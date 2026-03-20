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

  // Revenue: aggregate from deals (value) and contacts (custom_fields->>ltv)
  let totalRevenue = 0;
  let totalPurchases = 0;
  let contactsWithPurchases = 0;
  let ltvBuckets = { whale: 0, mid: 0, low: 0, zero: 0 };
  let subscriptionBreakdown: Record<string, number> = {};

  try {
    const rawSql = getClient_raw();
    const [revResult, ltvResult, subResult] = await Promise.allSettled([
      rawSql`
        SELECT COALESCE(SUM(value), 0) as total_rev, COUNT(*) as deal_count
        FROM deals WHERE tenant_id = ${tid} AND value > 0
      `,
      rawSql`
        SELECT 
          COUNT(*) FILTER (WHERE (custom_fields->>'ltv')::numeric >= 500) as whale,
          COUNT(*) FILTER (WHERE (custom_fields->>'ltv')::numeric >= 200 AND (custom_fields->>'ltv')::numeric < 500) as mid,
          COUNT(*) FILTER (WHERE (custom_fields->>'ltv')::numeric > 0 AND (custom_fields->>'ltv')::numeric < 200) as low,
          COUNT(*) FILTER (WHERE custom_fields->>'ltv' IS NULL OR (custom_fields->>'ltv')::numeric = 0) as zero,
          COUNT(*) FILTER (WHERE (custom_fields->>'ltv')::numeric > 0) as with_purchases,
          COALESCE(SUM((custom_fields->>'ltv')::numeric) FILTER (WHERE (custom_fields->>'ltv')::numeric > 0), 0) as ltv_total,
          COALESCE(SUM((custom_fields->>'purchaseCount')::int) FILTER (WHERE (custom_fields->>'purchaseCount')::int > 0), 0) as purchase_total
        FROM contacts WHERE tenant_id = ${tid}
      `,
      rawSql`
        SELECT COALESCE(custom_fields->>'subscriptionStatus', 'never') as sub_status, COUNT(*) as cnt
        FROM contacts WHERE tenant_id = ${tid}
        GROUP BY COALESCE(custom_fields->>'subscriptionStatus', 'never')
      `,
    ]);

    // Use deal revenue if available, fall back to contact LTV aggregation
    if (revResult.status === "fulfilled" && revResult.value?.[0]) {
      const r = revResult.value[0] as any;
      const dealRev = Number(r.total_rev) || 0;
      if (dealRev > 0) {
        totalRevenue = dealRev;
        totalPurchases = Number(r.deal_count) || 0;
      }
    }

    if (ltvResult.status === "fulfilled" && ltvResult.value?.[0]) {
      const r = ltvResult.value[0] as any;
      ltvBuckets = {
        whale: Number(r.whale) || 0,
        mid: Number(r.mid) || 0,
        low: Number(r.low) || 0,
        zero: Number(r.zero) || 0,
      };
      contactsWithPurchases = Number(r.with_purchases) || 0;
      // If no deal revenue, use LTV from contacts (ESL Sports data is in custom_fields)
      if (totalRevenue === 0) {
        totalRevenue = Number(r.ltv_total) || 0;
        totalPurchases = Number(r.purchase_total) || 0;
      }
    }

    if (subResult.status === "fulfilled" && subResult.value) {
      for (const row of subResult.value as any[]) {
        subscriptionBreakdown[row.sub_status || "never"] = Number(row.cnt) || 0;
      }
    }
  } catch (e) {
    // Revenue queries failed — use zeros (non-blocking)
  }

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

  const response = ok({
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
      // avgLTV: from contact custom_fields, or fall back to revenue/deals if no LTV data
      avgLTV: contactsWithPurchases > 0
        ? Math.round((totalRevenue / contactsWithPurchases) * 100) / 100
        : totalPurchases > 0
          ? Math.round((totalRevenue / totalPurchases) * 100) / 100
          : 0,
      avgOrder: totalPurchases > 0 ? Math.round((totalRevenue / totalPurchases) * 100) / 100 : 0,
      contactsWithPurchases: contactsWithPurchases || totalPurchases,
    },
    ltvBuckets,
    subscriptionBreakdown,
    topCustomers: top5,
    tenantName: ctx.tenantName,
    tenantSlug: ctx.tenantSlug,
    pipeline: await getPipelineStages(tid),
  });
  response.headers.set("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  return response;
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
