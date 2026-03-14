"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/dashboard/header";
import { useCRM } from "@/lib/crm-store";
import {
  Users,
  CheckCircle2,
  Handshake,
  TrendingUp,
  Target,
  Upload,
  Search,
  Zap,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  totalContacts: number;
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  totalTasks: number;
  openTasks: number;
  recentContacts: { id: string; firstName: string; lastName: string; email: string; status: string; source: string | null; createdAt: string }[];
  statusBreakdown: { status: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  tenantName: string;
  tenantSlug: string;
}

function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500", lead: "bg-indigo-500", inactive: "bg-gray-400",
  lost: "bg-red-400", "at-risk": "bg-amber-500",
};

function StatCard({ label, value, sublabel, icon: Icon, color, href }: {
  label: string; value: string; sublabel: string; icon: React.ElementType; color: string; href?: string;
}) {
  const inner = (
    <div className={`bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100/50 transition ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1.5">{sublabel}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const { deals, tasks } = useCRM();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => { if (data.ok && data.data) setStats(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeDeals = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost");
  const wonDeals = deals.filter((d) => d.stage === "Closed Won");
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const upcomingTasks = [...tasks].filter((t) => t.status !== "done")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);

  if (loading) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {stats && (
          <div>
            <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-0.5">Here&apos;s what&apos;s happening with {stats.tenantName}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Contacts" value={stats ? formatNumber(stats.totalContacts) : "0"}
            sublabel={stats ? `${stats.totalContacts.toLocaleString()} in your CRM` : "Import from Stripe"}
            icon={Users} color="bg-indigo-500" href="/dashboard/contacts" />
          <StatCard label="Active Deals" value={String(activeDeals.length)}
            sublabel={pipelineValue > 0 ? `${formatCurrency(pipelineValue)} in pipeline` : "Create your first deal"}
            icon={Target} color="bg-blue-500" href="/dashboard/deals" />
          <StatCard label="Won Deals" value={String(wonDeals.length)}
            sublabel={wonValue > 0 ? `${formatCurrency(wonValue)} revenue` : "Close deals to track revenue"}
            icon={TrendingUp} color="bg-emerald-500" href="/dashboard/deals" />
          <StatCard label="Open Tasks" value={stats ? String(stats.openTasks) : String(upcomingTasks.length)}
            sublabel={stats && stats.openTasks > 0 ? `${stats.openTasks} need attention` : "All caught up"}
            icon={CheckCircle2} color="bg-violet-500" href="/dashboard/tasks" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {stats && stats.statusBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">Contact Breakdown</h2>
                  <span className="text-xs text-gray-400">{stats.totalContacts.toLocaleString()} total</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex mb-4">
                  {stats.statusBreakdown.sort((a, b) => b.count - a.count).map((s) => (
                    <div key={s.status} className={`h-full ${statusColors[s.status.toLowerCase()] || "bg-gray-400"}`}
                      style={{ width: `${(s.count / stats.totalContacts) * 100}%` }}
                      title={`${s.status}: ${s.count.toLocaleString()}`} />
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stats.statusBreakdown.sort((a, b) => b.count - a.count).map((s) => (
                    <div key={s.status} className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${statusColors[s.status.toLowerCase()] || "bg-gray-400"}`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.count.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 capitalize">{s.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats && stats.recentContacts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">Recently Added</h2>
                  <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-1">
                  {stats.recentContacts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-gray-600">{c.firstName?.[0] || "?"}{c.lastName?.[0] || ""}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          c.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          c.status === "lead" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                          "bg-gray-50 text-gray-500 border-gray-200"
                        }`}>{c.status}</span>
                        <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deals.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">Recent Deals</h2>
                  <Link href="/dashboard/deals" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-1">
                  {deals.slice(0, 5).map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                        <p className="text-xs text-gray-400">{deal.contactName} &middot; {deal.stage}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: "/dashboard/contacts", icon: Search, color: "bg-indigo-50 group-hover:bg-indigo-100", iconColor: "text-indigo-600", label: "Search Contacts", desc: "Find anyone in your CRM" },
                  { href: "/dashboard/deals", icon: Handshake, color: "bg-blue-50 group-hover:bg-blue-100", iconColor: "text-blue-600", label: "Create Deal", desc: "Add a deal to your pipeline" },
                  { href: "/dashboard/settings", icon: Zap, color: "bg-violet-50 group-hover:bg-violet-100", iconColor: "text-violet-600", label: "Integrations", desc: "Connect Stripe, Resend, Twilio" },
                  { href: "/dashboard/forms", icon: Upload, color: "bg-emerald-50 group-hover:bg-emerald-100", iconColor: "text-emerald-600", label: "Build a Form", desc: "Capture leads from your website" },
                ].map((a) => (
                  <Link key={a.href} href={a.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group">
                    <div className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center transition`}>
                      <a.icon className={`w-4 h-4 ${a.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.label}</p>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Upcoming Tasks</h2>
                <Link href="/dashboard/tasks" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
              </div>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          task.priority === "high" ? "bg-red-50 text-red-600" :
                          task.priority === "medium" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"
                        }`}>{task.priority}</span>
                        <span className="text-[10px] text-gray-400">Due {task.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No pending tasks</p>
                </div>
              )}
            </div>

            {stats && stats.sourceBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Data Sources</h2>
                <div className="space-y-2.5">
                  {stats.sourceBreakdown.map((s) => (
                    <div key={s.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="text-sm text-gray-700 capitalize">{s.source.replace(/_/g, " ")}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{s.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
