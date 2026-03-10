"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  SlidersHorizontal,
  Share2,
  Download,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

// ────────────────────────────────────
// MOCK DATA
// ────────────────────────────────────

const stats = [
  { label: "Deals Won", value: "425", sublabel: "Closed successfully", color: "bg-indigo-500", trend: "up", trendValue: "18%" },
  { label: "Active Leads", value: "1,847", sublabel: "In progress", color: "bg-blue-500", trend: "up", trendValue: "12%" },
  { label: "Win Rate", value: "32.8%", sublabel: "Last period", color: "bg-amber-500", trend: "down", trendValue: "3%" },
  { label: "Total Revenue", value: "$350,000", sublabel: "From closed deals", color: "bg-emerald-500", trend: "up", trendValue: "24%" },
];

const revenueData = [
  { month: "Jan", revenue: 95000, target: 180000 },
  { month: "Feb", revenue: 120000, target: 180000 },
  { month: "Mar", revenue: 175000, target: 180000 },
  { month: "Apr", revenue: 210000, target: 180000 },
  { month: "May", revenue: 160000, target: 180000 },
  { month: "Jun", revenue: 195000, target: 180000 },
];

const activityData = [
  { name: "Calls", value: 1245, pct: "50%", color: "#6366f1" },
  { name: "Emails", value: 487, pct: "30%", color: "#3b82f6" },
  { name: "Meetings", value: 156, pct: "11%", color: "#f59e0b" },
  { name: "Tasks", value: 234, pct: "9%", color: "#10b981" },
];

const funnelData = [
  { stage: "Leads", desc: "Initial contacts from marketing campaigns", count: 850, pct: "100%", date: "January 2026", color: "bg-indigo-500" },
  { stage: "Qualified", desc: "Prospects meeting qualification criteria", count: 425, pct: "50%", date: "January 2026", color: "bg-blue-500" },
  { stage: "Proposal", desc: "Custom proposals sent to prospects", count: 212, pct: "25%", date: "January 2026", color: "bg-amber-500" },
  { stage: "Negotiation", desc: "Active deal negotiations in progress", count: 106, pct: "12.5%", date: "January 2026", color: "bg-violet-500" },
  { stage: "Won", desc: "Successfully closed deals", count: 53, pct: "6.2%", date: "January 2026", color: "bg-emerald-500" },
];

const teamData = [
  { name: "Orlando", role: "Founder", dealsWon: 24, revenue: "$185,000", avatar: "O", color: "from-indigo-400 to-indigo-600" },
  { name: "Sarah Chen", role: "Sales Lead", dealsWon: 18, revenue: "$92,000", avatar: "SC", color: "from-blue-400 to-blue-600" },
  { name: "Marcus Rivera", role: "Account Exec", dealsWon: 12, revenue: "$45,000", avatar: "MR", color: "from-emerald-400 to-emerald-600" },
  { name: "Emily Rodriguez", role: "SDR", dealsWon: 8, revenue: "$28,000", avatar: "ER", color: "from-violet-400 to-violet-600" },
];

// ────────────────────────────────────
// CUSTOM TOOLTIP
// ────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-4 py-3">
      <p className="text-xs font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill || p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-semibold text-gray-900">${(p.value / 1000).toFixed(0)}k</span>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────
// ANALYTICS PAGE
// ────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("This Month");
  const targetRevenue = 300000;
  const currentRevenue = 252900;
  const targetPct = ((currentRevenue / targetRevenue) * 100).toFixed(1);
  const remaining = targetRevenue - currentRevenue;

  return (
    <>
      <Header title="Analytics" />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition bg-white">
              <SlidersHorizontal className="w-4 h-4" /> Show Filters
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition bg-white">
              {period} <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100/50 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-10 rounded-full ${s.color}`} />
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  s.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                }`}>
                  {s.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {s.trendValue}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-4">{s.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Revenue Trend — 3/5 width */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Revenue Trend</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600"><ChevronDown className="w-4 h-4" /></button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  {/* Target line simulated as very thin bars */}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-500" /> Revenue</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-gray-300 rounded" /> Target: $180k</div>
            </div>
          </div>

          {/* Activity Breakdown — 2/5 width */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-6">Activity Breakdown</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {activityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <text x="50%" y="46%" textAnchor="middle" className="text-2xl font-bold" fill="#0f172a">
                    {activityData.reduce((s, d) => s + d.value, 0).toLocaleString()}
                  </text>
                  <text x="50%" y="58%" textAnchor="middle" className="text-xs" fill="#94a3b8">
                    Total Activities
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {activityData.map((a) => (
                <div key={a.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: a.color }} />
                    <span className="text-gray-600">{a.name}: {a.pct}</span>
                  </div>
                  <span className="font-medium text-gray-400">&middot; {a.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Funnel + Target + Team */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sales Funnel — 3/5 */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Last Month Sales Funnel</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600"><ChevronDown className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {funnelData.map((f) => (
                <div key={f.stage} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0`}>
                    <div className={`w-3 h-3 rounded-full ${f.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-gray-900">{f.stage}</p>
                      <span className="text-sm font-bold text-gray-900">{f.count}</span>
                    </div>
                    <p className="text-xs text-gray-400">{f.desc}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.date} &middot; {f.pct}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Target + Team — 2/5 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Revenue Target */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Revenue Target</h3>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-gray-900">{targetPct}%</p>
                <p className="text-sm text-gray-500 mt-1">${(remaining / 1000).toFixed(1)}K Left</p>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${targetPct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Revenue target</span>
                <span className="font-semibold text-gray-900">${(targetRevenue / 1000).toFixed(0)}K</span>
              </div>
            </div>

            {/* Team Performance */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Performance</h3>
              <div className="space-y-3">
                {teamData.map((t) => (
                  <div key={t.name} className="flex items-center gap-3 py-2">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xs font-semibold text-white">{t.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{t.revenue}</p>
                      <p className="text-xs text-gray-400">{t.dealsWon} Deals Won</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
