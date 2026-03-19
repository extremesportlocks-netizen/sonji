import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db, getClient_raw } from "@/lib/db";
import { users, tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ok, unauthorized } from "@/lib/api/responses";

/**
 * GET /api/me — Returns current user + tenant info.
 * 
 * PERFORMANCE: Single auth() call + single JOIN query.
 * currentUser() is deferred — only called if clerk_id lookup fails
 * (handles production Clerk switch, same email new ID).
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return unauthorized("Not signed in");

    const sql = getClient_raw();

    // Single JOIN query — user + tenant in one round-trip
    let rows = await sql`
      SELECT 
        u.id as user_id, u.email, u.name as user_name, u.role,
        t.id as tenant_id, t.slug, t.name as tenant_name, 
        t.plan, t.industry, t.status
      FROM users u
      JOIN tenants t ON t.id = u.tenant_id
      WHERE u.clerk_id = ${clerkUserId}
      LIMIT 1
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
          LIMIT 1
        `;

        if (rows.length > 0) {
          // Auto-link: update Clerk ID for future fast lookups
          await sql`UPDATE users SET clerk_id = ${clerkUserId} WHERE id = ${rows[0].user_id}`;
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

    const r = rows[0];

    return ok({
      hasTenant: true,
      tenant: {
        id: r.tenant_id,
        slug: r.slug,
        name: r.tenant_name,
        plan: r.plan,
        industry: r.industry,
        status: r.status,
      },
      user: {
        id: r.user_id,
        email: r.email,
        name: r.user_name,
        role: r.role,
      },
    });
  } catch (err: any) {
    return ok({ hasTenant: false, error: err.message });
  }
}
