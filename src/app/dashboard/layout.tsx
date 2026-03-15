"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import CommandPalette from "@/components/dashboard/command-palette";
import PulseBar from "@/components/dashboard/pulse-bar";
import DemoBar from "@/components/dashboard/demo-bar";
import { ModalProvider } from "@/components/modals/modal-provider";
import { CRMProvider } from "@/lib/crm-store";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const [healthStats, setHealthStats] = useState<any>(null);

  useEffect(() => {
    // Check if in demo mode
    const demoIndustry = localStorage.getItem("sonji-demo-industry");
    const url = demoIndustry && demoIndustry !== "ecommerce"
      ? `/api/demo?industry=${demoIndustry}`
      : "/api/dashboard";
    fetch(url).then(r => r.json()).then(d => {
      setHealthStats(d.data || (d.ok ? d.data : d));
    }).catch(() => {});
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
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CRMProvider>
      <ModalProvider>
        <SidebarProvider>
          <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
      </ModalProvider>
    </CRMProvider>
  );
}
