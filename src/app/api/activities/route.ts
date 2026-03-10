import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { ok, created, validationError, withErrorHandler } from "@/lib/api/responses";
import { createActivitySchema, parseBody, paginationSchema, parseQuery } from "@/lib/api/validation";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { logActivity } from "@/lib/services/activity-logger";
import { setTenantContext } from "@/lib/db";

/**
 * GET /api/activities — List activities with optional contact filter.
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "activities:read");
  await setTenantContext(ctx.tenantId);

  const url = new URL(req.url);
  const { page, pageSize } = parseQuery(url, paginationSchema);
  const contactId = url.searchParams.get("contactId");
  const userId = url.searchParams.get("userId");
  const actionType = url.searchParams.get("action");

  const conditions = [eq(activityLog.tenantId, ctx.tenantId)];
  if (contactId) conditions.push(eq(activityLog.contactId, contactId));
  if (userId) conditions.push(eq(activityLog.userId, userId));
  if (actionType) conditions.push(eq(activityLog.action, actionType));

  const [{ total }] = await db.select({ total: count() }).from(activityLog).where(and(...conditions));
  const rows = await db.select().from(activityLog).where(and(...conditions))
    .orderBy(desc(activityLog.createdAt)).limit(pageSize).offset((page - 1) * pageSize);

  return ok(rows, { page, pageSize, total: Number(total), hasMore: page * pageSize < Number(total) });
});

/**
 * POST /api/activities — Manually log an activity (e.g., note, call log).
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "activities:create");

  const { data, errors } = await parseBody(req, createActivitySchema);
  if (errors) return validationError(errors);

  await logActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    contactId: data!.contactId,
    action: data!.action as any,
    metadata: { type: data!.type, ...data!.metadata },
  });

  return created({ logged: true });
});
