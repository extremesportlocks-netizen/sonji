import { NextRequest } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { contacts, deals, tasks } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { ok, serverError, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";

/**
 * GET /api/dashboard
 * Returns real-time dashboard stats from the database.
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const [
    [contactCount],
    [dealCount],
    [activeDealCount],
    [wonDealCount],
    [taskCount],
    [openTaskCount],
    recentContacts,
    statusBreakdown,
    sourceBreakdown,
  ] = await Promise.all([
    // Total contacts
    db.select({ total: count() }).from(contacts).where(eq(contacts.tenantId, ctx.tenantId)),
    // Total deals
    db.select({ total: count() }).from(deals).where(eq(deals.tenantId, ctx.tenantId)),
    // Active deals (not won/lost)
    db.select({ total: count() }).from(deals).where(
      and(eq(deals.tenantId, ctx.tenantId), sql`${deals.stage} NOT IN ('Closed Won', 'Closed Lost')`)
    ),
    // Won deals
    db.select({ total: count() }).from(deals).where(
      and(eq(deals.tenantId, ctx.tenantId), eq(deals.stage, "Closed Won"))
    ),
    // Total tasks
    db.select({ total: count() }).from(tasks).where(eq(tasks.tenantId, ctx.tenantId)),
    // Open tasks
    db.select({ total: count() }).from(tasks).where(
      and(eq(tasks.tenantId, ctx.tenantId), sql`${tasks.status} != 'done'`)
    ),
    // 10 most recent contacts
    db.select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
      status: contacts.status,
      source: contacts.source,
      createdAt: contacts.createdAt,
    })
      .from(contacts)
      .where(eq(contacts.tenantId, ctx.tenantId))
      .orderBy(sql`${contacts.createdAt} DESC`)
      .limit(10),
    // Status breakdown
    db.select({
      status: contacts.status,
      count: count(),
    })
      .from(contacts)
      .where(eq(contacts.tenantId, ctx.tenantId))
      .groupBy(contacts.status),
    // Source breakdown
    db.select({
      source: contacts.source,
      count: count(),
    })
      .from(contacts)
      .where(eq(contacts.tenantId, ctx.tenantId))
      .groupBy(contacts.source),
  ]);

  return ok({
    totalContacts: Number(contactCount.total),
    totalDeals: Number(dealCount.total),
    activeDeals: Number(activeDealCount.total),
    wonDeals: Number(wonDealCount.total),
    totalTasks: Number(taskCount.total),
    openTasks: Number(openTaskCount.total),
    recentContacts,
    statusBreakdown: statusBreakdown.map((r) => ({ status: r.status, count: Number(r.count) })),
    sourceBreakdown: sourceBreakdown.map((r) => ({ source: r.source || "unknown", count: Number(r.count) })),
    tenantName: ctx.tenantName,
    tenantSlug: ctx.tenantSlug,
  });
});
