import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, contacts, tenants } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * POST /api/webhooks/twilio — Twilio inbound SMS webhook
 * 
 * Twilio sends form-encoded data when an SMS is received.
 * We match the sender phone to a contact and create an inbox message.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;
    const body = formData.get("Body") as string;

    if (!from || !body) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // Normalize phone (strip +1 prefix for US numbers)
    const normalizedPhone = from.replace(/^\+1/, "").replace(/\D/g, "");
    const phoneVariants = [from, `+1${normalizedPhone}`, normalizedPhone, `(${normalizedPhone.slice(0,3)}) ${normalizedPhone.slice(3,6)}-${normalizedPhone.slice(6)}`];

    // Find contact by phone across all tenants
    const contactRows = await db.select().from(contacts)
      .where(
        sql`REPLACE(REPLACE(REPLACE(REPLACE(${contacts.phone}, ' ', ''), '-', ''), '(', ''), ')', '') LIKE ${'%' + normalizedPhone}`
      )
      .limit(1);

    const contact = contactRows[0];

    if (contact) {
      // Create inbound message
      await db.insert(messages).values({
        tenantId: contact.tenantId,
        contactId: contact.id,
        direction: "inbound",
        channel: "sms",
        body,
        status: "new",
      });

      console.log(`[Twilio Webhook] SMS from ${from}: "${body.substring(0, 50)}..." → contact ${contact.id}`);
    } else {
      console.log(`[Twilio Webhook] SMS from unknown ${from}: "${body.substring(0, 50)}..."`);
    }

    // Return TwiML empty response
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (err) {
    console.error("[Twilio Webhook] Error:", err);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
