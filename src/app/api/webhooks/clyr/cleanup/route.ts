import { NextRequest, NextResponse } from "next/server";
import { getClient_raw } from "@/lib/db";

/**
 * GET /api/webhooks/clyr/cleanup?key=CLYR2026
 * 
 * Cleans up duplicate contacts and deals in the CLYR Health tenant.
 * Keeps only the first contact per email, deletes all deals (recreated by backfill).
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== "CLYR2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getClient_raw();

  try {
    const tenantRows = await sql`SELECT id FROM tenants WHERE slug = 'clyr-health' LIMIT 1`;
    if (tenantRows.length === 0) return NextResponse.json({ error: "No CLYR tenant" }, { status: 404 });
    const tenantId = tenantRows[0].id;

    // Count before
    const beforeContacts = await sql`SELECT count(*) as c FROM contacts WHERE tenant_id = ${tenantId}`;
    const beforeDeals = await sql`SELECT count(*) as c FROM deals WHERE tenant_id = ${tenantId}`;

    // Delete duplicate contacts — keep only the FIRST per email
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

    // Delete ALL deals (backfill recreates them cleanly)
    await sql`DELETE FROM deals WHERE tenant_id = ${tenantId}`;

    // Count after
    const afterContacts = await sql`SELECT count(*) as c FROM contacts WHERE tenant_id = ${tenantId}`;

    // List remaining
    const remaining = await sql`
      SELECT id, first_name, last_name, email,
             custom_fields->>'treatment' as treatment,
             custom_fields->>'plan' as plan
      FROM contacts 
      WHERE tenant_id = ${tenantId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      ok: true,
      before: { contacts: Number(beforeContacts[0].c), deals: Number(beforeDeals[0].c) },
      after: { contacts: Number(afterContacts[0].c), deals: 0 },
      remaining: remaining.map(r => ({ 
        name: `${r.first_name} ${r.last_name}`.trim(), 
        email: r.email,
        treatment: r.treatment,
        plan: r.plan,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
