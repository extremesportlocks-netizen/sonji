"use client";

import { useState, useEffect } from "react";
import { getIndustryConfig, type IndustryConfig } from "@/lib/industry-config";

/**
 * Hook to get current industry config for demo mode.
 * Returns null when not in demo mode (real data).
 * 
 * Usage:
 *   const ic = useIndustry();
 *   const title = ic?.contactLabelPlural || "Contacts";
 */
export function useIndustry(): IndustryConfig | null {
  const [ic, setIc] = useState<IndustryConfig | null>(null);

  useEffect(() => {
    const key = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    if (key) {
      setIc(getIndustryConfig(key));
    }
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
