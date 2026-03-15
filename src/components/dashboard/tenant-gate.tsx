"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

/**
 * TENANT GATE
 * 
 * Wraps the dashboard layout. On load:
 * 1. If not signed in → redirect to /login
 * 2. If signed in but no tenant → redirect to /onboarding
 * 3. If signed in + has tenant → render children
 * 
 * Stores tenant info in sessionStorage for subsequent page loads
 * (avoids hitting /api/me on every navigation).
 */
export default function TenantGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Not signed in → login
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    // Check if we already verified this session
    const cached = sessionStorage.getItem("sonji-tenant-verified");
    if (cached === "true") {
      setHasAccess(true);
      setChecked(true);
      return;
    }

    // Check /api/me for tenant
    fetch("/api/me")
      .then(r => r.json())
      .then(data => {
        if (data.data?.hasTenant) {
          sessionStorage.setItem("sonji-tenant-verified", "true");
          sessionStorage.setItem("sonji-tenant", JSON.stringify(data.data.tenant));
          sessionStorage.setItem("sonji-user", JSON.stringify(data.data.user));
          setHasAccess(true);
        } else {
          // No tenant — send to onboarding
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        // API error — allow access anyway (may be in dev mode / password gate)
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
