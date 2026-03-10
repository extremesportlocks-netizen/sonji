import Sidebar from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="ml-[260px] min-h-screen transition-all duration-200">
        {children}
      </main>
    </div>
  );
}
