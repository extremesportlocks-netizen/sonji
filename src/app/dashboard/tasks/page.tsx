"use client";

import { useState, useMemo } from "react";
import Header from "@/components/dashboard/header";
import { useCRM } from "@/lib/crm-store";
import { useModal } from "@/components/modals/modal-provider";
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
  const { tasks, updateTask, deleteTask } = useCRM();
  const { openModal } = useModal();
  const [search, setSearch] = useState("");
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

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
      updateTask(taskId, { status: newStatus as "todo" | "in_progress" | "done" });
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
                  <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
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
                            onClick={() => deleteTask(task.id)}
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
