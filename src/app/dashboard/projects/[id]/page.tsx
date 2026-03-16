"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import {
  ArrowLeft, Clock, DollarSign, Users, Calendar, TrendingUp, AlertTriangle,
  CheckCircle, Pause, Target, Plus, Play, Square, ChevronRight, MoreHorizontal,
  Timer, PieChart, Briefcase, FileText, MessageSquare, Loader2,
} from "lucide-react";

// ─── TYPES ───

interface TimeEntry {
  id: string;
  user: string;
  task: string;
  hours: number;
  date: string;
  description: string;
  billable: boolean;
}

interface ProjectTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  assignee: string;
  hoursEstimated: number;
  hoursLogged: number;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

interface ProjectDetail {
  id: string;
  name: string;
  client: string;
  status: string;
  budgetAmount: number;
  budgetType: string;
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
  description: string;
  tasks: ProjectTask[];
  timeEntries: TimeEntry[];
  team: { name: string; role: string; hours: number; allocation: number }[];
}

// ─── DEMO DATA ───

const DEMO_PROJECTS: Record<string, ProjectDetail> = {
  p1: {
    id: "p1", name: "Website Redesign", client: "Meridian Law Group", status: "active",
    budgetAmount: 15000, budgetType: "fixed", hourlyRate: 150, retainerHours: 0,
    hoursLogged: 62, hoursEstimated: 100, costIncurred: 4340, revenue: 15000, margin: 71.1,
    startDate: "2026-02-15", dueDate: "2026-04-01", manager: "Colton",
    description: "Full website redesign including brand refresh, UX audit, new information architecture, responsive design, and SEO migration. Deliverables: wireframes, mockups, development, QA, launch.",
    tasks: [
      { id: "t1", title: "UX Audit & Wireframes", status: "done", assignee: "Colton", hoursEstimated: 12, hoursLogged: 10, dueDate: "2026-02-25", priority: "high" },
      { id: "t2", title: "Homepage Mockup", status: "done", assignee: "Sarah", hoursEstimated: 8, hoursLogged: 9, dueDate: "2026-03-01", priority: "high" },
      { id: "t3", title: "Inner Page Templates (6)", status: "done", assignee: "Sarah", hoursEstimated: 16, hoursLogged: 14, dueDate: "2026-03-08", priority: "medium" },
      { id: "t4", title: "Frontend Development", status: "in_progress", assignee: "Mike", hoursEstimated: 24, hoursLogged: 18, dueDate: "2026-03-20", priority: "high" },
      { id: "t5", title: "CMS Integration", status: "in_progress", assignee: "Mike", hoursEstimated: 8, hoursLogged: 5, dueDate: "2026-03-22", priority: "medium" },
      { id: "t6", title: "SEO Migration Plan", status: "in_progress", assignee: "Rocco", hoursEstimated: 6, hoursLogged: 4, dueDate: "2026-03-18", priority: "high" },
      { id: "t7", title: "Content Migration", status: "todo", assignee: "Sarah", hoursEstimated: 10, hoursLogged: 0, dueDate: "2026-03-25", priority: "medium" },
      { id: "t8", title: "QA & Browser Testing", status: "todo", assignee: "Mike", hoursEstimated: 6, hoursLogged: 0, dueDate: "2026-03-28", priority: "medium" },
      { id: "t9", title: "Client Review & Revisions", status: "todo", assignee: "Colton", hoursEstimated: 6, hoursLogged: 2, dueDate: "2026-03-30", priority: "low" },
      { id: "t10", title: "Launch & DNS Cutover", status: "todo", assignee: "Mike", hoursEstimated: 4, hoursLogged: 0, dueDate: "2026-04-01", priority: "high" },
    ],
    timeEntries: [
      { id: "te1", user: "Colton", task: "UX Audit & Wireframes", hours: 3.5, date: "2026-03-14", description: "Completed sitemap revisions and navigation wireframes", billable: true },
      { id: "te2", user: "Mike", task: "Frontend Development", hours: 6, date: "2026-03-14", description: "Built responsive header, hero section, and footer components", billable: true },
      { id: "te3", user: "Rocco", task: "SEO Migration Plan", hours: 2, date: "2026-03-14", description: "Mapped current URL structure → new URL redirects", billable: true },
      { id: "te4", user: "Sarah", task: "Inner Page Templates (6)", hours: 4, date: "2026-03-13", description: "Finalized practice area and attorney bio templates", billable: true },
      { id: "te5", user: "Mike", task: "Frontend Development", hours: 5.5, date: "2026-03-13", description: "Implemented practice area grid and contact form", billable: true },
      { id: "te6", user: "Colton", task: "Client Review & Revisions", hours: 1.5, date: "2026-03-12", description: "Review call with Meridian team — minor color adjustments", billable: true },
    ],
    team: [
      { name: "Colton", role: "Project Manager", hours: 15.5, allocation: 30 },
      { name: "Sarah", role: "Designer", hours: 23, allocation: 50 },
      { name: "Mike", role: "Developer", hours: 23.5, allocation: 60 },
    ],
  },
};

// ─── HELPERS ───

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`; }

const statusStyles: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-50 text-blue-600",
  done: "bg-emerald-50 text-emerald-600",
};

const priorityStyles: Record<string, string> = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-gray-100 text-gray-500 border-gray-200",
};

// ─── DYNAMIC DETAIL GENERATOR ───
// For projects without handcrafted detail data, generate plausible detail from summary info

const PROJECT_SUMMARIES: Record<string, Record<string, { name: string; client: string; budgetAmount: number; budgetType: string; hourlyRate: number; hoursLogged: number; hoursEstimated: number; costIncurred: number; revenue: number; margin: number; startDate: string; dueDate: string; manager: string; tasksTotal: number; tasksDone: number }>> = {
  agency_consulting: {
    p2: { name: "SEO + PPC Management", client: "Brightview Hotels", budgetAmount: 8500, budgetType: "retainer", hourlyRate: 125, hoursLogged: 52, hoursEstimated: 68, costIncurred: 3640, revenue: 8500, margin: 57.2, startDate: "2026-01-01", dueDate: "2026-12-31", manager: "Rocco", tasksTotal: 18, tasksDone: 12 },
    p3: { name: "Brand Identity Refresh", client: "Summit Athletics", budgetAmount: 12000, budgetType: "fixed", hourlyRate: 140, hoursLogged: 28, hoursEstimated: 80, costIncurred: 1960, revenue: 12000, margin: 83.7, startDate: "2026-03-01", dueDate: "2026-05-15", manager: "Colton", tasksTotal: 16, tasksDone: 5 },
    p4: { name: "Social Media Management", client: "Apex Construction", budgetAmount: 3000, budgetType: "retainer", hourlyRate: 100, hoursLogged: 0, hoursEstimated: 30, costIncurred: 0, revenue: 3000, margin: 100, startDate: "2026-04-01", dueDate: "2026-06-30", manager: "Rocco", tasksTotal: 8, tasksDone: 0 },
    p5: { name: "Content Strategy", client: "Harbor Dental", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 120, hoursLogged: 18, hoursEstimated: 40, costIncurred: 1260, revenue: 5000, margin: 74.8, startDate: "2026-02-20", dueDate: "2026-04-15", manager: "Colton", tasksTotal: 12, tasksDone: 6 },
    p6: { name: "Full Stack Marketing", client: "Sterling Partners", budgetAmount: 10000, budgetType: "retainer", hourlyRate: 150, hoursLogged: 58, hoursEstimated: 67, costIncurred: 4060, revenue: 10000, margin: 59.4, startDate: "2026-01-15", dueDate: "2026-12-31", manager: "Rocco", tasksTotal: 22, tasksDone: 18 },
  },
};

function generateProjectDetail(id: string, industry: string): ProjectDetail | null {
  const industryData = PROJECT_SUMMARIES[industry];
  const summary = industryData?.[id];
  if (!summary) return null;

  const taskNames = [
    "Research & Discovery", "Strategy Document", "Creative Brief", "Initial Design",
    "Client Review Round 1", "Revisions", "Content Creation", "Development",
    "Testing & QA", "Client Review Round 2", "Final Revisions", "Launch Prep",
    "Go Live", "Post-Launch Monitoring", "Monthly Report", "Performance Review",
    "Optimization Pass", "Quarterly Review", "Client Presentation", "Training Session",
    "Documentation", "Handoff",
  ];
  const team = [
    { name: summary.manager, role: "Project Manager", hours: Math.round(summary.hoursLogged * 0.3), allocation: 30 },
    { name: "Team Member A", role: "Specialist", hours: Math.round(summary.hoursLogged * 0.45), allocation: 50 },
    { name: "Team Member B", role: "Support", hours: Math.round(summary.hoursLogged * 0.25), allocation: 20 },
  ];

  const tasks: ProjectTask[] = taskNames.slice(0, summary.tasksTotal).map((name, i) => ({
    id: `t${i + 1}`,
    title: name,
    status: i < summary.tasksDone ? "done" : i < summary.tasksDone + 2 ? "in_progress" : "todo",
    assignee: team[i % team.length].name,
    hoursEstimated: Math.round(summary.hoursEstimated / summary.tasksTotal),
    hoursLogged: i < summary.tasksDone ? Math.round(summary.hoursLogged / summary.tasksDone) : i < summary.tasksDone + 2 ? Math.round(summary.hoursLogged / summary.tasksTotal) : 0,
    dueDate: summary.dueDate,
    priority: i < 3 ? "high" : i < summary.tasksTotal - 2 ? "medium" : "low",
  }));

  const timeEntries: TimeEntry[] = [
    { id: "te1", user: team[0].name, task: tasks[0]?.title || "General", hours: 2.5, date: "2026-03-14", description: "Strategy review and planning session", billable: true },
    { id: "te2", user: team[1].name, task: tasks[1]?.title || "General", hours: 4, date: "2026-03-14", description: "Deliverable creation and refinement", billable: true },
    { id: "te3", user: team[2].name, task: tasks[2]?.title || "General", hours: 1.5, date: "2026-03-13", description: "Research and support tasks", billable: true },
    { id: "te4", user: team[0].name, task: tasks[3]?.title || "General", hours: 3, date: "2026-03-13", description: "Client communication and review", billable: true },
  ];

  return {
    id,
    name: summary.name,
    client: summary.client,
    status: summary.tasksDone === summary.tasksTotal ? "completed" : summary.hoursLogged === 0 ? "planning" : "active",
    budgetAmount: summary.budgetAmount,
    budgetType: summary.budgetType,
    hourlyRate: summary.hourlyRate,
    retainerHours: summary.budgetType === "retainer" ? summary.hoursEstimated : 0,
    hoursLogged: summary.hoursLogged,
    hoursEstimated: summary.hoursEstimated,
    costIncurred: summary.costIncurred,
    revenue: summary.revenue,
    margin: summary.margin,
    startDate: summary.startDate,
    dueDate: summary.dueDate,
    manager: summary.manager,
    description: `${summary.name} for ${summary.client}. ${summary.budgetType === "retainer" ? "Monthly retainer engagement." : "Fixed-price project."}`,
    tasks,
    timeEntries,
    team,
  };
}

// ─── MAIN COMPONENT ───

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tasks" | "time" | "budget" | "team">("tasks");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTask, setTimerTask] = useState("");

  useEffect(() => {
    // Load demo project — p1 has full handcrafted detail
    const p = DEMO_PROJECTS[id as string];
    if (p) {
      setProject(p);
      setLoading(false);
      return;
    }

    // For any other project ID, generate detail from the projects page data
    // Import the project list and build a detail view
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const generated = generateProjectDetail(id as string, demoIndustry || "agency_consulting");
    if (generated) setProject(generated);
    setLoading(false);
  }, [id]);

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (s: number) => `${Math.floor(s / 3600).toString().padStart(2, "0")}:${Math.floor((s % 3600) / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading) return <><Header title="Project" /><div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div></>;
  if (!project) return <><Header title="Project" /><div className="p-6 text-center py-32 text-gray-500">Project not found. <button onClick={() => router.push("/dashboard/projects")} className="text-indigo-600 underline">Back to Projects</button></div></>;

  const budgetPct = project.budgetType === "fixed" ? (project.costIncurred / project.budgetAmount) * 100 : (project.hoursLogged / project.hoursEstimated) * 100;
  const tasksDone = project.tasks.filter(t => t.status === "done").length;
  const tasksTotal = project.tasks.length;
  const marginColor = project.margin >= 60 ? "text-emerald-600" : project.margin >= 40 ? "text-amber-600" : "text-red-600";

  return (
    <>
      <Header title={project.name} subtitle={project.client} />
      <div className="p-6 space-y-6">

        {/* Back + Status */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/dashboard/projects")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
          {/* Timer */}
          <div className="flex items-center gap-3">
            {timerRunning && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono font-bold text-red-600">{formatTimer(timerSeconds)}</span>
                <span className="text-xs text-red-400">{timerTask}</span>
              </div>
            )}
            <button onClick={() => {
              if (timerRunning) { setTimerRunning(false); setTimerSeconds(0); setTimerTask(""); }
              else { setTimerRunning(true); setTimerTask("General"); }
            }} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${timerRunning ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
              {timerRunning ? <><Square className="w-3.5 h-3.5" /> Stop Timer</> : <><Play className="w-3.5 h-3.5" /> Start Timer</>}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Budget</p>
            <p className="text-xl font-bold text-gray-900">{fmt(project.budgetAmount)}</p>
            <p className="text-xs text-gray-400">{project.budgetType}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Hours</p>
            <p className="text-xl font-bold text-gray-900">{project.hoursLogged}h</p>
            <p className="text-xs text-gray-400">of {project.hoursEstimated}h estimated</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cost</p>
            <p className="text-xl font-bold text-gray-900">{fmt(project.costIncurred)}</p>
            <p className="text-xs text-gray-400">{fmt(project.budgetAmount - project.costIncurred)} remaining</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Margin</p>
            <p className={`text-xl font-bold ${marginColor}`}>{project.margin.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">{fmt(project.revenue - project.costIncurred)} profit</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tasks</p>
            <p className="text-xl font-bold text-gray-900">{tasksDone}/{tasksTotal}</p>
            <p className="text-xs text-gray-400">{((tasksDone / tasksTotal) * 100).toFixed(0)}% complete</p>
          </div>
        </div>

        {/* Budget Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">Budget Utilization</span>
            <span className={`text-xs font-bold ${budgetPct > 90 ? "text-red-600" : budgetPct > 70 ? "text-amber-600" : "text-emerald-600"}`}>{budgetPct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${budgetPct > 90 ? "bg-red-400" : budgetPct > 70 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {[
            { key: "tasks" as const, label: "Tasks", icon: CheckCircle },
            { key: "time" as const, label: "Time Log", icon: Clock },
            { key: "budget" as const, label: "Budget", icon: DollarSign },
            { key: "team" as const, label: "Team", icon: Users },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">{tasksTotal} Tasks</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"><Plus className="w-3.5 h-3.5" /> Add Task</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Task</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Assignee</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Hours</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {project.tasks.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityStyles[t.priority]}`}>{t.priority[0].toUpperCase()}</span>
                        <span className="text-sm font-medium text-gray-900">{t.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-600">{t.assignee}</span></td>
                    <td className="px-3 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[t.status]}`}>{t.status.replace("_", " ")}</span></td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm text-gray-700">{t.hoursLogged}h</span>
                      <span className="text-xs text-gray-400"> / {t.hoursEstimated}h</span>
                    </td>
                    <td className="px-5 py-3 text-right"><span className="text-xs text-gray-400">{t.dueDate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TIME LOG TAB */}
        {activeTab === "time" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Time Entries</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"><Plus className="w-3.5 h-3.5" /> Log Time</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Team Member</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Task</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Description</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {project.timeEntries.map(te => (
                  <tr key={te.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3"><span className="text-sm text-gray-700">{te.date}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center"><span className="text-[10px] font-bold text-indigo-700">{te.user[0]}</span></div>
                        <span className="text-sm text-gray-700">{te.user}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-600">{te.task}</span></td>
                    <td className="px-3 py-3"><span className="text-xs text-gray-400">{te.description}</span></td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-bold text-gray-900">{te.hours}h</span>
                      {te.billable && <span className="ml-1.5 text-[10px] text-emerald-600 font-medium">$</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === "budget" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Revenue</h3>
                <p className="text-2xl font-bold text-gray-900">{fmt(project.revenue)}</p>
                <p className="text-xs text-gray-400 mt-1">{project.budgetType === "retainer" ? `${project.retainerHours}h/mo @ $${project.hourlyRate}/h` : `Fixed price`}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Cost Incurred</h3>
                <p className="text-2xl font-bold text-gray-900">{fmt(project.costIncurred)}</p>
                <p className="text-xs text-gray-400 mt-1">{project.hoursLogged}h × $70 avg cost/hr</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Profit</h3>
                <p className={`text-2xl font-bold ${marginColor}`}>{fmt(project.revenue - project.costIncurred)}</p>
                <p className="text-xs text-gray-400 mt-1">{project.margin.toFixed(1)}% margin</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Cost Breakdown by Team Member</h3>
              <div className="space-y-3">
                {project.team.map(m => {
                  const cost = m.hours * 70; // Avg cost rate
                  const pct = project.costIncurred > 0 ? (cost / project.costIncurred) * 100 : 0;
                  return (
                    <div key={m.name} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-indigo-700">{m.name[0]}</span></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{m.name}</span>
                          <span className="text-sm font-bold text-gray-700">{fmt(cost)} ({m.hours}h)</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === "team" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Team ({project.team.length} members)</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"><Plus className="w-3.5 h-3.5" /> Add Member</button>
            </div>
            <div className="divide-y divide-gray-50">
              {project.team.map(m => {
                const memberTasks = project.tasks.filter(t => t.assignee === m.name);
                const doneTasks = memberTasks.filter(t => t.status === "done").length;
                return (
                  <div key={m.name} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-700">{m.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{m.name}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{m.role}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-400"><Clock className="w-3 h-3 inline mr-0.5" />{m.hours}h logged</span>
                        <span className="text-xs text-gray-400"><CheckCircle className="w-3 h-3 inline mr-0.5" />{doneTasks}/{memberTasks.length} tasks</span>
                        <span className="text-xs text-gray-400"><Target className="w-3 h-3 inline mr-0.5" />{m.allocation}% allocated</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{fmt(m.hours * 70)}</p>
                      <p className="text-[10px] text-gray-400">cost</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
