import { NextRequest, NextResponse } from "next/server";

/**
 * SONJI MULTI-TENANT MIDDLEWARE
 * 
 * Runs on every request. Resolves tenant from subdomain.
 * 
 * Routing logic:
 *   sonji.io / www.sonji.io       → Marketing site (public)
 *   app.sonji.io                   → Login/signup (auth)
 *   {tenant}.sonji.io              → Tenant dashboard (CRM)
 *   admin.sonji.io                 → Platform admin (internal)
 * 
 * Custom domains (Scale tier):
 *   crm.clientbusiness.com         → Tenant dashboard (via CNAME)
 */

// Platform root domain — update for production vs development
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "sonji.io";

// Reserved subdomains that should NOT resolve as tenants
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "admin",
  "api",
  "docs",
  "status",
  "blog",
  "mail",
  "smtp",
]);

// Public paths that don't require tenant context
const PUBLIC_PATHS = new Set([
  "/",
  "/pricing",
  "/features",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
]);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

// ─── SITE PASSWORD PROTECTION ───
// Set SITE_PASSWORD env var to enable. Remove to disable.
const SITE_PASSWORD = process.env.SITE_PASSWORD || "";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // ─── PASSWORD GATE ───
  // If SITE_PASSWORD is set, require password before showing anything
  if (SITE_PASSWORD && url.pathname !== "/password-gate" && url.pathname !== "/api/auth-password") {
    const authed = request.cookies.get("site_auth")?.value;
    if (authed !== SITE_PASSWORD) {
      url.pathname = "/password-gate";
      return NextResponse.rewrite(url);
    }
  }

  // ─── LOCAL DEVELOPMENT ───
  // In dev, hostname is localhost:3000 — skip tenant resolution
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // Check for dev tenant simulation via header or query param
    const devTenant = request.headers.get("x-tenant-slug") || 
                      url.searchParams.get("tenant");
    if (devTenant) {
      const response = NextResponse.next();
      response.headers.set("x-tenant-slug", devTenant);
      return response;
    }
    return NextResponse.next();
  }

  // ─── EXTRACT SUBDOMAIN ───
  // hostname: "acme.sonji.io" → subdomain: "acme"
  // hostname: "sonji.io" → subdomain: null
  // hostname: "crm.clientbiz.com" → custom domain flow
  let subdomain: string | null = null;

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = hostname.replace(`.${ROOT_DOMAIN}`, "");
  } else if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    // Root domain — serve marketing site
    subdomain = null;
  } else {
    // Custom domain — look up tenant by domain
    // TODO: Query tenants table for custom_domain match
    // For now, pass the hostname as a header for the app to resolve
    const response = NextResponse.next();
    response.headers.set("x-custom-domain", hostname);
    return response;
  }

  // ─── ROUTE BY SUBDOMAIN ───
  
  // No subdomain = marketing site
  if (!subdomain) {
    return NextResponse.next();
  }

  // Reserved subdomains
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    // Rewrite to the appropriate route group
    if (subdomain === "app") {
      url.pathname = `/app${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    if (subdomain === "admin") {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    // www → root
    if (subdomain === "www") {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // ─── TENANT SUBDOMAIN ───
  // This is a tenant request: {slug}.sonji.io
  // Inject tenant slug into headers for the app to use
  const response = NextResponse.next();
  response.headers.set("x-tenant-slug", subdomain);
  return response;
}
