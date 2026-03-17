import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { invoices, contacts, tenants } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { ok, created, validationError, withErrorHandler } from "@/lib/api/responses";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { setTenantContext } from "@/lib/db";
import { sendNotification } from "@/lib/services/notifications";
import Stripe from "stripe";

/**
 * GET /api/invoices — List invoices for tenant
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const conditions = [eq(invoices.tenantId, ctx.tenantId)];
  if (status) conditions.push(eq(invoices.status, status));

  const rows = await db.select().from(invoices)
    .where(and(...conditions))
    .orderBy(desc(invoices.createdAt))
    .limit(Math.min(limit, 100));

  const [{ total }] = await db.select({ total: count() }).from(invoices)
    .where(and(...conditions));

  return ok({ data: rows, total: Number(total) });
});

/**
 * POST /api/invoices — Create and optionally send an invoice
 * Uses Stripe Invoicing API if tenant has Stripe connected.
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:create");
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  if (!body.contactId && !body.contactEmail) {
    return validationError({ contact: ["Contact ID or email is required"] });
  }
  if (!body.items?.length) {
    return validationError({ items: ["At least one line item is required"] });
  }

  // Calculate totals
  const subtotal = body.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0);
  const taxRate = body.taxRate || 0;
  const tax = Math.round(subtotal * taxRate) / 100;
  const total = subtotal + tax;

  // Get tenant Stripe config
  const [tenant] = await db.select({ settings: tenants.settings }).from(tenants)
    .where(eq(tenants.id, ctx.tenantId)).limit(1);
  const stripeKey = (tenant?.settings as any)?.stripe?.secretKey;

  let stripeInvoiceId: string | null = null;
  let stripeInvoiceUrl: string | null = null;

  // If Stripe is connected, create a real Stripe invoice
  if (stripeKey && body.contactEmail) {
    try {
      const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" as any });

      // Find or create Stripe customer
      const customers = await stripe.customers.list({ email: body.contactEmail, limit: 1 });
      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: body.contactEmail,
          name: body.contactName || undefined,
        });
        customerId = customer.id;
      }

      // Create invoice
      const stripeInvoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: false, // Don't auto-finalize
        collection_method: "send_invoice",
        days_until_due: body.dueInDays || 30,
      });

      // Add line items
      for (const item of body.items) {
        await (stripe.invoiceItems as any).create({
          customer: customerId,
          invoice: stripeInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_amount: Math.round(item.unitPrice * 100),
        });
      }

      // Finalize and send
      if (body.sendImmediately !== false) {
        const finalized = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
        await stripe.invoices.sendInvoice(stripeInvoice.id);
        stripeInvoiceUrl = finalized.hosted_invoice_url || null;
      }

      stripeInvoiceId = stripeInvoice.id;
    } catch (err) {
      console.error("[Invoice] Stripe error:", err);
      // Continue — still create local record even if Stripe fails
    }
  }

  // Create local invoice record
  const [invoice] = await db.insert(invoices).values({
    tenantId: ctx.tenantId,
    contactId: body.contactId || null,
    status: body.sendImmediately !== false ? "sent" : "draft",
    total: total.toFixed(2),
    items: body.items,
    dueDate: body.dueDate || new Date(Date.now() + (body.dueInDays || 30) * 86400000).toISOString().split("T")[0],
    stripeInvoiceId,
  } as any).returning();

  // Notify
  sendNotification({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type: "invoice.paid" as any,
    title: `Invoice created`,
    body: `$${total.toFixed(2)} invoice ${body.sendImmediately !== false ? "sent" : "drafted"}`,
    actionUrl: `/dashboard/invoices`,
  });

  return created({
    data: invoice,
    stripeInvoiceId,
    stripeInvoiceUrl,
  });
});

/**
 * PATCH /api/invoices — Update invoice status
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing invoice id"] });
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  const updates: any = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.paidAt !== undefined) updates.paidAt = new Date(body.paidAt);

  const [updated] = await db.update(invoices).set(updates)
    .where(and(eq(invoices.id, id), eq(invoices.tenantId, ctx.tenantId)))
    .returning();

  return ok({ data: updated });
});
