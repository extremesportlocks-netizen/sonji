"use client";

import Sidebar from "@/components/dashboard/sidebar";
import { ModalProvider } from "@/components/modals/modal-provider";
import { CRMProvider } from "@/lib/crm-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CRMProvider>
      <ModalProvider>
        <div className="min-h-screen bg-gray-50/50">
          <Sidebar />
          <main className="ml-[260px] min-h-screen transition-all duration-200">
            {children}
          </main>
        </div>
      </ModalProvider>
    </CRMProvider>
  );
}
