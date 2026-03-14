import { NextRequest, NextResponse } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { tenants, contacts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";

export const maxDuration = 300;
const STRIPE_API = "https://api.stripe.com/v1";

async function getTenantStripeKey(tenantId: string): Promise<string | null> {
  const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  return (rows[0]?.settings as any)?.stripeSecretKey || null;
}

async function verifyStripeKey(key: string) {
  try {
    const res = await fetch(`${STRIPE_API}/account`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) { const e = await res.json(); return { valid: false, error: e.error?.message || "Invalid" }; }
    const a = await res.json();
    return { valid: true, accountName: a.settings?.dashboard?.display_name || a.business_profile?.name || a.email || "Stripe" };
  } catch { return { valid: false, error: "Failed to reach Stripe" }; }
}

async function stripeList<T>(key: string, endpoint: string, params: Record<string, string> = {}, maxPages = 200): Promise<T[]> {
  const all: T[] = [];
  let hasMore = true;
  let after: string | undefined;
  let pages = 0;
  while (hasMore && pages < maxPages) {
    const qs = new URLSearchParams({ limit: "100", ...params });
    if (after) qs.set("starting_after", after);
    const res = await fetch(`${STRIPE_API}${endpoint}?${qs}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || res.statusText); }
    const d = await res.json();
    all.push(...d.data);
    hasMore = d.has_more;
    if (d.data.length > 0) after = (d.data[d.data.length - 1] as any).id;
    pages++;
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
      for (const k of ["stripeSecretKey","stripeAccountName","stripeConnectedAt","lastStripeSync","lastStripeSyncResult"]) delete s[k];
      await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true });
    }

    // ══════════════════════════════════════
    // PHASE 1: Import customers + subscriptions
    // ══════════════════════════════════════
    if (body.action === "sync") {
      const stripeKey = await getTenantStripeKey(ctx.tenantId);
      if (!stripeKey) return NextResponse.json({ error: "Stripe not connected." }, { status: 400 });
      const dryRun = body.dryRun ?? false;
      const t0 = Date.now();

      // Pull customers + subscriptions only (fast)
      const [customers, subscriptions] = await Promise.all([
        stripeList<any>(stripeKey, "/customers"),
        stripeList<any>(stripeKey, "/subscriptions", { status: "all" }),
      ]);

      // Index subs by customer
      const subsByCustomer = new Map<string, any[]>();
      for (const sub of subscriptions) {
        const cid = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!cid) continue;
        (subsByCustomer.get(cid) || (subsByCustomer.set(cid, []), subsByCustomer.get(cid)!)).push(sub);
      }

      // Build contacts
      const enriched: any[] = [];
      let activeCount = 0, lapsedCount = 0;

      for (const cust of customers) {
        const custSubs = subsByCustomer.get(cust.id) || [];
        const activeSub = custSubs.find((s: any) => s.status === "active" || s.status === "trialing");
        const canceledSub = custSubs.find((s: any) => s.status === "canceled");
        const hasAnySub = custSubs.length > 0;

        let status = "lead";
        if (activeSub) { status = "active"; activeCount++; }
        else if (canceledSub || (hasAnySub && !activeSub)) { status = "inactive"; lapsedCount++; }

        const tags: string[] = ["Stripe Import"];
        if (activeSub) tags.push("Active Subscriber");
        if (canceledSub && !activeSub) tags.push("Lapsed");

        let subPlan = null, subInterval = null, subAmount = null;
        if (activeSub) {
          const item = activeSub.items?.data?.[0];
          subPlan = item?.price?.nickname || item?.price?.product || null;
          subInterval = item?.price?.recurring?.interval || "month";
          subAmount = item?.price?.unit_amount ? item.price.unit_amount / 100 : null;
        }

        const nameParts = (cust.name || "").trim().split(/\s+/);
        enriched.push({
          tenantId: ctx.tenantId,
          firstName: nameParts[0] || cust.email?.split("@")[0] || "Unknown",
          lastName: nameParts.slice(1).join(" ") || "",
          email: cust.email || "", phone: cust.phone || "",
          company: cust.metadata?.company || cust.description || "",
          tags,
          customFields: {
            stripeCustomerId: cust.id,
            subscriptionStatus: activeSub ? "active" : canceledSub ? "canceled" : hasAnySub ? "expired" : "never",
            subscriptionPlan: subPlan, subscriptionInterval: subInterval, subscriptionAmount: subAmount,
            ltv: 0, purchaseCount: 0, avgOrderValue: 0,
            lastPurchaseDate: null, firstPurchaseDate: null, daysSinceLastPurchase: null,
            highestCharge: 0, stripeCreated: new Date(cust.created * 1000).toISOString(),
          },
          source: "stripe_import", status,
        });
      }

      // Insert
      let insertedCount = 0;
      if (!dryRun && enriched.length > 0) {
        await setTenantContext(ctx.tenantId);
        await db.delete(contacts).where(and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.source, "stripe_import")));
        for (let i = 0; i < enriched.length; i += 50) {
          try { await db.insert(contacts).values(enriched.slice(i, i + 50)); insertedCount += Math.min(50, enriched.length - i); } catch (e) { console.error(`[Sync] batch ${i}:`, e); }
        }
      }

      // Save metadata
      if (!dryRun) {
        const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
        await db.update(tenants).set({ settings: { ...(rows[0]?.settings as any || {}), lastStripeSync: new Date().toISOString(), lastStripeSyncResult: { contacts: insertedCount, subscriptions: subscriptions.length, active: activeCount, lapsed: lapsedCount, duration: Date.now() - t0 } }, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      }

      return NextResponse.json({
        success: true, dryRun, phase: 1,
        stripeData: { customersFound: customers.length, subscriptionsFound: subscriptions.length },
        imported: dryRun ? 0 : insertedCount,
        metrics: { activeSubscribers: activeCount, lapsedCustomers: lapsedCount, subBreakdown: {
          active: enriched.filter(c => c.customFields.subscriptionStatus === "active").length,
          canceled: enriched.filter(c => c.customFields.subscriptionStatus === "canceled").length,
          expired: enriched.filter(c => c.customFields.subscriptionStatus === "expired").length,
          never: enriched.filter(c => c.customFields.subscriptionStatus === "never").length,
        }},
        duration: Date.now() - t0,
        nextPhase: "enrich",
      });
    }

    // ══════════════════════════════════════
    // PHASE 2: Enrich with charges (LTV, purchase history)
    // ══════════════════════════════════════
    if (body.action === "enrich") {
      const stripeKey = await getTenantStripeKey(ctx.tenantId);
      if (!stripeKey) return NextResponse.json({ error: "Stripe not connected." }, { status: 400 });
      const t0 = Date.now();

      // Pull charges — go back to 2023 as requested
      const since2023 = Math.floor(new Date("2023-01-01").getTime() / 1000);
      const charges = await stripeList<any>(stripeKey, "/charges", { "created[gte]": String(since2023) }, 100);

      // Index by customer
      const chargesByCustomer = new Map<string, any[]>();
      for (const ch of charges) {
        if (!ch.customer || ch.status !== "succeeded") continue;
        (chargesByCustomer.get(ch.customer) || (chargesByCustomer.set(ch.customer, []), chargesByCustomer.get(ch.customer)!)).push(ch);
      }

      // Get all stripe-imported contacts
      await setTenantContext(ctx.tenantId);
      const existingContacts = await db.select({ id: contacts.id, customFields: contacts.customFields, tags: contacts.tags })
        .from(contacts)
        .where(and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.source, "stripe_import")));

      let enrichedCount = 0;
      let totalRevenue = 0;

      for (const contact of existingContacts) {
        const cf = (contact.customFields as any) || {};
        const stripeId = cf.stripeCustomerId;
        if (!stripeId) continue;

        const custCharges = chargesByCustomer.get(stripeId);
        if (!custCharges || custCharges.length === 0) continue;

        const ltv = custCharges.reduce((s: number, c: any) => s + (c.amount / 100), 0);
        totalRevenue += ltv;
        const purchaseCount = custCharges.length;
        const amounts = custCharges.map((c: any) => c.amount / 100);
        const chargeDates = custCharges.map((c: any) => c.created).sort((a: number, b: number) => b - a);
        const lastPurchaseDate = new Date(chargeDates[0] * 1000).toISOString();
        const firstPurchaseDate = new Date(chargeDates[chargeDates.length - 1] * 1000).toISOString();
        const daysSince = Math.floor((Date.now() - chargeDates[0] * 1000) / 86400000);

        // Build tags
        const existingTags = (contact.tags as string[]) || [];
        const newTags = [...existingTags.filter(t => !["Whale","Mid-Tier","Low-Tier","High Frequency","Recently Active","Win-Back"].includes(t))];
        if (ltv >= 500) newTags.push("Whale");
        else if (ltv >= 200) newTags.push("Mid-Tier");
        else if (ltv > 0) newTags.push("Low-Tier");
        if (purchaseCount >= 10) newTags.push("High Frequency");
        if (daysSince <= 30) newTags.push("Recently Active");
        if (daysSince > 90 && ltv > 0) newTags.push("Win-Back");

        // Update status based on recency if not already active subscriber
        let newStatus: string | undefined;
        if (cf.subscriptionStatus !== "active") {
          if (daysSince <= 30) newStatus = "active";
          else if (daysSince <= 90) newStatus = "lead";
          else newStatus = "inactive";
        }

        // Update the contact
        const updateData: any = {
          tags: newTags,
          customFields: {
            ...cf,
            ltv: Math.round(ltv * 100) / 100,
            purchaseCount,
            avgOrderValue: Math.round((ltv / purchaseCount) * 100) / 100,
            lastPurchaseDate,
            firstPurchaseDate,
            daysSinceLastPurchase: daysSince,
            highestCharge: Math.max(...amounts),
            totalCharges: purchaseCount,
          },
          updatedAt: new Date(),
        };
        if (newStatus) updateData.status = newStatus;

        await db.update(contacts).set(updateData).where(eq(contacts.id, contact.id));
        enrichedCount++;
      }

      return NextResponse.json({
        success: true, phase: 2,
        chargesFound: charges.length,
        contactsEnriched: enrichedCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgLTV: enrichedCount > 0 ? Math.round((totalRevenue / enrichedCount) * 100) / 100 : 0,
        tierBreakdown: {
          whales: existingContacts.filter(c => { const ltv = chargesByCustomer.get((c.customFields as any)?.stripeCustomerId)?.reduce((s: number, ch: any) => s + ch.amount/100, 0) || 0; return ltv >= 500; }).length,
          mid: existingContacts.filter(c => { const ltv = chargesByCustomer.get((c.customFields as any)?.stripeCustomerId)?.reduce((s: number, ch: any) => s + ch.amount/100, 0) || 0; return ltv >= 200 && ltv < 500; }).length,
          low: existingContacts.filter(c => { const ltv = chargesByCustomer.get((c.customFields as any)?.stripeCustomerId)?.reduce((s: number, ch: any) => s + ch.amount/100, 0) || 0; return ltv > 0 && ltv < 200; }).length,
        },
        duration: Date.now() - t0,
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
    for (const k of ["stripeSecretKey","stripeAccountName","stripeConnectedAt","lastStripeSync","lastStripeSyncResult"]) delete s[k];
    await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}
