import { inngest } from "../client";
import { db, setTenantContext } from "@/lib/db";
import { tenants, contacts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

const STRIPE_API = "https://api.stripe.com/v1";

// Fetch one page from Stripe
async function stripePage(key: string, endpoint: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ limit: "100", ...params });
  const res = await fetch(`${STRIPE_API}${endpoint}?${qs}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Stripe API error: ${err.error?.message || res.statusText}`);
  }
  return res.json();
}

// Fetch all pages from a Stripe list endpoint (no limit)
async function stripeListAll(key: string, endpoint: string, params: Record<string, string> = {}) {
  const all: any[] = [];
  let hasMore = true;
  let after: string | undefined;
  while (hasMore) {
    const p = { ...params };
    if (after) p.starting_after = after;
    const data = await stripePage(key, endpoint, p);
    all.push(...data.data);
    hasMore = data.has_more;
    if (data.data.length) after = data.data[data.data.length - 1].id;
  }
  return all;
}

// Update sync progress in tenant settings (UI polls this)
async function updateProgress(tenantId: string, progress: Record<string, any>) {
  const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const current = (rows[0]?.settings as any) || {};
  await db.update(tenants).set({
    settings: { ...current, syncProgress: progress },
    updatedAt: new Date(),
  }).where(eq(tenants.id, tenantId));
}

// ═══════════════════════════════════════
// THE INNGEST FUNCTION
// ═══════════════════════════════════════

export const stripeSyncFunction = inngest.createFunction(
  {
    id: "stripe-full-sync",
    retries: 3,
    concurrency: [{ limit: 1 }], // Only one sync at a time
  },
  { event: "stripe/sync.requested" },
  async ({ event, step }) => {
    const { tenantId, stripeKey } = event.data;

    // ── STEP 1: Pull all customers ──
    const customers = await step.run("pull-customers", async () => {
      await updateProgress(tenantId, { status: "pulling_customers", startedAt: new Date().toISOString() });
      const result = await stripeListAll(stripeKey, "/customers");
      await updateProgress(tenantId, { status: "customers_done", customersFound: result.length });
      return result;
    });

    // ── STEP 2: Pull all subscriptions ──
    const subscriptions = await step.run("pull-subscriptions", async () => {
      await updateProgress(tenantId, { status: "pulling_subscriptions", customersFound: customers.length });
      const result = await stripeListAll(stripeKey, "/subscriptions", { status: "all" });
      await updateProgress(tenantId, { status: "subscriptions_done", customersFound: customers.length, subscriptionsFound: result.length });
      return result;
    });

    // ── STEPS 3-N: Pull charges in batches of 500 ──
    // Each batch is its own retriable step with its own 300s timeout
    let allCharges: any[] = [];
    let hasMore = true;
    let lastId: string | undefined;
    let batchNum = 0;

    while (hasMore) {
      batchNum++;
      const batchResult = await step.run(`pull-charges-batch-${batchNum}`, async () => {
        const charges: any[] = [];
        let more = true;
        let after = lastId;
        let pages = 0;

        // 5 pages per step = 500 charges per step
        while (more && pages < 5) {
          const params: Record<string, string> = { limit: "100" };
          if (after) params.starting_after = after;
          const data = await stripePage(stripeKey, "/charges", params);
          charges.push(...data.data);
          more = data.has_more;
          if (data.data.length) after = data.data[data.data.length - 1].id;
          pages++;
        }

        return { charges, hasMore: more, lastId: after };
      });

      allCharges = allCharges.concat(batchResult.charges);
      hasMore = batchResult.hasMore;
      lastId = batchResult.lastId || undefined;

      // Update progress so UI can show real-time status
      await step.run(`progress-charges-${batchNum}`, async () => {
        await updateProgress(tenantId, {
          status: "pulling_charges",
          customersFound: customers.length,
          subscriptionsFound: subscriptions.length,
          chargesSoFar: allCharges.length,
          batch: batchNum,
        });
      });
    }

    // ── STEP N+1: Enrich and insert into database ──
    const result = await step.run("enrich-and-insert", async () => {
      await updateProgress(tenantId, { status: "enriching", chargesTotal: allCharges.length });

      // Index charges by customer
      const chargeMap = new Map<string, any[]>();
      for (const ch of allCharges) {
        if (!ch.customer || ch.status !== "succeeded") continue;
        (chargeMap.get(ch.customer) || (chargeMap.set(ch.customer, []), chargeMap.get(ch.customer)!)).push(ch);
      }

      // Index subs by customer
      const subMap = new Map<string, any[]>();
      for (const sub of subscriptions) {
        const cid = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!cid) continue;
        (subMap.get(cid) || (subMap.set(cid, []), subMap.get(cid)!)).push(sub);
      }

      // Build enriched contacts
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
          tenantId,
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

      // Delete old + batch insert
      await setTenantContext(tenantId);
      await db.delete(contacts).where(and(eq(contacts.tenantId, tenantId), eq(contacts.source, "stripe_import")));
      let inserted = 0;
      for (let i = 0; i < rows.length; i += 100) {
        try {
          await db.insert(contacts).values(rows.slice(i, i + 100));
          inserted += Math.min(100, rows.length - i);
        } catch (e) {
          console.error(`[StripeSync] Batch insert error at ${i}:`, e);
        }
      }

      return {
        imported: inserted,
        totalRevenue: Math.round(totalRev * 100) / 100,
        chargesProcessed: allCharges.length,
        activeSubscribers: activeCount,
        lapsedCustomers: lapsedCount,
      };
    });

    // ── FINAL STEP: Mark complete ──
    await step.run("mark-complete", async () => {
      const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
      const current = (rows[0]?.settings as any) || {};
      await db.update(tenants).set({
        settings: {
          ...current,
          lastStripeSync: new Date().toISOString(),
          lastStripeSyncResult: {
            contacts: result.imported,
            charges: result.chargesProcessed,
            totalRevenue: result.totalRevenue,
            active: result.activeSubscribers,
            lapsed: result.lapsedCustomers,
            completedAt: new Date().toISOString(),
          },
          syncProgress: {
            status: "complete",
            imported: result.imported,
            chargesProcessed: result.chargesProcessed,
            totalRevenue: result.totalRevenue,
            completedAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date(),
      }).where(eq(tenants.id, tenantId));
    });

    return result;
  }
);
