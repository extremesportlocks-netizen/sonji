import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db, getClient_raw } from "@/lib/db";
import { users, tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ok, unauthorized } from "@/lib/api/responses";

/**
 * GET /api/me — Returns current user + tenant info.
 * 
 * Used by the dashboard to know which tenant to load,
 * and by the router to decide: dashboard vs onboarding.
 * 
 * Uses raw SQL to bypass RLS — we don't know the tenant yet,
 * that's the whole point of this route.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return unauthorized("Not signed in");

    const clerkUser = await currentUser();
    const sql = getClient_raw();

    // Look up Sonji user by Clerk ID (bypasses RLS)
    let userRows = await sql`
      SELECT id, tenant_id, email, name, role, clerk_id 
      FROM users 
      WHERE clerk_id = ${clerkUserId} 
      LIMIT 1
    `;

    let user = userRows[0] || null;

    // If no match by Clerk ID, try matching by email
    // This handles production Clerk switch — same email, new Clerk user ID
    if (!user && clerkUser?.emailAddresses?.[0]?.emailAddress) {
      const email = clerkUser.emailAddresses[0].emailAddress;
      const emailRows = await sql`
        SELECT id, tenant_id, email, name, role, clerk_id 
        FROM users 
        WHERE email = ${email} 
        LIMIT 1
      `;

      if (emailRows.length > 0) {
        user = emailRows[0];
        // Auto-link: update the user's Clerk ID to the new production one
        await sql`
          UPDATE users SET clerk_id = ${clerkUserId} WHERE id = ${user.id}
        `;
      }
    }

    if (!user) {
      return ok({
        hasTenant: false,
        clerkUser: {
          id: clerkUserId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || null,
          firstName: clerkUser?.firstName || null,
          lastName: clerkUser?.lastName || null,
        },
      });
    }

    // Look up tenant (also bypass RLS)
    const tenantRows = await sql`
      SELECT id, slug, name, plan, industry, status 
      FROM tenants 
      WHERE id = ${user.tenant_id} 
      LIMIT 1
    `;

    if (tenantRows.length === 0) {
      return ok({ hasTenant: false });
    }

    const tenant = tenantRows[0];

    return ok({
      hasTenant: true,
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        plan: tenant.plan,
        industry: tenant.industry,
        status: tenant.status,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    return ok({ hasTenant: false, error: err.message });
  }
}
