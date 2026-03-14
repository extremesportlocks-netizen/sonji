"use client";

import Sidebar from "@/components/dashboard/sidebar";
import { ModalProvider } from "@/components/modals/modal-provider";
import { CRMProvider } from "@/lib/crm-store";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className={`min-h-screen transition-all duration-200 ${collapsed ? "ml-[68px]" : "ml-[260px]"}`}>
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
