import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { automations } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { ok, created, validationError, withErrorHandler } from "@/lib/api/responses";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { setTenantContext } from "@/lib/db";

/**
 * GET /api/automations — List all automations for tenant
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const rows = await db.select().from(automations)
    .where(eq(automations.tenantId, ctx.tenantId))
    .orderBy(desc(automations.createdAt));

  return ok({ data: rows, total: rows.length });
});

/**
 * POST /api/automations — Create a new automation
 * Body: { name, trigger: { type, config }, actions: [{ type, ...config }], status? }
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  if (!body.name) return validationError({ name: ["Automation name is required"] });
  if (!body.trigger?.type) return validationError({ trigger: ["Trigger type is required"] });

  const [automation] = await db.insert(automations).values({
    tenantId: ctx.tenantId,
    name: body.name,
    trigger: body.trigger,
    actions: body.actions || [],
    status: body.status || "paused",
  }).returning();

  return created({ data: automation });
});

/**
 * PATCH /api/automations — Update automation (name, trigger, actions, status)
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing automation id"] });
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  const updates: any = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.trigger !== undefined) updates.trigger = body.trigger;
  if (body.actions !== undefined) updates.actions = body.actions;
  if (body.status !== undefined) updates.status = body.status;

  const [updated] = await db.update(automations).set(updates)
    .where(and(eq(automations.id, id), eq(automations.tenantId, ctx.tenantId)))
    .returning();

  return ok({ data: updated });
});

/**
 * DELETE /api/automations — Delete an automation
 */
export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing automation id"] });
  const ctx = await requireAuth(req);

  await db.delete(automations).where(and(eq(automations.id, id), eq(automations.tenantId, ctx.tenantId)));
  return ok({ deleted: true });
});
