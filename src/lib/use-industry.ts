"use client";

import { useState, useEffect } from "react";
import { getIndustryConfig, type IndustryConfig } from "@/lib/industry-config";

/**
 * Hook to get current industry config.
 * 
 * Priority:
 * 1. Demo key in localStorage (brain mode / demo visitors)
 * 2. Tenant industry from sessionStorage (real tenants like CLYR)
 * 3. null (no industry context)
 */
export function useIndustry(): IndustryConfig | null {
  const [ic, setIc] = useState<IndustryConfig | null>(null);

  useEffect(() => {
    // Check demo mode first (brain mode / demo visitors)
    const demoKey = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    if (demoKey) {
      setIc(getIndustryConfig(demoKey));
      return;
    }

    // Check real tenant industry from sessionStorage
    try {
      const tenant = JSON.parse(sessionStorage.getItem("sonji-tenant") || "{}");
      if (tenant.industry) {
        setIc(getIndustryConfig(tenant.industry));
      }
    } catch {}
  }, []);

  return ic;
}

/**
 * Get industry-aware page title.
 */
export function usePageTitle(defaults: {
  contacts?: string;
  deals?: string;
  tasks?: string;
  activities?: string;
}) {
  const ic = useIndustry();
  return {
    contacts: ic?.contactLabelPlural || defaults.contacts || "Contacts",
    deals: ic?.dealLabelPlural || defaults.deals || "Deals",
    tasks: defaults.tasks || "Tasks",
    activities: defaults.activities || "Activities",
    ic,
  };
}
