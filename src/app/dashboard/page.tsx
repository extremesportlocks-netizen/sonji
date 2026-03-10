"use client";

import Header from "@/components/dashboard/header";
import {
  Users,
  Phone,
  Mail,
  StickyNote,
  UserCheck,
  ArrowUpRight,
  CheckCircle2,
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
  call: { icon: Phone, bg: "bg-blue-50", color: "text-blue-600" },
  meeting: { icon: Users, bg: "bg-violet-50", color: "text-violet-600" },
  note: { icon: StickyNote, bg: "bg-amber-50", color: "text-amber-600" },
  followup: { icon: UserCheck, bg: "bg-rose-50", color: "text-rose-500" },
  email: { icon: Mail, bg: "bg-emerald-50", color: "text-emerald-600" },
};

const stats = [
  { label: "Total Leads", value: "377", sublabel: "Potential customers", color: "bg-indigo-500", trendValue: "12%" },
  { label: "Active Deals", value: "467", sublabel: "In progress", color: "bg-blue-500", trendValue: "8%" },
  { label: "Won Deals", value: "122", sublabel: "Closed successfully", color: "bg-emerald-500", trendValue: "24%" },
  { label: "Total Revenue", value: "$350K", sublabel: "From closed deals", color: "bg-violet-500", trendValue: "18%" },
];

const recentDeals = [
  { name: "Security Audit & Implementation", status: "New", statusColor: "bg-blue-50 text-blue-700", date: "Feb 15", value: "$35k" },
  { name: "Training & Support Contract", status: "New", statusColor: "bg-blue-50 text-blue-700", date: "Feb 15", value: "$28k" },
  { name: "Cloud Infrastructure Setup", status: "Contacted", statusColor: "bg-amber-50 text-amber-700", date: "Feb 15", value: "$85k" },
  { name: "Annual Software License", status: "Proposal Sent", statusColor: "bg-violet-50 text-violet-700", date: "Feb 15", value: "$45k" },
];

const upcomingTasks = [
  { contact: "Mason Thompson", dueDate: "Due Mon, Jan 5", task: "Follow up with Mason Thompson", desc: "Send a follow-up email to discuss the next steps for the Enterprise Platform Migration deal.", avatar: "MT" },
  { contact: "Emily Rodriguez", dueDate: "Due Mon, Jan 5", task: "Schedule meeting with Emily Rodriguez", desc: "Send a follow-up email to discuss the next steps for the Enterprise Platform Migration deal.", avatar: "ER" },
];

const recentActivity = [
  { type: "call", title: "Call", desc: "Discussed pricing and timeline for custom integration project", contact: "Mason Thompson", company: "Vertex Partners", time: "Dec 31, 2025 at 14:30" },
  { type: "meeting", title: "Meeting", desc: "Met with Annual Software License", contact: "Logan Mitchell", company: "DataFlow Solutions", time: "Dec 31, 2025 at 14:30" },
  { type: "note", title: "Note", desc: "Note about Enterprise Platform Migration", contact: "Lucas Anderson", company: "TechVentures Inc", time: "Dec 31, 2025 at 14:30" },
  { type: "followup", title: "Follow-up", desc: "Follow-up with Consulting Services Package", contact: "Aiden Parker", company: "Bright Dynamics", time: "Dec 31, 2025 at 14:30" },
  { type: "email", title: "Email", desc: "Sent proposal for Q2 infrastructure overhaul", contact: "Sarah Chen", company: "NexGen Labs", time: "Dec 30, 2025 at 09:15" },
];

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Two-column: Deals + Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recently Updated Deals */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Recently Updated Deals</h2>
              <span className="text-xs text-gray-400">{String(recentDeals.length).padStart(2, "0")} Deals</span>
            </div>
            <div className="space-y-1">
              {recentDeals.map((deal) => (
                <div key={deal.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{deal.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${deal.statusColor}`}>{deal.status}</span>
                      <span className="text-xs text-gray-400">{deal.date}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{deal.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming This Week */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Upcoming This Week</h2>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.contact} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-xs font-semibold text-indigo-700">{task.avatar}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{task.contact}</span>
                      <span className="text-xs text-gray-400">{task.dueDate}</span>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full transition">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolve
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{task.task}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{task.desc}</p>
                </div>
              ))}
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
            {recentActivity.map((activity, i) => {
              const config = activityIcons[activity.type] || activityIcons.note;
              const Icon = config.icon;
              return (
                <div key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{activity.desc}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-gray-500">{activity.contact.split(" ").map(n => n[0]).join("")}</span>
                      </div>
                      <span className="text-xs text-gray-500">{activity.contact}</span>
                      <span className="text-xs text-gray-300">&middot;</span>
                      <span className="text-xs text-gray-400">{activity.company}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
