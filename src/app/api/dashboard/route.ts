import { NextRequest } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { contacts, deals, tasks, pipelines } from "@/lib/db/schema";
import { eq, and, count, sql, desc } from "drizzle-orm";
import { ok, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);
  const tid = ctx.tenantId;

  const [
    [contactCount], [dealCount], [activeDealCount], [wonDealCount],
    [taskCount], [openTaskCount],
    recentContacts, statusBreakdown, sourceBreakdown,
    allContactFields,
  ] = await Promise.all([
    db.select({ total: count() }).from(contacts).where(eq(contacts.tenantId, tid)),
    db.select({ total: count() }).from(deals).where(eq(deals.tenantId, tid)),
    db.select({ total: count() }).from(deals).where(and(eq(deals.tenantId, tid), sql`${deals.stage} NOT IN ('Closed Won','Closed Lost')`)),
    db.select({ total: count() }).from(deals).where(and(eq(deals.tenantId, tid), eq(deals.stage, "Closed Won"))),
    db.select({ total: count() }).from(tasks).where(eq(tasks.tenantId, tid)),
    db.select({ total: count() }).from(tasks).where(and(eq(tasks.tenantId, tid), sql`${tasks.status} != 'done'`)),
    db.select({ id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName, email: contacts.email, status: contacts.status, source: contacts.source, customFields: contacts.customFields, createdAt: contacts.createdAt })
      .from(contacts).where(eq(contacts.tenantId, tid)).orderBy(desc(contacts.createdAt)).limit(10),
    db.select({ status: contacts.status, count: count() }).from(contacts).where(eq(contacts.tenantId, tid)).groupBy(contacts.status),
    db.select({ source: contacts.source, count: count() }).from(contacts).where(eq(contacts.tenantId, tid)).groupBy(contacts.source),
    // Get customFields for revenue computation — only contacts with purchases
    db.select({ customFields: contacts.customFields }).from(contacts)
      .where(and(eq(contacts.tenantId, tid), sql`(${contacts.customFields}->>'purchaseCount')::int > 0`)),
  ]);

  // Compute revenue metrics from customFields
  let totalRevenue = 0, totalPurchases = 0;
  const ltvBuckets = { whale: 0, mid: 0, low: 0, zero: 0 };
  const subStatuses: Record<string, number> = {};
  const topCustomers: any[] = [];

  // Process ALL contacts for sub status (not just those with purchases)
  const allForSubs = await db.select({ customFields: contacts.customFields, firstName: contacts.firstName, lastName: contacts.lastName, email: contacts.email, id: contacts.id })
    .from(contacts).where(eq(contacts.tenantId, tid));

  for (const c of allForSubs) {
    const cf = (c.customFields as any) || {};
    const ss = cf.subscriptionStatus || "never";
    subStatuses[ss] = (subStatuses[ss] || 0) + 1;
  }

  for (const c of allContactFields) {
    const cf = (c.customFields as any) || {};
    const ltv = Number(cf.ltv) || 0;
    const pc = Number(cf.purchaseCount) || 0;
    totalRevenue += ltv;
    totalPurchases += pc;
    if (ltv >= 500) ltvBuckets.whale++;
    else if (ltv >= 200) ltvBuckets.mid++;
    else if (ltv > 0) ltvBuckets.low++;
    else ltvBuckets.zero++;
  }

  // Top 5 customers for dashboard
  const topRows = await db.select({ id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName, email: contacts.email, customFields: contacts.customFields })
    .from(contacts).where(and(eq(contacts.tenantId, tid), sql`(${contacts.customFields}->>'ltv')::numeric > 0`))
    .orderBy(sql`(${contacts.customFields}->>'ltv')::numeric DESC`).limit(5);

  const top5 = topRows.map((r) => {
    const cf = (r.customFields as any) || {};
    return { id: r.id, name: `${r.firstName} ${r.lastName}`.trim(), email: r.email, ltv: cf.ltv || 0, purchases: cf.purchaseCount || 0, subStatus: cf.subscriptionStatus || "never" };
  });

  const contactsWithPurchases = allContactFields.length;

  return ok({
    totalContacts: Number(contactCount.total),
    totalDeals: Number(dealCount.total),
    activeDeals: Number(activeDealCount.total),
    wonDeals: Number(wonDealCount.total),
    totalTasks: Number(taskCount.total),
    openTasks: Number(openTaskCount.total),
    recentContacts: recentContacts.map((c) => ({ ...c, ltv: ((c.customFields as any)?.ltv) || 0, subStatus: ((c.customFields as any)?.subscriptionStatus) || "never" })),
    statusBreakdown: statusBreakdown.map((r) => ({ status: r.status, count: Number(r.count) })),
    sourceBreakdown: sourceBreakdown.map((r) => ({ source: r.source || "unknown", count: Number(r.count) })),
    revenue: {
      total: Math.round(totalRevenue * 100) / 100,
      totalPurchases,
      avgLTV: contactsWithPurchases > 0 ? Math.round((totalRevenue / contactsWithPurchases) * 100) / 100 : 0,
      avgOrder: totalPurchases > 0 ? Math.round((totalRevenue / totalPurchases) * 100) / 100 : 0,
      contactsWithPurchases,
    },
    ltvBuckets,
    subscriptionBreakdown: subStatuses,
    topCustomers: top5,
    tenantName: ctx.tenantName,
    tenantSlug: ctx.tenantSlug,
    pipeline: await getPipelineStages(tid),
  });
});

// Get pipeline stages with deal counts
async function getPipelineStages(tenantId: string) {
  try {
    const pipelineRows = await db.select().from(pipelines).where(eq(pipelines.tenantId, tenantId)).limit(1);
    if (pipelineRows.length === 0) return [];

    const stages = (pipelineRows[0].stages as any[]) || [];

    // Count deals per stage
    const dealCounts = await db.select({
      stage: deals.stage,
      count: count(),
    }).from(deals).where(eq(deals.tenantId, tenantId)).groupBy(deals.stage);

    const countMap: Record<string, number> = {};
    for (const d of dealCounts) {
      countMap[d.stage] = Number(d.count);
    }

    return stages
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map((s: any) => ({
        stage: s.name,
        color: s.color || "#6366f1",
        count: countMap[s.name] || 0,
      }));
  } catch {
    return [];
  }
}
