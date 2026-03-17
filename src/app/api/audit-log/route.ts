import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { ok, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";
import { setTenantContext } from "@/lib/db";

/**
 * GET /api/audit-log — List activity log entries for tenant
 * Query params: ?q=search&action=deal.won&limit=50
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const action = url.searchParams.get("action") || "";
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const conditions = [eq(activityLog.tenantId, ctx.tenantId)];
  if (action) conditions.push(eq(activityLog.action, action));
  if (q) conditions.push(ilike(activityLog.action, `%${q}%`));

  const rows = await db.select().from(activityLog)
    .where(and(...conditions))
    .orderBy(desc(activityLog.createdAt))
    .limit(Math.min(limit, 200));

  return ok({ data: rows, total: rows.length });
});
