import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { ok, created, validationError, notFound, withErrorHandler } from "@/lib/api/responses";
import { createTaskSchema, updateTaskSchema, parseBody, paginationSchema, parseQuery } from "@/lib/api/validation";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { logActivity } from "@/lib/services/activity-logger";
import { sendNotification } from "@/lib/services/notifications";
import { setTenantContext } from "@/lib/db";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "tasks:read");
  await setTenantContext(ctx.tenantId);

  const url = new URL(req.url);
  const { page, pageSize } = parseQuery(url, paginationSchema);
  const status = url.searchParams.get("status");
  const assignedTo = url.searchParams.get("assignedTo");
  const priority = url.searchParams.get("priority");

  const conditions = [eq(tasks.tenantId, ctx.tenantId)];
  if (status) conditions.push(eq(tasks.status, status));
  if (assignedTo) conditions.push(eq(tasks.assignedTo, assignedTo));
  if (priority) conditions.push(eq(tasks.priority, priority));

  const [{ total }] = await db.select({ total: count() }).from(tasks).where(and(...conditions));
  const rows = await db.select().from(tasks).where(and(...conditions))
    .orderBy(desc(tasks.createdAt)).limit(pageSize).offset((page - 1) * pageSize);

  return ok(rows, { page, pageSize, total: Number(total), hasMore: page * pageSize < Number(total) });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "tasks:create");
  await setTenantContext(ctx.tenantId);

  const { data, errors } = await parseBody(req, createTaskSchema);
  if (errors) return validationError(errors);

  const [task] = await db.insert(tasks).values({
    tenantId: ctx.tenantId, ...data!,
  }).returning();

  logActivity({
    tenantId: ctx.tenantId, userId: ctx.userId, contactId: data!.contactId || undefined,
    action: "task.created", metadata: { taskId: task.id, title: task.title },
  });

  // Notify assignee if different from creator
  if (data!.assignedTo && data!.assignedTo !== ctx.userId) {
    sendNotification({
      tenantId: ctx.tenantId,
      userId: data!.assignedTo,
      type: "task.assigned",
      title: "New task assigned to you",
      body: task.title,
      actionUrl: `/dashboard/tasks`,
    });
  }

  return created(task);
});

/**
 * PATCH /api/tasks — Update a task (status change, reassign, etc.)
 * Body: { id: string, ...fields }
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "tasks:update");
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  const taskId = body.id;
  if (!taskId) return validationError({ id: ["Task ID is required"] });

  // Get current state
  const [current] = await db.select().from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, ctx.tenantId)));
  if (!current) return notFound("Task");

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status) updateData.status = body.status;
  if (body.priority) updateData.priority = body.priority;
  if (body.title) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
  if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;

  // Track completion
  if (body.status === "done" && current.status !== "done") {
    updateData.completedAt = new Date();
  }

  const [updated] = await db.update(tasks).set(updateData)
    .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, ctx.tenantId)))
    .returning();

  const action = body.status === "done" ? "task.completed" : "task.created";
  logActivity({
    tenantId: ctx.tenantId, userId: ctx.userId, contactId: current.contactId || undefined,
    action, metadata: { taskId, title: updated.title, changes: Object.keys(updateData) },
  });

  return ok(updated);
});

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing task id"] });
  const ctx = await requireAuth(req);

  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.tenantId, ctx.tenantId)));
  return ok({ deleted: true });
});