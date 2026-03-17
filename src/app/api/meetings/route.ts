import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { ok, created, validationError, noContent, withErrorHandler } from "@/lib/api/responses";
import { getAuthContext } from "@/lib/api/auth-context";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await getAuthContext(req);
  if (!auth?.tenantId) return ok({ data: [], total: 0 });

  const rows = await db.select().from(appointments)
    .where(eq(appointments.tenantId, auth.tenantId))
    .orderBy(desc(appointments.startsAt))
    .limit(200);

  return ok({ data: rows, total: rows.length });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await getAuthContext(req);
  if (!auth?.tenantId) return validationError({ tenant: ["No tenant"] });

  const body = await req.json();
  const [row] = await db.insert(appointments).values({
    tenantId: auth.tenantId,
    title: body.title || "",
    contactId: body.contactId || null,
    contactName: body.contactName || "",
    startsAt: body.startTime ? new Date(body.startTime) : new Date(),
    endsAt: body.endTime ? new Date(body.endTime) : null,
    type: body.type || "call",
    location: body.location || "",
    notes: body.notes || "",
    status: body.status || "scheduled",
  }).returning();

  return created({ data: row });
});

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing id"] });
  const auth = await getAuthContext(req);
  if (!auth?.tenantId) return validationError({ tenant: ["No tenant"] });

  const body = await req.json();
  const updates: any = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.status !== undefined) updates.status = body.status;
  if (body.startTime !== undefined) updates.startsAt = new Date(body.startTime);
  if (body.endTime !== undefined) updates.endsAt = new Date(body.endTime);
  if (body.location !== undefined) updates.location = body.location;
  if (body.notes !== undefined) updates.notes = body.notes;

  await db.update(appointments).set(updates)
    .where(and(eq(appointments.id, id), eq(appointments.tenantId, auth.tenantId)));

  return ok({ success: true });
});

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing id"] });
  const auth = await getAuthContext(req);
  if (!auth?.tenantId) return validationError({ tenant: ["No tenant"] });

  await db.delete(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.tenantId, auth.tenantId)));

  return ok({ deleted: true });
});
