import { NextRequest, NextResponse } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { tenants, contacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";
import {
  runSync,
  formatSyncSummary,
  computeStripeMetrics,
  type StripeCustomer,
  type StripeSubscription,
  type StripeInvoice,
  type StripeCharge,
  type SyncConfig,
} from "@/lib/services/stripe-sync";

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
  } catch (err) {
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
      startingAfter = data.data[data.data.length - 1].id;
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
  } catch (err) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
}

// ─── POST — Connect Stripe (save key) or trigger sync ───

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();

    // ── CONNECT: Save Stripe API key ──
    if (body.action === "connect") {
      const key = body.stripeSecretKey;
      if (!key || !key.startsWith("sk_")) {
        return NextResponse.json({ error: "Invalid Stripe secret key. Must start with sk_" }, { status: 400 });
      }

      // Verify the key works
      const verification = await verifyStripeKey(key);
      if (!verification.valid) {
        return NextResponse.json({ error: verification.error || "Invalid Stripe key" }, { status: 400 });
      }

      // Save to tenant settings
      const rows = await db
        .select({ settings: tenants.settings })
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId))
        .limit(1);

      const currentSettings = (rows[0]?.settings as Record<string, any>) || {};
      const updatedSettings = {
        ...currentSettings,
        stripeSecretKey: key,
        stripeAccountName: verification.accountName,
        stripeConnectedAt: new Date().toISOString(),
      };

      await db
        .update(tenants)
        .set({ settings: updatedSettings, updatedAt: new Date() })
        .where(eq(tenants.id, ctx.tenantId));

      return NextResponse.json({
        success: true,
        accountName: verification.accountName,
        message: `Connected to ${verification.accountName}`,
      });
    }

    // ── DISCONNECT: Remove Stripe key ──
    if (body.action === "disconnect") {
      const rows = await db
        .select({ settings: tenants.settings })
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId))
        .limit(1);

      const currentSettings = (rows[0]?.settings as Record<string, any>) || {};
      delete currentSettings.stripeSecretKey;
      delete currentSettings.stripeAccountName;
      delete currentSettings.stripeConnectedAt;

      await db
        .update(tenants)
        .set({ settings: currentSettings, updatedAt: new Date() })
        .where(eq(tenants.id, ctx.tenantId));

      return NextResponse.json({ success: true, message: "Stripe disconnected" });
    }

    // ── SYNC: Pull data from Stripe and import into CRM ──
    if (body.action === "sync") {
      const stripeKey = await getTenantStripeKey(ctx.tenantId);
      if (!stripeKey) {
        return NextResponse.json({ error: "Stripe not connected. Add your API key first." }, { status: 400 });
      }

      const config: SyncConfig = {
        tenantId: ctx.tenantId,
        syncCustomers: body.syncCustomers ?? true,
        syncSubscriptions: body.syncSubscriptions ?? false,
        syncInvoices: body.syncInvoices ?? false,
        syncPayments: body.syncPayments ?? false,
        dryRun: body.dryRun ?? false,
        sinceTimestamp: body.sinceTimestamp,
      };

      // Fetch from Stripe
      const [customers, subscriptions, invoices, charges] = await Promise.all([
        config.syncCustomers ? stripeListAll<StripeCustomer>(stripeKey, "/customers") : Promise.resolve([]),
        config.syncSubscriptions ? stripeListAll<StripeSubscription>(stripeKey, "/subscriptions", { status: "all" }) : Promise.resolve([]),
        config.syncInvoices ? stripeListAll<StripeInvoice>(stripeKey, "/invoices") : Promise.resolve([]),
        config.syncPayments ? stripeListAll<StripeCharge>(stripeKey, "/charges") : Promise.resolve([]),
      ]);

      // Map through sync engine
      const { result, contacts: mappedContacts, deals, invoices: mappedInvoices, payments } = runSync(config, {
        customers,
        subscriptions,
        invoices,
        charges,
      });

      // ── INSERT CONTACTS INTO DATABASE ──
      if (!config.dryRun && mappedContacts.length > 0) {
        await setTenantContext(ctx.tenantId);

        // Batch insert — 50 at a time to avoid query size limits
        const batchSize = 50;
        let insertedCount = 0;

        for (let i = 0; i < mappedContacts.length; i += batchSize) {
          const batch = mappedContacts.slice(i, i + batchSize);
          const values = batch.map((c) => ({
            tenantId: ctx.tenantId,
            firstName: c.firstName,
            lastName: c.lastName || "",
            email: c.email || "",
            phone: c.phone || "",
            company: c.company || "",
            tags: c.tags,
            customFields: c.customFields,
            source: "stripe_import",
            status: c.status,
          }));

          try {
            await db.insert(contacts).values(values);
            insertedCount += batch.length;
          } catch (err) {
            console.error(`[StripeSync] Batch insert error at offset ${i}:`, err);
            result.contacts.errors.push(`Batch at offset ${i} failed: ${err instanceof Error ? err.message : "Unknown"}`);
          }
        }

        result.contacts.imported = insertedCount;
      }

      // Save last sync timestamp to tenant settings
      if (!config.dryRun) {
        const rows = await db
          .select({ settings: tenants.settings })
          .from(tenants)
          .where(eq(tenants.id, ctx.tenantId))
          .limit(1);

        const currentSettings = (rows[0]?.settings as Record<string, any>) || {};
        await db
          .update(tenants)
          .set({
            settings: {
              ...currentSettings,
              lastStripeSync: new Date().toISOString(),
              lastStripeSyncResult: {
                contacts: result.contacts.imported,
                deals: result.deals.imported,
                invoices: result.invoices.imported,
                payments: result.payments.imported,
                duration: result.syncDuration,
              },
            },
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, ctx.tenantId));
      }

      // Compute metrics
      const metrics = computeStripeMetrics(mappedContacts, deals, mappedInvoices, payments);

      return NextResponse.json({
        success: true,
        result,
        summary: formatSyncSummary(result),
        metrics,
        stripeStats: {
          customersFound: customers.length,
          subscriptionsFound: subscriptions.length,
          invoicesFound: invoices.length,
          chargesFound: charges.length,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action. Use: connect, disconnect, or sync" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[StripeIntegration]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE — Disconnect Stripe ───

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);

    const rows = await db
      .select({ settings: tenants.settings })
      .from(tenants)
      .where(eq(tenants.id, ctx.tenantId))
      .limit(1);

    const currentSettings = (rows[0]?.settings as Record<string, any>) || {};
    delete currentSettings.stripeSecretKey;
    delete currentSettings.stripeAccountName;
    delete currentSettings.stripeConnectedAt;
    delete currentSettings.lastStripeSync;
    delete currentSettings.lastStripeSyncResult;

    await db
      .update(tenants)
      .set({ settings: currentSettings, updatedAt: new Date() })
      .where(eq(tenants.id, ctx.tenantId));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
}
