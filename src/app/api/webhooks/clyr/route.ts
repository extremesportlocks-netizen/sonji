import { NextRequest, NextResponse } from "next/server";
import { db, getClient_raw } from "@/lib/db";
import { contacts, tenants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/webhooks/clyr — Receive patient data from clyr-backend
 * 
 * Called by clyr-backend after Stripe checkout.session.completed.
 * Creates or updates a contact in the CLYR Health Sonji tenant.
 * 
 * Auth: x-clyr-webhook-secret header
 * 
 * Body: {
 *   firstName, lastName, email, phone,
 *   treatment: "tirzepatide" | "semaglutide",
 *   plan: "monthly" | "3-month" | "6-month",
 *   amount: 320,
 *   stripeCustomerId: "cus_xxx",
 *   mdiCaseId: "case_xxx",   // optional, set after MDI creates encounter
 *   event: "checkout" | "mdi_approved" | "mdi_prescribed" | "shipped" | "delivered"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const secret = req.headers.get("x-clyr-webhook-secret");
    const expectedSecret = process.env.CLYR_WEBHOOK_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, email, phone, treatment, plan, amount, stripeCustomerId, mdiCaseId, event } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const sql = getClient_raw();

    // Find CLYR Health tenant
    const tenantRows = await sql`
      SELECT id FROM tenants WHERE slug = 'clyr-health' LIMIT 1
    `;

    if (tenantRows.length === 0) {
      return NextResponse.json({ error: "CLYR Health tenant not found" }, { status: 404 });
    }

    const tenantId = tenantRows[0].id;

    // Check if contact already exists (by email)
    const existing = await sql`
      SELECT id, custom_fields FROM contacts 
      WHERE tenant_id = ${tenantId} AND email = ${email}
      LIMIT 1
    `;

    const tags = ["CLYR Patient"];
    if (treatment) tags.push(treatment === "tirzepatide" ? "Tirzepatide" : "Semaglutide");
    if (plan) tags.push(plan === "monthly" ? "Monthly" : plan === "3-month" ? "3-Month" : "6-Month");
    if (event === "mdi_approved") tags.push("Approved");
    if (event === "mdi_prescribed") tags.push("Prescribed");
    if (event === "shipped") tags.push("Shipped");
    if (event === "delivered") tags.push("Delivered");

    const customFields = {
      treatment: treatment || null,
      plan: plan || null,
      ltv: amount || 0,
      purchaseCount: 1,
      subscriptionStatus: "active",
      subscriptionPlan: plan || "monthly",
      subscriptionAmount: amount || 0,
      stripeCustomerId: stripeCustomerId || null,
      mdiCaseId: mdiCaseId || null,
      lastEvent: event || "checkout",
      lastEventAt: new Date().toISOString(),
    };

    // Map event to pipeline stage
    const EVENT_TO_STAGE: Record<string, string> = {
      checkout: "Payment Collected",
      waiting: "Under Review",
      mdi_approved: "Approved",
      mdi_prescribed: "Prescribed",
      shipped: "Shipped",
      delivered: "Delivered",
      abandoned: "Intake",
      cancelled: "Intake",
    };

    const stage = EVENT_TO_STAGE[event || "checkout"] || "Payment Collected";

    if (existing.length > 0) {
      // Update existing contact
      const prevCf = (existing[0].custom_fields as any) || {};
      const mergedCf = { ...prevCf, ...customFields };
      
      // Merge tags
      const prevTags = Array.isArray(prevCf.tags) ? prevCf.tags : [];
      const mergedTags = Array.from(new Set([...prevTags, ...tags]));

      await sql`
        UPDATE contacts 
        SET custom_fields = ${JSON.stringify(mergedCf)}::jsonb,
            tags = ${JSON.stringify(mergedTags)}::jsonb,
            status = 'active',
            phone = COALESCE(${phone || null}, phone)
        WHERE id = ${existing[0].id}
      `;

      // Update existing deal stage if deal exists
      await sql`
        UPDATE deals
        SET stage = ${stage},
            updated_at = NOW()
        WHERE tenant_id = ${tenantId}
          AND contact_id = ${existing[0].id}
      `;

      return NextResponse.json({ ok: true, action: "updated", contactId: existing[0].id });
    } else {
      // Create new contact
      const result = await sql`
        INSERT INTO contacts (tenant_id, first_name, last_name, email, phone, source, status, tags, custom_fields)
        VALUES (
          ${tenantId},
          ${firstName || ""},
          ${lastName || ""},
          ${email},
          ${phone || null},
          'clyr-intake',
          'active',
          ${JSON.stringify(tags)}::jsonb,
          ${JSON.stringify(customFields)}::jsonb
        )
        RETURNING id
      `;

      const contactId = result[0].id;

      // Find the CLYR pipeline
      const pipelineRows = await sql`
        SELECT id FROM pipelines WHERE tenant_id = ${tenantId} LIMIT 1
      `;

      // Create a deal in the treatment pipeline
      const dealTitle = treatment === "tirzepatide"
        ? `Tirzepatide ${plan === "3-month" ? "3-Month" : plan === "6-month" ? "6-Month" : "Monthly"}`
        : `Semaglutide ${plan === "3-month" ? "3-Month" : plan === "6-month" ? "6-Month" : "Monthly"}`;

      if (pipelineRows.length > 0) {
        await sql`
          INSERT INTO deals (
            tenant_id, contact_id, pipeline_id, title, value, stage,
            notes, status
          ) VALUES (
            ${tenantId},
            ${contactId},
            ${pipelineRows[0].id},
            ${dealTitle},
            ${amount || 0},
            ${stage},
            ${`Patient: ${`${firstName || ""} ${lastName || ""}`.trim()} | Plan: ${plan || "monthly"} | Stripe: ${stripeCustomerId || "n/a"}`},
            'open'
          )
        `;
      }

      return NextResponse.json({ ok: true, action: "created", contactId });
    }
  } catch (err: any) {
    console.error("CLYR webhook error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
