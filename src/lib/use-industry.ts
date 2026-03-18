"use client";

import { useState, useEffect } from "react";
import { getIndustryConfig, type IndustryConfig } from "@/lib/industry-config";
import { getActiveIndustry } from "@/lib/tenant-utils";

/**
 * Hook to get current industry config.
 * Uses centralized tenant-utils for bulletproof demo/real detection.
 */
export function useIndustry(): IndustryConfig | null {
  const [ic, setIc] = useState<IndustryConfig | null>(null);

  useEffect(() => {
    const industry = getActiveIndustry();
    if (industry) {
      setIc(getIndustryConfig(industry));
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
