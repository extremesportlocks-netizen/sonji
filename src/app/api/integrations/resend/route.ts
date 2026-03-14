import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";
import { addDomain, verifyDomain, getDomainStatus, removeDomain, verifyResendKey } from "@/lib/services/email";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const email = (r[0]?.settings as any)?.email || null;
    return NextResponse.json({
      configured: !!(email?.domainVerified || email?.resendApiKey),
      mode: email?.mode || null,
      domain: email?.domain || null,
      domainVerified: email?.domainVerified || false,
      fromEmail: email?.fromEmail || null,
      fromName: email?.fromName || null,
      dnsRecords: email?.dnsRecords || null,
    });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();

    const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const settings = (r[0]?.settings as any) || {};
    const email = settings.email || {};

    // ── ADD DOMAIN (platform mode) ──
    if (body.action === "add-domain") {
      const domain = body.domain?.trim().toLowerCase();
      if (!domain || !domain.includes(".")) return NextResponse.json({ error: "Invalid domain" }, { status: 400 });

      const result = await addDomain(domain, email.mode === "byok" ? email.resendApiKey : undefined);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

      await db.update(tenants).set({
        settings: {
          ...settings,
          email: {
            ...email,
            mode: email.mode || "platform",
            domain,
            domainId: result.domainId,
            domainVerified: false,
            dnsRecords: result.records,
            fromEmail: body.fromEmail || `noreply@${domain}`,
            fromName: body.fromName || ctx.tenantName || "Sonji",
          },
        },
        updatedAt: new Date(),
      }).where(eq(tenants.id, ctx.tenantId));

      return NextResponse.json({ success: true, domainId: result.domainId, records: result.records });
    }

    // ── VERIFY DOMAIN ──
    if (body.action === "verify-domain") {
      if (!email.domainId) return NextResponse.json({ error: "No domain to verify" }, { status: 400 });

      const result = await verifyDomain(email.domainId, email.mode === "byok" ? email.resendApiKey : undefined);

      if (result.verified) {
        await db.update(tenants).set({
          settings: { ...settings, email: { ...email, domainVerified: true } },
          updatedAt: new Date(),
        }).where(eq(tenants.id, ctx.tenantId));
      }

      return NextResponse.json({ verified: result.verified, status: result.status, error: result.error });
    }

    // ── CHECK DOMAIN STATUS ──
    if (body.action === "domain-status") {
      if (!email.domainId) return NextResponse.json({ error: "No domain configured" }, { status: 400 });

      const result = await getDomainStatus(email.domainId, email.mode === "byok" ? email.resendApiKey : undefined);

      if (result.status === "verified" && !email.domainVerified) {
        await db.update(tenants).set({
          settings: { ...settings, email: { ...email, domainVerified: true } },
          updatedAt: new Date(),
        }).where(eq(tenants.id, ctx.tenantId));
      }

      return NextResponse.json({ status: result.status, records: result.records });
    }

    // ── CONNECT BYOK (Bring Your Own Key) ──
    if (body.action === "connect-byok") {
      const apiKey = body.resendApiKey;
      if (!apiKey?.startsWith("re_")) return NextResponse.json({ error: "Invalid Resend key (must start with re_)" }, { status: 400 });

      const v = await verifyResendKey(apiKey);
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });

      await db.update(tenants).set({
        settings: {
          ...settings,
          email: {
            ...email,
            mode: "byok",
            resendApiKey: apiKey,
          },
        },
        updatedAt: new Date(),
      }).where(eq(tenants.id, ctx.tenantId));

      return NextResponse.json({ success: true });
    }

    // ── UPDATE FROM ADDRESS ──
    if (body.action === "update-from") {
      await db.update(tenants).set({
        settings: {
          ...settings,
          email: {
            ...email,
            fromName: body.fromName || email.fromName,
            fromEmail: body.fromEmail || email.fromEmail,
            replyTo: body.replyTo || email.replyTo,
          },
        },
        updatedAt: new Date(),
      }).where(eq(tenants.id, ctx.tenantId));

      return NextResponse.json({ success: true });
    }

    // ── DISCONNECT ──
    if (body.action === "disconnect") {
      if (email.domainId) {
        await removeDomain(email.domainId, email.mode === "byok" ? email.resendApiKey : undefined).catch(() => {});
      }
      const { email: _, ...rest } = settings;
      await db.update(tenants).set({ settings: rest, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
