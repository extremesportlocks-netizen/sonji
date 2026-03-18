/**
 * SONJI TENANT UTILITIES
 * 
 * Single source of truth for determining what data to show.
 * Every dashboard page and widget MUST use these functions.
 * 
 * RULE: If isRealTenant() returns true, NEVER show demo data.
 * Period. No fallbacks, no "ecommerce" defaults, nothing.
 */

const ADMIN_EMAILS = [
  "contact@extremesportlocks.com",
  "orlandosmith1996@gmail.com",
  "orlandoenterprises54@gmail.com",
];

/**
 * Is the current user a real authenticated tenant?
 * Checks sessionStorage which is set by TenantGate on auth.
 */
export function isRealTenant(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("sonji-tenant-verified") === "true";
}

/**
 * Is the current user a platform admin (Orlando)?
 */
export function isAdminUser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const user = JSON.parse(sessionStorage.getItem("sonji-user") || "{}");
    return ADMIN_EMAILS.includes(user.email);
  } catch { return false; }
}

/**
 * Get the demo industry key — ONLY if demo data should be shown.
 * 
 * Returns the industry key for:
 * - Demo visitors (not authenticated)
 * - Admin users in brain mode (switching industries)
 * 
 * Returns NULL for:
 * - ALL real tenants (CLYR, Power, future customers)
 * - Even if localStorage still has a stale key from before
 * 
 * THIS IS THE FUNCTION EVERY PAGE SHOULD USE.
 */
export function getDemoIndustry(): string | null {
  if (typeof window === "undefined") return null;
  
  // Real tenant = NEVER show demo data
  if (isRealTenant()) {
    // Exception: admin in brain mode with demo bar active
    if (isAdminUser()) {
      const demoKey = localStorage.getItem("sonji-demo-industry");
      // Only return demo key if admin has explicitly switched to a DIFFERENT industry
      const tenantIndustry = getTenantIndustry();
      if (demoKey && tenantIndustry && demoKey !== tenantIndustry) {
        return demoKey;
      }
    }
    return null;
  }
  
  // Not a real tenant — demo visitor, show demo data
  return localStorage.getItem("sonji-demo-industry") || "ecommerce";
}

/**
 * Get the tenant's industry from sessionStorage.
 * Works for both real tenants and returns null for demo visitors.
 */
export function getTenantIndustry(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const tenant = JSON.parse(sessionStorage.getItem("sonji-tenant") || "{}");
    return tenant.industry || null;
  } catch { return null; }
}

/**
 * Get the active industry for label overrides.
 * Returns the industry that should drive labels like "Patients" vs "Contacts".
 * 
 * For real tenants: their actual industry
 * For demo visitors: the demo industry
 * For admin brain mode: the demo bar industry
 */
export function getActiveIndustry(): string | null {
  if (typeof window === "undefined") return null;
  const demo = getDemoIndustry();
  if (demo) return demo;
  return getTenantIndustry();
}

