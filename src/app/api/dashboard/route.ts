import { NextRequest } from "next/server";
import { getClient_raw } from "@/lib/db";
import { ok, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  const tid = ctx.tenantId;
  const raw = getClient_raw();

  try {
    // Run ALL queries in parallel — 4 concurrent DB calls instead of 6 sequential
    const [counts, recentContacts, pipelineData, top5Data, revenueData] = await Promise.all([
      // Counts
      raw`SELECT
        (SELECT count(*) FROM contacts WHERE tenant_id = ${tid})::int as total_contacts,
        (SELECT count(*) FROM deals WHERE tenant_id = ${tid})::int as total_deals,
        (SELECT count(*) FROM tasks WHERE tenant_id = ${tid})::int as total_tasks,
        (SELECT count(*) FROM tasks WHERE tenant_id = ${tid} AND status != 'done')::int as open_tasks
      `,
      // Recent 10
      raw`SELECT id, first_name, last_name, email, status, source, custom_fields, created_at
        FROM contacts WHERE tenant_id = ${tid} ORDER BY created_at DESC LIMIT 10`,
      // Pipeline + deal counts
      Promise.all([
        raw`SELECT stages FROM pipelines WHERE tenant_id = ${tid} LIMIT 1`,
        raw`SELECT stage, count(*)::int as c FROM deals WHERE tenant_id = ${tid} GROUP BY stage`,
      ]).catch(() => [[], []]),
      // Top 5
      raw`SELECT id, first_name, last_name, email, custom_fields
        FROM contacts WHERE tenant_id = ${tid}
        AND custom_fields->>'ltv' IS NOT NULL AND custom_fields->>'ltv' ~ '^[0-9.]+$'
        ORDER BY (custom_fields->>'ltv')::numeric DESC LIMIT 5`.catch(() => []),
      // Revenue
      raw`SELECT COALESCE(SUM((custom_fields->>'ltv')::numeric), 0) as total
        FROM contacts WHERE tenant_id = ${tid}
        AND custom_fields->>'ltv' IS NOT NULL AND custom_fields->>'ltv' ~ '^[0-9.]+$'`.catch(() => [{ total: 0 }]),
    ]);

    const c = counts[0];

    // Build pipeline
    let pipeline: any[] = [];
    try {
      const [pRows, dealCounts] = pipelineData as [any[], any[]];
      if (pRows.length > 0) {
        const stages = (pRows[0].stages as any[]) || [];
        const countMap: Record<string, number> = {};
        for (const d of dealCounts) countMap[d.stage] = d.c;
        pipeline = stages
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((s: any) => ({ stage: s.name, color: s.color || "#6366f1", count: countMap[s.name] || 0 }));
      }
    } catch {}

    const top5 = (top5Data as any[]).map((r: any) => {
      const cf = r.custom_fields || {};
      return { id: r.id, name: `${r.first_name} ${r.last_name}`.trim(), email: r.email, ltv: cf.ltv || 0, purchases: cf.purchaseCount || 0, subStatus: cf.subscriptionStatus || "never" };
    });

    const totalRevenue = Number((revenueData as any[])[0]?.total) || 0;

    return ok({
      totalContacts: c.total_contacts,
      totalDeals: c.total_deals,
      activeDeals: c.total_deals,
      wonDeals: 0,
      totalTasks: c.total_tasks,
      openTasks: c.open_tasks,
      recentContacts: recentContacts.map((c: any) => ({
        id: c.id, firstName: c.first_name, lastName: c.last_name, email: c.email,
        status: c.status, source: c.source, customFields: c.custom_fields, createdAt: c.created_at,
        ltv: c.custom_fields?.ltv || 0, subStatus: c.custom_fields?.subscriptionStatus || "never",
      })),
      statusBreakdown: [],
      sourceBreakdown: [],
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        totalPurchases: 0,
        avgLTV: c.total_contacts > 0 ? Math.round((totalRevenue / c.total_contacts) * 100) / 100 : 0,
        avgOrder: 0,
        contactsWithPurchases: 0,
      },
      ltvBuckets: { whale: 0, mid: 0, low: 0, zero: 0 },
      subscriptionBreakdown: {},
      topCustomers: top5,
      tenantName: ctx.tenantName,
      tenantSlug: ctx.tenantSlug,
      pipeline,
    });
  } catch (err: any) {
    return ok({
      totalContacts: 0, totalDeals: 0, activeDeals: 0, wonDeals: 0,
      totalTasks: 0, openTasks: 0, recentContacts: [], statusBreakdown: [],
      sourceBreakdown: [], revenue: { total: 0, totalPurchases: 0, avgLTV: 0, avgOrder: 0, contactsWithPurchases: 0 },
      ltvBuckets: { whale: 0, mid: 0, low: 0, zero: 0 }, subscriptionBreakdown: {},
      topCustomers: [], tenantName: ctx.tenantName || "", tenantSlug: ctx.tenantSlug || "",
      pipeline: [], _error: err.message,
    });
  }
});
