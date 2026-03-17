import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { emailCampaigns, contacts, tenants } from "@/lib/db/schema";
import { eq, and, desc, count, inArray } from "drizzle-orm";
import { ok, created, validationError, withErrorHandler } from "@/lib/api/responses";
import { requireAuth, requirePermission } from "@/lib/api/auth-context";
import { setTenantContext } from "@/lib/db";
import { sendBatchEmail, getResendForTenant } from "@/lib/services/email";
import { inngest } from "@/lib/inngest/client";

/**
 * GET /api/campaigns — List campaigns
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const rows = await db.select().from(emailCampaigns)
    .where(eq(emailCampaigns.tenantId, ctx.tenantId))
    .orderBy(desc(emailCampaigns.createdAt));

  return ok({ data: rows, total: rows.length });
});

/**
 * POST /api/campaigns — Create campaign (draft or send immediately)
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "contacts:create");
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  if (!body.name || !body.subject || !body.html) {
    return validationError({ fields: ["name, subject, and html are required"] });
  }

  // Get recipients based on segment/tags/all
  let recipientCount = 0;
  const segment = body.segment || "all";

  if (segment === "all") {
    const [{ total }] = await db.select({ total: count() }).from(contacts)
      .where(and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.status, "active")));
    recipientCount = Number(total);
  }

  // Create campaign record
  const [campaign] = await db.insert(emailCampaigns).values({
    tenantId: ctx.tenantId,
    name: body.name,
    subject: body.subject,
    bodyHtml: body.html,
    status: body.sendNow ? "sending" : "draft",
    segmentFilter: segment !== "all" ? { segment } : null,
  } as any).returning();

  // If sending now, queue the send via Inngest
  if (body.sendNow) {
    inngest.send({
      name: "crm/campaign.send",
      data: {
        tenantId: ctx.tenantId,
        campaignId: campaign.id,
        subject: body.subject,
        html: body.html,
        segment,
      },
    }).catch(() => {});
  }

  return created({ data: campaign });
});

/**
 * PATCH /api/campaigns — Update campaign
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return validationError({ id: ["Missing campaign id"] });
  const ctx = await requireAuth(req);
  await setTenantContext(ctx.tenantId);

  const body = await req.json();
  const updates: any = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.subject !== undefined) updates.subject = body.subject;
  if (body.html !== undefined) updates.bodyHtml = body.html;
  if (body.status !== undefined) updates.status = body.status;

  const [updated] = await db.update(emailCampaigns).set(updates)
    .where(and(eq(emailCampaigns.id, id), eq(emailCampaigns.tenantId, ctx.tenantId)))
    .returning();

  return ok({ data: updated });
});
