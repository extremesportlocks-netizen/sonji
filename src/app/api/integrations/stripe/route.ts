import { NextRequest, NextResponse } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { tenants, contacts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";

const STRIPE_API = "https://api.stripe.com/v1";

// ─── HELPERS ───

async function getTenantStripeKey(tenantId: string): Promise<string | null> {
  const rows = await db
    .select({ settings: tenants.settings })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!rows.length) return null;
  const settings = rows[0].settings as Record<string, any> | null;
  return settings?.stripeSecretKey || null;
}

async function verifyStripeKey(key: string): Promise<{ valid: boolean; accountName?: string; error?: string }> {
  try {
    const res = await fetch(`${STRIPE_API}/account`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const err = await res.json();
      return { valid: false, error: err.error?.message || "Invalid API key" };
    }
    const account = await res.json();
    return {
      valid: true,
      accountName: account.settings?.dashboard?.display_name || account.business_profile?.name || account.email || "Stripe Account",
    };
  } catch {
    return { valid: false, error: "Failed to reach Stripe API" };
  }
}

async function stripeListAll<T>(key: string, endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  const all: T[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const qs = new URLSearchParams({ limit: "100", ...params });
    if (startingAfter) qs.set("starting_after", startingAfter);

    const res = await fetch(`${STRIPE_API}${endpoint}?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Stripe API error: ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    all.push(...data.data);
    hasMore = data.has_more;
    if (data.data.length > 0) {
      startingAfter = (data.data[data.data.length - 1] as any).id;
    }
  }

  return all;
}

// ─── GET — Check Stripe connection status ───

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const key = await getTenantStripeKey(ctx.tenantId);

    if (!key) {
      return NextResponse.json({ connected: false });
    }

    const verification = await verifyStripeKey(key);
    return NextResponse.json({
      connected: verification.valid,
      accountName: verification.accountName,
      error: verification.error,
    });
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
}

// ─── POST — Connect, disconnect, or full sync ───

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();

    // ── CONNECT ──
    if (body.action === "connect") {
      const key = body.stripeSecretKey;
      if (!key || !key.startsWith("sk_")) {
        return NextResponse.json({ error: "Invalid Stripe secret key. Must start with sk_" }, { status: 400 });
      }

      const verification = await verifyStripeKey(key);
      if (!verification.valid) {
        return NextResponse.json({ error: verification.error || "Invalid key" }, { status: 400 });
      }

      const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      const currentSettings = (rows[0]?.settings as Record<string, any>) || {};

      await db.update(tenants).set({
        settings: {
          ...currentSettings,
          stripeSecretKey: key,
          stripeAccountName: verification.accountName,
          stripeConnectedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      }).where(eq(tenants.id, ctx.tenantId));

      return NextResponse.json({ success: true, accountName: verification.accountName });
    }

    // ── DISCONNECT ──
    if (body.action === "disconnect") {
      const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      const s = (rows[0]?.settings as Record<string, any>) || {};
      delete s.stripeSecretKey; delete s.stripeAccountName; delete s.stripeConnectedAt;
      delete s.lastStripeSync; delete s.lastStripeSyncResult;
      await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true });
    }

    // ══════════════════════════════════════════
    // ── FULL SYNC: Pull EVERYTHING from Stripe ──
    // ══════════════════════════════════════════
    if (body.action === "sync") {
      const stripeKey = await getTenantStripeKey(ctx.tenantId);
      if (!stripeKey) {
        return NextResponse.json({ error: "Stripe not connected." }, { status: 400 });
      }

      const dryRun = body.dryRun ?? false;
      const startTime = Date.now();

      // ── STEP 1: Pull customers, charges, and subscriptions in parallel ──
      const [customers, charges, subscriptions] = await Promise.all([
        stripeListAll<any>(stripeKey, "/customers"),
        stripeListAll<any>(stripeKey, "/charges"),
        stripeListAll<any>(stripeKey, "/subscriptions", { status: "all" }),
      ]);

      // ── STEP 2: Index charges by customer ──
      const chargesByCustomer = new Map<string, any[]>();
      for (const charge of charges) {
        if (!charge.customer || charge.status !== "succeeded") continue;
        const existing = chargesByCustomer.get(charge.customer) || [];
        existing.push(charge);
        chargesByCustomer.set(charge.customer, existing);
      }

      // ── STEP 3: Index subscriptions by customer ──
      const subsByCustomer = new Map<string, any[]>();
      for (const sub of subscriptions) {
        const custId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!custId) continue;
        const existing = subsByCustomer.get(custId) || [];
        existing.push(sub);
        subsByCustomer.set(custId, existing);
      }

      // ── STEP 4: Build enriched contact records ──
      const enrichedContacts: any[] = [];
      let totalRevenue = 0;
      let activeCount = 0;
      let lapsedCount = 0;

      for (const customer of customers) {
        const custCharges = chargesByCustomer.get(customer.id) || [];
        const custSubs = subsByCustomer.get(customer.id) || [];

        // LTV from charges
        const ltv = custCharges.reduce((sum: number, c: any) => sum + (c.amount / 100), 0);
        totalRevenue += ltv;
        const purchaseCount = custCharges.length;
        const amounts = custCharges.map((c: any) => c.amount / 100);

        // Dates
        const chargeDates = custCharges.map((c: any) => c.created).sort((a: number, b: number) => b - a);
        const lastPurchaseDate = chargeDates.length > 0 ? new Date(chargeDates[0] * 1000).toISOString() : null;
        const firstPurchaseDate = chargeDates.length > 0 ? new Date(chargeDates[chargeDates.length - 1] * 1000).toISOString() : null;

        // Days since last purchase
        const daysSinceLastPurchase = lastPurchaseDate
          ? Math.floor((Date.now() - new Date(lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
          : null;

        // Subscription status
        const activeSub = custSubs.find((s: any) => s.status === "active" || s.status === "trialing");
        const hasAnySub = custSubs.length > 0;
        const canceledSub = custSubs.find((s: any) => s.status === "canceled");

        // Determine status
        let status = "lead";
        if (activeSub) {
          status = "active";
          activeCount++;
        } else if (canceledSub || (hasAnySub && !activeSub)) {
          status = "inactive";
          lapsedCount++;
        } else if (purchaseCount > 0 && daysSinceLastPurchase !== null) {
          if (daysSinceLastPurchase <= 30) { status = "active"; activeCount++; }
          else if (daysSinceLastPurchase <= 90) { status = "lead"; }
          else { status = "inactive"; lapsedCount++; }
        }

        // Tier tagging
        const tags: string[] = ["Stripe Import"];
        if (ltv >= 500) tags.push("Whale");
        else if (ltv >= 200) tags.push("Mid-Tier");
        else if (ltv > 0) tags.push("Low-Tier");
        if (activeSub) tags.push("Active Subscriber");
        if (canceledSub && !activeSub) tags.push("Lapsed");
        if (purchaseCount >= 10) tags.push("High Frequency");
        if (daysSinceLastPurchase !== null && daysSinceLastPurchase <= 30 && !activeSub) tags.push("Recently Active");
        if (daysSinceLastPurchase !== null && daysSinceLastPurchase > 90 && ltv > 0) tags.push("Win-Back");

        // Subscription details
        let subscriptionPlan = null;
        let subscriptionInterval = null;
        let subscriptionAmount = null;
        if (activeSub) {
          const item = activeSub.items?.data?.[0];
          subscriptionPlan = item?.price?.nickname || item?.price?.product || activeSub.id;
          subscriptionInterval = item?.price?.recurring?.interval || "month";
          subscriptionAmount = item?.price?.unit_amount ? item.price.unit_amount / 100 : null;
        }

        // Parse name
        const nameParts = (customer.name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || customer.email?.split("@")[0] || "Unknown";
        const lastName = nameParts.slice(1).join(" ") || "";

        enrichedContacts.push({
          tenantId: ctx.tenantId,
          firstName,
          lastName,
          email: customer.email || "",
          phone: customer.phone || "",
          company: customer.metadata?.company || customer.description || "",
          tags,
          customFields: {
            stripeCustomerId: customer.id,
            ltv: Math.round(ltv * 100) / 100,
            purchaseCount,
            avgOrderValue: purchaseCount > 0 ? Math.round((ltv / purchaseCount) * 100) / 100 : 0,
            lastPurchaseDate,
            firstPurchaseDate,
            daysSinceLastPurchase,
            subscriptionStatus: activeSub ? "active" : canceledSub ? "canceled" : hasAnySub ? "expired" : purchaseCount > 0 ? "one-time" : "never",
            subscriptionPlan,
            subscriptionInterval,
            subscriptionAmount,
            totalCharges: purchaseCount,
            highestCharge: amounts.length > 0 ? Math.max(...amounts) : 0,
            stripeCurrency: customer.currency || "usd",
            stripeCreated: new Date(customer.created * 1000).toISOString(),
          },
          source: "stripe_import",
          status,
        });
      }

      // ── STEP 5: Insert into database ──
      let insertedCount = 0;
      if (!dryRun && enrichedContacts.length > 0) {
        await setTenantContext(ctx.tenantId);

        // Delete existing stripe imports first (clean re-sync)
        await db.delete(contacts).where(
          and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.source, "stripe_import"))
        );

        // Batch insert
        const batchSize = 50;
        for (let i = 0; i < enrichedContacts.length; i += batchSize) {
          const batch = enrichedContacts.slice(i, i + batchSize);
          try {
            await db.insert(contacts).values(batch);
            insertedCount += batch.length;
          } catch (err) {
            console.error(`[StripeSync] Batch error at ${i}:`, err);
          }
        }
      }

      // ── STEP 6: Save sync metadata ──
      if (!dryRun) {
        const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
        const currentSettings = (rows[0]?.settings as Record<string, any>) || {};
        await db.update(tenants).set({
          settings: {
            ...currentSettings,
            lastStripeSync: new Date().toISOString(),
            lastStripeSyncResult: {
              contacts: insertedCount,
              charges: charges.length,
              subscriptions: subscriptions.length,
              totalRevenue: Math.round(totalRevenue * 100) / 100,
              activeSubscribers: activeCount,
              lapsedCustomers: lapsedCount,
              duration: Date.now() - startTime,
            },
          },
          updatedAt: new Date(),
        }).where(eq(tenants.id, ctx.tenantId));
      }

      // ── Build tier breakdown ──
      const tierBreakdown = {
        whales: enrichedContacts.filter((c) => (c.customFields.ltv || 0) >= 500).length,
        mid: enrichedContacts.filter((c) => (c.customFields.ltv || 0) >= 200 && (c.customFields.ltv || 0) < 500).length,
        low: enrichedContacts.filter((c) => (c.customFields.ltv || 0) > 0 && (c.customFields.ltv || 0) < 200).length,
        noPurchase: enrichedContacts.filter((c) => (c.customFields.ltv || 0) === 0).length,
      };

      const subBreakdown = {
        active: enrichedContacts.filter((c) => c.customFields.subscriptionStatus === "active").length,
        canceled: enrichedContacts.filter((c) => c.customFields.subscriptionStatus === "canceled").length,
        expired: enrichedContacts.filter((c) => c.customFields.subscriptionStatus === "expired").length,
        oneTime: enrichedContacts.filter((c) => c.customFields.subscriptionStatus === "one-time").length,
        never: enrichedContacts.filter((c) => c.customFields.subscriptionStatus === "never").length,
      };

      return NextResponse.json({
        success: true,
        dryRun,
        stripeData: {
          customersFound: customers.length,
          chargesFound: charges.length,
          subscriptionsFound: subscriptions.length,
        },
        imported: dryRun ? 0 : insertedCount,
        metrics: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          avgLTV: customers.length > 0 ? Math.round((totalRevenue / customers.length) * 100) / 100 : 0,
          activeSubscribers: activeCount,
          lapsedCustomers: lapsedCount,
          tierBreakdown,
          subBreakdown,
        },
        duration: Date.now() - startTime,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[StripeIntegration]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE ───

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const rows = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const s = (rows[0]?.settings as Record<string, any>) || {};
    delete s.stripeSecretKey; delete s.stripeAccountName; delete s.stripeConnectedAt;
    delete s.lastStripeSync; delete s.lastStripeSyncResult;
    await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
}
