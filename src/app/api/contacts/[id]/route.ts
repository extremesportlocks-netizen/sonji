import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ok, notFound, validationError, noContent, withErrorHandler } from "@/lib/api/responses";
import { updateContactSchema, parseBody } from "@/lib/api/validation";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { logActivity } from "@/lib/services/activity-logger";
import { setTenantContext } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:read");
  await setTenantContext(ctx.tenantId);

  const [contact] = await db.select().from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.tenantId, ctx.tenantId)));

  if (!contact) return notFound("Contact");
  return ok(contact);
});

export const PUT = withErrorHandler(async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:update");
  await setTenantContext(ctx.tenantId);

  const { data, errors } = await parseBody(req, updateContactSchema);
  if (errors) return validationError(errors);

  const [updated] = await db.update(contacts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(contacts.id, id), eq(contacts.tenantId, ctx.tenantId)))
    .returning();

  if (!updated) return notFound("Contact");

  logActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    contactId: id,
    action: "contact.updated",
    metadata: { fields: Object.keys(data!) },
  });

  return ok(updated);
});

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:delete");
  await setTenantContext(ctx.tenantId);

  const [deleted] = await db.delete(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.tenantId, ctx.tenantId)))
    .returning();

  if (!deleted) return notFound("Contact");

  logActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    contactId: id,
    action: "contact.deleted",
    metadata: { name: `${deleted.firstName} ${deleted.lastName || ""}`.trim() },
  });

  return noContent();
});
