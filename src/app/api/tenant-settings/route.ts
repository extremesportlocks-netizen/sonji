import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    return NextResponse.json({
      name: tenant.name,
      slug: tenant.slug,
      industry: tenant.industry,
      plan: tenant.plan,
      settings: tenant.settings || {},
      branding: tenant.branding || {},
    });
  } catch { return NextResponse.json({ error: "Auth required" }, { status: 401 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const body = await req.json();

    const updates: any = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.industry !== undefined) updates.industry = body.industry;
    if (body.branding !== undefined) updates.branding = body.branding;

    // Merge settings (don't overwrite integration config)
    if (body.settings !== undefined) {
      const [current] = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
      updates.settings = { ...(current?.settings as any || {}), ...body.settings };
    }

    const [updated] = await db.update(tenants).set(updates).where(eq(tenants.id, ctx.tenantId)).returning();
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
