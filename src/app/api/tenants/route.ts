import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ok, created, conflict, validationError, badRequest, unauthorized, withErrorHandler } from "@/lib/api/responses";
import { createTenantSchema, parseBody } from "@/lib/api/validation";
import { provisionTenant, isSlugAvailable } from "@/lib/services/tenant-provisioning";

/**
 * POST /api/tenants — Provision a new tenant (called from onboarding wizard).
 * Grabs the authenticated Clerk user and links them to the new tenant.
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  // Get authenticated Clerk user
  const { userId } = await auth();
  if (!userId) return unauthorized("You must be signed in to create a workspace");

  const user = await currentUser();
  if (!user) return unauthorized("Unable to resolve user");

  const { data, errors } = await parseBody(req, createTenantSchema);
  if (errors) return validationError(errors);

  // Check slug
  const available = await isSlugAvailable(data!.slug);
  if (!available) return conflict(`The workspace URL "${data!.slug}" is already taken`);

  const result = await provisionTenant({
    name: data!.name,
    slug: data!.slug,
    plan: data!.plan,
    industry: data!.industry || "other",
    ownerEmail: data!.ownerEmail || user.emailAddresses[0]?.emailAddress || "",
    ownerName: data!.ownerName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Owner",
    clerkUserId: userId,
  });

  return created(result);
});

/**
 * GET /api/tenants?slug=check-this — Check slug availability.
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const slugToCheck = url.searchParams.get("slug");
  if (!slugToCheck) return badRequest("slug parameter is required");

  const available = await isSlugAvailable(slugToCheck);
  return ok({ slug: slugToCheck, available });
});
