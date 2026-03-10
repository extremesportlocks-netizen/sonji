import { NextRequest } from "next/server";
import { ok, badRequest, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";
import { globalSearch } from "@/lib/services/search";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const types = url.searchParams.get("types")?.split(",") as any;
  const limit = parseInt(url.searchParams.get("limit") || "20");

  if (!q || q.length < 2) return badRequest("Search query must be at least 2 characters");

  const results = await globalSearch({
    tenantId: ctx.tenantId,
    query: q,
    types,
    limit: Math.min(limit, 50),
  });

  return ok(results);
});
