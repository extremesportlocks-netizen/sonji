import { NextRequest, NextResponse } from "next/server";
import { getClient_raw } from "@/lib/db";

/**
 * GET /api/health — Full system health check
 * No auth required. Returns timing for every subsystem.
 */
export async function GET(req: NextRequest) {
  const start = Date.now();
  const checks: Record<string, any> = {};

  // 1. Database connection
  try {
    const dbStart = Date.now();
    const raw = getClient_raw();
    const [r] = await raw`SELECT 1 as ok`;
    checks.database = { status: "ok", ms: Date.now() - dbStart };
  } catch (e: any) {
    checks.database = { status: "error", error: e.message };
  }

  // 2. Contacts table
  try {
    const t = Date.now();
    const raw = getClient_raw();
    const [r] = await raw`SELECT count(*) as c FROM contacts`;
    checks.contacts = { status: "ok", count: Number(r.c), ms: Date.now() - t };
  } catch (e: any) {
    checks.contacts = { status: "error", error: e.message };
  }

  // 3. Deals table
  try {
    const t = Date.now();
    const raw = getClient_raw();
    const [r] = await raw`SELECT count(*) as c FROM deals`;
    checks.deals = { status: "ok", count: Number(r.c), ms: Date.now() - t };
  } catch (e: any) {
    checks.deals = { status: "error", error: e.message };
  }

  // 4. Tasks table
  try {
    const t = Date.now();
    const raw = getClient_raw();
    const [r] = await raw`SELECT count(*) as c FROM tasks`;
    checks.tasks = { status: "ok", count: Number(r.c), ms: Date.now() - t };
  } catch (e: any) {
    checks.tasks = { status: "error", error: e.message };
  }

  // 5. Tenants
  try {
    const t = Date.now();
    const raw = getClient_raw();
    const rows = await raw`SELECT slug, name, industry, plan FROM tenants ORDER BY created_at`;
    checks.tenants = { status: "ok", count: rows.length, list: rows, ms: Date.now() - t };
  } catch (e: any) {
    checks.tenants = { status: "error", error: e.message };
  }

  // 6. Pipelines
  try {
    const t = Date.now();
    const raw = getClient_raw();
    const rows = await raw`SELECT t.slug, p.name, jsonb_array_length(p.stages) as stage_count
      FROM pipelines p JOIN tenants t ON t.id = p.tenant_id`;
    checks.pipelines = { status: "ok", list: rows, ms: Date.now() - t };
  } catch (e: any) {
    checks.pipelines = { status: "error", error: e.message };
  }

  // 7. CLYR specific
  try {
    const t = Date.now();
    const raw = getClient_raw();
    const [clyr] = await raw`SELECT id FROM tenants WHERE slug = 'clyr-health'`;
    if (clyr) {
      const tid = clyr.id;
      const [cc] = await raw`SELECT count(*) as c FROM contacts WHERE tenant_id = ${tid}`;
      const [dc] = await raw`SELECT count(*) as c FROM deals WHERE tenant_id = ${tid}`;
      const deals = await raw`SELECT title, stage, value FROM deals WHERE tenant_id = ${tid} ORDER BY created_at DESC LIMIT 5`;
      checks.clyr = { status: "ok", contacts: Number(cc.c), deals: Number(dc.c), recentDeals: deals, ms: Date.now() - t };
    } else {
      checks.clyr = { status: "error", error: "CLYR tenant not found" };
    }
  } catch (e: any) {
    checks.clyr = { status: "error", error: e.message };
  }

  // 8. DB size
  try {
    const t = Date.now();
    const raw = getClient_raw();
    const [r] = await raw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
    checks.dbSize = { status: "ok", size: r.size, ms: Date.now() - t };
  } catch (e: any) {
    checks.dbSize = { status: "error", error: e.message };
  }

  return NextResponse.json({
    status: Object.values(checks).every((c: any) => c.status === "ok") ? "healthy" : "degraded",
    totalMs: Date.now() - start,
    checks,
  });
}
