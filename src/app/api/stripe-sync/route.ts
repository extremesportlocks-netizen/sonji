import { NextRequest, NextResponse } from "next/server";
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

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_API = "https://api.stripe.com/v1";

/**
 * Fetch all pages of a Stripe list endpoint.
 */
async function stripeListAll<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  if (!STRIPE_SECRET) throw new Error("STRIPE_SECRET_KEY not configured");

  const all: T[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const qs = new URLSearchParams({ limit: "100", ...params });
    if (startingAfter) qs.set("starting_after", startingAfter);

    const res = await fetch(`${STRIPE_API}${endpoint}?${qs.toString()}`, {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
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

/**
 * POST /api/stripe-sync
 *
 * Body:
 * {
 *   "syncCustomers": true,
 *   "syncSubscriptions": true,
 *   "syncInvoices": true,
 *   "syncPayments": true,
 *   "dryRun": true,
 *   "sinceTimestamp": 1700000000
 * }
 */
export async function POST(request: NextRequest) {
  try {
    if (!STRIPE_SECRET) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to environment variables." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const config: SyncConfig = {
      tenantId: "default", // In production: resolve from auth context
      syncCustomers: body.syncCustomers ?? true,
      syncSubscriptions: body.syncSubscriptions ?? true,
      syncInvoices: body.syncInvoices ?? true,
      syncPayments: body.syncPayments ?? true,
      dryRun: body.dryRun ?? false,
      sinceTimestamp: body.sinceTimestamp,
    };

    // Fetch all data from Stripe in parallel
    const [customers, subscriptions, invoices, charges] = await Promise.all([
      config.syncCustomers ? stripeListAll<StripeCustomer>("/customers") : Promise.resolve([]),
      config.syncSubscriptions ? stripeListAll<StripeSubscription>("/subscriptions", { status: "all" }) : Promise.resolve([]),
      config.syncInvoices ? stripeListAll<StripeInvoice>("/invoices") : Promise.resolve([]),
      config.syncPayments ? stripeListAll<StripeCharge>("/charges") : Promise.resolve([]),
    ]);

    // Run through sync engine
    const { result, contacts, deals, invoices: mappedInvoices, payments } = runSync(config, {
      customers,
      subscriptions,
      invoices,
      charges,
    });

    // Compute revenue metrics
    const metrics = computeStripeMetrics(contacts, deals, mappedInvoices, payments);

    // TODO: When database is live, insert contacts/deals/invoices/payments here
    // For now, return the mapped data so the frontend can display it

    return NextResponse.json({
      success: true,
      result,
      summary: formatSyncSummary(result),
      metrics,
      data: config.dryRun ? { contacts, deals, invoices: mappedInvoices, payments } : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/stripe-sync
 *
 * Returns sync status and capabilities.
 */
export async function GET() {
  return NextResponse.json({
    configured: !!STRIPE_SECRET,
    endpoints: {
      sync: "POST /api/stripe-sync",
      description: "Import customers, subscriptions, invoices, and payments from Stripe",
    },
    options: {
      syncCustomers: "boolean — import Stripe customers as contacts",
      syncSubscriptions: "boolean — import subscriptions as deals",
      syncInvoices: "boolean — import invoices",
      syncPayments: "boolean — import charges as payment records",
      dryRun: "boolean — return mapped data without saving to database",
      sinceTimestamp: "number — only sync records created after this unix timestamp",
    },
  });
}
