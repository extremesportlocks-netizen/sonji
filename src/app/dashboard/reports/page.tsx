"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Search,
  Plus,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  Star,
  Clock,
  ChevronRight,
  PieChart,
  Target,
  Handshake,
  Mail,
  X,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  lastRun: string;
  starred: boolean;
}

const mockReports: Report[] = [
  { id: "r1", name: "Pipeline Summary", description: "Overview of all deals by stage with values and conversion rates", category: "Sales", icon: BarChart3, iconBg: "bg-indigo-50", iconColor: "text-indigo-600", lastRun: "Today", starred: true },
  { id: "r2", name: "Revenue by Month", description: "Monthly revenue trends with year-over-year comparison", category: "Revenue", icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", lastRun: "Today", starred: true },
  { id: "r3", name: "Contact Growth", description: "New contacts added over time by source and channel", category: "Contacts", icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600", lastRun: "Yesterday", starred: false },
  { id: "r4", name: "Deal Velocity", description: "Average time deals spend in each pipeline stage", category: "Sales", icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600", lastRun: "3 days ago", starred: false },
  { id: "r5", name: "Win/Loss Analysis", description: "Breakdown of won vs lost deals by reason, owner, and value", category: "Sales", icon: Target, iconBg: "bg-rose-50", iconColor: "text-rose-500", lastRun: "1 week ago", starred: true },
  { id: "r6", name: "Team Performance", description: "Individual team member metrics: calls, emails, meetings, deals closed", category: "Team", icon: Users, iconBg: "bg-violet-50", iconColor: "text-violet-600", lastRun: "Today", starred: false },
  { id: "r7", name: "Email Campaign Results", description: "Open rates, click rates, and conversions across all campaigns", category: "Marketing", icon: Mail, iconBg: "bg-cyan-50", iconColor: "text-cyan-600", lastRun: "2 days ago", starred: false },
  { id: "r8", name: "Forecast Report", description: "Projected revenue based on current pipeline and historical close rates", category: "Revenue", icon: DollarSign, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", lastRun: "Yesterday", starred: false },
  { id: "r9", name: "Activity Summary", description: "Total activities logged by type across all team members", category: "Team", icon: PieChart, iconBg: "bg-orange-50", iconColor: "text-orange-600", lastRun: "Today", starred: false },
  { id: "r10", name: "Meeting Analytics", description: "Meeting frequency, duration, and outcomes by contact and company", category: "Sales", icon: Calendar, iconBg: "bg-teal-50", iconColor: "text-teal-600", lastRun: "Yesterday", starred: false },
];

// Featured report data
const pipelineData = [
  { stage: "Lead", count: 145, value: "$1,450,000", avgDays: 3, conversion: "100%" },
  { stage: "Qualified", count: 89, value: "$890,000", avgDays: 7, conversion: "61.4%" },
  { stage: "Meeting Booked", count: 52, value: "$624,000", avgDays: 5, conversion: "58.4%" },
  { stage: "Proposal Sent", count: 31, value: "$496,000", avgDays: 12, conversion: "59.6%" },
  { stage: "Negotiation", count: 18, value: "$342,000", avgDays: 8, conversion: "58.1%" },
  { stage: "Closed Won", count: 12, value: "$228,000", avgDays: 4, conversion: "66.7%" },
  { stage: "Closed Lost", count: 6, value: "$114,000", avgDays: 2, conversion: "33.3%" },
];

const stageColors: Record<string, string> = {
  "Lead": "bg-indigo-500",
  "Qualified": "bg-blue-500",
  "Meeting Booked": "bg-amber-500",
  "Proposal Sent": "bg-violet-500",
  "Negotiation": "bg-orange-500",
  "Closed Won": "bg-emerald-500",
  "Closed Lost": "bg-red-500",
};

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeReport, setActiveReport] = useState<string | null>("r1");
  const categories = ["All", "Sales", "Revenue", "Contacts", "Marketing", "Team"];

  const filtered = mockReports.filter((r) => {
    const matchSearch = search === "" || `${r.name} ${r.description}`.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || r.category === category;
    return matchSearch && matchCategory;
  });

  const starred = filtered.filter((r) => r.starred);
  const other = filtered.filter((r) => !r.starred);

  return (
    <>
      <Header title="Reports" subtitle={`${mockReports.length} reports available`} />

      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* ═══ LEFT: Report Library ═══ */}
          <div className="col-span-4">
            {/* Search + Filters */}
            <div className="mb-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
                {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {categories.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${category === c ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100 bg-white border border-gray-200"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Starred */}
            {starred.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Starred</p>
                <div className="space-y-1.5">
                  {starred.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button key={r.id} onClick={() => setActiveReport(r.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition ${
                          activeReport === r.id ? "bg-indigo-50 border border-indigo-200" : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        }`}>
                        <div className={`w-9 h-9 rounded-lg ${r.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${r.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${activeReport === r.id ? "text-indigo-700" : "text-gray-900"}`}>{r.name}</p>
                          <p className="text-xs text-gray-400 truncate">{r.description}</p>
                        </div>
                        <Star className={`w-3.5 h-3.5 flex-shrink-0 ${activeReport === r.id ? "text-indigo-400" : "text-amber-400"} fill-current`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Reports */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">All Reports</p>
              <div className="space-y-1.5">
                {other.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button key={r.id} onClick={() => setActiveReport(r.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition ${
                        activeReport === r.id ? "bg-indigo-50 border border-indigo-200" : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                      }`}>
                      <div className={`w-9 h-9 rounded-lg ${r.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${r.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${activeReport === r.id ? "text-indigo-700" : "text-gray-900"}`}>{r.name}</p>
                        <p className="text-xs text-gray-400 truncate">{r.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition border border-indigo-100">
              <Plus className="w-4 h-4" /> Create Custom Report
            </button>
          </div>

          {/* ═══ RIGHT: Report Detail ═══ */}
          <div className="col-span-8">
            {activeReport === "r1" && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Report Header */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Pipeline Summary</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Last updated: Today at 2:30 PM &middot; Auto-refreshes hourly</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <Download className="w-4 h-4" /> Export
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <Calendar className="w-4 h-4" /> This Month
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Deals</p>
                    <p className="text-2xl font-bold text-gray-900">353</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600"><ArrowUpRight className="w-3 h-3" /> 12% vs last month</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">Pipeline Value</p>
                    <p className="text-2xl font-bold text-gray-900">$4.1M</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600"><ArrowUpRight className="w-3 h-3" /> 8% vs last month</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-gray-900">$19K</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-500"><ArrowDownRight className="w-3 h-3" /> 3% vs last month</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">66.7%</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600"><ArrowUpRight className="w-3 h-3" /> 5% vs last month</div>
                  </div>
                </div>

                {/* Pipeline Table */}
                <div className="px-6 py-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Breakdown by Stage</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 pr-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</span></th>
                        <th className="text-right py-3 px-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deals</span></th>
                        <th className="text-right py-3 px-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</span></th>
                        <th className="text-right py-3 px-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Days</span></th>
                        <th className="text-right py-3 px-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversion</span></th>
                        <th className="py-3 pl-4 w-32"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Distribution</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pipelineData.map((row) => (
                        <tr key={row.stage} className="hover:bg-gray-50/50 transition">
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${stageColors[row.stage]}`} />
                              <span className="text-sm font-medium text-gray-900">{row.stage}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-3"><span className="text-sm font-semibold text-gray-900">{row.count}</span></td>
                          <td className="text-right py-3 px-3"><span className="text-sm text-gray-700">{row.value}</span></td>
                          <td className="text-right py-3 px-3"><span className="text-sm text-gray-500">{row.avgDays}d</span></td>
                          <td className="text-right py-3 px-3"><span className="text-sm text-gray-500">{row.conversion}</span></td>
                          <td className="py-3 pl-4">
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${stageColors[row.stage]}`}
                                style={{ width: `${(row.count / 145) * 100}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeReport && activeReport !== "r1" && (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {mockReports.find((r) => r.id === activeReport)?.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                  {mockReports.find((r) => r.id === activeReport)?.description}
                </p>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                  <BarChart3 className="w-4 h-4" /> Generate Report
                </button>
              </div>
            )}

            {!activeReport && (
              <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">Select a report to view</h3>
                <p className="text-sm text-gray-400 mt-1">Choose from the report library on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
