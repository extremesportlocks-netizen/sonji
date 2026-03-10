"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Plus,
  Search,
  Workflow,
  Play,
  Pause,
  MoreHorizontal,
  Zap,
  Mail,
  MessageSquare,
  Clock,
  Tag,
  UserPlus,
  ArrowRight,
  X,
} from "lucide-react";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerIcon: React.ElementType;
  actions: string[];
  status: "Active" | "Paused" | "Draft";
  lastRun: string;
  runsTotal: number;
}

const mockWorkflows: WorkflowItem[] = [
  { id: "w1", name: "New Lead Welcome Sequence", description: "Sends a 3-email welcome series when a new contact is created from an intake form", trigger: "Form Submitted", triggerIcon: Zap, actions: ["Wait 5 min", "Send Email", "Wait 2 days", "Send Email", "Add Tag"], status: "Active", lastRun: "2 hours ago", runsTotal: 847 },
  { id: "w2", name: "Deal Stage Notification", description: "Notifies the team via email when a deal moves to Proposal Sent or Closed Won", trigger: "Deal Stage Changed", triggerIcon: ArrowRight, actions: ["Check Stage", "Send Email"], status: "Active", lastRun: "Yesterday", runsTotal: 234 },
  { id: "w3", name: "Meeting Follow-up", description: "Automatically sends a follow-up email 24 hours after a meeting is completed", trigger: "Meeting Completed", triggerIcon: Clock, actions: ["Wait 24h", "Send Email"], status: "Active", lastRun: "3 days ago", runsTotal: 156 },
  { id: "w4", name: "Inactive Contact Re-engagement", description: "Tags contacts as inactive after 30 days of no activity and sends a re-engagement email", trigger: "No Activity (30 days)", triggerIcon: Clock, actions: ["Add Tag: Inactive", "Send Email", "Wait 7 days", "Send SMS"], status: "Paused", lastRun: "1 week ago", runsTotal: 92 },
  { id: "w5", name: "New Customer Onboarding", description: "Welcome sequence for customers who complete their first purchase", trigger: "Invoice Paid", triggerIcon: Zap, actions: ["Add Tag: Customer", "Send Email", "Create Task", "Wait 3 days", "Send Email"], status: "Active", lastRun: "5 hours ago", runsTotal: 413 },
  { id: "w6", name: "Birthday Campaign", description: "Sends a birthday greeting with a special offer to contacts with a DOB on file", trigger: "Contact Birthday", triggerIcon: UserPlus, actions: ["Send Email", "Add Tag"], status: "Draft", lastRun: "Never", runsTotal: 0 },
];

const statusStyles: Record<string, { badge: string; dot: string }> = {
  Active: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Paused: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Draft: { badge: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

const actionIcons: Record<string, React.ElementType> = {
  "Send Email": Mail,
  "Send SMS": MessageSquare,
  "Add Tag": Tag,
  "Add Tag: Inactive": Tag,
  "Add Tag: Customer": Tag,
  "Create Task": Zap,
  "Wait": Clock,
  "Check Stage": ArrowRight,
};

export default function WorkflowsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [workflows, setWorkflows] = useState(mockWorkflows);

  const filtered = workflows.filter((w) => {
    const matchSearch = search === "" || `${w.name} ${w.description}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id: string) => {
    setWorkflows((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      if (w.status === "Active") return { ...w, status: "Paused" as const };
      if (w.status === "Paused") return { ...w, status: "Active" as const };
      return w;
    }));
  };

  return (
    <>
      <Header title="Workflows" subtitle={`${workflows.filter(w => w.status === "Active").length} active automations`} />
      <div className="p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {["All", "Active", "Paused", "Draft"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${statusFilter === s ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100 bg-white border border-gray-200"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search workflows..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-56 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
              <Plus className="w-4 h-4" /> Create Workflow
            </button>
          </div>
        </div>

        {/* Workflow Cards */}
        <div className="space-y-3">
          {filtered.map((w) => {
            const st = statusStyles[w.status];
            const TriggerIcon = w.triggerIcon;
            return (
              <div key={w.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-100 hover:shadow-sm transition group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Workflow className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-gray-900">{w.name}</h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {w.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-lg">{w.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {w.status !== "Draft" && (
                      <button onClick={() => toggleStatus(w.id)}
                        className={`p-2 rounded-lg transition ${w.status === "Active" ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                        title={w.status === "Active" ? "Pause" : "Activate"}>
                        {w.status === "Active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Trigger + Actions Flow */}
                <div className="flex items-center gap-2 mt-3 ml-[52px]">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    <TriggerIcon className="w-3 h-3" />
                    {w.trigger}
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                  <div className="flex items-center gap-1">
                    {w.actions.slice(0, 4).map((action, i) => {
                      const match = Object.keys(actionIcons).find((k) => action.startsWith(k));
                      const AIcon = match ? actionIcons[match] : Zap;
                      return (
                        <div key={i} className="w-6 h-6 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center" title={action}>
                          <AIcon className="w-3 h-3 text-gray-500" />
                        </div>
                      );
                    })}
                    {w.actions.length > 4 && (
                      <span className="text-[10px] text-gray-400 font-medium">+{w.actions.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 ml-[52px] text-xs text-gray-400">
                  <span>Last run: {w.lastRun}</span>
                  <span>&middot;</span>
                  <span>{w.runsTotal.toLocaleString()} total runs</span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
              <Workflow className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No workflows found</p>
              <p className="text-xs text-gray-400 mt-1">Create your first automation to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
