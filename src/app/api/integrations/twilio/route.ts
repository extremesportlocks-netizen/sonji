import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";
import { createSubAccount, provisionPhoneNumber, verifyTwilioCredentials } from "@/lib/services/sms";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const sms = (r[0]?.settings as any)?.sms || null;
    return NextResponse.json({
      configured: !!(sms?.twilioPhoneNumber),
      mode: sms?.mode || null,
      phoneNumber: sms?.twilioPhoneNumber || null,
      hasCredentials: !!(sms?.twilioAccountSid || sms?.subAccountSid),
    });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();

    const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const settings = (r[0]?.settings as any) || {};
    const sms = settings.sms || {};

    // ── PROVISION (Platform mode — creates subaccount + buys number) ──
    if (body.action === "provision") {
      // Create Twilio subaccount for this tenant
      const sub = await createSubAccount(ctx.tenantName || "Sonji Tenant");
      if (!sub.success) return NextResponse.json({ error: sub.error }, { status: 400 });

      // Provision a phone number on the subaccount
      const phone = await provisionPhoneNumber(sub.subAccountSid, sub.subAccountAuthToken, body.areaCode);
      if (!phone.success) return NextResponse.json({ error: phone.error }, { status: 400 });

      await db.update(tenants).set({
        settings: {
          ...settings,
          sms: {
            mode: "platform",
            subAccountSid: sub.subAccountSid,
            subAccountAuthToken: sub.subAccountAuthToken,
            twilioPhoneNumber: phone.phoneNumber,
            phoneSid: phone.phoneSid,
            provisionedAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date(),
      }).where(eq(tenants.id, ctx.tenantId));

      return NextResponse.json({ success: true, phoneNumber: phone.phoneNumber });
    }

    // ── CONNECT BYOK (Bring Your Own Keys) ──
    if (body.action === "connect-byok") {
      const { accountSid, authToken, phoneNumber } = body;
      if (!accountSid || !authToken) return NextResponse.json({ error: "Account SID and Auth Token required" }, { status: 400 });

      const v = await verifyTwilioCredentials(accountSid, authToken);
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });

      // If they didn't specify a number, use their first one
      const number = phoneNumber || (v.phoneNumbers && v.phoneNumbers.length > 0 ? v.phoneNumbers[0] : null);

      await db.update(tenants).set({
        settings: {
          ...settings,
          sms: {
            mode: "byok",
            twilioAccountSid: accountSid,
            twilioAuthToken: authToken,
            twilioPhoneNumber: number,
            availableNumbers: v.phoneNumbers,
            connectedAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date(),
      }).where(eq(tenants.id, ctx.tenantId));

      return NextResponse.json({ success: true, phoneNumber: number, availableNumbers: v.phoneNumbers });
    }

    // ── SELECT PHONE NUMBER (BYOK — pick from their available numbers) ──
    if (body.action === "select-number") {
      if (!body.phoneNumber) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

      await db.update(tenants).set({
        settings: { ...settings, sms: { ...sms, twilioPhoneNumber: body.phoneNumber } },
        updatedAt: new Date(),
      }).where(eq(tenants.id, ctx.tenantId));

      return NextResponse.json({ success: true, phoneNumber: body.phoneNumber });
    }

    // ── DISCONNECT ──
    if (body.action === "disconnect") {
      const { sms: _, ...rest } = settings;
      await db.update(tenants).set({ settings: rest, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
