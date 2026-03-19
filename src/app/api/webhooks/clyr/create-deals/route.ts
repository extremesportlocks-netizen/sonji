import { NextRequest, NextResponse } from "next/server";
import { getClient_raw } from "@/lib/db";

/**
 * GET /api/webhooks/clyr/create-deals?key=CLYR2026
 * 
 * Creates one deal per CLYR contact that doesn't already have a deal.
 * Reads treatment data from contact custom_fields.
 * No webhook, no external calls — pure SQL.
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== "CLYR2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getClient_raw();

  try {
    // Find CLYR tenant + pipeline
    const tenantRows = await sql`SELECT id FROM tenants WHERE slug = 'clyr-health' LIMIT 1`;
    if (tenantRows.length === 0) return NextResponse.json({ error: "No CLYR tenant" }, { status: 404 });
    const tenantId = tenantRows[0].id;

    const pipelineRows = await sql`SELECT id FROM pipelines WHERE tenant_id = ${tenantId} LIMIT 1`;
    if (pipelineRows.length === 0) return NextResponse.json({ error: "No pipeline" }, { status: 404 });
    const pipelineId = pipelineRows[0].id;

    // Get all contacts that DON'T have deals yet
    const contacts = await sql`
      SELECT c.id, c.first_name, c.last_name, c.email, c.custom_fields, c.created_at
      FROM contacts c
      WHERE c.tenant_id = ${tenantId}
        AND NOT EXISTS (SELECT 1 FROM deals d WHERE d.contact_id = c.id AND d.tenant_id = ${tenantId})
    `;

    const results = [];
    for (const c of contacts) {
      const cf = (c.custom_fields || {}) as any;
      const treatment = cf.treatment || cf.treatmentProduct || null;
      const plan = cf.plan || cf.subscriptionPlan || "monthly";
      const amount = Number(cf.ltv) || Number(cf.subscriptionAmount) || 0;
      const lastEvent = cf.lastEvent || "checkout";

      // Map event to stage
      const stageMap: Record<string, string> = {
        checkout: "Payment Collected",
        waiting: "Under Review",
        mdi_approved: "Approved",
        mdi_prescribed: "Prescribed",
        shipped: "Shipped",
        delivered: "Delivered",
        abandoned: "Intake",
        cancelled: "Intake",
      };
      const stage = stageMap[lastEvent] || "Payment Collected";

      // Build title
      const treatmentName = treatment === "tirzepatide" ? "Tirzepatide" :
        treatment === "semaglutide" ? "Semaglutide" : "Treatment";
      const planName = plan === "3month" || plan === "3-month" ? "3-Month" :
        plan === "6month" || plan === "6-month" ? "6-Month" : "Monthly";
      const title = `${treatmentName} ${planName}`;

      await sql`
        INSERT INTO deals (tenant_id, contact_id, pipeline_id, title, value, stage, notes, status)
        VALUES (
          ${tenantId}, ${c.id}, ${pipelineId},
          ${title}, ${amount}, ${stage},
          ${`${c.first_name} ${c.last_name} — ${c.email}`},
          'open'
        )
      `;

      results.push({ name: `${c.first_name} ${c.last_name}`, email: c.email, title, stage, amount });
    }

    return NextResponse.json({ ok: true, created: results.length, deals: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
