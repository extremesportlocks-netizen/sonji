"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import { CheckSquare, Calendar, User, Flag, Save } from "lucide-react";
import { useCRM } from "@/lib/crm-store";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  editTask?: { id: string; title: string; description?: string; priority: string; assignedTo?: string; contactName?: string; dueDate?: string; status?: string } | null;
}

const priorities = [
  { value: "high", label: "High", dot: "bg-red-500" },
  { value: "medium", label: "Medium", dot: "bg-amber-500" },
  { value: "low", label: "Low", dot: "bg-gray-400" },
];

const statuses = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export default function CreateTaskModal({ open, onClose, editTask }: CreateTaskModalProps) {
  const { addTask, updateTask, contacts } = useCRM();
  const contactNames = contacts.map((c) => `${c.firstName} ${c.lastName}`);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", assignee: "Orlando", dueDate: "", contact: "", status: "todo" });
  const [saving, setSaving] = useState(false);
  const isEdit = !!editTask;

  // Pre-fill form when editing
  useEffect(() => {
    if (editTask && open) {
      setForm({
        title: editTask.title || "",
        description: editTask.description || "",
        priority: editTask.priority || "medium",
        assignee: editTask.assignedTo || "Orlando",
        dueDate: editTask.dueDate || "",
        contact: editTask.contactName || "",
        status: editTask.status || "todo",
      });
    } else if (!editTask && open) {
      setForm({ title: "", description: "", priority: "medium", assignee: "Orlando", dueDate: "", contact: "", status: "todo" });
    }
  }, [editTask, open]);

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const handleSave = () => {
    setSaving(true);
    if (isEdit && editTask) {
      updateTask(editTask.id, {
        title: form.title,
        description: form.description,
        priority: form.priority as "high" | "medium" | "low",
        status: form.status as "todo" | "in_progress" | "done",
        assignedTo: form.assignee,
        contactName: form.contact,
        dueDate: form.dueDate,
      });
    } else {
      addTask({
        title: form.title,
        description: form.description,
        priority: form.priority as "high" | "medium" | "low",
        status: "todo",
        assignedTo: form.assignee,
        contactName: form.contact,
        dueDate: form.dueDate,
      });
    }
    setTimeout(() => {
      setSaving(false);
      setForm({ title: "", description: "", priority: "medium", assignee: "Orlando", dueDate: "", contact: "", status: "todo" });
      onClose();
    }, 500);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Task" : "Add Task"} subtitle={isEdit ? "Update task details" : "Create a new task"} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Title *</label>
          <input type="text" placeholder="Follow up with Mason Thompson" value={form.title} onChange={(e) => update("title", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
          <textarea rows={3} placeholder="Add details..." value={form.description} onChange={(e) => update("description", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button key={p.value} onClick={() => update("priority", p.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition flex-1 justify-center ${
                    form.priority === p.value ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${p.dot}`} /> {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>
        {isEdit && (
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button key={s.value} onClick={() => update("status", s.value)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition flex-1 text-center ${
                    form.status === s.value ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}>{s.label}</button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Assigned To</label>
            <select value={form.assignee} onChange={(e) => update("assignee", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
              {["Orlando", "Sarah Chen", "Marcus Rivera", "Emily Rodriguez"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Related Contact</label>
            <select value={form.contact} onChange={(e) => update("contact", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
              <option value="">None</option>
              {contactNames.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
        <button onClick={handleSave} disabled={!form.title || saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
        </button>
      </div>
    </Modal>
  );
}
