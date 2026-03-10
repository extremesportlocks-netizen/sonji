import { NextRequest, NextResponse } from "next/server";
import { serverError } from "@/lib/api/responses";

/**
 * POST /api/webhooks
 *
 * Central webhook receiver. Routes events from:
 * - Stripe (payment succeeded, subscription updated, invoice paid)
 * - Clerk (user created, org updated)
 * - Resend (email delivered, bounced, opened)
 * - Twilio (SMS delivered, inbound SMS)
 *
 * Each provider sends a source header or uses a distinct URL.
 * We route to the appropriate handler based on the source.
 */

export async function POST(req: NextRequest) {
  try {
    const source = req.headers.get("x-webhook-source") ||
      detectSource(req);

    const body = await req.text(); // raw body for signature verification

    switch (source) {
      case "stripe":
        return await handleStripeWebhook(body, req);
      case "clerk":
        return await handleClerkWebhook(body, req);
      case "resend":
        return await handleResendWebhook(body, req);
      case "twilio":
        return await handleTwilioWebhook(body, req);
      default:
        console.warn(`[Webhook] Unknown source: ${source}`);
        return NextResponse.json({ received: true, source: "unknown" }, { status: 200 });
    }
  } catch (err) {
    console.error("[Webhook] Processing error:", err);
    return serverError("Webhook processing failed");
  }
}

/**
 * Detect webhook source from headers.
 */
function detectSource(req: NextRequest): string {
  if (req.headers.get("stripe-signature")) return "stripe";
  if (req.headers.get("svix-id")) return "clerk"; // Clerk uses Svix
  if (req.headers.get("webhook-id")) return "resend";
  return "unknown";
}

// ════════════════════════════════════════
// STRIPE WEBHOOKS
// ════════════════════════════════════════

async function handleStripeWebhook(rawBody: string, req: NextRequest): Promise<NextResponse> {
  // TODO: Verify signature with stripe.webhooks.constructEvent()
  const event = JSON.parse(rawBody);

  console.log(`[Stripe Webhook] ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed":
      // New subscription created
      // TODO: Update tenant.stripe_subscription_id, set status to active
      break;

    case "customer.subscription.updated":
      // Plan change, renewal, etc.
      // TODO: Update tenant plan, handle downgrades
      break;

    case "customer.subscription.deleted":
      // Cancellation
      // TODO: Update tenant status to churned, trigger retention workflow
      break;

    case "invoice.paid":
      // Payment succeeded
      // TODO: Log billing event, send receipt notification
      break;

    case "invoice.payment_failed":
      // Payment failed
      // TODO: Notify tenant owner, retry logic
      break;

    default:
      console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true, source: "stripe" });
}

// ════════════════════════════════════════
// CLERK WEBHOOKS
// ════════════════════════════════════════

async function handleClerkWebhook(rawBody: string, req: NextRequest): Promise<NextResponse> {
  // TODO: Verify Svix signature
  const event = JSON.parse(rawBody);

  console.log(`[Clerk Webhook] ${event.type}`);

  switch (event.type) {
    case "user.created":
      // New user signed up
      // TODO: Check if user belongs to an org → create user row in tenant
      break;

    case "organization.created":
      // Clerk org created (maps to our tenant)
      break;

    case "organizationMembership.created":
      // User added to org → create user row in tenant
      break;

    case "organizationMembership.deleted":
      // User removed from org → deactivate user row
      break;

    default:
      console.log(`[Clerk Webhook] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true, source: "clerk" });
}

// ════════════════════════════════════════
// RESEND WEBHOOKS
// ════════════════════════════════════════

async function handleResendWebhook(rawBody: string, req: NextRequest): Promise<NextResponse> {
  const event = JSON.parse(rawBody);

  console.log(`[Resend Webhook] ${event.type}`);

  switch (event.type) {
    case "email.delivered":
      // TODO: Update message status, increment campaign stats
      break;
    case "email.opened":
      // TODO: Increment open count on campaign
      break;
    case "email.clicked":
      // TODO: Increment click count, log activity
      break;
    case "email.bounced":
      // TODO: Mark contact email as invalid, increment bounce count
      break;
    default:
      console.log(`[Resend Webhook] Unhandled: ${event.type}`);
  }

  return NextResponse.json({ received: true, source: "resend" });
}

// ════════════════════════════════════════
// TWILIO WEBHOOKS
// ════════════════════════════════════════

async function handleTwilioWebhook(rawBody: string, req: NextRequest): Promise<NextResponse> {
  // Twilio sends form-encoded data, not JSON
  const params = new URLSearchParams(rawBody);
  const status = params.get("SmsStatus") || params.get("MessageStatus");
  const from = params.get("From");
  const body = params.get("Body");

  console.log(`[Twilio Webhook] Status: ${status}, From: ${from}`);

  if (body && from) {
    // Inbound SMS
    // TODO: Match phone number to contact, create message record, trigger automation
  }

  return NextResponse.json({ received: true, source: "twilio" });
}
