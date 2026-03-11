"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { CheckSquare, Calendar, User, Flag, Save } from "lucide-react";

interface CreateTaskModalProps { open: boolean; onClose: () => void; }

const priorities = [
  { value: "high", label: "High", dot: "bg-red-500" },
  { value: "medium", label: "Medium", dot: "bg-amber-500" },
  { value: "low", label: "Low", dot: "bg-gray-400" },
];

export default function CreateTaskModal({ open, onClose }: CreateTaskModalProps) {
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", assignee: "Orlando", dueDate: "", contact: "", status: "todo" });
  const [saving, setSaving] = useState(false);
  const update = (k: string, v: string) => setForm({ ...form, [k]: v });
  const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); onClose(); }, 800); };

  return (
    <Modal open={open} onClose={onClose} title="Add Task" subtitle="Create a new task" size="md">
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
              {["Mason Thompson", "Sarah Chen", "Lucas Anderson", "Aiden Parker"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
        <button onClick={handleSave} disabled={!form.title || saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Create Task"}
        </button>
      </div>
    </Modal>
  );
}
