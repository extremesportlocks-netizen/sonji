import { NextRequest, NextResponse } from "next/server";
import { getClient_raw } from "@/lib/db";

/**
 * GET /api/webhooks/clyr/cleanup?key=CLYR2026
 * GET /api/webhooks/clyr/cleanup?key=CLYR2026&deals=true  ← creates deals too
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== "CLYR2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const createDeals = req.nextUrl.searchParams.get("deals") === "true";
  const sql = getClient_raw();

  try {
    const tenantRows = await sql`SELECT id FROM tenants WHERE slug = 'clyr-health' LIMIT 1`;
    if (tenantRows.length === 0) return NextResponse.json({ error: "No CLYR tenant" }, { status: 404 });
    const tenantId = tenantRows[0].id;

    // Count before
    const beforeContacts = await sql`SELECT count(*) as c FROM contacts WHERE tenant_id = ${tenantId}`;
    const beforeDeals = await sql`SELECT count(*) as c FROM deals WHERE tenant_id = ${tenantId}`;

    // Delete duplicate contacts
    await sql`
      DELETE FROM contacts 
      WHERE tenant_id = ${tenantId}
        AND id NOT IN (
          SELECT DISTINCT ON (email) id 
          FROM contacts 
          WHERE tenant_id = ${tenantId}
          ORDER BY email, created_at ASC
        )
    `;

    // Delete all deals
    await sql`DELETE FROM deals WHERE tenant_id = ${tenantId}`;

    const afterContacts = await sql`SELECT count(*) as c FROM contacts WHERE tenant_id = ${tenantId}`;

    // Create deals if requested
    const dealsCreated: any[] = [];
    if (createDeals) {
      const pipelineRows = await sql`SELECT id FROM pipelines WHERE tenant_id = ${tenantId} LIMIT 1`;
      if (pipelineRows.length > 0) {
        const pipelineId = pipelineRows[0].id;

        const contacts = await sql`
          SELECT id, first_name, last_name, email, custom_fields
          FROM contacts WHERE tenant_id = ${tenantId}
        `;

        for (const c of contacts) {
          try {
            const cf = (c.custom_fields || {}) as any;
            const treatment = cf.treatment || cf.treatmentProduct || null;
            const plan = cf.plan || cf.subscriptionPlan || "monthly";
            const amount = Number(cf.ltv) || Number(cf.subscriptionAmount) || 0;
            const lastEvent = cf.lastEvent || "checkout";

            const stageMap: Record<string, string> = {
              checkout: "Payment Collected", waiting: "Under Review",
              mdi_approved: "Approved", mdi_prescribed: "Prescribed",
              shipped: "Shipped", delivered: "Delivered",
              abandoned: "Intake", cancelled: "Intake",
            };
            const stage = stageMap[lastEvent] || "Payment Collected";

            const tName = treatment === "tirzepatide" ? "Tirzepatide" :
              treatment === "semaglutide" ? "Semaglutide" : "Treatment";
            const pName = (plan === "3month" || plan === "3-month") ? "3-Month" :
              (plan === "6month" || plan === "6-month") ? "6-Month" : "Monthly";

            await sql`
              INSERT INTO deals (tenant_id, contact_id, pipeline_id, title, value, stage, notes, status)
              VALUES (${tenantId}, ${c.id}, ${pipelineId}, ${`${tName} ${pName}`}, ${amount}, ${stage},
                ${`${c.first_name} ${c.last_name} — ${c.email}`}, 'open')
            `;
            dealsCreated.push({ name: `${c.first_name} ${c.last_name}`, title: `${tName} ${pName}`, stage, amount });
          } catch (e: any) {
            dealsCreated.push({ name: `${c.first_name} ${c.last_name}`, error: e.message });
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      before: { contacts: Number(beforeContacts[0].c), deals: Number(beforeDeals[0].c) },
      after: { contacts: Number(afterContacts[0].c), deals: dealsCreated.length },
      dealsCreated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
