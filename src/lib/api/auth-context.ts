import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, tenants } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

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
 * MULTI-TENANT FIX: Reads `sonji-tenant-id` cookie to determine which tenant
 * to resolve for. This ensures Path 1 (/api/me → TenantGate → cookie) and
 * Path 2 (getAuthContext → every API route) always agree on the tenant.
 *
 * If no cookie, falls back to deterministic ORDER BY created_at ASC.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;

    // Read tenant selection cookie (set by TenantGate on dashboard load)
    const selectedTenantId = req.cookies.get("sonji-tenant-id")?.value;

    const selectFields = {
      userId: users.id,
      tenantId: users.tenantId,
      email: users.email,
      name: users.name,
      role: users.role,
      tenantSlug: tenants.slug,
      tenantName: tenants.name,
    };

    let rows: any[] = [];

    // If cookie is set, do a targeted query — user must belong to this specific tenant
    if (selectedTenantId) {
      rows = await db
        .select(selectFields)
        .from(users)
        .innerJoin(tenants, eq(tenants.id, users.tenantId))
        .where(and(eq(users.clerkId, clerkUserId), eq(users.tenantId, selectedTenantId)))
        .limit(1);
    }

    // Fallback — no cookie or cookie didn't match. Use deterministic ORDER BY.
    if (rows.length === 0) {
      rows = await db
        .select(selectFields)
        .from(users)
        .innerJoin(tenants, eq(tenants.id, users.tenantId))
        .where(eq(users.clerkId, clerkUserId))
        .orderBy(asc(tenants.createdAt))
        .limit(1);
    }

    if (rows.length === 0) return null;

    const r = rows[0];

    return {
      tenantId: r.tenantId,
      tenantSlug: r.tenantSlug,
      tenantName: r.tenantName,
      userId: r.userId,
      userEmail: r.email,
      userName: r.name,
      userRole: r.role as TenantRole,
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
