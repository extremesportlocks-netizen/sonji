import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { messages, contacts } from "@/lib/db/schema";
import { eq, and, desc, count, or, ilike } from "drizzle-orm";
import { ok, created, validationError, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";
import { setTenantContext } from "@/lib/db";
import { sendEmail } from "@/lib/services/email";
import { sendSMS } from "@/lib/services/sms";
import { inngest } from "@/lib/inngest/client";

/**
 * GET /api/messages — List messages for unified inbox
 * Query: ?channel=email|sms|form&direction=inbound|outbound&contactId=xxx&limit=50
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const url = new URL(req.url);
  const channel = url.searchParams.get("channel");
  const direction = url.searchParams.get("direction");
  const contactId = url.searchParams.get("contactId");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const conditions = [eq(messages.tenantId, ctx.tenantId)];
  if (channel) conditions.push(eq(messages.channel, channel));
  if (direction) conditions.push(eq(messages.direction, direction));
  if (contactId) conditions.push(eq(messages.contactId, contactId));

  const rows = await db.select().from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(Math.min(limit, 200));

  const [{ total }] = await db.select({ total: count() }).from(messages)
    .where(and(...conditions));

  // Get unread count
  const [{ unread }] = await db.select({ unread: count() }).from(messages)
    .where(and(
      eq(messages.tenantId, ctx.tenantId),
      eq(messages.direction, "inbound"),
      eq(messages.status, "new"),
    ));

  return ok({ data: rows, total: Number(total), unreadCount: Number(unread) });
});

/**
 * POST /api/messages — Send a message (email or SMS)
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  const { channel, contactId, to, subject, content } = body;

  if (!channel || !content) {
    return validationError({ fields: ["channel and content are required"] });
  }
  if (!contactId && !to) {
    return validationError({ recipient: ["contactId or to address is required"] });
  }

  // Resolve recipient
  let recipientEmail = to;
  let recipientPhone = to;
  if (contactId) {
    const [contact] = await db.select().from(contacts)
      .where(and(eq(contacts.id, contactId), eq(contacts.tenantId, ctx.tenantId)))
      .limit(1);
    if (contact) {
      recipientEmail = contact.email;
      recipientPhone = contact.phone;
    }
  }

  // Send via appropriate channel
  let sendResult = { success: false };
  if (channel === "email" && recipientEmail) {
    const { tenants } = await import("@/lib/db/schema");
    const [tenant] = await db.select({ settings: tenants.settings }).from(tenants)
      .where(eq(tenants.id, ctx.tenantId)).limit(1);
    const emailConfig = (tenant?.settings as any)?.email;

    sendResult = await sendEmail(emailConfig, {
      to: recipientEmail,
      subject: subject || "Message from your CRM",
      html: content,
    });
  } else if (channel === "sms" && recipientPhone) {
    const { tenants } = await import("@/lib/db/schema");
    const [tenant] = await db.select({ settings: tenants.settings }).from(tenants)
      .where(eq(tenants.id, ctx.tenantId)).limit(1);
    const smsConfig = (tenant?.settings as any)?.sms;

    sendResult = await sendSMS(smsConfig, {
      to: recipientPhone,
      body: content,
    });
  }

  // Log message regardless of send success
  const [message] = await db.insert(messages).values({
    tenantId: ctx.tenantId,
    contactId: contactId || null,
    direction: "outbound",
    channel,
    subject: subject || null,
    body: content,
    status: sendResult.success ? "sent" : "failed",
  }).returning();

  return created({ data: message, sent: sendResult.success });
});

/**
 * PATCH /api/messages — Mark as read/replied
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing message id"] });
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  const updates: any = {};
  if (body.status !== undefined) updates.status = body.status;

  const [updated] = await db.update(messages).set(updates)
    .where(and(eq(messages.id, id), eq(messages.tenantId, ctx.tenantId)))
    .returning();

  return ok({ data: updated });
});
