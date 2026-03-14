import { NextRequest, NextResponse } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { tenants, contacts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";

export const maxDuration = 300;
const STRIPE_API = "https://api.stripe.com/v1";

async function getTenantStripeKey(tid: string) {
  const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tid)).limit(1);
  return (r[0]?.settings as any)?.stripeSecretKey || null;
}

async function verifyKey(key: string) {
  try {
    const r = await fetch(`${STRIPE_API}/account`, { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) return { valid: false, error: (await r.json()).error?.message || "Invalid" };
    const a = await r.json();
    return { valid: true, accountName: a.settings?.dashboard?.display_name || a.business_profile?.name || a.email || "Stripe" };
  } catch { return { valid: false, error: "Cannot reach Stripe" }; }
}

// Fetch one page at a time with a hard page limit
async function stripeFetch<T>(key: string, endpoint: string, params: Record<string, string> = {}, maxPages = 50): Promise<T[]> {
  const all: T[] = [];
  let hasMore = true, after: string | undefined, p = 0;
  while (hasMore && p < maxPages) {
    const qs = new URLSearchParams({ limit: "100", ...params });
    if (after) qs.set("starting_after", after);
    const r = await fetch(`${STRIPE_API}${endpoint}?${qs}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) throw new Error((await r.json()).error?.message || r.statusText);
    const d = await r.json();
    all.push(...d.data);
    hasMore = d.has_more;
    if (d.data.length) after = (d.data[d.data.length - 1] as any).id;
    p++;
  }
  return all;
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const key = await getTenantStripeKey(ctx.tenantId);
    if (!key) return NextResponse.json({ connected: false });
    const v = await verifyKey(key);
    return NextResponse.json({ connected: v.valid, accountName: v.accountName, error: v.error });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();

    if (body.action === "connect") {
      const key = body.stripeSecretKey;
      if (!key?.startsWith("sk_")) return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      const v = await verifyKey(key);
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });
      const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      await db.update(tenants).set({ settings: { ...(r[0]?.settings as any || {}), stripeSecretKey: key, stripeAccountName: v.accountName, stripeConnectedAt: new Date().toISOString() }, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true, accountName: v.accountName });
    }

    if (body.action === "disconnect") {
      const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      const s = (r[0]?.settings as any) || {};
      for (const k of ["stripeSecretKey","stripeAccountName","stripeConnectedAt","lastStripeSync","lastStripeSyncResult"]) delete s[k];
      await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true });
    }

    // ═══════════════════════════════════════════════════════
    // FULL SYNC — One shot. Customers + Subs + Charges.
    // Everything enriched in memory, one bulk insert.
    // ═══════════════════════════════════════════════════════
    if (body.action === "sync") {
      const sk = await getTenantStripeKey(ctx.tenantId);
      if (!sk) return NextResponse.json({ error: "Stripe not connected." }, { status: 400 });
      const dryRun = body.dryRun ?? false;
      const t0 = Date.now();

      // Pull everything in parallel — charges at 20 pages (2K records).
      // Full charge history (7K+) needs background job — serverless can't handle it.
      const [customers, subscriptions, charges] = await Promise.all([
        stripeFetch<any>(sk, "/customers", {}, 50),
        stripeFetch<any>(sk, "/subscriptions", { status: "all" }, 20),
        stripeFetch<any>(sk, "/charges", {}, 20),
      ]);

      // Index charges + subs by customer
      const chargeMap = new Map<string, any[]>();
      for (const ch of charges) {
        if (!ch.customer || ch.status !== "succeeded") continue;
        (chargeMap.get(ch.customer) || (chargeMap.set(ch.customer, []), chargeMap.get(ch.customer)!)).push(ch);
      }
      const subMap = new Map<string, any[]>();
      for (const sub of subscriptions) {
        const cid = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!cid) continue;
        (subMap.get(cid) || (subMap.set(cid, []), subMap.get(cid)!)).push(sub);
      }

      // Build fully enriched contacts
      const rows: any[] = [];
      let totalRev = 0, activeCount = 0, lapsedCount = 0;

      for (const cust of customers) {
        const cc = chargeMap.get(cust.id) || [];
        const cs = subMap.get(cust.id) || [];

        const ltv = cc.reduce((s: number, c: any) => s + c.amount / 100, 0);
        totalRev += ltv;
        const pc = cc.length;
        const dates = cc.map((c: any) => c.created).sort((a: number, b: number) => b - a);
        const lastDate = dates[0] ? new Date(dates[0] * 1000).toISOString() : null;
        const firstDate = dates.length ? new Date(dates[dates.length - 1] * 1000).toISOString() : null;
        const daysSince = dates[0] ? Math.floor((Date.now() - dates[0] * 1000) / 86400000) : null;

        const activeSub = cs.find((s: any) => s.status === "active" || s.status === "trialing");
        const canceledSub = cs.find((s: any) => s.status === "canceled");
        const hasSub = cs.length > 0;

        let status = "lead";
        if (activeSub) { status = "active"; activeCount++; }
        else if (canceledSub || (hasSub && !activeSub)) { status = "inactive"; lapsedCount++; }
        else if (pc > 0 && daysSince !== null) {
          if (daysSince <= 30) { status = "active"; activeCount++; }
          else if (daysSince <= 90) status = "lead";
          else { status = "inactive"; lapsedCount++; }
        }

        const tags: string[] = ["Stripe Import"];
        if (ltv >= 500) tags.push("Whale"); else if (ltv >= 200) tags.push("Mid-Tier"); else if (ltv > 0) tags.push("Low-Tier");
        if (activeSub) tags.push("Active Subscriber");
        if (canceledSub && !activeSub) tags.push("Lapsed");
        if (pc >= 10) tags.push("High Frequency");
        if (daysSince !== null && daysSince <= 30 && !activeSub) tags.push("Recently Active");
        if (daysSince !== null && daysSince > 90 && ltv > 0) tags.push("Win-Back");

        let subPlan = null, subInt = null, subAmt = null, subStart = null, subEnd = null;
        if (activeSub) {
          const it = activeSub.items?.data?.[0];
          subPlan = it?.price?.nickname || (it?.price?.unit_amount ? `$${(it.price.unit_amount/100).toFixed(0)}/${it?.price?.recurring?.interval || "mo"}` : null);
          subInt = it?.price?.recurring?.interval || "month";
          subAmt = it?.price?.unit_amount ? it.price.unit_amount / 100 : null;
          subStart = activeSub.start_date ? new Date(activeSub.start_date * 1000).toISOString() : new Date(activeSub.created * 1000).toISOString();
          subEnd = activeSub.current_period_end ? new Date(activeSub.current_period_end * 1000).toISOString() : null;
        } else if (canceledSub) {
          const it = canceledSub.items?.data?.[0];
          subPlan = it?.price?.nickname || (it?.price?.unit_amount ? `$${(it.price.unit_amount/100).toFixed(0)}/${it?.price?.recurring?.interval || "mo"} (canceled)` : "Canceled");
          subInt = it?.price?.recurring?.interval || "month";
          subAmt = it?.price?.unit_amount ? it.price.unit_amount / 100 : null;
          subStart = canceledSub.start_date ? new Date(canceledSub.start_date * 1000).toISOString() : new Date(canceledSub.created * 1000).toISOString();
          subEnd = canceledSub.canceled_at ? new Date(canceledSub.canceled_at * 1000).toISOString() : null;
        }

        const nm = (cust.name || "").trim().split(/\s+/);
        rows.push({
          tenantId: ctx.tenantId,
          firstName: nm[0] || cust.email?.split("@")[0] || "Unknown",
          lastName: nm.slice(1).join(" ") || "",
          email: cust.email || "", phone: cust.phone || "",
          company: cust.metadata?.company || cust.description || "",
          tags, source: "stripe_import", status,
          customFields: {
            stripeCustomerId: cust.id, ltv: Math.round(ltv * 100) / 100, purchaseCount: pc,
            avgOrderValue: pc > 0 ? Math.round((ltv / pc) * 100) / 100 : 0,
            lastPurchaseDate: lastDate, firstPurchaseDate: firstDate, daysSinceLastPurchase: daysSince,
            subscriptionStatus: activeSub ? "active" : canceledSub ? "canceled" : hasSub ? "expired" : pc > 0 ? "one-time" : "never",
            subscriptionPlan: subPlan, subscriptionInterval: subInt, subscriptionAmount: subAmt,
            subscriptionStart: subStart, subscriptionEnd: subEnd,
            highestCharge: cc.length ? Math.max(...cc.map((c: any) => c.amount / 100)) : 0,
            totalCharges: pc, stripeCreated: new Date(cust.created * 1000).toISOString(),
          },
        });
      }

      // One delete + one batch insert
      let inserted = 0;
      if (!dryRun && rows.length > 0) {
        await setTenantContext(ctx.tenantId);
        await db.delete(contacts).where(and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.source, "stripe_import")));
        for (let i = 0; i < rows.length; i += 100) {
          try { await db.insert(contacts).values(rows.slice(i, i + 100)); inserted += Math.min(100, rows.length - i); } catch (e) { console.error(`[Sync] batch ${i}:`, e); }
        }
      }

      // Save metadata
      if (!dryRun) {
        const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
        await db.update(tenants).set({ settings: { ...(r[0]?.settings as any || {}), lastStripeSync: new Date().toISOString(), lastStripeSyncResult: { contacts: inserted, charges: charges.length, subscriptions: subscriptions.length, totalRevenue: Math.round(totalRev * 100) / 100, active: activeCount, lapsed: lapsedCount, duration: Date.now() - t0 } }, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      }

      const tb = { whales: 0, mid: 0, low: 0, none: 0 };
      const sb: Record<string, number> = {};
      for (const r of rows) {
        const l = r.customFields.ltv || 0;
        if (l >= 500) tb.whales++; else if (l >= 200) tb.mid++; else if (l > 0) tb.low++; else tb.none++;
        const ss = r.customFields.subscriptionStatus;
        sb[ss] = (sb[ss] || 0) + 1;
      }

      return NextResponse.json({
        success: true, dryRun,
        stripeData: { customersFound: customers.length, chargesFound: charges.length, subscriptionsFound: subscriptions.length },
        imported: dryRun ? 0 : inserted,
        metrics: { totalRevenue: Math.round(totalRev * 100) / 100, avgLTV: rows.length ? Math.round((totalRev / rows.length) * 100) / 100 : 0, activeSubscribers: activeCount, lapsedCustomers: lapsedCount, tierBreakdown: tb, subBreakdown: sb },
        duration: Date.now() - t0,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[Stripe]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const s = (r[0]?.settings as any) || {};
    for (const k of ["stripeSecretKey","stripeAccountName","stripeConnectedAt","lastStripeSync","lastStripeSyncResult"]) delete s[k];
    await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}
