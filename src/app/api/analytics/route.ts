import { NextRequest } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { ok, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const allContacts = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
      status: contacts.status,
      customFields: contacts.customFields,
      tags: contacts.tags,
      createdAt: contacts.createdAt,
    })
    .from(contacts)
    .where(eq(contacts.tenantId, ctx.tenantId));

  let totalRevenue = 0;
  let totalPurchases = 0;
  let activeSubscribers = 0;
  let canceledSubscribers = 0;
  let oneTimeBuyers = 0;
  let neverPurchased = 0;

  const ltvBuckets = { whale: 0, mid: 0, low: 0, zero: 0 };
  const subStatuses: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const topCustomers: any[] = [];

  for (const c of allContacts) {
    const cf = (c.customFields as Record<string, any>) || {};
    const ltv = Number(cf.ltv) || 0;
    const purchases = Number(cf.purchaseCount) || 0;
    const subStatus = cf.subscriptionStatus || "never";

    totalRevenue += ltv;
    totalPurchases += purchases;

    subStatuses[subStatus] = (subStatuses[subStatus] || 0) + 1;
    if (subStatus === "active") activeSubscribers++;
    else if (subStatus === "canceled") canceledSubscribers++;
    else if (subStatus === "one-time") oneTimeBuyers++;
    else if (subStatus === "never") neverPurchased++;

    if (ltv >= 500) ltvBuckets.whale++;
    else if (ltv >= 200) ltvBuckets.mid++;
    else if (ltv > 0) ltvBuckets.low++;
    else ltvBuckets.zero++;

    if (ltv >= 50) {
      topCustomers.push({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        email: c.email,
        ltv,
        purchases,
        subscriptionStatus: subStatus,
        daysSince: cf.daysSinceLastPurchase,
      });
    }

    const tags = (c.tags as string[]) || [];
    for (const tag of tags) {
      if (tag !== "Stripe Import") tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  topCustomers.sort((a, b) => b.ltv - a.ltv);

  const contactsWithPurchases = allContacts.filter((c) => (Number((c.customFields as any)?.purchaseCount) || 0) > 0).length;

  const statusBreakdown: Record<string, number> = {};
  for (const c of allContacts) statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;

  return ok({
    overview: {
      totalContacts: allContacts.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalPurchases,
      avgLTV: contactsWithPurchases > 0 ? Math.round((totalRevenue / contactsWithPurchases) * 100) / 100 : 0,
      avgOrderValue: totalPurchases > 0 ? Math.round((totalRevenue / totalPurchases) * 100) / 100 : 0,
      activeSubscribers,
      canceledSubscribers,
      oneTimeBuyers,
      neverPurchased,
      contactsWithPurchases,
    },
    ltvBuckets,
    subscriptionBreakdown: subStatuses,
    statusBreakdown,
    tagBreakdown: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([tag, ct]) => ({ tag, count: ct })),
    topCustomers: topCustomers.slice(0, 25),
  });
});
