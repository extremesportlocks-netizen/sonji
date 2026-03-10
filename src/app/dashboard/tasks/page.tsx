"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Columns3,
  List,
  CheckSquare,
  Clock,
  User,
  Calendar,
  Flag,
  X,
  ChevronDown,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "Todo" | "In Progress" | "Done";
  priority: "High" | "Medium" | "Low";
  assignee: string;
  assigneeAvatar: string;
  dueDate: string;
  contact?: string;
  company?: string;
}

const mockTasks: Task[] = [
  { id: "t1", title: "Follow up with Mason Thompson", description: "Send follow-up email about Enterprise Platform Migration next steps.", status: "In Progress", priority: "High", assignee: "Orlando", assigneeAvatar: "O", dueDate: "Mar 12, 2026", contact: "Mason Thompson", company: "Vertex Partners" },
  { id: "t2", title: "Prepare Q2 proposal deck", description: "Create updated pricing tiers and implementation timeline for DataFlow.", status: "Todo", priority: "High", assignee: "Orlando", assigneeAvatar: "O", dueDate: "Mar 14, 2026", contact: "Logan Mitchell", company: "DataFlow Solutions" },
  { id: "t3", title: "Schedule QBR with Vertex team", description: "Set up quarterly business review for Q2 with Mason and leadership.", status: "Todo", priority: "Medium", assignee: "Sarah Chen", assigneeAvatar: "SC", dueDate: "Mar 18, 2026", company: "Vertex Partners" },
  { id: "t4", title: "Review SOC 2 compliance docs", description: "Compile documentation for TechVentures CFO review process.", status: "In Progress", priority: "Medium", assignee: "Orlando", assigneeAvatar: "O", dueDate: "Mar 15, 2026", company: "TechVentures Inc" },
  { id: "t5", title: "Send contract renewal notice", description: "Annual software license renewal approaching for Skyline Group.", status: "Todo", priority: "Low", assignee: "Emily Rodriguez", assigneeAvatar: "ER", dueDate: "Mar 20, 2026", contact: "Joshua Murphy", company: "Skyline Group" },
  { id: "t6", title: "Update CRM contact records", description: "Merge duplicate contacts and update phone numbers from latest call.", status: "Done", priority: "Low", assignee: "Marcus Rivera", assigneeAvatar: "MR", dueDate: "Mar 8, 2026" },
  { id: "t7", title: "Create onboarding flow for Fusion Labs", description: "Set up welcome sequence and intake forms for new customer.", status: "In Progress", priority: "High", assignee: "Orlando", assigneeAvatar: "O", dueDate: "Mar 11, 2026", company: "Fusion Labs" },
  { id: "t8", title: "Prepare demo environment", description: "Spin up sandbox for Halo Collar product demo scheduled Thursday.", status: "Done", priority: "Medium", assignee: "Orlando", assigneeAvatar: "O", dueDate: "Mar 10, 2026", company: "Halo Collar" },
  { id: "t9", title: "Draft NDA for CloudPeak", description: "Legal review needed before contract negotiation meeting.", status: "Todo", priority: "High", assignee: "Sarah Chen", assigneeAvatar: "SC", dueDate: "Mar 13, 2026", company: "CloudPeak" },
  { id: "t10", title: "Send weekly pipeline report", description: "Compile pipeline stats and send to team Slack channel.", status: "Done", priority: "Low", assignee: "Orlando", assigneeAvatar: "O", dueDate: "Mar 7, 2026" },
];

const statusConfig: Record<string, { badge: string; bg: string; count: string }> = {
  "Todo": { badge: "bg-gray-50 text-gray-700 border-gray-200", bg: "bg-gray-50/50", count: "bg-gray-200 text-gray-600" },
  "In Progress": { badge: "bg-blue-50 text-blue-700 border-blue-200", bg: "bg-blue-50/30", count: "bg-blue-100 text-blue-700" },
  "Done": { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bg: "bg-emerald-50/30", count: "bg-emerald-100 text-emerald-700" },
};

const priorityConfig: Record<string, { badge: string; dot: string }> = {
  "High": { badge: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500" },
  "Medium": { badge: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
  "Low": { badge: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = q === "" || `${t.title} ${t.description} ${t.assignee} ${t.company || ""}`.toLowerCase().includes(q);
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const byStatus: Record<string, Task[]> = { "Todo": [], "In Progress": [], "Done": [] };
  filtered.forEach((t) => { if (byStatus[t.status]) byStatus[t.status].push(t); });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(null);
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (!id) return;
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: status as Task["status"] } : t));
    setDraggingId(null);
  };

  const statuses: Array<Task["status"]> = ["Todo", "In Progress", "Done"];
  const total = filtered.length;
  const done = filtered.filter((t) => t.status === "Done").length;

  return (
    <>
      <Header title="Tasks" subtitle={`${done}/${total} completed`} />

      <div className="p-6">
        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>

              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-2">
                <button onClick={() => setView("kanban")}
                  className={`p-2 transition ${view === "kanban" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                  <Columns3 className="w-4 h-4" />
                </button>
                <button onClick={() => setView("list")}
                  className={`p-2 transition border-l border-gray-200 ${view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden md:flex items-center gap-1 ml-2">
                {["All", "High", "Medium", "Low"].map((p) => (
                  <button key={p} onClick={() => setPriorityFilter(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${priorityFilter === p ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
                {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>
        </div>

        {/* ═══ KANBAN VIEW ═══ */}
        {view === "kanban" && (
          <div className="grid grid-cols-3 gap-4">
            {statuses.map((status) => {
              const config = statusConfig[status];
              const statusTasks = byStatus[status] || [];
              const isDragOver = dragOverStatus === status;

              return (
                <div key={status}
                  onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status); }}
                  onDragLeave={() => setDragOverStatus(null)}
                  onDrop={(e) => handleDrop(e, status)}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className={`inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badge}`}>
                      {status}
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${config.count}`}>
                        {statusTasks.length}
                      </span>
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"><Plus className="w-4 h-4" /></button>
                  </div>

                  <div className={`space-y-3 min-h-[200px] rounded-xl p-2 transition ${isDragOver ? "bg-indigo-50/50 border-2 border-dashed border-indigo-300" : config.bg}`}>
                    {statusTasks.map((task) => {
                      const pConfig = priorityConfig[task.priority];
                      return (
                        <div key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={() => { setDragOverStatus(null); setDraggingId(null); }}
                          className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-sm transition cursor-grab active:cursor-grabbing group">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-900 leading-snug pr-2">{task.title}</p>
                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{task.description}</p>

                          {task.company && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                              <CheckSquare className="w-3 h-3" />
                              <span>{task.company}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${pConfig.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
                                {task.priority}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Calendar className="w-3 h-3" />
                                {task.dueDate}
                              </span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center" title={task.assignee}>
                              <span className="text-[8px] font-bold text-white">{task.assigneeAvatar}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {statusTasks.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                        {isDragOver ? "Drop here" : "No tasks"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ LIST VIEW ═══ */}
        {view === "list" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-12 px-5 py-3"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" /></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-5 py-3"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" /></td>
                    <td className="px-3 py-3">
                      <p className="text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{t.description}</p>
                    </td>
                    <td className="px-3 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusConfig[t.status].badge}`}>{t.status}</span></td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${priorityConfig[t.priority].badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[t.priority].dot}`} />{t.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">{t.assigneeAvatar}</span>
                        </div>
                        <span className="text-sm text-gray-600">{t.assignee}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-500">{t.dueDate}</span></td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-500">{t.company || "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
