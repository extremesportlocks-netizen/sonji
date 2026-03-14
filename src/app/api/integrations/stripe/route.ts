import { NextRequest, NextResponse } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { tenants, contacts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";
import { inngest } from "@/lib/inngest/client";

export const maxDuration = 300;
const STRIPE_API = "https://api.stripe.com/v1";

async function getTenantStripeKey(tid: string) {
  const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tid)).limit(1);
  return (r[0]?.settings as any)?.stripeSecretKey || null;
}

async function getTenantSettings(tid: string) {
  const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tid)).limit(1);
  return (r[0]?.settings as any) || {};
}

async function verifyKey(key: string) {
  try {
    const r = await fetch(`${STRIPE_API}/account`, { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) return { valid: false, error: (await r.json()).error?.message || "Invalid" };
    const a = await r.json();
    return { valid: true, accountName: a.settings?.dashboard?.display_name || a.business_profile?.name || a.email || "Stripe" };
  } catch { return { valid: false, error: "Cannot reach Stripe" }; }
}

// ─── GET ───
export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const key = await getTenantStripeKey(ctx.tenantId);
    if (!key) return NextResponse.json({ connected: false });
    const v = await verifyKey(key);
    return NextResponse.json({ connected: v.valid, accountName: v.accountName, error: v.error });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}

// ─── POST ───
export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();

    // ── CONNECT ──
    if (body.action === "connect") {
      const key = body.stripeSecretKey;
      if (!key?.startsWith("sk_")) return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      const v = await verifyKey(key);
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });
      const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      await db.update(tenants).set({ settings: { ...(r[0]?.settings as any || {}), stripeSecretKey: key, stripeAccountName: v.accountName, stripeConnectedAt: new Date().toISOString() }, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true, accountName: v.accountName });
    }

    // ── DISCONNECT ──
    if (body.action === "disconnect") {
      const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      const s = (r[0]?.settings as any) || {};
      for (const k of ["stripeSecretKey","stripeAccountName","stripeConnectedAt","lastStripeSync","lastStripeSyncResult","syncProgress"]) delete s[k];
      await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
      return NextResponse.json({ success: true });
    }

    // ══════════════════════════════════════════
    // ── SYNC: Fire Inngest background job ──
    // ══════════════════════════════════════════
    if (body.action === "sync") {
      const stripeKey = await getTenantStripeKey(ctx.tenantId);
      if (!stripeKey) return NextResponse.json({ error: "Stripe not connected." }, { status: 400 });

      // Clear previous progress
      const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      const current = (r[0]?.settings as any) || {};
      await db.update(tenants).set({
        settings: { ...current, syncProgress: { status: "starting", startedAt: new Date().toISOString() } },
        updatedAt: new Date(),
      }).where(eq(tenants.id, ctx.tenantId));

      // Fire Inngest event — returns immediately
      await inngest.send({
        name: "stripe/sync.requested",
        data: {
          tenantId: ctx.tenantId,
          stripeKey,
        },
      });

      return NextResponse.json({ success: true, status: "started", message: "Stripe sync started in background" });
    }

    // ── SYNC STATUS: Poll for progress ──
    if (body.action === "sync-status") {
      const settings = await getTenantSettings(ctx.tenantId);
      return NextResponse.json({
        progress: settings.syncProgress || null,
        lastSync: settings.lastStripeSync || null,
        lastResult: settings.lastStripeSyncResult || null,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[Stripe]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

// ─── DELETE ───
export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const r = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    const s = (r[0]?.settings as any) || {};
    for (const k of ["stripeSecretKey","stripeAccountName","stripeConnectedAt","lastStripeSync","lastStripeSyncResult","syncProgress"]) delete s[k];
    await db.update(tenants).set({ settings: s, updatedAt: new Date() }).where(eq(tenants.id, ctx.tenantId));
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}
