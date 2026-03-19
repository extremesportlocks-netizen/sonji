import { NextRequest } from "next/server";
import { db, setTenantContext } from "@/lib/db";
import { pipelines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ok, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";

/**
 * GET /api/pipelines — Return the tenant's pipelines with stages.
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const rows = await db.select().from(pipelines).where(eq(pipelines.tenantId, ctx.tenantId));

  return ok(rows);
});
