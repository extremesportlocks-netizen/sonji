import { NextRequest } from "next/server";
import { getClient_raw } from "@/lib/db";
import { ok, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  const tid = ctx.tenantId;
  const raw = getClient_raw();

  // Safe query helper — never throws
  async function q<T>(query: Promise<T[]>, fallback: T[] = []): Promise<T[]> {
    try { return await query; } catch { return fallback; }
  }

  const countsP = q(raw`SELECT
    (SELECT count(*) FROM contacts WHERE tenant_id = ${tid})::int as total_contacts,
    (SELECT count(*) FROM deals WHERE tenant_id = ${tid})::int as total_deals,
    (SELECT count(*) FROM tasks WHERE tenant_id = ${tid})::int as total_tasks,
    (SELECT count(*) FROM tasks WHERE tenant_id = ${tid} AND status != 'done')::int as open_tasks
  `);

  const recentP = q(raw`SELECT id, first_name, last_name, email, status, source, custom_fields, created_at
    FROM contacts WHERE tenant_id = ${tid} ORDER BY created_at DESC LIMIT 10`);

  const pipelineStagesP = q(raw`SELECT stages FROM pipelines WHERE tenant_id = ${tid} LIMIT 1`);
  const dealCountsP = q(raw`SELECT stage, count(*)::int as c FROM deals WHERE tenant_id = ${tid} GROUP BY stage`);

  const top5P = q(raw`SELECT id, first_name, last_name, email, custom_fields
    FROM contacts WHERE tenant_id = ${tid}
    AND custom_fields->>'ltv' IS NOT NULL
    ORDER BY created_at DESC LIMIT 5`);

  // Run all in parallel
  const [counts, recentContacts, pipelineStages, dealCounts, top5Rows] =
    await Promise.all([countsP, recentP, pipelineStagesP, dealCountsP, top5P]);

  const c = counts[0] || { total_contacts: 0, total_deals: 0, total_tasks: 0, open_tasks: 0 };

  // Pipeline
  let pipeline: any[] = [];
  try {
    if (pipelineStages.length > 0) {
      const stages = ((pipelineStages[0] as any).stages || []) as any[];
      const countMap: Record<string, number> = {};
      for (const d of dealCounts) countMap[(d as any).stage] = (d as any).c;
      pipeline = stages
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((s: any) => ({ stage: s.name, color: s.color || "#6366f1", count: countMap[s.name] || 0 }));
    }
  } catch {}

  // Top customers
  const topCustomers = top5Rows.map((r: any) => {
    const cf = r.custom_fields || {};
    return { id: r.id, name: `${r.first_name} ${r.last_name}`.trim(), email: r.email, ltv: cf.ltv || 0, purchases: cf.purchaseCount || 0, subStatus: cf.subscriptionStatus || "never" };
  });

  return ok({
    totalContacts: (c as any).total_contacts || 0,
    totalDeals: (c as any).total_deals || 0,
    activeDeals: (c as any).total_deals || 0,
    wonDeals: 0,
    totalTasks: (c as any).total_tasks || 0,
    openTasks: (c as any).open_tasks || 0,
    recentContacts: recentContacts.map((r: any) => ({
      id: r.id, firstName: r.first_name, lastName: r.last_name, email: r.email,
      status: r.status, source: r.source, customFields: r.custom_fields, createdAt: r.created_at,
      ltv: r.custom_fields?.ltv || 0, subStatus: r.custom_fields?.subscriptionStatus || "never",
    })),
    statusBreakdown: [],
    sourceBreakdown: [],
    revenue: { total: 0, totalPurchases: 0, avgLTV: 0, avgOrder: 0, contactsWithPurchases: 0 },
    ltvBuckets: { whale: 0, mid: 0, low: 0, zero: 0 },
    subscriptionBreakdown: {},
    topCustomers,
    tenantName: ctx.tenantName,
    tenantSlug: ctx.tenantSlug,
    pipeline,
  });
});
