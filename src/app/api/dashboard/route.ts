import { NextRequest } from "next/server";
import { db, setTenantContext, getClient_raw } from "@/lib/db";
import { contacts, deals, tasks, pipelines } from "@/lib/db/schema";
import { eq, and, count, sql, desc } from "drizzle-orm";
import { ok, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);
  const tid = ctx.tenantId;
  const raw = getClient_raw();

  // All stats via SQL — no rows loaded into JS memory
  const [stats] = await raw`
    SELECT
      (SELECT count(*) FROM contacts WHERE tenant_id = ${tid}) as total_contacts,
      (SELECT count(*) FROM deals WHERE tenant_id = ${tid}) as total_deals,
      (SELECT count(*) FROM deals WHERE tenant_id = ${tid} AND stage NOT IN ('Closed Won','Closed Lost')) as active_deals,
      (SELECT count(*) FROM deals WHERE tenant_id = ${tid} AND stage = 'Closed Won') as won_deals,
      (SELECT count(*) FROM tasks WHERE tenant_id = ${tid}) as total_tasks,
      (SELECT count(*) FROM tasks WHERE tenant_id = ${tid} AND status != 'done') as open_tasks,
      (SELECT COALESCE(SUM((custom_fields->>'ltv')::numeric), 0) FROM contacts WHERE tenant_id = ${tid} AND (custom_fields->>'ltv') IS NOT NULL) as total_revenue,
      (SELECT COALESCE(SUM((custom_fields->>'purchaseCount')::int), 0) FROM contacts WHERE tenant_id = ${tid} AND (custom_fields->>'purchaseCount') IS NOT NULL) as total_purchases,
      (SELECT count(*) FROM contacts WHERE tenant_id = ${tid} AND (custom_fields->>'purchaseCount')::int > 0) as contacts_with_purchases,
      (SELECT count(*) FROM contacts WHERE tenant_id = ${tid} AND (custom_fields->>'ltv')::numeric >= 500) as whale,
      (SELECT count(*) FROM contacts WHERE tenant_id = ${tid} AND (custom_fields->>'ltv')::numeric >= 200 AND (custom_fields->>'ltv')::numeric < 500) as mid,
      (SELECT count(*) FROM contacts WHERE tenant_id = ${tid} AND (custom_fields->>'ltv')::numeric > 0 AND (custom_fields->>'ltv')::numeric < 200) as low
  `;

  // Recent contacts — just 10 rows
  const recentContacts = await raw`
    SELECT id, first_name, last_name, email, status, source, custom_fields, created_at
    FROM contacts WHERE tenant_id = ${tid}
    ORDER BY created_at DESC LIMIT 10
  `;

  // Subscription breakdown via SQL
  const subRows = await raw`
    SELECT COALESCE(custom_fields->>'subscriptionStatus', 'never') as status, count(*) as c
    FROM contacts WHERE tenant_id = ${tid}
    GROUP BY custom_fields->>'subscriptionStatus'
  `;
  const subscriptionBreakdown: Record<string, number> = {};
  for (const r of subRows) subscriptionBreakdown[r.status] = Number(r.c);

  // Status breakdown
  const statusRows = await raw`
    SELECT COALESCE(status, 'unknown') as status, count(*) as c
    FROM contacts WHERE tenant_id = ${tid} GROUP BY status
  `;

  // Source breakdown
  const sourceRows = await raw`
    SELECT COALESCE(source, 'unknown') as source, count(*) as c
    FROM contacts WHERE tenant_id = ${tid} GROUP BY source
  `;

  // Top 5 customers
  const top5 = await raw`
    SELECT id, first_name, last_name, email, custom_fields
    FROM contacts WHERE tenant_id = ${tid} AND (custom_fields->>'ltv')::numeric > 0
    ORDER BY (custom_fields->>'ltv')::numeric DESC LIMIT 5
  `;

  // Pipeline stages with deal counts
  let pipeline: any[] = [];
  try {
    const pRows = await raw`SELECT stages FROM pipelines WHERE tenant_id = ${tid} LIMIT 1`;
    if (pRows.length > 0) {
      const stages = (pRows[0].stages as any[]) || [];
      const dealCounts = await raw`
        SELECT stage, count(*) as c FROM deals WHERE tenant_id = ${tid} GROUP BY stage
      `;
      const countMap: Record<string, number> = {};
      for (const d of dealCounts) countMap[d.stage] = Number(d.c);

      pipeline = stages
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((s: any) => ({ stage: s.name, color: s.color || "#6366f1", count: countMap[s.name] || 0 }));
    }
  } catch {}

  const totalRev = Number(stats.total_revenue) || 0;
  const cwp = Number(stats.contacts_with_purchases) || 0;
  const tp = Number(stats.total_purchases) || 0;

  return ok({
    totalContacts: Number(stats.total_contacts),
    totalDeals: Number(stats.total_deals),
    activeDeals: Number(stats.active_deals),
    wonDeals: Number(stats.won_deals),
    totalTasks: Number(stats.total_tasks),
    openTasks: Number(stats.open_tasks),
    recentContacts: recentContacts.map((c: any) => ({
      id: c.id, firstName: c.first_name, lastName: c.last_name, email: c.email,
      status: c.status, source: c.source, customFields: c.custom_fields, createdAt: c.created_at,
      ltv: c.custom_fields?.ltv || 0, subStatus: c.custom_fields?.subscriptionStatus || "never",
    })),
    statusBreakdown: statusRows.map((r: any) => ({ status: r.status, count: Number(r.c) })),
    sourceBreakdown: sourceRows.map((r: any) => ({ source: r.source, count: Number(r.c) })),
    revenue: {
      total: Math.round(totalRev * 100) / 100,
      totalPurchases: tp,
      avgLTV: cwp > 0 ? Math.round((totalRev / cwp) * 100) / 100 : 0,
      avgOrder: tp > 0 ? Math.round((totalRev / tp) * 100) / 100 : 0,
      contactsWithPurchases: cwp,
    },
    ltvBuckets: { whale: Number(stats.whale), mid: Number(stats.mid), low: Number(stats.low), zero: 0 },
    subscriptionBreakdown,
    topCustomers: top5.map((r: any) => {
      const cf = r.custom_fields || {};
      return { id: r.id, name: `${r.first_name} ${r.last_name}`.trim(), email: r.email, ltv: cf.ltv || 0, purchases: cf.purchaseCount || 0, subStatus: cf.subscriptionStatus || "never" };
    }),
    tenantName: ctx.tenantName,
    tenantSlug: ctx.tenantSlug,
    pipeline,
  });
});
