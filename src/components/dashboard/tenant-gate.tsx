"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

/**
 * TENANT GATE
 *
 * Wraps the dashboard layout. On load:
 * 1. If signed in → call /api/me to get tenant(s)
 *    - Has tenant → set cookie + sessionStorage, render dashboard
 *    - Multiple tenants → also store allTenants for sidebar switcher
 *    - No tenant → redirect to /onboarding
 * 2. If not signed in → allow access (demo/password-gate mode)
 *
 * The `sonji-tenant-id` cookie is the single source of truth for tenant selection.
 * Both /api/me and getAuthContext (every API route) read this cookie.
 */
export default function TenantGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setHasAccess(true);
      setChecked(true);
      return;
    }

    // Check if we already verified this session
    const cached = sessionStorage.getItem("sonji-tenant-verified");
    if (cached === "true") {
      try {
        const user = JSON.parse(sessionStorage.getItem("sonji-user") || "{}");
        const isAdmin = user.email === "contact@extremesportlocks.com";

        if (!isAdmin) {
          localStorage.removeItem("sonji-demo-industry");
          localStorage.removeItem("sonji-dashboard-layout");
          localStorage.removeItem("sonji-dashboard-industry");
          localStorage.removeItem("sonji-box-config");
          localStorage.removeItem("sonji-box-industry");
        }
      } catch {}
      setHasAccess(true);
      setChecked(true);
      return;
    }

    // Signed in → resolve tenant(s) from /api/me
    fetch("/api/me")
      .then(r => r.json())
      .then(data => {
        if (data.data?.hasTenant) {
          const tenant = data.data.tenant;
          const user = data.data.user;
          const allTenants = data.data.allTenants; // only present if multiple

          // ─── Set the tenant selection cookie ───
          // This is the critical fix: every API route reads this cookie
          // to resolve the correct tenant. No more LIMIT 1 guessing.
          document.cookie = `sonji-tenant-id=${tenant.id}; path=/; max-age=31536000; SameSite=Lax`;

          // Store in sessionStorage for UI components
          sessionStorage.setItem("sonji-tenant-verified", "true");
          sessionStorage.setItem("sonji-tenant", JSON.stringify(tenant));
          sessionStorage.setItem("sonji-user", JSON.stringify(user));

          // Store allTenants for the sidebar tenant switcher
          if (allTenants && allTenants.length > 1) {
            sessionStorage.setItem("sonji-all-tenants", JSON.stringify(allTenants));
          } else {
            sessionStorage.removeItem("sonji-all-tenants");
          }

          // Only ESL platform admin gets brain mode
          const isAdmin = user.email === "contact@extremesportlocks.com";

          if (isAdmin && tenant.industry) {
            localStorage.setItem("sonji-demo-industry", tenant.industry);
          } else {
            // Real tenant owner — clear ALL stale demo/layout state
            localStorage.removeItem("sonji-demo-industry");
            localStorage.removeItem("sonji-dashboard-layout");
            localStorage.removeItem("sonji-dashboard-industry");
            localStorage.removeItem("sonji-box-config");
            localStorage.removeItem("sonji-box-industry");
          }

          setHasAccess(true);
        } else {
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        setHasAccess(true);
      })
      .finally(() => setChecked(true));
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) return null;

  return <>{children}</>;
}
