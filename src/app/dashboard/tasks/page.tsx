"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useCRM, type Task } from "@/lib/crm-store";
import { useModal } from "@/components/modals/modal-provider";
import { useIndustry } from "@/lib/use-industry";
import {
  Plus,
  MoreHorizontal,
  GripVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Trash2,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";

// ─── DEMO SEED TASKS ───

const INDUSTRY_TASKS: Record<string, Task[]> = {
  agency_consulting: [
    { id: "dt1", title: "Send March report to Brightview", description: "ROAS report + recommendations", priority: "high", status: "todo", assignedTo: "Rocco", contactName: "Brightview Hotels", dueDate: "2026-03-18", createdAt: "2026-03-16" },
    { id: "dt2", title: "Review Summit brand mockups", description: "Color palette + typography", priority: "high", status: "todo", assignedTo: "Colton", contactName: "Summit Athletics", dueDate: "2026-03-17", createdAt: "2026-03-15" },
    { id: "dt3", title: "Follow up on Apex proposal", description: "Social media management $3K/mo", priority: "medium", status: "todo", assignedTo: "Rocco", contactName: "Apex Construction", dueDate: "2026-03-19", createdAt: "2026-03-14" },
    { id: "dt4", title: "Meridian website — QA browser testing", description: "Test Chrome, Safari, Firefox, mobile", priority: "high", status: "in_progress", assignedTo: "Mike", contactName: "Meridian Law Group", dueDate: "2026-03-20", createdAt: "2026-03-14" },
    { id: "dt5", title: "SEO redirect map — final review", description: "127 redirects mapped, need sign-off", priority: "medium", status: "in_progress", assignedTo: "Rocco", contactName: "Meridian Law Group", dueDate: "2026-03-18", createdAt: "2026-03-13" },
    { id: "dt6", title: "Sterling Partners renewal prep", description: "Attribution report + retention strategy", priority: "high", status: "in_progress", assignedTo: "Rocco", contactName: "Sterling Partners", dueDate: "2026-03-22", createdAt: "2026-03-12" },
    { id: "dt7", title: "Harbor Dental — schedule April content", description: "Approved posts ready to schedule", priority: "low", status: "done", assignedTo: "Colton", contactName: "Harbor Dental", dueDate: "2026-03-15", createdAt: "2026-03-10" },
    { id: "dt8", title: "Nova Fitness email automation — launch", description: "3-email sequence activated", priority: "medium", status: "done", assignedTo: "Colton", contactName: "Nova Fitness", dueDate: "2026-03-14", createdAt: "2026-03-08" },
    { id: "dt9", title: "Coastal RE monthly PPC optimization", description: "Adjust bids, add negative keywords", priority: "medium", status: "done", assignedTo: "Rocco", contactName: "Coastal Real Estate", dueDate: "2026-03-12", createdAt: "2026-03-05" },
  ],
  health_wellness: [
    { id: "dt1", title: "Prepare chart for Emily Rodriguez", description: "New patient consultation tomorrow", priority: "high", status: "todo", assignedTo: "Front Desk", contactName: "Emily Rodriguez", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt2", title: "Call Patricia Lee — missed appointments", description: "2 consecutive no-shows, check in", priority: "high", status: "todo", assignedTo: "Dr. Patel", contactName: "Patricia Lee", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt3", title: "Order Botox supply — running low", description: "Current stock: 3 vials, need 10+", priority: "medium", status: "todo", assignedTo: "Office Manager", contactName: "Internal", dueDate: "2026-03-18", createdAt: "2026-03-15" },
    { id: "dt4", title: "Sarah Thompson dosage review", description: "Week 4 — weight loss slowing, assess", priority: "high", status: "in_progress", assignedTo: "Dr. Patel", contactName: "Sarah Thompson", dueDate: "2026-03-17", createdAt: "2026-03-14" },
    { id: "dt5", title: "Update consent forms for telehealth", description: "New state regulations effective April 1", priority: "medium", status: "in_progress", assignedTo: "Office Manager", contactName: "Internal", dueDate: "2026-03-25", createdAt: "2026-03-10" },
    { id: "dt6", title: "David Kim — book IV therapy 4-pack", description: "Patient confirmed wants to proceed", priority: "medium", status: "done", assignedTo: "Front Desk", contactName: "David Kim", dueDate: "2026-03-15", createdAt: "2026-03-14" },
    { id: "dt7", title: "Send post-treatment check-in to Michael", description: "Day 3 after Botox", priority: "low", status: "done", assignedTo: "Dr. Kim", contactName: "Michael Brown", dueDate: "2026-03-14", createdAt: "2026-03-11" },
  ],
  ecommerce: [
    { id: "dt1", title: "Contact Andrew Krieman — payment failed", description: "VIP Monthly $165 card declined", priority: "high", status: "todo", assignedTo: "Orlando", contactName: "Andrew Krieman", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt2", title: "Write NCAAB picks for Thursday slate", description: "4 games, need by 5pm", priority: "high", status: "todo", assignedTo: "Orlando", contactName: "All Subscribers", dueDate: "2026-03-18", createdAt: "2026-03-16" },
    { id: "dt3", title: "Reply to Wayne Barry — upgrade question", description: "Wants to switch monthly to yearly VIP", priority: "medium", status: "todo", assignedTo: "Orlando", contactName: "Wayne Barry", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt4", title: "Win-back campaign — review open rates", description: "60-day inactive sequence sent yesterday", priority: "medium", status: "in_progress", assignedTo: "Orlando", contactName: "Lapsed Customers", dueDate: "2026-03-18", createdAt: "2026-03-15" },
    { id: "dt5", title: "NFL player props feature — scope it", description: "Tyler McLaughlin requested, popular ask", priority: "low", status: "in_progress", assignedTo: "Orlando", contactName: "Feature Request", dueDate: "2026-03-25", createdAt: "2026-03-15" },
    { id: "dt6", title: "Weekly newsletter — sent", description: "Picks preview sent to 94 subscribers", priority: "high", status: "done", assignedTo: "Orlando", contactName: "All Subscribers", dueDate: "2026-03-15", createdAt: "2026-03-15" },
    { id: "dt7", title: "Ship VIP gift to Chris Persaud", description: "4th purchase milestone — surprise merch", priority: "medium", status: "done", assignedTo: "Orlando", contactName: "Chris Persaud", dueDate: "2026-03-14", createdAt: "2026-03-13" },
  ],
  home_services: [
    { id: "dt1", title: "Emergency: Call Susan Taylor ASAP", description: "Active roof leak — needs same-day response", priority: "high", status: "todo", assignedTo: "Mike", contactName: "Susan Taylor", dueDate: "2026-03-16", createdAt: "2026-03-16" },
    { id: "dt2", title: "Follow up with Richard Wilson", description: "Gutter estimate sent 14 days ago, no response", priority: "high", status: "todo", assignedTo: "Steve", contactName: "Richard Wilson", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt3", title: "Order materials — Garcia roof job", description: "Shingles + underlayment for March 20 start", priority: "high", status: "in_progress", assignedTo: "Mike", contactName: "Linda Garcia", dueDate: "2026-03-18", createdAt: "2026-03-15" },
    { id: "dt4", title: "HVAC install — confirm Thursday crew", description: "2 techs needed for Thomas Brown job", priority: "medium", status: "in_progress", assignedTo: "Steve", contactName: "Thomas Brown", dueDate: "2026-03-18", createdAt: "2026-03-14" },
    { id: "dt5", title: "Send maintenance plan renewals", description: "12 customers approaching annual renewal", priority: "medium", status: "done", assignedTo: "Office", contactName: "Multiple", dueDate: "2026-03-15", createdAt: "2026-03-10" },
    { id: "dt6", title: "Complete emergency leak patch", description: "Susan Taylor — temporary fix before full repair", priority: "high", status: "done", assignedTo: "Crew A", contactName: "Susan Taylor", dueDate: "2026-03-16", createdAt: "2026-03-16" },
  ],
  legal: [
    { id: "dt1", title: "Review Johnson medical records", description: "Received from Southwest General — need for PI case", priority: "high", status: "todo", assignedTo: "Atty. Sterling", contactName: "Marcus Johnson", dueDate: "2026-03-18", createdAt: "2026-03-16" },
    { id: "dt2", title: "Draft Williams estate plan", description: "Trust setup after husband's passing", priority: "high", status: "todo", assignedTo: "Atty. Hayes", contactName: "Patricia Williams", dueDate: "2026-03-20", createdAt: "2026-03-16" },
    { id: "dt3", title: "Prepare mediation brief — Harbor", description: "Contract dispute mediation next week", priority: "high", status: "in_progress", assignedTo: "Atty. Sterling", contactName: "Harbor Construction", dueDate: "2026-03-19", createdAt: "2026-03-14" },
    { id: "dt4", title: "File Mitchell motion", description: "Divorce discovery motion due Friday", priority: "medium", status: "in_progress", assignedTo: "Paralegal", contactName: "Sarah Mitchell", dueDate: "2026-03-20", createdAt: "2026-03-13" },
    { id: "dt5", title: "Send engagement letter to Williams", description: "Estate planning engagement — awaiting signature", priority: "medium", status: "done", assignedTo: "Atty. Hayes", contactName: "Patricia Williams", dueDate: "2026-03-15", createdAt: "2026-03-14" },
  ],
  fitness_gym: [
    { id: "dt1", title: "Call Daniel Wright — at risk", description: "14 days no check-in, send trainer personal text", priority: "high", status: "todo", assignedTo: "Coach Jake", contactName: "Daniel Wright", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt2", title: "Set up Saturday HIIT class", description: "New class requested, need instructor + studio", priority: "medium", status: "todo", assignedTo: "Manager", contactName: "Internal", dueDate: "2026-03-20", createdAt: "2026-03-15" },
    { id: "dt3", title: "Stephanie Clark — renew PT package", description: "Wants unlimited monthly instead of 12-pack", priority: "medium", status: "in_progress", assignedTo: "Coach Sarah", contactName: "Stephanie Clark", dueDate: "2026-03-18", createdAt: "2026-03-15" },
    { id: "dt4", title: "Brandon Lewis intro session", description: "New trial member — first PT session booked", priority: "high", status: "done", assignedTo: "Coach Jake", contactName: "Brandon Lewis", dueDate: "2026-03-16", createdAt: "2026-03-15" },
  ],
  beauty_salon: [
    { id: "dt1", title: "Order keratin treatment supply", description: "Running low — need 6 kits from Aveda", priority: "high", status: "todo", assignedTo: "Manager", contactName: "Internal", dueDate: "2026-03-18", createdAt: "2026-03-16" },
    { id: "dt2", title: "Confirm Charlotte bridal trial", description: "Monday 10AM — prep station 1, 2 hours blocked", priority: "high", status: "todo", assignedTo: "Emma", contactName: "Charlotte Davis", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt3", title: "Follow up Nina Patel rebooking", description: "6 weeks since last visit — send personal text", priority: "medium", status: "in_progress", assignedTo: "Alex", contactName: "Nina Patel", dueDate: "2026-03-17", createdAt: "2026-03-15" },
    { id: "dt4", title: "Post-visit thank you to Amelia", description: "Keratin treatment completed — send aftercare tips", priority: "low", status: "done", assignedTo: "Emma", contactName: "Amelia Wilson", dueDate: "2026-03-15", createdAt: "2026-03-14" },
  ],
  real_estate: [
    { id: "dt1", title: "Submit offer — 4521 Bayshore Dr", description: "Amanda Hill wants to offer $425K, pre-approval attached", priority: "high", status: "todo", assignedTo: "Agent Sarah", contactName: "Amanda Hill", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt2", title: "Confirm Williams closing — March 28", description: "Title company docs ready, confirm with seller", priority: "high", status: "todo", assignedTo: "Agent Sarah", contactName: "Patricia Williams", dueDate: "2026-03-20", createdAt: "2026-03-16" },
    { id: "dt3", title: "Prepare CMA for Chen waterfront", description: "3 comps needed for listing presentation", priority: "medium", status: "in_progress", assignedTo: "Agent Sarah", contactName: "Robert Chen", dueDate: "2026-03-18", createdAt: "2026-03-15" },
    { id: "dt4", title: "Set up Saturday open house", description: "1234 Gulf Blvd — signage, flyers, sign-in sheet", priority: "medium", status: "in_progress", assignedTo: "Agent Mike", contactName: "Internal", dueDate: "2026-03-19", createdAt: "2026-03-14" },
    { id: "dt5", title: "Send anniversary CMA to Karen Wu", description: "1-year purchase anniversary — market update", priority: "low", status: "done", assignedTo: "Agent Mike", contactName: "Karen Wu", dueDate: "2026-03-15", createdAt: "2026-03-10" },
  ],
  coaching_education: [
    { id: "dt1", title: "Review Nathan Harris VIP Day app", description: "Referred by Jason Wright — March 25 date requested", priority: "high", status: "todo", assignedTo: "Coach", contactName: "Nathan Harris", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt2", title: "Check in on Lindsey K.", description: "3 weeks no assignments submitted — stuck intervention", priority: "high", status: "todo", assignedTo: "Coach", contactName: "Lindsey K.", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt3", title: "Prep mastermind Week 3 materials", description: "Scaling strategies module — slides + workbook", priority: "medium", status: "in_progress", assignedTo: "Coach", contactName: "Cohort", dueDate: "2026-03-18", createdAt: "2026-03-14" },
    { id: "dt4", title: "Send goal-setting template to Jason", description: "Requested after yesterday's session", priority: "low", status: "done", assignedTo: "Coach", contactName: "Jason Wright", dueDate: "2026-03-16", createdAt: "2026-03-15" },
  ],
  restaurant_food: [
    { id: "dt1", title: "Finalize wedding menu — Emily & David", description: "Need final selections by Friday, tasting Monday", priority: "high", status: "todo", assignedTo: "Chef", contactName: "Emily & David", dueDate: "2026-03-20", createdAt: "2026-03-16" },
    { id: "dt2", title: "Send catering menu to Apex Financial", description: "Corporate lunch for 35 on April 12", priority: "high", status: "todo", assignedTo: "Manager", contactName: "Apex Financial", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt3", title: "Prep Marcus Rivera meal order", description: "Weekly meal prep + added salmon + double rice", priority: "medium", status: "in_progress", assignedTo: "Chef", contactName: "Marcus Rivera", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt4", title: "Reserve corner booth — Michael Rivera", description: "Friday 7:30PM birthday party of 6", priority: "medium", status: "done", assignedTo: "Host", contactName: "Michael Rivera", dueDate: "2026-03-15", createdAt: "2026-03-15" },
  ],
  automotive: [
    { id: "dt1", title: "Call Thomas Brown — post-service noise", description: "Cold-start squealing after timing belt — may need belt tension adjustment", priority: "high", status: "todo", assignedTo: "Steve", contactName: "Thomas Brown", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt2", title: "Schedule Enterprise fleet block", description: "5 vehicles for 30K service next week", priority: "high", status: "todo", assignedTo: "Manager", contactName: "Enterprise Fleet", dueDate: "2026-03-18", createdAt: "2026-03-16" },
    { id: "dt3", title: "Order brake pads — James Peterson", description: "Full brake job scheduled for Friday", priority: "medium", status: "in_progress", assignedTo: "Parts Dept", contactName: "James Peterson", dueDate: "2026-03-18", createdAt: "2026-03-15" },
    { id: "dt4", title: "Complete 30K service — Nancy Davis", description: "Oil, filters, tire rotation, inspection", priority: "medium", status: "done", assignedTo: "Tech A", contactName: "Nancy Davis", dueDate: "2026-03-14", createdAt: "2026-03-13" },
  ],
  nonprofit: [
    { id: "dt1", title: "Call Robert Chen — increase to $1K/mo", description: "Major donor wants to discuss increasing monthly contribution", priority: "high", status: "todo", assignedTo: "Director", contactName: "Robert Chen", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt2", title: "Send sponsorship deck to Community Bank", description: "Inquired about Gold/Platinum gala sponsorship", priority: "high", status: "todo", assignedTo: "Events", contactName: "Community Bank", dueDate: "2026-03-17", createdAt: "2026-03-16" },
    { id: "dt3", title: "Finalize gala venue logistics", description: "Seating chart, AV setup, catering timeline", priority: "high", status: "in_progress", assignedTo: "Events", contactName: "Internal", dueDate: "2026-03-25", createdAt: "2026-03-10" },
    { id: "dt4", title: "Process Sarah Lopez volunteer application", description: "Event planning experience — assign to gala committee", priority: "medium", status: "in_progress", assignedTo: "Outreach", contactName: "Sarah Lopez", dueDate: "2026-03-18", createdAt: "2026-03-16" },
    { id: "dt5", title: "Send lapsed donor re-engagement emails", description: "12+ months since last donation — 15 donors identified", priority: "medium", status: "done", assignedTo: "Outreach", contactName: "Multiple", dueDate: "2026-03-15", createdAt: "2026-03-10" },
  ],
};

const DEFAULT_TASKS: Task[] = [
  { id: "dt1", title: "Follow up with new lead", description: "Submitted contact form yesterday", priority: "high", status: "todo", assignedTo: "Team", contactName: "New Lead", dueDate: "2026-03-17", createdAt: "2026-03-16" },
  { id: "dt2", title: "Send weekly update email", description: "Status update to active clients", priority: "medium", status: "in_progress", assignedTo: "Team", contactName: "All Clients", dueDate: "2026-03-18", createdAt: "2026-03-15" },
  { id: "dt3", title: "Review analytics report", description: "Monthly performance review", priority: "low", status: "done", assignedTo: "Team", contactName: "Internal", dueDate: "2026-03-15", createdAt: "2026-03-10" },
];

const statusColumns = [
  { id: "todo", name: "To Do", color: "text-gray-700", borderColor: "border-gray-300", bgColor: "bg-gray-50", dotColor: "bg-gray-400" },
  { id: "in_progress", name: "In Progress", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50", dotColor: "bg-blue-500" },
  { id: "done", name: "Done", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50", dotColor: "bg-emerald-500" },
];

const priorityStyles: Record<string, string> = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function TasksPage() {
  const { tasks: crmTasks, updateTask, deleteTask, addTask } = useCRM();
  const { openModal } = useModal();
  const ic = useIndustry();
  const [search, setSearch] = useState("");
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [demoTasks, setDemoTasks] = useState<Task[]>([]);

  // Seed demo tasks when CRM store is empty
  useEffect(() => {
    if (crmTasks.length > 0) return; // Real data exists, don't seed
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = demoIndustry || "ecommerce";
    setDemoTasks(INDUSTRY_TASKS[key] || DEFAULT_TASKS);
  }, [crmTasks.length]);

  const tasks = crmTasks.length > 0 ? crmTasks : demoTasks;

  // Demo task update/delete for local state
  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    if (crmTasks.length > 0) { updateTask(id, updates); return; }
    setDemoTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const handleDeleteTask = (id: string) => {
    if (crmTasks.length > 0) { deleteTask(id); return; }
    setDemoTasks(prev => prev.filter(t => t.id !== id));
  };

  const filtered = tasks.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.contactName.toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q);
  });

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, typeof filtered> = {};
    statusColumns.forEach((s) => { grouped[s.id] = []; });
    filtered.forEach((t) => {
      if (grouped[t.status]) grouped[t.status].push(t);
      else grouped["todo"].push(t);
    });
    return grouped;
  }, [filtered]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      handleUpdateTask(taskId, { status: newStatus as "todo" | "in_progress" | "done" });
    }
    setDragOverCol(null);
    setDraggingId(null);
  };

  return (
    <>
      <Header title="Tasks" />
      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{tasks.length} Tasks</h2>
                <p className="text-xs text-gray-400">{tasks.filter(t => t.status === "done").length} completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => openModal("task")}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Task
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusColumns.map((col) => {
            const colTasks = tasksByStatus[col.id] || [];
            const isDragOver = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <span className="text-sm font-semibold text-gray-900">{col.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                  <button onClick={() => openModal("task")} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards */}
                <div className={`space-y-3 min-h-[200px] rounded-xl p-2 transition ${
                  isDragOver ? "bg-indigo-50/50 border-2 border-dashed border-indigo-300" : "bg-gray-50/30"
                }`}>
                  {colTasks.map((task) => {
                    const isOverdue = task.status !== "done" && task.dueDate < new Date().toISOString().split("T")[0];
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={() => { setDragOverCol(null); setDraggingId(null); }}
                        className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition cursor-grab active:cursor-grabbing group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
                            <h4 className="text-sm font-semibold text-gray-900 leading-snug">{task.title}</h4>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-xs text-gray-400 mb-3 ml-6">{task.description}</p>
                        )}

                        <div className="flex items-center gap-2 mb-3 ml-6">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityStyles[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 ml-6">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{task.contactName || task.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isOverdue ? <AlertCircle className="w-3 h-3 text-red-500" /> : <Calendar className="w-3 h-3 text-gray-400" />}
                            <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>{task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && !isDragOver && (
                    <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                      No tasks
                    </div>
                  )}

                  {isDragOver && colTasks.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-indigo-500 font-medium">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
