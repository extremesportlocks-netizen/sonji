import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, contacts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendNotification } from "@/lib/services/notifications";

/**
 * POST /api/webhooks/resend — Resend inbound email webhook
 * 
 * Receives email events from Resend:
 * - email.delivered, email.opened, email.clicked, email.bounced
 * - inbound email (if inbound domain configured)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.type;

    if (eventType === "email.received") {
      // Inbound email → create message in inbox
      const { from, to, subject, text, html } = body.data || {};
      const senderEmail = typeof from === "string" ? from : from?.email;

      if (!senderEmail) return NextResponse.json({ received: true });

      // Find contact by sender email across all tenants
      const contactRows = await db.select().from(contacts)
        .where(eq(contacts.email, senderEmail.toLowerCase()))
        .limit(1);

      const contact = contactRows[0];
      if (!contact) {
        console.log(`[Resend Webhook] No contact found for ${senderEmail}`);
        return NextResponse.json({ received: true });
      }

      // Create inbound message
      await db.insert(messages).values({
        tenantId: contact.tenantId,
        contactId: contact.id,
        direction: "inbound",
        channel: "email",
        subject: subject || "(no subject)",
        body: html || text || "",
        status: "new",
      });

      console.log(`[Resend Webhook] Inbound email from ${senderEmail} for tenant ${contact.tenantId}`);
    }

    if (eventType === "email.opened" || eventType === "email.clicked") {
      // Track engagement — update message status
      const messageId = body.data?.tags?.find((t: any) => t.name === "messageId")?.value;
      if (messageId) {
        await db.update(messages)
          .set({ status: eventType === "email.opened" ? "opened" : "clicked" })
          .where(eq(messages.id, messageId));
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Resend Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
