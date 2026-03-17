import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq, and, ilike, or, desc, asc, sql, count } from "drizzle-orm";
import { ok, created, notFound, validationError, serverError, withErrorHandler } from "@/lib/api/responses";
import { createContactSchema, updateContactSchema, parseBody, paginationSchema, parseQuery } from "@/lib/api/validation";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { logActivity } from "@/lib/services/activity-logger";
import { sendNotification } from "@/lib/services/notifications";
import { inngest } from "@/lib/inngest/client";
import { setTenantContext } from "@/lib/db";

/**
 * GET /api/contacts
 * List contacts with pagination, search, and filters.
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:read");
  await setTenantContext(ctx.tenantId);

  const url = new URL(req.url);
  const { page, pageSize, sortBy, sortOrder } = parseQuery(url, paginationSchema);
  const q = url.searchParams.get("q") || "";
  const status = url.searchParams.get("status");
  const tag = url.searchParams.get("tag");
  const subStatus = url.searchParams.get("subStatus");
  const minLtv = url.searchParams.get("minLtv");

  // Build where conditions
  const conditions = [eq(contacts.tenantId, ctx.tenantId)];

  if (q) {
    conditions.push(
      or(
        ilike(contacts.firstName, `%${q}%`),
        ilike(contacts.lastName || "", `%${q}%`),
        ilike(contacts.email || "", `%${q}%`),
        ilike(contacts.company || "", `%${q}%`),
        ilike(contacts.phone || "", `%${q}%`)
      )!
    );
  }

  if (status) {
    conditions.push(eq(contacts.status, status));
  }

  if (tag) {
    conditions.push(sql`${contacts.tags}::jsonb ? ${tag}`);
  }

  if (subStatus) {
    conditions.push(sql`${contacts.customFields}->>'subscriptionStatus' = ${subStatus}`);
  }

  if (minLtv) {
    conditions.push(sql`(${contacts.customFields}->>'ltv')::numeric >= ${Number(minLtv)}`);
  }

  // Count total
  const [{ total }] = await db
    .select({ total: count() })
    .from(contacts)
    .where(and(...conditions));

  // Fetch page
  const orderCol = sortBy === "name" ? contacts.firstName
    : sortBy === "email" ? contacts.email
    : sortBy === "company" ? contacts.company
    : sortBy === "status" ? contacts.status
    : sortBy === "ltv" ? sql`(${contacts.customFields}->>'ltv')::numeric`
    : sortBy === "purchaseCount" ? sql`(${contacts.customFields}->>'purchaseCount')::int`
    : contacts.createdAt;

  const rows = await db
    .select()
    .from(contacts)
    .where(and(...conditions))
    .orderBy(sortOrder === "asc" ? asc(orderCol!) : desc(orderCol!))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return ok(rows, {
    page,
    pageSize,
    total: Number(total),
    hasMore: page * pageSize < Number(total),
  });
});

/**
 * POST /api/contacts
 * Create a new contact.
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:create");
  await setTenantContext(ctx.tenantId);

  const { data, errors } = await parseBody(req, createContactSchema);
  if (errors) return validationError(errors);

  const [contact] = await db.insert(contacts).values({
    tenantId: ctx.tenantId,
    firstName: data!.firstName,
    lastName: data!.lastName,
    email: data!.email,
    phone: data!.phone,
    company: data!.company,
    tags: data!.tags || [],
    customFields: data!.customFields || {},
    source: data!.source,
    status: data!.status,
  }).returning();

  // Fire-and-forget: log activity + notify
  logActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    contactId: contact.id,
    action: "contact.created",
    metadata: { name: `${contact.firstName} ${contact.lastName || ""}`.trim() },
  });

  sendNotification({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type: "contact.created",
    title: "New contact created",
    body: `${contact.firstName} ${contact.lastName || ""} was added to your CRM.`,
    actionUrl: `/dashboard/contacts/${contact.id}`,
  });

  // Emit Inngest event → triggers automations
  inngest.send({
    name: "crm/contact.created",
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName || ""}`.trim(),
      contactEmail: contact.email,
      contactPhone: contact.phone,
    },
  }).catch(() => {});

  return created(contact);
});
