import { NextRequest } from "next/server";
import { unauthorized, forbidden } from "./responses";

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface AuthContext {
  tenantId: string;
  tenantSlug: string;
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
  // Contacts
  "contacts:read":    ["owner", "admin", "member", "viewer"],
  "contacts:create":  ["owner", "admin", "member"],
  "contacts:update":  ["owner", "admin", "member"],
  "contacts:delete":  ["owner", "admin"],
  "contacts:import":  ["owner", "admin"],
  "contacts:export":  ["owner", "admin", "member"],

  // Deals
  "deals:read":       ["owner", "admin", "member", "viewer"],
  "deals:create":     ["owner", "admin", "member"],
  "deals:update":     ["owner", "admin", "member"],
  "deals:delete":     ["owner", "admin"],

  // Tasks
  "tasks:read":       ["owner", "admin", "member", "viewer"],
  "tasks:create":     ["owner", "admin", "member"],
  "tasks:update":     ["owner", "admin", "member"],
  "tasks:delete":     ["owner", "admin", "member"],

  // Activities
  "activities:read":  ["owner", "admin", "member", "viewer"],
  "activities:create":["owner", "admin", "member"],

  // Email/SMS
  "messages:read":    ["owner", "admin", "member", "viewer"],
  "messages:send":    ["owner", "admin", "member"],
  "campaigns:manage": ["owner", "admin"],

  // Workflows
  "workflows:read":   ["owner", "admin", "member", "viewer"],
  "workflows:manage": ["owner", "admin"],

  // Reports
  "reports:read":     ["owner", "admin", "member", "viewer"],
  "reports:export":   ["owner", "admin"],

  // Settings & Billing
  "settings:read":    ["owner", "admin"],
  "settings:update":  ["owner", "admin"],
  "billing:manage":   ["owner"],
  "team:manage":      ["owner", "admin"],
  "team:read":        ["owner", "admin", "member", "viewer"],

  // Integrations & API
  "integrations:manage": ["owner", "admin"],
  "apikeys:manage":      ["owner"],
};

// ════════════════════════════════════════
// CONTEXT RESOLUTION
// ════════════════════════════════════════

/**
 * Resolve auth context from request.
 *
 * In production, this reads from Clerk's JWT + our middleware headers.
 * In dev mode, it can use mock headers or a dev token.
 *
 * Returns the auth context or throws an HTTP error response.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  // ── DEV MODE: Check for mock auth headers ──
  if (process.env.NODE_ENV === "development" || process.env.MOCK_AUTH === "true") {
    const mockTenantId = req.headers.get("x-mock-tenant-id");
    const mockUserId = req.headers.get("x-mock-user-id");

    if (mockTenantId && mockUserId) {
      return {
        tenantId: mockTenantId,
        tenantSlug: req.headers.get("x-tenant-slug") || "demo",
        userId: mockUserId,
        userEmail: req.headers.get("x-mock-user-email") || "dev@sonji.io",
        userName: req.headers.get("x-mock-user-name") || "Dev User",
        userRole: (req.headers.get("x-mock-user-role") as TenantRole) || "owner",
      };
    }
  }

  // ── PRODUCTION: Resolve from Clerk JWT ──
  // TODO: Wire Clerk auth when we add the package
  // const { userId } = auth();
  // const user = await currentUser();
  // const tenantSlug = req.headers.get("x-tenant-slug");
  // Query users table: SELECT * FROM users WHERE clerk_id = userId AND tenant_id = (SELECT id FROM tenants WHERE slug = tenantSlug)

  // For now, return null if no mock headers
  return null;
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
