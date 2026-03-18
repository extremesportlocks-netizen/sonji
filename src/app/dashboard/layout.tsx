"use client";

import { getDemoIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import CommandPalette from "@/components/dashboard/command-palette";
import PulseBar from "@/components/dashboard/pulse-bar";
import DemoBar from "@/components/dashboard/demo-bar";
import AIChat from "@/components/dashboard/ai-chat";
import TenantGate from "@/components/dashboard/tenant-gate";
import { ModalProvider } from "@/components/modals/modal-provider";
import { CRMProvider } from "@/lib/crm-store";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const [healthStats, setHealthStats] = useState<any>(null);

  useEffect(() => {
    const demoIndustry = getDemoIndustry();

    if (demoIndustry) {
      // Demo mode — load demo stats
      fetch(`/api/demo?industry=${demoIndustry}`).then(r => r.json()).then(d => {
        if (d.ok && d.data) setHealthStats(d.data);
      }).catch(() => {});
    } else {
      // Real tenant — load real stats
      fetch("/api/dashboard").then(r => r.json()).then(d => {
        setHealthStats(d.data || d);
      }).catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar />
      <CommandPalette />
      <main className={`min-h-screen transition-all duration-200 ${collapsed ? "ml-[68px]" : "ml-[260px]"}`}>
        <DemoBar />
        <PulseBar stats={healthStats} />
        {children}
      </main>
      <AIChat />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantGate>
      <CRMProvider>
        <ModalProvider>
          <SidebarProvider>
            <DashboardContent>{children}</DashboardContent>
          </SidebarProvider>
        </ModalProvider>
      </CRMProvider>
    </TenantGate>
  );
}
