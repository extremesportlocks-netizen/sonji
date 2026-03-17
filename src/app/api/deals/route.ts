import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { eq, and, desc, asc, count } from "drizzle-orm";
import { ok, created, notFound, validationError, withErrorHandler } from "@/lib/api/responses";
import { createDealSchema, updateDealSchema, moveDealSchema, parseBody, paginationSchema, parseQuery } from "@/lib/api/validation";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { logActivity } from "@/lib/services/activity-logger";
import { sendNotification } from "@/lib/services/notifications";
import { inngest } from "@/lib/inngest/client";
import { setTenantContext } from "@/lib/db";

/**
 * GET /api/deals — List deals with optional pipeline/stage filters.
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "deals:read");
  await setTenantContext(ctx.tenantId);

  const url = new URL(req.url);
  const { page, pageSize } = parseQuery(url, paginationSchema);
  const pipelineId = url.searchParams.get("pipelineId");
  const stage = url.searchParams.get("stage");
  const status = url.searchParams.get("status");

  const conditions = [eq(deals.tenantId, ctx.tenantId)];
  if (pipelineId) conditions.push(eq(deals.pipelineId, pipelineId));
  if (stage) conditions.push(eq(deals.stage, stage));
  if (status) conditions.push(eq(deals.status, status));

  const [{ total }] = await db.select({ total: count() }).from(deals).where(and(...conditions));

  const rows = await db.select().from(deals)
    .where(and(...conditions))
    .orderBy(desc(deals.updatedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return ok(rows, { page, pageSize, total: Number(total), hasMore: page * pageSize < Number(total) });
});

/**
 * POST /api/deals — Create a new deal.
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "deals:create");
  await setTenantContext(ctx.tenantId);

  const { data, errors } = await parseBody(req, createDealSchema);
  if (errors) return validationError(errors);

  const [deal] = await db.insert(deals).values({
    tenantId: ctx.tenantId,
    pipelineId: data!.pipelineId,
    contactId: data!.contactId,
    title: data!.title,
    value: data!.value ? String(data!.value) : null,
    stage: data!.stage,
    assignedTo: data!.assignedTo,
    expectedClose: data!.expectedClose,
    notes: data!.notes,
  }).returning();

  logActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    contactId: data!.contactId,
    action: "deal.created",
    metadata: { dealId: deal.id, title: deal.title, value: deal.value },
  });

  return created(deal);
});

/**
 * PATCH /api/deals — Move a deal to a new stage (special endpoint for kanban drag).
 * Body: { id: string, stage: string }
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "deals:update");
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  const dealId = body.id;
  const { data, errors } = await parseBody(
    new Request(req.url, { method: "POST", body: JSON.stringify(body), headers: req.headers }),
    moveDealSchema
  );
  if (errors) return validationError(errors);

  // Get current stage before update
  const [current] = await db.select({ stage: deals.stage }).from(deals)
    .where(and(eq(deals.id, dealId), eq(deals.tenantId, ctx.tenantId)));
  if (!current) return notFound("Deal");

  const previousStage = current.stage;
  const newStage = data!.stage;

  const [updated] = await db.update(deals)
    .set({ stage: newStage, updatedAt: new Date() })
    .where(and(eq(deals.id, dealId), eq(deals.tenantId, ctx.tenantId)))
    .returning();

  // Determine action type
  const action = newStage.toLowerCase().includes("won") ? "deal.won"
    : newStage.toLowerCase().includes("lost") ? "deal.lost"
    : "deal.moved";

  logActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    action,
    metadata: { dealId, title: updated.title, from: previousStage, to: newStage },
  });

  if (action === "deal.won") {
    sendNotification({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      type: "deal.won",
      title: "Deal won!",
      body: `${updated.title} moved to ${newStage}. Value: $${updated.value || 0}`,
      actionUrl: `/dashboard/deals?highlight=${dealId}`,
    });
  }

  // Emit Inngest event → triggers automations
  inngest.send({
    name: action === "deal.won" ? "crm/deal.won" : action === "deal.lost" ? "crm/deal.lost" : "crm/deal.stage_changed",
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      dealId,
      dealTitle: updated.title,
      dealValue: updated.value,
      previousStage,
      newStage,
      contactId: updated.contactId,
    },
  }).catch(() => {}); // Fire and forget

  return ok(updated);
});

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing deal id"] });
  const ctx = await requireAuth(req);

  await db.delete(deals).where(and(eq(deals.id, id), eq(deals.tenantId, ctx.tenantId)));
  return ok({ deleted: true });
});
