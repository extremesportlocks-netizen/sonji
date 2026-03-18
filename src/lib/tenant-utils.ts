/**
 * Check if the current user is a real authenticated tenant.
 * 
 * Real tenants should see their REAL data (even if empty).
 * Demo visitors should see industry demo data.
 * Orlando's brain mode (admin) can toggle between real + demo.
 * 
 * Usage in any dashboard page:
 *   const isReal = isRealTenant();
 *   if (isReal) { fetch("/api/contacts"); }
 *   else { fetch("/api/demo?industry=..."); }
 */

const ADMIN_EMAILS = [
  "contact@extremesportlocks.com",
  "orlandosmith1996@gmail.com",
  "orlandoenterprises54@gmail.com",
];

export function isRealTenant(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("sonji-tenant-verified") === "true";
}

export function isAdminUser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const user = JSON.parse(sessionStorage.getItem("sonji-user") || "{}");
    return ADMIN_EMAILS.includes(user.email);
  } catch { return false; }
}

/**
 * Should this page show demo data?
 * 
 * TRUE when:
 * - Not a real tenant (demo visitor)
 * - Admin user who has switched to a DIFFERENT industry via demo bar
 *   (brain mode — previewing other industry layouts)
 * 
 * FALSE when:
 * - Real tenant (show real data, even if empty)
 * - Admin user viewing their OWN industry
 */
export function shouldShowDemoData(): boolean {
  if (typeof window === "undefined") return false;

  const isReal = isRealTenant();

  if (!isReal) return true; // Demo visitor — always show demo

  // Real tenant — check if admin is in brain mode (different industry)
  if (isAdminUser()) {
    const demoIndustry = localStorage.getItem("sonji-demo-industry");
    const tenantIndustry = getTenantIndustry();
    // If admin switched to a different industry, show that industry's demo data
    if (demoIndustry && tenantIndustry && demoIndustry !== tenantIndustry) {
      return true;
    }
  }

  return false; // Real tenant — show real data
}

export function getTenantIndustry(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const tenant = JSON.parse(sessionStorage.getItem("sonji-tenant") || "{}");
    return tenant.industry || null;
  } catch { return null; }
}

export function getDemoIndustryKey(): string {
  if (typeof window === "undefined") return "ecommerce";
  return localStorage.getItem("sonji-demo-industry") || "ecommerce";
}
