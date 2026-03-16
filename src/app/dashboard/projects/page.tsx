"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/dashboard/header";
import Link from "next/link";
import { useModal } from "@/components/modals/modal-provider";
import { useIndustry } from "@/lib/use-industry";
import {
  Plus, MoreHorizontal, Search, X, Columns3, List, LayoutGrid,
  Clock, DollarSign, Users, Calendar, TrendingUp, AlertTriangle,
  CheckCircle, Pause, ChevronRight, ArrowUpRight, Briefcase,
  Timer, PieChart, Target,
} from "lucide-react";

// ─── TYPES ───

interface Project {
  id: string;
  name: string;
  client: string;
  status: "planning" | "active" | "on_hold" | "completed" | "canceled";
  priority: "high" | "medium" | "low";
  budgetAmount: number;
  budgetType: "fixed" | "hourly" | "retainer";
  hourlyRate: number;
  retainerHours: number;
  hoursLogged: number;
  hoursEstimated: number;
  costIncurred: number;
  revenue: number;
  margin: number;
  startDate: string;
  dueDate: string;
  manager: string;
  teamSize: number;
  tasksTotal: number;
  tasksDone: number;
  tags: string[];
}

// ─── DEMO DATA ───

const DEMO_PROJECTS: Record<string, Project[]> = {
  agency_consulting: [
    { id: "p1", name: "Website Redesign", client: "Meridian Law Group", status: "active", priority: "high", budgetAmount: 15000, budgetType: "fixed", hourlyRate: 150, retainerHours: 0, hoursLogged: 62, hoursEstimated: 100, costIncurred: 4340, revenue: 15000, margin: 71.1, startDate: "2026-02-15", dueDate: "2026-04-01", manager: "Colton", teamSize: 3, tasksTotal: 24, tasksDone: 15, tags: ["Web Design", "Priority"] },
    { id: "p2", name: "SEO + PPC Management", client: "Brightview Hotels", status: "active", priority: "high", budgetAmount: 8500, budgetType: "retainer", hourlyRate: 125, retainerHours: 68, hoursLogged: 52, hoursEstimated: 68, costIncurred: 3640, revenue: 8500, margin: 57.2, startDate: "2026-01-01", dueDate: "2026-12-31", manager: "Rocco", teamSize: 2, tasksTotal: 18, tasksDone: 12, tags: ["SEO", "PPC", "Retainer"] },
    { id: "p3", name: "Brand Identity Refresh", client: "Summit Athletics", status: "active", priority: "medium", budgetAmount: 12000, budgetType: "fixed", hourlyRate: 140, retainerHours: 0, hoursLogged: 28, hoursEstimated: 80, costIncurred: 1960, revenue: 12000, margin: 83.7, startDate: "2026-03-01", dueDate: "2026-05-15", manager: "Colton", teamSize: 2, tasksTotal: 16, tasksDone: 5, tags: ["Branding", "Design"] },
    { id: "p4", name: "Social Media Management", client: "Apex Construction", status: "planning", priority: "medium", budgetAmount: 3000, budgetType: "retainer", hourlyRate: 100, retainerHours: 30, hoursLogged: 0, hoursEstimated: 30, costIncurred: 0, revenue: 3000, margin: 100, startDate: "2026-04-01", dueDate: "2026-06-30", manager: "Rocco", teamSize: 1, tasksTotal: 8, tasksDone: 0, tags: ["Social Media"] },
    { id: "p5", name: "Content Strategy", client: "Harbor Dental", status: "active", priority: "low", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 120, retainerHours: 0, hoursLogged: 18, hoursEstimated: 40, costIncurred: 1260, revenue: 5000, margin: 74.8, startDate: "2026-02-20", dueDate: "2026-04-15", manager: "Colton", teamSize: 2, tasksTotal: 12, tasksDone: 6, tags: ["Content", "Strategy"] },
    { id: "p6", name: "Full Stack Marketing", client: "Sterling Partners", status: "active", priority: "high", budgetAmount: 10000, budgetType: "retainer", hourlyRate: 150, retainerHours: 67, hoursLogged: 58, hoursEstimated: 67, costIncurred: 4060, revenue: 10000, margin: 59.4, startDate: "2026-01-15", dueDate: "2026-12-31", manager: "Rocco", teamSize: 3, tasksTotal: 22, tasksDone: 18, tags: ["Full Stack", "Priority", "Retainer"] },
    { id: "p7", name: "PPC Management", client: "Coastal Real Estate", status: "on_hold", priority: "medium", budgetAmount: 6000, budgetType: "retainer", hourlyRate: 110, retainerHours: 55, hoursLogged: 42, hoursEstimated: 55, costIncurred: 2940, revenue: 6000, margin: 51.0, startDate: "2026-01-01", dueDate: "2026-12-31", manager: "Rocco", teamSize: 1, tasksTotal: 14, tasksDone: 10, tags: ["PPC", "On Hold"] },
    { id: "p8", name: "Email Automation Setup", client: "Nova Fitness", status: "completed", priority: "medium", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 130, retainerHours: 0, hoursLogged: 35, hoursEstimated: 38, costIncurred: 2450, revenue: 5000, margin: 51.0, startDate: "2026-01-20", dueDate: "2026-03-01", manager: "Colton", teamSize: 2, tasksTotal: 10, tasksDone: 10, tags: ["Email", "Automation", "Completed"] },
  ],
};

// Fallback for non-agency industries
const DEFAULT_PROJECTS: Project[] = [
  { id: "p1", name: "Sample Project", client: "Demo Client", status: "active", priority: "medium", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 100, retainerHours: 0, hoursLogged: 20, hoursEstimated: 50, costIncurred: 1400, revenue: 5000, margin: 72.0, startDate: "2026-03-01", dueDate: "2026-04-30", manager: "Team Lead", teamSize: 2, tasksTotal: 10, tasksDone: 4, tags: ["Demo"] },
];

// ─── HELPERS ───

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`; }

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  planning: { label: "Planning", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Target },
  active: { label: "Active", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: TrendingUp },
  on_hold: { label: "On Hold", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Pause },
  completed: { label: "Completed", color: "text-violet-600", bg: "bg-violet-50 border-violet-200", icon: CheckCircle },
  canceled: { label: "Canceled", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: X },
};

const priorityStyles: Record<string, string> = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-gray-100 text-gray-500 border-gray-200",
};

// ─── MAIN COMPONENT ───

export default function ProjectsPage() {
  const ic = useIndustry();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load projects
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = demoIndustry || "agency_consulting";
    setProjects(DEMO_PROJECTS[key] || DEFAULT_PROJECTS);
  }, []);

  const filtered = projects.filter(p => {
    if (search) { const q = search.toLowerCase(); if (!p.name.toLowerCase().includes(q) && !p.client.toLowerCase().includes(q)) return false; }
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  // Summary stats
  const activeProjects = projects.filter(p => p.status === "active").length;
  const totalRevenue = projects.filter(p => p.status !== "canceled").reduce((s, p) => s + p.revenue, 0);
  const totalHours = projects.reduce((s, p) => s + p.hoursLogged, 0);
  const avgMargin = projects.filter(p => p.hoursLogged > 0).reduce((s, p, _, arr) => s + p.margin / arr.length, 0);
  const totalBudget = projects.filter(p => p.status !== "canceled").reduce((s, p) => s + p.budgetAmount, 0);
  const totalCost = projects.reduce((s, p) => s + p.costIncurred, 0);

  return (
    <>
      <Header title="Projects" />
      <div className="p-6 space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Projects", value: String(activeProjects), icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total Revenue", value: fmt(totalRevenue), icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Hours Logged", value: `${totalHours.toFixed(0)}h`, icon: Timer, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Avg Margin", value: `${avgMargin.toFixed(1)}%`, icon: PieChart, color: "text-amber-600", bg: "bg-amber-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              {[{ key: "all", label: "All" }, { key: "active", label: "Active" }, { key: "planning", label: "Planning" }, { key: "on_hold", label: "On Hold" }, { key: "completed", label: "Completed" }].map(f => (
                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${statusFilter === f.key ? "bg-indigo-50 text-indigo-600 border border-indigo-200" : "text-gray-500 hover:bg-gray-50"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView("grid")} className={`p-2 transition ${view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setView("list")} className={`p-2 transition border-l border-gray-200 ${view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}><List className="w-4 h-4" /></button>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const sc = statusConfig[p.status];
              const Icon = sc.icon;
              const budgetPct = p.budgetType === "hourly" || p.budgetType === "retainer"
                ? (p.hoursLogged / (p.hoursEstimated || 1)) * 100
                : (p.costIncurred / (p.budgetAmount || 1)) * 100;
              const taskPct = p.tasksTotal > 0 ? (p.tasksDone / p.tasksTotal) * 100 : 0;
              const isOverBudget = budgetPct > 90;
              const marginColor = p.margin >= 60 ? "text-emerald-600" : p.margin >= 40 ? "text-amber-600" : "text-red-600";

              return (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition truncate">{p.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{p.client}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                      <Icon className="w-3 h-3" /> {sc.label}
                    </span>
                  </div>

                  {/* Budget + Hours */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Budget</p>
                      <p className="text-sm font-bold text-gray-900">{fmt(p.budgetAmount)}</p>
                      <p className="text-[10px] text-gray-400">{p.budgetType === "retainer" ? `${p.retainerHours}h/mo` : p.budgetType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Margin</p>
                      <p className={`text-sm font-bold ${marginColor}`}>{p.margin.toFixed(1)}%</p>
                      <p className="text-[10px] text-gray-400">{fmt(p.revenue - p.costIncurred)} profit</p>
                    </div>
                  </div>

                  {/* Hours Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400">{p.hoursLogged}h / {p.hoursEstimated}h</span>
                      {isOverBudget && <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> Over budget</span>}
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${budgetPct > 90 ? "bg-red-400" : budgetPct > 70 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                    </div>
                  </div>

                  {/* Tasks Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400">{p.tasksDone}/{p.tasksTotal} tasks</span>
                      <span className="text-[10px] text-gray-400 font-medium">{taskPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${taskPct}%` }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{p.teamSize} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">Due {p.dueDate}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-gray-400">No projects match your filters</div>
            )}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Budget</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Hours</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Margin</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tasks</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const sc = statusConfig[p.status];
                  const marginColor = p.margin >= 60 ? "text-emerald-600" : p.margin >= 40 ? "text-amber-600" : "text-red-600";
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => window.location.href = `/dashboard/projects/${p.id}`}>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{p.name}</span>
                        <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityStyles[p.priority]}`}>{p.priority}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-gray-600">{p.client}</span></td>
                      <td className="px-4 py-3"><span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-sm font-bold text-gray-900">{fmt(p.budgetAmount)}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-sm text-gray-600">{p.hoursLogged}h / {p.hoursEstimated}h</span></td>
                      <td className="px-4 py-3 text-right"><span className={`text-sm font-bold ${marginColor}`}>{p.margin.toFixed(1)}%</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-sm text-gray-600">{p.tasksDone}/{p.tasksTotal}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-xs text-gray-400">{p.dueDate}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Resource Loading Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Resource Loading</h2>
          <div className="space-y-3">
            {(() => {
              const managers = Array.from(new Set(projects.map(p => p.manager).filter(Boolean)));
              return managers.map(m => {
                const mProjects = projects.filter(p => p.manager === m && p.status === "active");
                const mHours = mProjects.reduce((s, p) => s + p.hoursLogged, 0);
                const mCapacity = mProjects.length * 40; // Rough: 40 hrs/week capacity
                const utilization = mCapacity > 0 ? (mHours / mCapacity) * 100 : 0;
                return (
                  <div key={m} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-indigo-700">{m[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{m}</span>
                        <span className="text-xs text-gray-400">{mProjects.length} active projects · {mHours}h logged</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${utilization > 85 ? "bg-red-400" : utilization > 60 ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${Math.min(utilization, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">{fmt(totalRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">Across {projects.filter(p => p.status !== "canceled").length} projects</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Cost</h3>
            <p className="text-2xl font-bold text-gray-900">{fmt(totalCost)}</p>
            <p className="text-xs text-gray-400 mt-1">{totalHours.toFixed(0)} hours × blended rate</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Net Profit</h3>
            <p className={`text-2xl font-bold ${totalRevenue - totalCost > 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(totalRevenue - totalCost)}</p>
            <p className="text-xs text-gray-400 mt-1">{((1 - totalCost / totalRevenue) * 100).toFixed(1)}% overall margin</p>
          </div>
        </div>
      </div>
    </>
  );
}
