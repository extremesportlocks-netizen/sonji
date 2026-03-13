/**
 * STRIPE SYNC ENGINE
 *
 * Imports and syncs data from an existing Stripe account into Sonji.
 * Converts Stripe objects into CRM contacts, deals, and invoices.
 *
 * Supports:
 * - Full initial import (all customers, subscriptions, invoices)
 * - Incremental sync (only new/changed since last sync)
 * - Webhook-driven real-time sync
 * - Bi-directional: Sonji can also push to Stripe
 *
 * Pure logic — Stripe API calls are abstracted behind a fetcher interface.
 * In production, swap the mock fetcher for real stripe.customers.list(), etc.
 */

// ════════════════════════════════════════
// TYPES — STRIPE RAW DATA
// ════════════════════════════════════════

export interface StripeCustomer {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  metadata: Record<string, string>;
  created: number; // unix timestamp
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
  currency?: string;
  delinquent?: boolean;
  description?: string | null;
  default_source?: string | null;
}

export interface StripeSubscription {
  id: string;
  customer: string; // customer ID
  status: "active" | "past_due" | "canceled" | "unpaid" | "trialing" | "incomplete" | "incomplete_expired" | "paused";
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  created: number;
  items: {
    data: {
      id: string;
      price: {
        id: string;
        unit_amount: number | null;
        currency: string;
        recurring?: { interval: string; interval_count: number } | null;
        product: string;
        nickname?: string | null;
      };
      quantity: number;
    }[];
  };
  metadata: Record<string, string>;
}

export interface StripeInvoice {
  id: string;
  customer: string;
  number: string | null;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  due_date: number | null;
  paid: boolean;
  hosted_invoice_url?: string | null;
  lines: {
    data: {
      description: string | null;
      amount: number;
      quantity: number | null;
      price?: { unit_amount: number | null } | null;
    }[];
  };
  metadata: Record<string, string>;
  subscription?: string | null;
}

export interface StripePaymentIntent {
  id: string;
  customer: string | null;
  amount: number;
  currency: string;
  status: "succeeded" | "processing" | "requires_payment_method" | "requires_confirmation" | "canceled" | "requires_action";
  created: number;
  description?: string | null;
  metadata: Record<string, string>;
  invoice?: string | null;
}

export interface StripeCharge {
  id: string;
  customer: string | null;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed";
  created: number;
  description?: string | null;
  receipt_url?: string | null;
  paid: boolean;
  refunded: boolean;
  metadata: Record<string, string>;
}

// ════════════════════════════════════════
// TYPES — SONJI MAPPED DATA
// ════════════════════════════════════════

export interface SonjiContact {
  stripeCustomerId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  source: string;
  status: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: Date;
}

export interface SonjiDeal {
  stripeSubscriptionId: string;
  contactStripeId: string;
  title: string;
  value: number; // monthly value in dollars
  totalValue: number; // total lifetime value
  stage: string;
  status: string;
  currency: string;
  billingInterval: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, string>;
  createdAt: Date;
}

export interface SonjiInvoice {
  stripeInvoiceId: string;
  contactStripeId: string;
  number: string;
  total: number; // in dollars
  amountPaid: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: Date | null;
  paidAt: Date | null;
  hostedUrl: string | null;
  lineItems: { description: string; quantity: number; amount: number }[];
  createdAt: Date;
}

export interface SonjiPayment {
  stripePaymentId: string;
  contactStripeId: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  receiptUrl: string | null;
  createdAt: Date;
}

// ════════════════════════════════════════
// SYNC CONFIGURATION
// ════════════════════════════════════════

export interface SyncConfig {
  tenantId: string;
  stripeSecretKey?: string; // only needed for real API calls
  syncCustomers: boolean;
  syncSubscriptions: boolean;
  syncInvoices: boolean;
  syncPayments: boolean;
  sinceTimestamp?: number; // unix timestamp — only sync records created/updated after this
  customerTagMapping?: Record<string, string>; // stripe metadata key → sonji tag
  defaultPipeline?: string;
  dryRun?: boolean; // if true, return what would be imported without saving
}

export interface SyncResult {
  success: boolean;
  dryRun: boolean;
  contacts: { imported: number; updated: number; skipped: number; errors: string[] };
  deals: { imported: number; updated: number; skipped: number; errors: string[] };
  invoices: { imported: number; updated: number; skipped: number; errors: string[] };
  payments: { imported: number; skipped: number; errors: string[] };
  totalRecords: number;
  syncDuration: number; // ms
  lastSyncTimestamp: number;
}

// ════════════════════════════════════════
// CUSTOMER → CONTACT MAPPING
// ════════════════════════════════════════

/**
 * Convert a Stripe customer to a Sonji contact.
 */
export function mapCustomerToContact(customer: StripeCustomer): SonjiContact {
  const nameParts = (customer.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || customer.email?.split("@")[0] || "Unknown";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Determine status from Stripe data
  let status = "active";
  if (customer.delinquent) status = "at-risk";

  // Build tags from metadata
  const tags: string[] = ["Stripe Import"];
  if (customer.metadata?.plan) tags.push(customer.metadata.plan);
  if (customer.metadata?.source) tags.push(customer.metadata.source);
  if (customer.delinquent) tags.push("Delinquent");

  return {
    stripeCustomerId: customer.id,
    firstName,
    lastName,
    email: customer.email,
    phone: customer.phone,
    company: customer.metadata?.company || customer.description || null,
    address: customer.address?.line1 || null,
    city: customer.address?.city || null,
    state: customer.address?.state || null,
    zip: customer.address?.postal_code || null,
    source: "stripe_import",
    status,
    tags,
    customFields: {
      stripeId: customer.id,
      stripeCurrency: customer.currency || "usd",
      ...customer.metadata,
    },
    createdAt: new Date(customer.created * 1000),
  };
}

// ════════════════════════════════════════
// SUBSCRIPTION → DEAL MAPPING
// ════════════════════════════════════════

/**
 * Convert a Stripe subscription to a Sonji deal.
 */
export function mapSubscriptionToDeal(sub: StripeSubscription): SonjiDeal {
  // Calculate monthly value from subscription items
  const monthlyAmount = sub.items.data.reduce((total, item) => {
    const unitAmount = (item.price.unit_amount || 0) / 100; // cents to dollars
    const qty = item.quantity || 1;
    const interval = item.price.recurring?.interval || "month";
    const intervalCount = item.price.recurring?.interval_count || 1;

    // Normalize to monthly
    let monthly = unitAmount * qty;
    if (interval === "year") monthly = monthly / 12;
    if (interval === "week") monthly = monthly * 4.33;
    if (interval === "day") monthly = monthly * 30;
    if (intervalCount > 1 && interval === "month") monthly = monthly / intervalCount;

    return total + monthly;
  }, 0);

  // Calculate total lifetime value (months active × monthly amount)
  const monthsActive = Math.max(1, Math.round((Date.now() / 1000 - sub.created) / (30 * 86400)));
  const totalValue = monthlyAmount * monthsActive;

  // Map Stripe status to pipeline stage
  const stageMap: Record<string, string> = {
    trialing: "Trial",
    active: "Active Customer",
    past_due: "At Risk",
    canceled: "Churned",
    unpaid: "At Risk",
    incomplete: "Pending",
    incomplete_expired: "Lost",
    paused: "Paused",
  };

  // Build deal title from product info
  const productNames = sub.items.data
    .map((item) => item.price.nickname || item.price.product)
    .join(" + ");

  const interval = sub.items.data[0]?.price.recurring?.interval || "month";

  return {
    stripeSubscriptionId: sub.id,
    contactStripeId: sub.customer,
    title: productNames || `Subscription ${sub.id.slice(-8)}`,
    value: Math.round(monthlyAmount * 100) / 100,
    totalValue: Math.round(totalValue * 100) / 100,
    stage: stageMap[sub.status] || "Active Customer",
    status: sub.status === "canceled" ? "lost" : sub.status === "active" ? "won" : "open",
    currency: sub.items.data[0]?.price.currency || "usd",
    billingInterval: interval,
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    metadata: sub.metadata,
    createdAt: new Date(sub.created * 1000),
  };
}

// ════════════════════════════════════════
// INVOICE → INVOICE MAPPING
// ════════════════════════════════════════

/**
 * Convert a Stripe invoice to a Sonji invoice.
 */
export function mapStripeInvoice(inv: StripeInvoice): SonjiInvoice {
  // Map Stripe status to Sonji status
  const statusMap: Record<string, SonjiInvoice["status"]> = {
    draft: "draft",
    open: "sent",
    paid: "paid",
    void: "draft",
    uncollectible: "overdue",
  };

  // Check if overdue
  let status = statusMap[inv.status] || "sent";
  if (inv.status === "open" && inv.due_date && inv.due_date * 1000 < Date.now()) {
    status = "overdue";
  }

  return {
    stripeInvoiceId: inv.id,
    contactStripeId: inv.customer,
    number: inv.number || `INV-${inv.id.slice(-6).toUpperCase()}`,
    total: inv.amount_due / 100,
    amountPaid: inv.amount_paid / 100,
    currency: inv.currency,
    status,
    dueDate: inv.due_date ? new Date(inv.due_date * 1000) : null,
    paidAt: inv.paid ? new Date(inv.created * 1000) : null, // approximate
    hostedUrl: inv.hosted_invoice_url || null,
    lineItems: inv.lines.data.map((line) => ({
      description: line.description || "Subscription",
      quantity: line.quantity || 1,
      amount: line.amount / 100,
    })),
    createdAt: new Date(inv.created * 1000),
  };
}

// ════════════════════════════════════════
// CHARGE → PAYMENT MAPPING
// ════════════════════════════════════════

/**
 * Convert a Stripe charge to a Sonji payment record.
 */
export function mapChargeToPayment(charge: StripeCharge): SonjiPayment {
  return {
    stripePaymentId: charge.id,
    contactStripeId: charge.customer,
    amount: charge.amount / 100,
    currency: charge.currency,
    status: charge.status,
    description: charge.description || null,
    receiptUrl: charge.receipt_url || null,
    createdAt: new Date(charge.created * 1000),
  };
}

// ════════════════════════════════════════
// FULL SYNC ORCHESTRATOR
// ════════════════════════════════════════

/**
 * Run a full sync from Stripe to Sonji.
 * Accepts raw Stripe data (fetched separately) and returns mapped Sonji objects.
 */
export function runSync(
  config: SyncConfig,
  data: {
    customers: StripeCustomer[];
    subscriptions: StripeSubscription[];
    invoices: StripeInvoice[];
    charges: StripeCharge[];
  }
): {
  result: SyncResult;
  contacts: SonjiContact[];
  deals: SonjiDeal[];
  invoices: SonjiInvoice[];
  payments: SonjiPayment[];
} {
  const startTime = Date.now();
  const result: SyncResult = {
    success: true,
    dryRun: config.dryRun || false,
    contacts: { imported: 0, updated: 0, skipped: 0, errors: [] },
    deals: { imported: 0, updated: 0, skipped: 0, errors: [] },
    invoices: { imported: 0, updated: 0, skipped: 0, errors: [] },
    payments: { imported: 0, skipped: 0, errors: [] },
    totalRecords: 0,
    syncDuration: 0,
    lastSyncTimestamp: Math.floor(Date.now() / 1000),
  };

  // ── Map customers to contacts ──
  const contacts: SonjiContact[] = [];
  if (config.syncCustomers) {
    for (const customer of data.customers) {
      try {
        // Filter by timestamp if incremental sync
        if (config.sinceTimestamp && customer.created < config.sinceTimestamp) {
          result.contacts.skipped++;
          continue;
        }
        const contact = mapCustomerToContact(customer);

        // Apply custom tag mapping
        if (config.customerTagMapping) {
          for (const [metaKey, tag] of Object.entries(config.customerTagMapping)) {
            if (customer.metadata[metaKey]) {
              contact.tags.push(`${tag}: ${customer.metadata[metaKey]}`);
            }
          }
        }

        contacts.push(contact);
        result.contacts.imported++;
      } catch (err) {
        result.contacts.errors.push(`Customer ${customer.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
  }

  // ── Map subscriptions to deals ──
  const deals: SonjiDeal[] = [];
  if (config.syncSubscriptions) {
    for (const sub of data.subscriptions) {
      try {
        if (config.sinceTimestamp && sub.created < config.sinceTimestamp) {
          result.deals.skipped++;
          continue;
        }
        const deal = mapSubscriptionToDeal(sub);
        deals.push(deal);
        result.deals.imported++;
      } catch (err) {
        result.deals.errors.push(`Subscription ${sub.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
  }

  // ── Map invoices ──
  const invoices: SonjiInvoice[] = [];
  if (config.syncInvoices) {
    for (const inv of data.invoices) {
      try {
        if (config.sinceTimestamp && inv.created < config.sinceTimestamp) {
          result.invoices.skipped++;
          continue;
        }
        const mapped = mapStripeInvoice(inv);
        invoices.push(mapped);
        result.invoices.imported++;
      } catch (err) {
        result.invoices.errors.push(`Invoice ${inv.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
  }

  // ── Map charges to payments ──
  const payments: SonjiPayment[] = [];
  if (config.syncPayments) {
    for (const charge of data.charges) {
      try {
        if (config.sinceTimestamp && charge.created < config.sinceTimestamp) {
          result.payments.skipped++;
          continue;
        }
        // Only import successful charges
        if (charge.status !== "succeeded") {
          result.payments.skipped++;
          continue;
        }
        const payment = mapChargeToPayment(charge);
        payments.push(payment);
        result.payments.imported++;
      } catch (err) {
        result.payments.errors.push(`Charge ${charge.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
  }

  result.totalRecords = contacts.length + deals.length + invoices.length + payments.length;
  result.syncDuration = Date.now() - startTime;

  return { result, contacts, deals, invoices, payments };
}

// ════════════════════════════════════════
// SYNC SUMMARY / REPORTING
// ════════════════════════════════════════

/**
 * Generate a human-readable sync summary.
 */
export function formatSyncSummary(result: SyncResult): string {
  const lines = [
    `Stripe Sync ${result.dryRun ? "(DRY RUN)" : "Complete"}`,
    `Duration: ${result.syncDuration}ms`,
    ``,
    `Contacts: ${result.contacts.imported} imported, ${result.contacts.updated} updated, ${result.contacts.skipped} skipped`,
    `Deals: ${result.deals.imported} imported, ${result.deals.updated} updated, ${result.deals.skipped} skipped`,
    `Invoices: ${result.invoices.imported} imported, ${result.invoices.updated} updated, ${result.invoices.skipped} skipped`,
    `Payments: ${result.payments.imported} imported, ${result.payments.skipped} skipped`,
    ``,
    `Total records: ${result.totalRecords}`,
  ];

  const allErrors = [
    ...result.contacts.errors,
    ...result.deals.errors,
    ...result.invoices.errors,
    ...result.payments.errors,
  ];

  if (allErrors.length > 0) {
    lines.push(``, `Errors (${allErrors.length}):`);
    allErrors.forEach((e) => lines.push(`  - ${e}`));
  }

  return lines.join("\n");
}

// ════════════════════════════════════════
// REVENUE ANALYTICS FROM STRIPE DATA
// ════════════════════════════════════════

export interface StripeRevenueMetrics {
  totalRevenue: number;
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  churnRate: number;
  averageRevenuePerCustomer: number;
  totalCustomers: number;
  paidInvoices: number;
  overdueInvoices: number;
  outstandingAmount: number;
  revenueByMonth: { month: string; revenue: number; count: number }[];
  topCustomers: { name: string; email: string | null; totalPaid: number }[];
  subscriptionsByStatus: Record<string, number>;
}

/**
 * Compute revenue metrics from synced Stripe data.
 */
export function computeStripeMetrics(
  contacts: SonjiContact[],
  deals: SonjiDeal[],
  invoices: SonjiInvoice[],
  payments: SonjiPayment[]
): StripeRevenueMetrics {
  // MRR from active subscriptions
  const activeDeals = deals.filter((d) => d.status === "won" || d.stage === "Active Customer");
  const mrr = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const arr = mrr * 12;

  // Churn
  const canceledDeals = deals.filter((d) => d.stage === "Churned" || d.status === "lost");
  const totalDeals = deals.length;
  const churnRate = totalDeals > 0 ? (canceledDeals.length / totalDeals) * 100 : 0;

  // Revenue from paid invoices
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);

  // Outstanding
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const outstandingAmount = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + (i.total - i.amountPaid), 0);

  // ARPC
  const averageRevenuePerCustomer = contacts.length > 0 ? totalRevenue / contacts.length : 0;

  // Revenue by month (last 12 months)
  const monthMap = new Map<string, { revenue: number; count: number }>();
  for (const inv of paidInvoices) {
    const month = inv.createdAt.toLocaleString("en-US", { month: "short", year: "numeric" });
    const existing = monthMap.get(month) || { revenue: 0, count: 0 };
    existing.revenue += inv.total;
    existing.count++;
    monthMap.set(month, existing);
  }
  const revenueByMonth = Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-12);

  // Top customers by total paid
  const customerPayments = new Map<string, { name: string; email: string | null; totalPaid: number }>();
  for (const contact of contacts) {
    customerPayments.set(contact.stripeCustomerId, {
      name: `${contact.firstName} ${contact.lastName}`.trim(),
      email: contact.email,
      totalPaid: 0,
    });
  }
  for (const inv of paidInvoices) {
    const existing = customerPayments.get(inv.contactStripeId);
    if (existing) existing.totalPaid += inv.total;
  }
  const topCustomers = Array.from(customerPayments.values())
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10);

  // Subscriptions by status
  const subscriptionsByStatus: Record<string, number> = {};
  for (const deal of deals) {
    subscriptionsByStatus[deal.stage] = (subscriptionsByStatus[deal.stage] || 0) + 1;
  }

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(arr * 100) / 100,
    activeSubscriptions: activeDeals.length,
    canceledSubscriptions: canceledDeals.length,
    churnRate: Math.round(churnRate * 10) / 10,
    averageRevenuePerCustomer: Math.round(averageRevenuePerCustomer * 100) / 100,
    totalCustomers: contacts.length,
    paidInvoices: paidInvoices.length,
    overdueInvoices: overdueInvoices.length,
    outstandingAmount: Math.round(outstandingAmount * 100) / 100,
    revenueByMonth,
    topCustomers,
    subscriptionsByStatus,
  };
}

// ════════════════════════════════════════
// WEBHOOK EVENT HANDLER
// ════════════════════════════════════════

export type StripeWebhookEvent =
  | "customer.created"
  | "customer.updated"
  | "customer.deleted"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.created"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "invoice.finalized"
  | "charge.succeeded"
  | "charge.failed"
  | "charge.refunded"
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed";

/**
 * Determine what action to take for a Stripe webhook event.
 */
export function handleWebhookEvent(
  eventType: StripeWebhookEvent,
  eventData: any
): { action: string; entity: string; data: any } | null {
  switch (eventType) {
    case "customer.created":
      return { action: "create_contact", entity: "contact", data: mapCustomerToContact(eventData) };

    case "customer.updated":
      return { action: "update_contact", entity: "contact", data: mapCustomerToContact(eventData) };

    case "customer.deleted":
      return { action: "archive_contact", entity: "contact", data: { stripeCustomerId: eventData.id } };

    case "customer.subscription.created":
    case "customer.subscription.updated":
      return { action: "upsert_deal", entity: "deal", data: mapSubscriptionToDeal(eventData) };

    case "customer.subscription.deleted":
      return { action: "close_deal", entity: "deal", data: { stripeSubscriptionId: eventData.id, stage: "Churned", status: "lost" } };

    case "invoice.paid":
      return { action: "update_invoice", entity: "invoice", data: mapStripeInvoice(eventData) };

    case "invoice.payment_failed":
      return { action: "flag_invoice", entity: "invoice", data: { stripeInvoiceId: eventData.id, status: "overdue" } };

    case "charge.succeeded":
      return { action: "record_payment", entity: "payment", data: mapChargeToPayment(eventData) };

    case "charge.refunded":
      return { action: "record_refund", entity: "payment", data: { stripeChargeId: eventData.id, refunded: true } };

    default:
      return null;
  }
}
