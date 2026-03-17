import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { forms, formSubmissions } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { ok, created, validationError, withErrorHandler } from "@/lib/api/responses";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { setTenantContext } from "@/lib/db";

/**
 * GET /api/forms — List all forms for the tenant
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const rows = await db.select().from(forms)
    .where(eq(forms.tenantId, ctx.tenantId))
    .orderBy(desc(forms.createdAt));

  // Get submission counts per form
  const withCounts = await Promise.all(rows.map(async (form) => {
    const [{ total }] = await db.select({ total: count() }).from(formSubmissions)
      .where(eq(formSubmissions.formId, form.id));
    return { ...form, submissionCount: Number(total) };
  }));

  return ok({ data: withCounts, total: withCounts.length });
});

/**
 * POST /api/forms — Create a new form
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:create");
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  if (!body.name) return validationError({ name: ["Form name is required"] });

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const [form] = await db.insert(forms).values({
    tenantId: ctx.tenantId,
    name: body.name,
    slug,
    fields: body.fields || [],
    settings: body.settings || {},
    status: "active",
  }).returning();

  return created({ data: form });
});

/**
 * PATCH /api/forms — Update a form
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing form id"] });
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  const updates: any = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.fields !== undefined) updates.fields = body.fields;
  if (body.settings !== undefined) updates.settings = body.settings;
  if (body.status !== undefined) updates.status = body.status;

  const [updated] = await db.update(forms).set(updates)
    .where(and(eq(forms.id, id), eq(forms.tenantId, ctx.tenantId)))
    .returning();

  return ok({ data: updated });
});

/**
 * DELETE /api/forms — Delete a form
 */
export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing form id"] });
  const ctx = await requireAuth(req);

  await db.delete(forms).where(and(eq(forms.id, id), eq(forms.tenantId, ctx.tenantId)));
  return ok({ deleted: true });
});
