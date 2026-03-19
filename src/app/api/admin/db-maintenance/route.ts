import { NextRequest, NextResponse } from "next/server";
import { getClient_raw } from "@/lib/db";

/**
 * POST /api/admin/db-maintenance — Run DB indexes + cleanup
 * 
 * Auth: x-admin-key header must match CLYR_WEBHOOK_SECRET (reuse existing secret)
 * 
 * Actions:
 *   ?action=indexes — Create missing indexes
 *   ?action=clean-clyr — Delete junk CLYR deals, dedupe contacts
 *   ?action=all — Both
 */
export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  const expected = process.env.CLYR_WEBHOOK_SECRET;
  if (!expected || adminKey !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = req.nextUrl.searchParams.get("action") || "all";
  const sql = getClient_raw();
  const results: string[] = [];

  try {
    // ── CREATE INDEXES ──
    if (action === "indexes" || action === "all") {
      const indexes = [
        `CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON contacts(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_contacts_tenant_email ON contacts(tenant_id, email)`,
        `CREATE INDEX IF NOT EXISTS idx_deals_tenant ON deals(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_deals_tenant_stage ON deals(tenant_id, stage)`,
        `CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id)`,
        `CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_pipelines_tenant ON pipelines(tenant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_users_clerk ON users(clerk_id)`,
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      ];

      for (const idx of indexes) {
        try {
          await sql.unsafe(idx);
          results.push(`✅ ${idx.split("idx_")[1]?.split(" ON")[0] || idx}`);
        } catch (e: any) {
          results.push(`⚠️ ${e.message}`);
        }
      }
    }

    // ── CLEAN CLYR JUNK DATA ──
    if (action === "clean-clyr" || action === "all") {
      // Get CLYR tenant ID
      const tenantRows = await sql`SELECT id FROM tenants WHERE slug = 'clyr-health' LIMIT 1`;
      
      if (tenantRows.length > 0) {
        const tid = tenantRows[0].id;

        // Delete junk deals (deals with $0 value or "Treatment Monthly" title from backfill)
        const deletedDeals = await sql`
          DELETE FROM deals 
          WHERE tenant_id = ${tid} 
            AND (value = 0 OR value IS NULL OR title = 'Treatment Monthly')
          RETURNING id
        `;
        results.push(`✅ Deleted ${deletedDeals.length} junk CLYR deals`);

        // Dedupe contacts — keep the one with the most data (latest updated)
        const dupes = await sql`
          SELECT email, COUNT(*) as cnt 
          FROM contacts 
          WHERE tenant_id = ${tid} 
          GROUP BY email 
          HAVING COUNT(*) > 1
        `;

        let dedupedCount = 0;
        for (const d of dupes) {
          // Keep the most recently created, delete older dupes
          const deleted = await sql`
            DELETE FROM contacts 
            WHERE tenant_id = ${tid} 
              AND email = ${d.email}
              AND id NOT IN (
                SELECT id FROM contacts 
                WHERE tenant_id = ${tid} AND email = ${d.email}
                ORDER BY created_at DESC 
                LIMIT 1
              )
            RETURNING id
          `;
          dedupedCount += deleted.length;
        }
        results.push(`✅ Deduped ${dedupedCount} duplicate CLYR contacts`);

        // Count remaining
        const remaining = await sql`
          SELECT 
            (SELECT COUNT(*) FROM contacts WHERE tenant_id = ${tid}) as contacts,
            (SELECT COUNT(*) FROM deals WHERE tenant_id = ${tid}) as deals
        `;
        results.push(`📊 CLYR now has ${remaining[0].contacts} contacts, ${remaining[0].deals} deals`);
      } else {
        results.push(`⚠️ CLYR tenant not found`);
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 });
  }
}
