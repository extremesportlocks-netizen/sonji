import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ok, unauthorized } from "@/lib/api/responses";

/**
 * GET /api/me — Returns current user + tenant info.
 * 
 * Used by the dashboard to know which tenant to load,
 * and by the router to decide: dashboard vs onboarding.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return unauthorized("Not signed in");

    const clerkUser = await currentUser();

    // Look up Sonji user by Clerk ID
    const userRows = await db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (userRows.length === 0) {
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

    const user = userRows[0];

    const tenantRows = await db
      .select({
        id: tenants.id,
        slug: tenants.slug,
        name: tenants.name,
        plan: tenants.plan,
        industry: tenants.industry,
        status: tenants.status,
      })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

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
