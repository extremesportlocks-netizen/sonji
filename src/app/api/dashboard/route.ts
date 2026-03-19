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

  const results = await Promise.allSettled([
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
  ]);

  // Safe extract — returns fallback if query failed
  const v = (i: number, fallback: any = []) => results[i].status === "fulfilled" ? results[i].value : fallback;

  const contactCount = v(0, [{ total: 0 }])[0];
  const dealCount = v(1, [{ total: 0 }])[0];
  const activeDealCount = v(2, [{ total: 0 }])[0];
  const wonDealCount = v(3, [{ total: 0 }])[0];
  const taskCount = v(4, [{ total: 0 }])[0];
  const openTaskCount = v(5, [{ total: 0 }])[0];
  const recentContacts = v(6);
  const statusBreakdown = v(7);
  const sourceBreakdown = v(8);

  const contactsWithPurchases = 0;
  const totalRevenue = 0;
  const totalPurchases = 0;
  const ltvBuckets = { whale: 0, mid: 0, low: 0, zero: 0 };

  // Top 5 customers for dashboard
  let top5: any[] = [];
  try {
    const topRows = await db.select({ id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName, email: contacts.email, customFields: contacts.customFields })
      .from(contacts).where(and(eq(contacts.tenantId, tid), sql`${contacts.customFields}->>'ltv' IS NOT NULL`))
      .orderBy(desc(contacts.createdAt)).limit(5);
    top5 = topRows.map((r) => {
      const cf = (r.customFields as any) || {};
      return { id: r.id, name: `${r.firstName} ${r.lastName}`.trim(), email: r.email, ltv: cf.ltv || 0, purchases: cf.purchaseCount || 0, subStatus: cf.subscriptionStatus || "never" };
    });
  } catch {}

  return ok({
    totalContacts: Number(contactCount.total),
    totalDeals: Number(dealCount.total),
    activeDeals: Number(activeDealCount.total),
    wonDeals: Number(wonDealCount.total),
    totalTasks: Number(taskCount.total),
    openTasks: Number(openTaskCount.total),
    recentContacts: recentContacts.map((c: any) => ({ ...c, ltv: ((c.customFields as any)?.ltv) || 0, subStatus: ((c.customFields as any)?.subscriptionStatus) || "never" })),
    statusBreakdown: statusBreakdown.map((r: any) => ({ status: r.status, count: Number(r.count) })),
    sourceBreakdown: sourceBreakdown.map((r: any) => ({ source: r.source || "unknown", count: Number(r.count) })),
    revenue: {
      total: Math.round(totalRevenue * 100) / 100,
      totalPurchases,
      avgLTV: contactsWithPurchases > 0 ? Math.round((totalRevenue / contactsWithPurchases) * 100) / 100 : 0,
      avgOrder: totalPurchases > 0 ? Math.round((totalRevenue / totalPurchases) * 100) / 100 : 0,
      contactsWithPurchases,
    },
    ltvBuckets,
    subscriptionBreakdown: {},
    topCustomers: top5,
    tenantName: ctx.tenantName,
    tenantSlug: ctx.tenantSlug,
    pipeline: await getPipelineStages(tid),
  });
});

async function getPipelineStages(tenantId: string) {
  try {
    const rows = await db.select().from(pipelines).where(eq(pipelines.tenantId, tenantId)).limit(1);
    if (rows.length === 0) return [];
    const stages = (rows[0].stages as any[]) || [];
    const dealCounts = await db.select({ stage: deals.stage, count: count() })
      .from(deals).where(eq(deals.tenantId, tenantId)).groupBy(deals.stage);
    const countMap: Record<string, number> = {};
    for (const d of dealCounts) countMap[d.stage] = Number(d.count);
    return stages
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map((s: any) => ({ stage: s.name, color: s.color || "#6366f1", count: countMap[s.name] || 0 }));
  } catch { return []; }
}
