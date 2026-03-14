import { NextRequest, NextResponse } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { tenants, contacts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";

export const maxDuration = 300;

const STRIPE_API = "https://api.stripe.com/v1";

async function getTenantStripeKey(tenantId: string): Promise<string | null> {
  const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!rows.length) return null;
  return (rows[0].settings as any)?.stripeSecretKey || null;
}

async function verifyStripeKey(key: string): Promise<{ valid: boolean; accountName?: string; error?: string }> {
  try {
    const res = await fetch(`${STRIPE_API}/account`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) { const err = await res.json(); return { valid: false, error: err.error?.message || "Invalid" }; }
    const acct = await res.json();
    return { valid: true, accountName: acct.settings?.dashboard?.display_name || acct.business_profile?.name || acct.email || "Stripe Account" };
  } catch { return { valid: false, error: "Failed to reach Stripe" }; }
}

async function stripeListAll<T>(key: string, endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  const all: T[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;
  while (hasMore) {
    const qs = new URLSearchParams({ limit: "100", ...params });
    if (startingAfter) qs.set("starting_after", startingAfter);
    const res = await fetch(`${STRIPE_API}${endpoint}?${qs}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || res.statusText); }
    const data = await res.json();
    all.push(...data.data);
    hasMore = data.has_more;
    if (data.data.length > 0) startingAfter = (data.data[data.data.length - 1] as any).id;
  }
  return all;
}

// Pull charges in pages with a limit to avoid timeout
async function stripeListLimited<T>(key: string, endpoint: string, maxRecords: number, params: Record<string, string> = {}): Promise<T[]> {
  const all: T[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;
  while (hasMore && all.length < maxRecords) {
    const qs = new URLSearchParams({ limit: "100", ...params });
    if (startingAfter) qs.set("starting_after", startingAfter);
    const res = await fetch(`${STRIPE_API}${endpoint}?${qs}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || res.statusText); }
    const data = await res.json();
    all.push(...data.data);
    hasMore = data.has_more;
    if (data.data.length > 0) startingAfter = (data.data[data.data.length - 1] as any).id;
  }
  return all;
}

// ─── GET ───
export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const key = await getTenantStripeKey(ctx.tenantId);
    if (!key) return NextResponse.json({ connected: false });
    const v = await verifyStripeKey(key);
    return NextResponse.json({ connected: v.valid, accountName: v.accountName, error: v.error });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}

// ─── POST ───
export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();

    // ── CONNECT ──
    if (body.action === "connect") {
      const key = body.stripeSecretKey;
      if (!key?.startsWith("sk_")) return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      const v = await verifyStripeKey(key);
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });
      const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      const s = (rows[0]?.settings as any) || {};
      await db.update(tenants).set({ settings: { ...s, stripeSecretKey: key, stripeAccountName: v.accountName, stripeConnectedAt: new Date().toISOString() }, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true, accountName: v.accountName });
    }

    // ── DISCONNECT ──
    if (body.action === "disconnect") {
      const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      const s = (rows[0]?.settings as any) || {};
      delete s.stripeSecretKey; delete s.stripeAccountName; delete s.stripeConnectedAt; delete s.lastStripeSync; delete s.lastStripeSyncResult;
      await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true });
    }

    // ══════════════════════════════════════════
    // ── SYNC ──
    // ══════════════════════════════════════════
    if (body.action === "sync") {
      const stripeKey = await getTenantStripeKey(ctx.tenantId);
      if (!stripeKey) return NextResponse.json({ error: "Stripe not connected." }, { status: 400 });
      const dryRun = body.dryRun ?? false;
      const startTime = Date.now();

      // STEP 1: Customers + Subscriptions (fast — these are small datasets)
      const [customers, subscriptions] = await Promise.all([
        stripeListAll<any>(stripeKey, "/customers"),
        stripeListAll<any>(stripeKey, "/subscriptions", { status: "all" }),
      ]);

      // STEP 2: Charges — pull with a 2-year window to limit volume
      const twoYearsAgo = Math.floor((Date.now() - 2 * 365 * 86400000) / 1000);
      let charges: any[] = [];
      try {
        charges = await stripeListLimited<any>(stripeKey, "/charges", 10000, { "created[gte]": String(twoYearsAgo) });
      } catch (err) {
        // If charges fail, continue without them — still have customers + subs
        console.error("[StripeSync] Charges fetch failed, continuing:", err);
      }

      // STEP 3: Index by customer
      const chargesByCustomer = new Map<string, any[]>();
      for (const ch of charges) {
        if (!ch.customer || ch.status !== "succeeded") continue;
        const arr = chargesByCustomer.get(ch.customer) || [];
        arr.push(ch);
        chargesByCustomer.set(ch.customer, arr);
      }

      const subsByCustomer = new Map<string, any[]>();
      for (const sub of subscriptions) {
        const cid = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!cid) continue;
        const arr = subsByCustomer.get(cid) || [];
        arr.push(sub);
        subsByCustomer.set(cid, arr);
      }

      // STEP 4: Build enriched contacts
      const enriched: any[] = [];
      let totalRevenue = 0;
      let activeCount = 0;
      let lapsedCount = 0;

      for (const cust of customers) {
        const custCharges = chargesByCustomer.get(cust.id) || [];
        const custSubs = subsByCustomer.get(cust.id) || [];

        const ltv = custCharges.reduce((s: number, c: any) => s + (c.amount / 100), 0);
        totalRevenue += ltv;
        const purchaseCount = custCharges.length;

        const chargeDates = custCharges.map((c: any) => c.created).sort((a: number, b: number) => b - a);
        const lastPurchaseDate = chargeDates[0] ? new Date(chargeDates[0] * 1000).toISOString() : null;
        const firstPurchaseDate = chargeDates.length > 0 ? new Date(chargeDates[chargeDates.length - 1] * 1000).toISOString() : null;
        const daysSince = lastPurchaseDate ? Math.floor((Date.now() - new Date(lastPurchaseDate).getTime()) / 86400000) : null;

        const activeSub = custSubs.find((s: any) => s.status === "active" || s.status === "trialing");
        const canceledSub = custSubs.find((s: any) => s.status === "canceled");
        const hasAnySub = custSubs.length > 0;

        let status = "lead";
        if (activeSub) { status = "active"; activeCount++; }
        else if (canceledSub || (hasAnySub && !activeSub)) { status = "inactive"; lapsedCount++; }
        else if (purchaseCount > 0 && daysSince !== null) {
          if (daysSince <= 30) { status = "active"; activeCount++; }
          else if (daysSince <= 90) { status = "lead"; }
          else { status = "inactive"; lapsedCount++; }
        }

        const tags: string[] = ["Stripe Import"];
        if (ltv >= 500) tags.push("Whale");
        else if (ltv >= 200) tags.push("Mid-Tier");
        else if (ltv > 0) tags.push("Low-Tier");
        if (activeSub) tags.push("Active Subscriber");
        if (canceledSub && !activeSub) tags.push("Lapsed");
        if (purchaseCount >= 10) tags.push("High Frequency");
        if (daysSince !== null && daysSince <= 30 && !activeSub) tags.push("Recently Active");
        if (daysSince !== null && daysSince > 90 && ltv > 0) tags.push("Win-Back");

        let subscriptionPlan = null, subscriptionInterval = null, subscriptionAmount = null;
        if (activeSub) {
          const item = activeSub.items?.data?.[0];
          subscriptionPlan = item?.price?.nickname || item?.price?.product || activeSub.id;
          subscriptionInterval = item?.price?.recurring?.interval || "month";
          subscriptionAmount = item?.price?.unit_amount ? item.price.unit_amount / 100 : null;
        }

        const nameParts = (cust.name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || cust.email?.split("@")[0] || "Unknown";
        const lastName = nameParts.slice(1).join(" ") || "";

        enriched.push({
          tenantId: ctx.tenantId,
          firstName, lastName,
          email: cust.email || "", phone: cust.phone || "",
          company: cust.metadata?.company || cust.description || "",
          tags,
          customFields: {
            stripeCustomerId: cust.id, ltv: Math.round(ltv * 100) / 100,
            purchaseCount,
            avgOrderValue: purchaseCount > 0 ? Math.round((ltv / purchaseCount) * 100) / 100 : 0,
            lastPurchaseDate, firstPurchaseDate, daysSinceLastPurchase: daysSince,
            subscriptionStatus: activeSub ? "active" : canceledSub ? "canceled" : hasAnySub ? "expired" : purchaseCount > 0 ? "one-time" : "never",
            subscriptionPlan, subscriptionInterval, subscriptionAmount,
            totalCharges: purchaseCount,
            highestCharge: custCharges.length > 0 ? Math.max(...custCharges.map((c: any) => c.amount / 100)) : 0,
            stripeCurrency: cust.currency || "usd",
            stripeCreated: new Date(cust.created * 1000).toISOString(),
          },
          source: "stripe_import", status,
        });
      }

      // STEP 5: Insert
      let insertedCount = 0;
      if (!dryRun && enriched.length > 0) {
        await setTenantContext(ctx.tenantId);
        await db.delete(contacts).where(and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.source, "stripe_import")));
        const batchSize = 50;
        for (let i = 0; i < enriched.length; i += batchSize) {
          try {
            await db.insert(contacts).values(enriched.slice(i, i + batchSize));
            insertedCount += Math.min(batchSize, enriched.length - i);
          } catch (err) { console.error(`[StripeSync] Batch ${i}:`, err); }
        }
      }

      // STEP 6: Save metadata
      if (!dryRun) {
        const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
        const s = (rows[0]?.settings as any) || {};
        await db.update(tenants).set({
          settings: { ...s, lastStripeSync: new Date().toISOString(), lastStripeSyncResult: { contacts: insertedCount, charges: charges.length, subscriptions: subscriptions.length, totalRevenue: Math.round(totalRevenue * 100) / 100, active: activeCount, lapsed: lapsedCount, duration: Date.now() - startTime } },
          updatedAt: new Date(),
        }).where(eq(tenants.id, ctx.tenantId));
      }

      const tierBreakdown = {
        whales: enriched.filter((c) => (c.customFields.ltv || 0) >= 500).length,
        mid: enriched.filter((c) => (c.customFields.ltv || 0) >= 200 && (c.customFields.ltv || 0) < 500).length,
        low: enriched.filter((c) => (c.customFields.ltv || 0) > 0 && (c.customFields.ltv || 0) < 200).length,
        noPurchase: enriched.filter((c) => (c.customFields.ltv || 0) === 0).length,
      };
      const subBreakdown = {
        active: enriched.filter((c) => c.customFields.subscriptionStatus === "active").length,
        canceled: enriched.filter((c) => c.customFields.subscriptionStatus === "canceled").length,
        expired: enriched.filter((c) => c.customFields.subscriptionStatus === "expired").length,
        oneTime: enriched.filter((c) => c.customFields.subscriptionStatus === "one-time").length,
        never: enriched.filter((c) => c.customFields.subscriptionStatus === "never").length,
      };

      return NextResponse.json({
        success: true, dryRun,
        stripeData: { customersFound: customers.length, chargesFound: charges.length, subscriptionsFound: subscriptions.length },
        imported: dryRun ? 0 : insertedCount,
        metrics: { totalRevenue: Math.round(totalRevenue * 100) / 100, avgLTV: customers.length > 0 ? Math.round((totalRevenue / customers.length) * 100) / 100 : 0, activeSubscribers: activeCount, lapsedCustomers: lapsedCount, tierBreakdown, subBreakdown },
        duration: Date.now() - startTime,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[StripeIntegration]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── DELETE ───
export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const s = (rows[0]?.settings as any) || {};
    delete s.stripeSecretKey; delete s.stripeAccountName; delete s.stripeConnectedAt; delete s.lastStripeSync; delete s.lastStripeSyncResult;
    await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}
