import { NextRequest, NextResponse } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { tenants, contacts, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";
import { sendSMS, sendBatchSMS } from "@/lib/services/sms";

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();
    await setTenantContext(ctx.tenantId);

    // Get tenant SMS config
    const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const smsConfig = (r[0]?.settings as any)?.sms;

    // ── SEND SINGLE SMS ──
    if (body.action === "send") {
      const { to, body: messageBody } = body;
      if (!to || !messageBody) return NextResponse.json({ error: "to and body are required" }, { status: 400 });

      const result = await sendSMS(smsConfig, { to, body: messageBody });

      // DEBUG: Log what happened
      console.log("[SMS DEBUG]", {
        smsConfigExists: !!smsConfig,
        smsMode: smsConfig?.mode,
        hasPhoneNumber: !!smsConfig?.twilioPhoneNumber,
        phoneNumber: smsConfig?.twilioPhoneNumber,
        hasSubAccount: !!smsConfig?.subAccountSid,
        to,
        result,
      });

      // Log to messages table
      if (result.success) {
        try {
          const contactRows = await db.select({ id: contacts.id })
            .from(contacts)
            .where(and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.phone, to)))
            .limit(1);

          await db.insert(messages).values({
            tenantId: ctx.tenantId,
            contactId: contactRows[0]?.id || null,
            direction: "outbound",
            channel: "sms",
            body: messageBody,
            status: "sent",
            
          });
        } catch {}
      }

      return NextResponse.json({
        ...result,
        _debug: {
          smsConfigExists: !!smsConfig,
          mode: smsConfig?.mode,
          phoneNumber: smsConfig?.twilioPhoneNumber,
          hasSubAccount: !!smsConfig?.subAccountSid,
          to,
        },
      });
    }

    // ── SEND BATCH SMS ──
    if (body.action === "send-batch") {
      const { recipients, messageTemplate } = body;
      if (!recipients?.length || !messageTemplate) {
        return NextResponse.json({ error: "recipients and messageTemplate required" }, { status: 400 });
      }

      const smsMessages = recipients.map((r: any) => ({
        to: r.phone,
        body: messageTemplate
          .replace(/{{firstName}}/g, r.firstName || "")
          .replace(/{{lastName}}/g, r.lastName || "")
          .replace(/{{company}}/g, r.company || ""),
      }));

      const result = await sendBatchSMS(smsConfig, smsMessages);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
