"use client";

import Header from "@/components/dashboard/header";
import OnboardingChecklist from "@/components/dashboard/onboarding-checklist";
import ProductTour, { useTour } from "@/components/dashboard/product-tour";
import { useCRM } from "@/lib/crm-store";
import {
  Users,
  Phone,
  Mail,
  StickyNote,
  UserCheck,
  ArrowUpRight,
  CheckCircle2,
  Handshake,
  Target,
  TrendingUp,
  DollarSign,
  CalendarClock,
  PlusCircle,
  ArrowRightCircle,
} from "lucide-react";

function StatCard({ label, value, sublabel, color, trendValue }: {
  label: string; value: string; sublabel: string; color: string; trendValue?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100/50 transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-10 rounded-full ${color}`} />
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        </div>
        {trendValue && (
          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
            <ArrowUpRight className="w-3 h-3" />
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2 ml-4">{sublabel}</p>
    </div>
  );
}

const activityIcons: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  contact_created: { icon: PlusCircle, bg: "bg-blue-50", color: "text-blue-600" },
  deal_created: { icon: Handshake, bg: "bg-violet-50", color: "text-violet-600" },
  task_created: { icon: CheckCircle2, bg: "bg-amber-50", color: "text-amber-600" },
  meeting_scheduled: { icon: CalendarClock, bg: "bg-emerald-50", color: "text-emerald-600" },
  email_sent: { icon: Mail, bg: "bg-cyan-50", color: "text-cyan-600" },
  import_completed: { icon: Users, bg: "bg-indigo-50", color: "text-indigo-600" },
  deal_moved: { icon: ArrowRightCircle, bg: "bg-orange-50", color: "text-orange-600" },
  deal_won: { icon: TrendingUp, bg: "bg-emerald-50", color: "text-emerald-600" },
};

const stageStatusMap: Record<string, { label: string; color: string }> = {
  "Lead": { label: "Lead", color: "bg-indigo-50 text-indigo-700" },
  "Sales Qualified": { label: "Qualified", color: "bg-blue-50 text-blue-700" },
  "Meeting Booked": { label: "Meeting", color: "bg-amber-50 text-amber-700" },
  "Proposal Sent": { label: "Proposal", color: "bg-violet-50 text-violet-700" },
  "Negotiation": { label: "Negotiation", color: "bg-orange-50 text-orange-700" },
  "Closed Won": { label: "Won", color: "bg-emerald-50 text-emerald-700" },
  "Closed Lost": { label: "Lost", color: "bg-red-50 text-red-600" },
};

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
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { showTour, completeTour, dismissTour } = useTour();
  const { contacts, deals, tasks, meetings, activities, stats, updateTask } = useCRM();

  const activeDeals = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost");
  const wonDeals = deals.filter((d) => d.stage === "Closed Won");

  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const recentActivity = activities.slice(0, 6);

  const statCards = [
    { label: "Total Contacts", value: String(stats.totalContacts), sublabel: "In your CRM", color: "bg-indigo-500" },
    { label: "Active Deals", value: String(activeDeals.length), sublabel: `${formatCurrency(stats.pipelineValue)} in pipeline`, color: "bg-blue-500" },
    { label: "Won Deals", value: String(wonDeals.length), sublabel: "Closed successfully", color: "bg-emerald-500" },
    { label: "Total Revenue", value: formatCurrency(stats.wonValue), sublabel: "From closed deals", color: "bg-violet-500" },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        <OnboardingChecklist />
        {showTour && <ProductTour onComplete={completeTour} onDismiss={dismissTour} />}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Two-column: Deals + Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Deals */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Recent Deals</h2>
              <span className="text-xs text-gray-400">{String(recentDeals.length).padStart(2, "0")} Deals</span>
            </div>
            <div className="space-y-1">
              {recentDeals.map((deal) => {
                const stageInfo = stageStatusMap[deal.stage] || { label: deal.stage, color: "bg-gray-50 text-gray-600" };
                return (
                  <div key={deal.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageInfo.color}`}>{stageInfo.label}</span>
                        <span className="text-xs text-gray-400">{deal.contactName}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                  </div>
                );
              })}
              {recentDeals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Handshake className="w-8 h-8 mb-2 text-gray-300" />
                  <p className="text-sm">No deals yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Upcoming Tasks</h2>
              <span className="text-xs text-gray-400">{stats.tasksOverdue > 0 ? `${stats.tasksOverdue} overdue` : `${upcomingTasks.length} pending`}</span>
            </div>
            <div className="space-y-4">
              {upcomingTasks.map((task) => {
                const initials = task.contactName ? task.contactName.split(" ").map((n: string) => n[0]).join("") : task.assignedTo.slice(0, 2).toUpperCase();
                const isOverdue = task.dueDate < new Date().toISOString().split("T")[0];
                return (
                  <div key={task.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 hover:shadow-sm transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-indigo-700">{initials}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{task.contactName || task.assignedTo}</span>
                        <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                          {isOverdue ? "Overdue" : `Due ${task.dueDate}`}
                        </span>
                      </div>
                      <button
                        onClick={() => updateTask(task.id, { status: "done" })}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full transition"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Resolve
                      </button>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">{task.title}</p>
                    {task.description && <p className="text-xs text-gray-400 leading-relaxed">{task.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        task.priority === "high" ? "bg-red-50 text-red-600" :
                        task.priority === "medium" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"
                      }`}>{task.priority}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        task.status === "in_progress" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                      }`}>{task.status === "in_progress" ? "In Progress" : "To Do"}</span>
                    </div>
                  </div>
                );
              })}
              {upcomingTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mb-2 text-gray-300" />
                  <p className="text-sm">All tasks complete</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
            <span className="text-xs text-gray-400">{recentActivity.length} Recent</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((activity) => {
              const config = activityIcons[activity.type] || activityIcons.contact_created;
              const Icon = config.icon;
              return (
                <div key={activity.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                    {activity.contactName && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-gray-500">{activity.contactName.split(" ").map((n: string) => n[0]).join("")}</span>
                        </div>
                        <span className="text-xs text-gray-500">{activity.contactName}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{timeAgo(activity.timestamp)}</span>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <StickyNote className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm">No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
