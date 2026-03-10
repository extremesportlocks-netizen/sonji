import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { ok, noContent, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";
import { setTenantContext } from "@/lib/db";

/**
 * GET /api/notifications — List notifications for current user.
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unread") === "true";
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const conditions = [
    eq(notifications.tenantId, ctx.tenantId),
    eq(notifications.userId, ctx.userId),
  ];
  if (unreadOnly) conditions.push(eq(notifications.read, false));

  const rows = await db.select().from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(Math.min(limit, 50));

  // Also get unread count
  const [{ unread }] = await db.select({ unread: count() }).from(notifications)
    .where(and(
      eq(notifications.tenantId, ctx.tenantId),
      eq(notifications.userId, ctx.userId),
      eq(notifications.read, false),
    ));

  return ok({ notifications: rows, unreadCount: Number(unread) });
});

/**
 * PATCH /api/notifications — Mark notifications as read.
 * Body: { ids: string[] } or { all: true }
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const body = await req.json();

  if (body.all === true) {
    await db.update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.tenantId, ctx.tenantId),
        eq(notifications.userId, ctx.userId),
        eq(notifications.read, false),
      ));
  } else if (Array.isArray(body.ids)) {
    for (const id of body.ids) {
      await db.update(notifications)
        .set({ read: true })
        .where(and(
          eq(notifications.id, id),
          eq(notifications.tenantId, ctx.tenantId),
          eq(notifications.userId, ctx.userId),
        ));
    }
  }

  return noContent();
});
