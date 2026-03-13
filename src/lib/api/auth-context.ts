import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface AuthContext {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: TenantRole;
}

export type TenantRole = "owner" | "admin" | "member" | "viewer";

/**
 * Permission matrix.
 * Each action maps to the minimum roles that can perform it.
 */
const PERMISSIONS: Record<string, TenantRole[]> = {
  "contacts:read":    ["owner", "admin", "member", "viewer"],
  "contacts:create":  ["owner", "admin", "member"],
  "contacts:update":  ["owner", "admin", "member"],
  "contacts:delete":  ["owner", "admin"],
  "contacts:import":  ["owner", "admin"],
  "contacts:export":  ["owner", "admin", "member"],
  "deals:read":       ["owner", "admin", "member", "viewer"],
  "deals:create":     ["owner", "admin", "member"],
  "deals:update":     ["owner", "admin", "member"],
  "deals:delete":     ["owner", "admin"],
  "tasks:read":       ["owner", "admin", "member", "viewer"],
  "tasks:create":     ["owner", "admin", "member"],
  "tasks:update":     ["owner", "admin", "member"],
  "tasks:delete":     ["owner", "admin", "member"],
  "activities:read":  ["owner", "admin", "member", "viewer"],
  "activities:create":["owner", "admin", "member"],
  "messages:read":    ["owner", "admin", "member", "viewer"],
  "messages:send":    ["owner", "admin", "member"],
  "campaigns:manage": ["owner", "admin"],
  "workflows:read":   ["owner", "admin", "member", "viewer"],
  "workflows:manage": ["owner", "admin"],
  "reports:read":     ["owner", "admin", "member", "viewer"],
  "reports:export":   ["owner", "admin"],
  "settings:read":    ["owner", "admin"],
  "settings:update":  ["owner", "admin"],
  "billing:manage":   ["owner"],
  "team:manage":      ["owner", "admin"],
  "team:read":        ["owner", "admin", "member", "viewer"],
  "integrations:manage": ["owner", "admin"],
  "apikeys:manage":      ["owner"],
};

// ════════════════════════════════════════
// CONTEXT RESOLUTION
// ════════════════════════════════════════

/**
 * Resolve auth context from Clerk session → database lookup.
 *
 * Flow: Clerk JWT → userId → query users table → get tenant → return full context.
 * This is the bridge between Clerk auth and Sonji's multi-tenant data layer.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;

    // Look up the Sonji user by Clerk ID
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

    if (userRows.length === 0) return null;

    const user = userRows[0];

    // Get tenant info
    const tenantRows = await db
      .select({
        id: tenants.id,
        slug: tenants.slug,
        name: tenants.name,
      })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

    if (tenantRows.length === 0) return null;

    const tenant = tenantRows[0];

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role as TenantRole,
    };
  } catch (err) {
    console.error("[AuthContext] Failed to resolve:", err);
    return null;
  }
}

/**
 * Require auth. Returns context or throws 401.
 */
export async function requireAuth(req: NextRequest): Promise<AuthContext> {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    throw new AuthError("Authentication required", 401);
  }
  return ctx;
}

/**
 * Check if the user has a specific permission.
 */
export function hasPermission(role: TenantRole, permission: string): boolean {
  const allowed = PERMISSIONS[permission];
  if (!allowed) {
    console.warn(`[RBAC] Unknown permission: ${permission}`);
    return false;
  }
  return allowed.includes(role);
}

/**
 * Require a specific permission. Throws 403 if denied.
 */
export function requirePermission(ctx: AuthContext, permission: string): void {
  if (!hasPermission(ctx.userRole, permission)) {
    throw new AuthError(`Permission denied: ${permission}`, 403);
  }
}

/**
 * Custom auth error with HTTP status.
 */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}
