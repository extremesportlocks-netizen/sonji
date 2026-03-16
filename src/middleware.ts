import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * SONJI MULTI-TENANT MIDDLEWARE
 * 
 * Clerk auth + multi-tenant subdomain routing.
 * 
 * Public routes (no auth required):
 *   Marketing pages, pricing, login, signup, onboarding, demo, password gate, API routes
 * 
 * Protected routes (auth required):
 *   /dashboard/* — Tenant CRM dashboard
 */

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "sonji.io";

const RESERVED_SUBDOMAINS = new Set([
  "www", "app", "admin", "api", "docs", "status", "blog", "mail", "smtp",
]);

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/features",
  "/about",
  "/contact",
  "/compare",
  "/roi",
  "/privacy",
  "/terms",
  "/login(.*)",
  "/signup(.*)",
  "/onboarding(.*)",
  "/demo(.*)",
  "/password-gate",
  "/api/(.*)",
]);

// Site password protection
const SITE_PASSWORD = process.env.SITE_PASSWORD || "";

export default clerkMiddleware(async (auth, request) => {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // ─── PASSWORD GATE ───
  // Bypass for: API routes, Clerk-authenticated users, specific paths
  if (SITE_PASSWORD && url.pathname !== "/password-gate" && url.pathname !== "/api/auth-password" && !url.pathname.startsWith("/api/inngest") && !url.pathname.startsWith("/api/webhooks")) {
    const authed = request.cookies.get("site_auth")?.value;
    const { userId } = await auth();
    // Skip password gate if user is signed in via Clerk OR has the site password cookie
    if (authed !== SITE_PASSWORD && !userId) {
      // Also skip for login/signup/onboarding and marketing pages so they're always accessible
      const marketingPaths = ["/login", "/signup", "/onboarding", "/compare", "/pricing", "/demo", "/privacy", "/terms", "/roi", "/about"];
      const isMarketingPage = url.pathname === "/" || marketingPaths.some(p => url.pathname.startsWith(p));
      if (!isMarketingPage) {
        url.pathname = "/password-gate";
        return NextResponse.rewrite(url);
      }
    }
  }

  // ─── PROTECT DASHBOARD ROUTES ───
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // ─── LOCAL DEVELOPMENT ───
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
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
  let subdomain: string | null = null;

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = hostname.replace(`.${ROOT_DOMAIN}`, "");
  } else if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    subdomain = null;
  } else {
    const response = NextResponse.next();
    response.headers.set("x-custom-domain", hostname);
    return response;
  }

  // ─── ROUTE BY SUBDOMAIN ───
  if (!subdomain) {
    return NextResponse.next();
  }

  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    if (subdomain === "app") {
      url.pathname = `/app${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    if (subdomain === "admin") {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    if (subdomain === "www") {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // ─── TENANT SUBDOMAIN ───
  const response = NextResponse.next();
  response.headers.set("x-tenant-slug", subdomain);
  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
