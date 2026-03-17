import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ok, validationError, withErrorHandler } from "@/lib/api/responses";
import { requireAuth } from "@/lib/api/auth-context";
import { scoreContact, DEFAULT_SCORING_PROFILE } from "@/lib/services/lead-scoring";

/**
 * GET /api/lead-score?contactId=xxx — Calculate lead score for a contact
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  const contactId = req.nextUrl.searchParams.get("contactId");
  if (!contactId) return validationError({ contactId: ["Required"] });

  const [contact] = await db.select().from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.tenantId, ctx.tenantId)))
    .limit(1);

  if (!contact) return ok({ score: 0, signals: [] });

  const result = scoreContact(contact as any, DEFAULT_SCORING_PROFILE);
  return ok(result);
});

/**
 * POST /api/lead-score/batch — Score multiple contacts
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  const body = await req.json();
  const contactIds = body.contactIds || [];

  if (!contactIds.length) return ok({ scores: [] });

  const rows = await db.select().from(contacts)
    .where(eq(contacts.tenantId, ctx.tenantId));

  const filtered = rows.filter(c => contactIds.includes(c.id));
  const scores = filtered.map(c => ({
    contactId: c.id,
    name: `${c.firstName} ${c.lastName || ""}`.trim(),
    ...scoreContact(c as any, DEFAULT_SCORING_PROFILE),
  }));

  return ok({ scores });
});
