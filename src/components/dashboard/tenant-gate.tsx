"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

/**
 * TENANT GATE
 * 
 * Wraps the dashboard layout. On load:
 * 1. If signed in via Clerk → resolve tenant from /api/me
 *    - Has tenant → set industry, render dashboard
 *    - No tenant → redirect to /onboarding
 * 2. If not signed in → allow access (demo/password-gate mode)
 * 
 * Sets localStorage("sonji-demo-industry") from tenant.industry
 * so all dashboard widgets show the correct industry data.
 */
export default function TenantGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Not signed in → allow access for demo/password-gate visitors
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
        // ONLY the ESL platform admin account gets brain mode
        const isAdmin = user.email === "contact@extremesportlocks.com";

        if (!isAdmin) {
          // Real tenant owner (CLYR, Power Marketing, etc.) — ALWAYS clear demo state
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

    // Signed in → check /api/me for tenant
    fetch("/api/me")
      .then(r => r.json())
      .then(data => {
        if (data.data?.hasTenant) {
          const tenant = data.data.tenant;
          const user = data.data.user;

          sessionStorage.setItem("sonji-tenant-verified", "true");
          sessionStorage.setItem("sonji-tenant", JSON.stringify(tenant));
          sessionStorage.setItem("sonji-user", JSON.stringify(user));

          // ONLY the ESL platform admin account gets brain mode
          const isAdmin = user.email === "contact@extremesportlocks.com";

          if (isAdmin && tenant.industry) {
            // Admin brain mode — set demo industry for industry switching
            localStorage.setItem("sonji-demo-industry", tenant.industry);
          } else {
            // Real tenant owner — ALWAYS clear ALL stale demo/layout state
            // This prevents Power Marketing data from bleeding into CLYR
            localStorage.removeItem("sonji-demo-industry");
            localStorage.removeItem("sonji-dashboard-layout");
            localStorage.removeItem("sonji-dashboard-industry");
            localStorage.removeItem("sonji-box-config");
            localStorage.removeItem("sonji-box-industry");
          }

          setHasAccess(true);
        } else {
          // Signed in but no tenant → send to onboarding
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        // API error — allow access anyway (graceful degradation)
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
