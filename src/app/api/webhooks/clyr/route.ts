import { NextRequest, NextResponse } from "next/server";
import { getClient_raw } from "@/lib/db";

/**
 * POST /api/webhooks/clyr — Receive patient data from clyr-backend
 *
 * Called by clyr-backend on various patient lifecycle events.
 * Creates or updates a contact + deal in the CLYR Health Sonji tenant.
 * Fires Inngest events for automation sequences (abandoned cart recovery, welcome).
 *
 * Auth: x-clyr-webhook-secret header
 *
 * Events handled:
 *   checkout           → Payment Collected (existing)
 *   checkout_confirmed → Payment Collected + welcome automation
 *   abandoned          → Abandoned Checkout + recovery automation
 *   checkout_abandoned → Abandoned Checkout + recovery automation
 *   intake_abandoned   → Intake Abandoned + recovery automation
 *   waiting            → Under Review
 *   mdi_approved       → Approved
 *   mdi_prescribed     → Prescribed
 *   shipped            → Shipped
 *   delivered          → Delivered
 *   cancelled          → Cancelled (contact status = churned)
 *   provider_message   → no stage change
 *   pharmacy_processing→ Under Review
 *   pharmacy_hold      → Under Review
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
    const {
      firstName,
      lastName,
      email,
      phone,
      treatment,
      plan,
      amount,
      stripeCustomerId,
      mdiCaseId,
      event,
      abandonedAt,
      abandonmentType,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const sql = getClient_raw();

    // ─── Find CLYR Health tenant ───
    const tenantRows = await sql`
      SELECT id FROM tenants WHERE slug = 'clyr-health' LIMIT 1
    `;
    if (tenantRows.length === 0) {
      return NextResponse.json({ error: "CLYR Health tenant not found" }, { status: 404 });
    }
    const tenantId = tenantRows[0].id;

    // ─── Ensure pipeline has all required stages ───
    await ensurePipelineStages(sql, tenantId);

    // ─── Map event → pipeline stage ───
    const EVENT_TO_STAGE: Record<string, string> = {
      // Intake & abandonment
      intake_completed: "Intake",
      intake_abandoned: "Intake Abandoned",
      abandoned: "Abandoned Checkout",
      checkout_abandoned: "Abandoned Checkout",
      // Payment & progression
      checkout: "Payment Collected",
      checkout_confirmed: "Payment Collected",
      // Clinical
      waiting: "Under Review",
      pharmacy_processing: "Under Review",
      pharmacy_hold: "Under Review",
      mdi_approved: "Approved",
      mdi_prescribed: "Prescribed",
      // Fulfillment
      shipped: "Shipped",
      delivered: "Delivered",
      // Terminal
      cancelled: "Cancelled",
    };

    const stage = EVENT_TO_STAGE[event || "checkout"] || "Intake";

    // ─── Build tags ───
    const tags = ["CLYR Patient"];
    if (treatment) tags.push(treatment === "tirzepatide" ? "Tirzepatide" : "Semaglutide");
    if (plan) tags.push(plan === "monthly" ? "Monthly" : plan === "3-month" ? "3-Month" : "6-Month");

    const eventTags: Record<string, string> = {
      mdi_approved: "Approved",
      mdi_prescribed: "Prescribed",
      shipped: "Shipped",
      delivered: "Delivered",
      abandoned: "Abandoned Checkout",
      checkout_abandoned: "Abandoned Checkout",
      intake_abandoned: "Intake Abandoned",
      checkout_confirmed: "Paid",
    };
    if (event && eventTags[event]) tags.push(eventTags[event]);

    // ─── Build custom fields ───
    const isAbandonment = ["abandoned", "checkout_abandoned", "intake_abandoned"].includes(event);
    const isPaid = ["checkout", "checkout_confirmed"].includes(event);

    const customFields: Record<string, any> = {
      treatment: treatment || null,
      plan: plan || null,
      stripeCustomerId: stripeCustomerId || null,
      mdiCaseId: mdiCaseId || null,
      lastEvent: event || "checkout",
      lastEventAt: new Date().toISOString(),
    };

    if (isPaid) {
      customFields.ltv = amount || 0;
      customFields.purchaseCount = 1;
      customFields.subscriptionStatus = "active";
      customFields.subscriptionPlan = plan || "monthly";
      customFields.subscriptionAmount = amount || 0;
      customFields.paidAt = new Date().toISOString();
    }

    if (isAbandonment) {
      customFields.abandonedAt = abandonedAt || new Date().toISOString();
      customFields.abandonmentType = abandonmentType || event;
      customFields.recoveryStatus = "pending";
    }

    // ─── Determine contact status ───
    const contactStatus = event === "cancelled" ? "churned" : "active";

    // ─── Upsert contact ───
    const existing = await sql`
      SELECT id, custom_fields FROM contacts
      WHERE tenant_id = ${tenantId} AND email = ${email}
      LIMIT 1
    `;

    let contactId: string;

    if (existing.length > 0) {
      contactId = existing[0].id;
      const prevCf = (existing[0].custom_fields as any) || {};
      const mergedCf = { ...prevCf, ...customFields };

      // Don't overwrite ltv with 0 if we already have a real value
      if (!isPaid && prevCf.ltv && prevCf.ltv > 0) {
        mergedCf.ltv = prevCf.ltv;
        mergedCf.purchaseCount = prevCf.purchaseCount;
        mergedCf.subscriptionStatus = prevCf.subscriptionStatus;
        mergedCf.subscriptionPlan = prevCf.subscriptionPlan;
        mergedCf.subscriptionAmount = prevCf.subscriptionAmount;
      }

      // If patient is completing payment, clear abandonment fields
      if (isPaid) {
        mergedCf.recoveryStatus = "recovered";
        delete mergedCf.abandonedAt;
        delete mergedCf.abandonmentType;
      }

      const prevTags = Array.isArray(prevCf.tags) ? prevCf.tags : [];
      const mergedTags = Array.from(new Set([...prevTags, ...tags]));

      await sql`
        UPDATE contacts
        SET custom_fields = ${JSON.stringify(mergedCf)}::jsonb,
            tags = ${JSON.stringify(mergedTags)}::jsonb,
            status = ${contactStatus},
            first_name = COALESCE(NULLIF(${firstName || ""}, ''), first_name),
            last_name = COALESCE(NULLIF(${lastName || ""}, ''), last_name),
            phone = COALESCE(${phone || null}, phone)
        WHERE id = ${contactId}
      `;
    } else {
      const result = await sql`
        INSERT INTO contacts (tenant_id, first_name, last_name, email, phone, source, status, tags, custom_fields)
        VALUES (
          ${tenantId},
          ${firstName || ""},
          ${lastName || ""},
          ${email},
          ${phone || null},
          'clyr-intake',
          ${contactStatus},
          ${JSON.stringify(tags)}::jsonb,
          ${JSON.stringify(customFields)}::jsonb
        )
        RETURNING id
      `;
      contactId = result[0].id;
    }

    // ─── Upsert deal ───
    const existingDeal = await sql`
      SELECT id, stage FROM deals WHERE tenant_id = ${tenantId} AND contact_id = ${contactId} LIMIT 1
    `;

    // Kill trigger: don't regress a paid deal back to abandoned
    const PAID_STAGES = ["Payment Collected", "Under Review", "Approved", "Prescribed", "Shipped", "Delivered", "Active"];
    const shouldSkipStageUpdate =
      isAbandonment &&
      existingDeal.length > 0 &&
      PAID_STAGES.includes(existingDeal[0].stage);

    let dealId: string = "";

    if (existingDeal.length > 0) {
      dealId = existingDeal[0].id;
      if (!shouldSkipStageUpdate) {
        await sql`
          UPDATE deals SET
            stage = ${stage},
            value = CASE WHEN ${amount || 0}::numeric > 0 THEN ${amount || 0}::numeric ELSE value END,
            updated_at = NOW()
          WHERE id = ${dealId}
        `;
      }
    } else {
      const pipelineRows = await sql`SELECT id FROM pipelines WHERE tenant_id = ${tenantId} LIMIT 1`;
      const dealTitle = formatDealTitle(treatment, plan);

      if (pipelineRows.length > 0) {
        const result = await sql`
          INSERT INTO deals (tenant_id, contact_id, pipeline_id, title, value, stage, notes, status)
          VALUES (
            ${tenantId}, ${contactId}, ${pipelineRows[0].id},
            ${dealTitle}, ${amount || 0}, ${stage},
            ${`Patient: ${`${firstName || ""} ${lastName || ""}`.trim()} | Plan: ${plan || "monthly"} | Stripe: ${stripeCustomerId || "n/a"}`},
            'open'
          )
          RETURNING id
        `;
        dealId = result[0].id;
      }
    }

    // ─── Log activity ───
    await sql`
      INSERT INTO activity_log (tenant_id, contact_id, action, metadata)
      VALUES (
        ${tenantId}, ${contactId},
        ${`clyr.${event || "checkout"}`},
        ${JSON.stringify({
          event,
          treatment,
          plan,
          amount,
          stage,
          abandonmentType: abandonmentType || null,
          timestamp: new Date().toISOString(),
        })}::jsonb
      )
    `;

    // ─── Fire Inngest events for automations ───
    if (!shouldSkipStageUpdate) {
      await fireAutomationEvents(tenantId, contactId, dealId, event, body);
    }

    return NextResponse.json({
      ok: true,
      action: existing.length > 0 ? "updated" : "created",
      contactId,
      dealId,
      stage,
      skippedStageUpdate: shouldSkipStageUpdate || false,
    });
  } catch (err: any) {
    console.error("CLYR webhook error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// ════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════

/**
 * Ensure the CLYR pipeline has all required stages.
 * Idempotent — only writes if stages are missing.
 */
async function ensurePipelineStages(sql: any, tenantId: string) {
  const REQUIRED_STAGES = [
    { name: "Intake", order: 0, color: "#6366f1" },
    { name: "Intake Abandoned", order: 1, color: "#f59e0b" },
    { name: "Abandoned Checkout", order: 2, color: "#ef4444" },
    { name: "Payment Collected", order: 3, color: "#10b981" },
    { name: "Under Review", order: 4, color: "#3b82f6" },
    { name: "Approved", order: 5, color: "#8b5cf6" },
    { name: "Prescribed", order: 6, color: "#06b6d4" },
    { name: "Shipped", order: 7, color: "#14b8a6" },
    { name: "Delivered", order: 8, color: "#22c55e" },
    { name: "Active", order: 9, color: "#059669" },
    { name: "Cancelled", order: 10, color: "#dc2626" },
  ];

  const rows = await sql`
    SELECT id, stages FROM pipelines WHERE tenant_id = ${tenantId} LIMIT 1
  `;
  if (rows.length === 0) return;

  const currentStages = (rows[0].stages as any[]) || [];
  const currentNames = new Set(currentStages.map((s: any) => s.name));
  const missing = REQUIRED_STAGES.filter((s) => !currentNames.has(s.name));
  if (missing.length === 0) return;

  // Merge existing + missing, re-sort by canonical order
  const nameToOrder = Object.fromEntries(REQUIRED_STAGES.map((s) => [s.name, s.order]));
  const nameToColor = Object.fromEntries(REQUIRED_STAGES.map((s) => [s.name, s.color]));

  const merged = [...currentStages, ...missing].map((s: any) => ({
    name: s.name,
    order: nameToOrder[s.name] ?? s.order ?? 99,
    color: nameToColor[s.name] ?? s.color ?? "#6b7280",
  }));
  merged.sort((a: any, b: any) => a.order - b.order);

  await sql`
    UPDATE pipelines SET stages = ${JSON.stringify(merged)}::jsonb
    WHERE id = ${rows[0].id}
  `;

  console.log(`[CLYR Pipeline] Added ${missing.length} stages: ${missing.map((s) => s.name).join(", ")}`);
}

/**
 * Fire Inngest events based on the webhook event type.
 */
async function fireAutomationEvents(
  tenantId: string,
  contactId: string,
  dealId: string,
  event: string,
  payload: any
) {
  try {
    // Lazy-load inngest (7.7MB) — only needed when firing events, not on every webhook call
    const { inngest } = await import("@/lib/inngest/client");

    const baseData = {
      tenantId,
      contactId,
      dealId,
      contactEmail: payload.email,
      contactPhone: payload.phone,
      contactName: `${payload.firstName || ""} ${payload.lastName || ""}`.trim(),
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
      treatment: payload.treatment,
      plan: payload.plan,
      amount: payload.amount || 0,
      stripeCustomerId: payload.stripeCustomerId,
    };

    switch (event) {
      case "abandoned":
      case "checkout_abandoned": {
        await inngest.send({
          name: "clyr/checkout.abandoned",
          data: {
            ...baseData,
            abandonedAt: payload.abandonedAt || new Date().toISOString(),
            abandonmentType: payload.abandonmentType || "checkout_expired",
          },
        });
        break;
      }

      case "intake_abandoned": {
        await inngest.send({
          name: "clyr/intake.abandoned",
          data: {
            ...baseData,
            abandonedAt: payload.abandonedAt || new Date().toISOString(),
            abandonmentType: "never_started_checkout",
          },
        });
        break;
      }

      case "checkout":
      case "checkout_confirmed": {
        await inngest.send({
          name: "clyr/checkout.confirmed",
          data: baseData,
        });

        // Also fire generic CRM event for other automations
        await inngest.send({
          name: "crm/deal.stage_changed",
          data: {
            tenantId,
            dealId,
            contactId,
            contactEmail: payload.email,
            contactName: baseData.contactName,
            fromStage: "Intake",
            toStage: "Payment Collected",
          },
        });
        break;
      }

      case "mdi_approved":
      case "mdi_prescribed":
      case "shipped":
      case "delivered": {
        const stageMap: Record<string, string> = {
          mdi_approved: "Approved",
          mdi_prescribed: "Prescribed",
          shipped: "Shipped",
          delivered: "Delivered",
        };
        await inngest.send({
          name: "crm/deal.stage_changed",
          data: {
            tenantId,
            dealId,
            contactId,
            contactEmail: payload.email,
            contactName: baseData.contactName,
            toStage: stageMap[event],
          },
        });
        break;
      }
    }
  } catch (err) {
    console.error("[CLYR Webhook] Failed to fire Inngest event:", err);
  }
}

/**
 * Format deal title from treatment + plan.
 */
function formatDealTitle(treatment?: string, plan?: string): string {
  const med = treatment === "tirzepatide" ? "Tirzepatide"
    : treatment === "semaglutide" ? "Semaglutide"
    : treatment || "Treatment";
  const duration = plan === "3-month" ? "3-Month"
    : plan === "6-month" ? "6-Month"
    : "Monthly";
  return `${med} ${duration}`;
}
