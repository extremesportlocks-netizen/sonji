import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts, tenants } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * POST /api/webhooks
 * 
 * Stripe webhooks → real-time contact updates.
 * Updates subscription status, plan, dates, LTV on every Stripe event.
 */

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    // Detect source
    if (sig) return await handleStripe(rawBody, sig);

    // Generic fallback
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handleStripe(rawBody: string, signature: string) {
  const event = JSON.parse(rawBody);

  // TODO: Verify signature with STRIPE_WEBHOOK_SECRET when available
  // const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  // const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

  console.log(`[Stripe Webhook] ${event.type} — ${event.data?.object?.id || "no id"}`);

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      await handleSubscriptionEvent(event);
      break;

    case "charge.succeeded":
      await handleChargeSucceeded(event);
      break;

    case "customer.created":
      await handleCustomerCreated(event);
      break;

    default:
      console.log(`[Stripe Webhook] Unhandled: ${event.type}`);
  }

  return NextResponse.json({ received: true, type: event.type });
}

// ─── Find tenant by Stripe customer ID ───
async function findContactByStripeId(stripeCustomerId: string) {
  const rows = await db.select()
    .from(contacts)
    .where(sql`${contacts.customFields}->>'stripeCustomerId' = ${stripeCustomerId}`)
    .limit(1);
  return rows[0] || null;
}

// ─── SUBSCRIPTION EVENTS ───
async function handleSubscriptionEvent(event: any) {
  const sub = event.data.object;
  const customerId = sub.customer;
  const contact = await findContactByStripeId(customerId);
  if (!contact) { console.log(`[Webhook] No contact for Stripe customer ${customerId}`); return; }

  const cf = (contact.customFields as any) || {};
  const item = sub.items?.data?.[0];
  const price = item?.price;

  // Determine status
  let subStatus = "active";
  if (sub.status === "canceled" || event.type === "customer.subscription.deleted") subStatus = "canceled";
  else if (sub.status === "paused") subStatus = "paused";
  else if (sub.status === "past_due") subStatus = "past_due";
  else if (sub.status === "trialing") subStatus = "active";

  // Build plan name
  let planName = price?.nickname || null;
  if (!planName && price?.unit_amount) {
    planName = `$${(price.unit_amount / 100).toFixed(0)}/${price.recurring?.interval || "mo"}`;
  }
  // Try to get product name
  if (!planName && price?.product) {
    planName = typeof price.product === "string" ? price.product : price.product.name;
  }

  const updates: any = {
    ...cf,
    subscriptionStatus: subStatus,
    subscriptionPlan: planName || cf.subscriptionPlan,
    subscriptionInterval: price?.recurring?.interval || cf.subscriptionInterval,
    subscriptionAmount: price?.unit_amount ? price.unit_amount / 100 : cf.subscriptionAmount,
    subscriptionStart: sub.start_date ? new Date(sub.start_date * 1000).toISOString() : cf.subscriptionStart,
    subscriptionEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : cf.subscriptionEnd,
    lastWebhookUpdate: new Date().toISOString(),
  };

  // If canceled, store cancel date
  if (subStatus === "canceled") {
    updates.subscriptionEnd = sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : new Date().toISOString();
  }

  // Contact status
  const contactStatus = subStatus === "active" ? "active" : "inactive";

  // Update tags
  let tags = Array.isArray(contact.tags) ? [...contact.tags] : [];
  tags = tags.filter(t => !["Active Subscriber", "Lapsed", "Win-Back"].includes(t));
  if (subStatus === "active") tags.push("Active Subscriber");
  else if (subStatus === "canceled") { tags.push("Lapsed"); if (cf.ltv && parseFloat(cf.ltv) > 0) tags.push("Win-Back"); }

  await db.update(contacts).set({
    status: contactStatus,
    tags,
    customFields: updates,
    updatedAt: new Date(),
  }).where(eq(contacts.id, contact.id));

  console.log(`[Webhook] Updated ${contact.email}: sub=${subStatus}, plan=${planName}`);
}

// ─── CHARGE SUCCEEDED ───
async function handleChargeSucceeded(event: any) {
  const charge = event.data.object;
  const customerId = charge.customer;
  if (!customerId) return;

  const contact = await findContactByStripeId(customerId);
  if (!contact) return;

  const cf = (contact.customFields as any) || {};
  const amount = charge.amount / 100;
  const currentLtv = parseFloat(cf.ltv || "0");
  const currentPurchases = parseInt(cf.purchaseCount || "0");

  const newLtv = currentLtv + amount;
  const newPurchases = currentPurchases + 1;
  const newAvgOrder = newLtv / newPurchases;

  const updates: any = {
    ...cf,
    ltv: Math.round(newLtv * 100) / 100,
    purchaseCount: newPurchases,
    avgOrderValue: Math.round(newAvgOrder * 100) / 100,
    lastPurchaseDate: new Date(charge.created * 1000).toISOString(),
    daysSinceLastPurchase: 0, // Just purchased!
    highestCharge: Math.max(parseFloat(cf.highestCharge || "0"), amount),
    lastWebhookUpdate: new Date().toISOString(),
  };

  // Update tier tags
  let tags = Array.isArray(contact.tags) ? [...contact.tags] : [];
  tags = tags.filter(t => !["Whale", "Mid-Tier", "Low-Tier", "Recently Active"].includes(t));
  if (newLtv >= 500) tags.push("Whale");
  else if (newLtv >= 200) tags.push("Mid-Tier");
  else tags.push("Low-Tier");
  tags.push("Recently Active");

  await db.update(contacts).set({
    status: "active",
    tags,
    customFields: updates,
    updatedAt: new Date(),
  }).where(eq(contacts.id, contact.id));

  console.log(`[Webhook] Charge $${amount} for ${contact.email}. New LTV: $${newLtv}`);
}

// ─── CUSTOMER CREATED ───
async function handleCustomerCreated(event: any) {
  const cust = event.data.object;

  // Check if already exists
  const existing = await findContactByStripeId(cust.id);
  if (existing) return; // Already imported

  // Find which tenant this belongs to — check all tenants with Stripe connected
  const allTenants = await db.select({ id: tenants.id, settings: tenants.settings }).from(tenants);
  let tenantId: string | null = null;

  for (const t of allTenants) {
    const s = (t.settings as any) || {};
    if (s.stripeSecretKey) {
      // This tenant has Stripe connected — assume new customers belong to the first tenant with Stripe
      // TODO: In multi-tenant mode, verify via Stripe API that this customer belongs to this tenant's Stripe account
      tenantId = t.id;
      break;
    }
  }

  if (!tenantId) return;

  const nm = (cust.name || "").trim().split(/\s+/);
  await db.insert(contacts).values({
    tenantId,
    firstName: nm[0] || cust.email?.split("@")[0] || "New",
    lastName: nm.slice(1).join(" ") || "",
    email: cust.email || "",
    phone: cust.phone || "",
    tags: ["Stripe Import", "New"],
    source: "stripe_webhook",
    status: "lead",
    customFields: {
      stripeCustomerId: cust.id,
      ltv: 0, purchaseCount: 0, avgOrderValue: 0,
      subscriptionStatus: "never",
      stripeCreated: new Date(cust.created * 1000).toISOString(),
      lastWebhookUpdate: new Date().toISOString(),
    },
  });

  console.log(`[Webhook] New customer created: ${cust.email}`);
}
