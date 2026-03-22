import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getClient_raw } from "@/lib/db";
import { ok, unauthorized } from "@/lib/api/responses";

/**
 * GET /api/me — Returns current user + tenant info.
 *
 * MULTI-TENANT FIX: Returns ALL tenants for the Clerk user.
 * Uses `sonji-tenant-id` cookie to determine which tenant is selected.
 * If no cookie or cookie doesn't match, defaults to first tenant (by created_at).
 *
 * Response includes `allTenants` array when user belongs to multiple tenants,
 * enabling the sidebar tenant switcher.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return unauthorized("Not signed in");

    const sql = getClient_raw();

    // Get ALL tenants for this Clerk user — NO LIMIT 1
    let rows = await sql`
      SELECT 
        u.id as user_id, u.email, u.name as user_name, u.role,
        t.id as tenant_id, t.slug, t.name as tenant_name, 
        t.plan, t.industry, t.status
      FROM users u
      JOIN tenants t ON t.id = u.tenant_id
      WHERE u.clerk_id = ${clerkUserId}
      ORDER BY t.created_at ASC
    `;

    // If no match by Clerk ID, try email fallback (deferred currentUser call)
    if (rows.length === 0) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

      if (email) {
        rows = await sql`
          SELECT 
            u.id as user_id, u.email, u.name as user_name, u.role,
            t.id as tenant_id, t.slug, t.name as tenant_name, 
            t.plan, t.industry, t.status
          FROM users u
          JOIN tenants t ON t.id = u.tenant_id
          WHERE u.email = ${email}
          ORDER BY t.created_at ASC
        `;

        if (rows.length > 0) {
          for (const row of rows) {
            await sql`UPDATE users SET clerk_id = ${clerkUserId} WHERE id = ${row.user_id}`;
          }
        }
      }

      if (rows.length === 0) {
        return ok({
          hasTenant: false,
          clerkUser: {
            id: clerkUserId,
            email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
            firstName: clerkUser?.firstName || null,
            lastName: clerkUser?.lastName || null,
          },
        });
      }
    }

    // ─── Determine selected tenant ───
    // Priority: cookie > first tenant (oldest by created_at)
    const cookieTenantId = req.cookies.get("sonji-tenant-id")?.value;
    let selected = rows[0];

    if (cookieTenantId) {
      const match = rows.find((r: any) => r.tenant_id === cookieTenantId);
      if (match) selected = match;
    }

    const allTenants = rows.map((r: any) => ({
      id: r.tenant_id,
      slug: r.slug,
      name: r.tenant_name,
      plan: r.plan,
      industry: r.industry,
      status: r.status,
    }));

    return ok({
      hasTenant: true,
      tenant: {
        id: selected.tenant_id,
        slug: selected.slug,
        name: selected.tenant_name,
        plan: selected.plan,
        industry: selected.industry,
        status: selected.status,
      },
      user: {
        id: selected.user_id,
        email: selected.email,
        name: selected.user_name,
        role: selected.role,
      },
      ...(allTenants.length > 1 ? { allTenants } : {}),
    });
  } catch (err: any) {
    return ok({ hasTenant: false, error: err.message });
  }
}
