import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { eq, and, ilike, or, desc, count } from "drizzle-orm";
import { ok, created, validationError, withErrorHandler } from "@/lib/api/responses";
import { createCompanySchema, parseBody, paginationSchema, parseQuery } from "@/lib/api/validation";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { logActivity } from "@/lib/services/activity-logger";
import { setTenantContext } from "@/lib/db";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:read");
  await setTenantContext(ctx.tenantId);

  const url = new URL(req.url);
  const { page, pageSize } = parseQuery(url, paginationSchema);
  const q = url.searchParams.get("q") || "";

  const conditions = [eq(companies.tenantId, ctx.tenantId)];
  if (q) {
    conditions.push(or(ilike(companies.name, `%${q}%`), ilike(companies.domain || "", `%${q}%`))!);
  }

  const [{ total }] = await db.select({ total: count() }).from(companies).where(and(...conditions));
  const rows = await db.select().from(companies).where(and(...conditions))
    .orderBy(desc(companies.updatedAt)).limit(pageSize).offset((page - 1) * pageSize);

  return ok(rows, { page, pageSize, total: Number(total), hasMore: page * pageSize < Number(total) });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:create");
  await setTenantContext(ctx.tenantId);

  const { data, errors } = await parseBody(req, createCompanySchema);
  if (errors) return validationError(errors);

  const [company] = await db.insert(companies).values({
    tenantId: ctx.tenantId, ...data!,
  }).returning();

  logActivity({ tenantId: ctx.tenantId, userId: ctx.userId, action: "contact.created", metadata: { type: "company", companyId: company.id, name: company.name } });
  return created(company);
});
