import { NextRequest, NextResponse } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { tenants, contacts, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";
import { sendEmail, sendBatchEmail } from "@/lib/services/email";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();
    await setTenantContext(ctx.tenantId);

    // Get tenant email config
    const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const emailConfig = (r[0]?.settings as any)?.email;

    // ── SEND SINGLE EMAIL ──
    if (body.action === "send") {
      const { to, subject, html, text, replyTo } = body;
      if (!to || !subject || !html) return NextResponse.json({ error: "to, subject, and html are required" }, { status: 400 });

      const result = await sendEmail(emailConfig, { to, subject, html, text, replyTo });

      // Log to messages table
      if (result.success) {
        try {
          // Find contact by email
          const contactRows = await db.select({ id: contacts.id })
            .from(contacts)
            .where(and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.email, Array.isArray(to) ? to[0] : to)))
            .limit(1);

          await db.insert(messages).values({
            tenantId: ctx.tenantId,
            contactId: contactRows[0]?.id || null,
            direction: "outbound",
            channel: "email",
            subject,
            body: html,
            status: "sent",
            
          });
        } catch {} // Don't fail the send if logging fails
      }

      return NextResponse.json(result);
    }

    // ── SEND BATCH (to a segment/list) ──
    if (body.action === "send-batch") {
      const { recipients, subject, html, text } = body;
      if (!recipients?.length || !subject || !html) {
        return NextResponse.json({ error: "recipients, subject, and html are required" }, { status: 400 });
      }

      const emails = recipients.map((r: any) => ({
        to: r.email,
        subject,
        html: html
          .replace(/{{firstName}}/g, r.firstName || "")
          .replace(/{{lastName}}/g, r.lastName || "")
          .replace(/{{email}}/g, r.email || "")
          .replace(/{{company}}/g, r.company || ""),
        text,
        tags: [{ name: "campaign", value: body.campaignId || "manual" }],
      }));

      const result = await sendBatchEmail(emailConfig, emails);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
