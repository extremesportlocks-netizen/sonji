"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { Calendar, Clock, Video, MapPin, Users, Save } from "lucide-react";

interface ScheduleMeetingModalProps { open: boolean; onClose: () => void; }

export default function ScheduleMeetingModal({ open, onClose }: ScheduleMeetingModalProps) {
  const [form, setForm] = useState({ title: "", date: "", startTime: "10:00", endTime: "11:00", type: "virtual", location: "", contact: "", notes: "" });
  const [participants, setParticipants] = useState<string[]>(["Orlando"]);
  const [saving, setSaving] = useState(false);
  const update = (k: string, v: string) => setForm({ ...form, [k]: v });
  const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); onClose(); }, 800); };

  const addParticipant = (name: string) => { if (name && !participants.includes(name)) setParticipants([...participants, name]); };
  const removeParticipant = (name: string) => setParticipants(participants.filter((p) => p !== name));

  return (
    <Modal open={open} onClose={onClose} title="Schedule Meeting" subtitle="Set up a new meeting" size="lg">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Meeting Title *</label>
          <input type="text" placeholder="Product Demo — Vertex Partners" value={form.title} onChange={(e) => update("title", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Date *</label>
            <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Start Time</label>
            <input type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">End Time</label>
            <input type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1.5 block">Meeting Type</label>
          <div className="flex gap-2">
            {[
              { value: "virtual", label: "Virtual", icon: Video, color: "bg-blue-50 text-blue-600 border-blue-200" },
              { value: "in-person", label: "In Person", icon: MapPin, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
              { value: "phone", label: "Phone", icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-200" },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.value} onClick={() => update("type", t.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition flex-1 justify-center ${
                    form.type === t.value ? `${t.color}` : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}>
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
        {form.type === "virtual" && (
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Meeting Link</label>
            <input type="url" placeholder="https://meet.google.com/abc-defg-hij" value={form.location} onChange={(e) => update("location", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        )}
        {form.type === "in-person" && (
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Location</label>
            <input type="text" placeholder="123 Main St, Suite 400" value={form.location} onChange={(e) => update("location", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1.5 block">Participants</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {participants.map((p) => (
              <span key={p} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
                {p}
                <button onClick={() => removeParticipant(p)} className="text-indigo-400 hover:text-indigo-600 ml-0.5">&times;</button>
              </span>
            ))}
          </div>
          <select onChange={(e) => { addParticipant(e.target.value); e.target.value = ""; }}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
            <option value="">Add participant...</option>
            {["Mason Thompson", "Sarah Chen", "Marcus Rivera", "Emily Rodriguez", "Lucas Anderson"].filter((c) => !participants.includes(c)).map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Notes</label>
          <textarea rows={2} placeholder="Agenda, talking points..." value={form.notes} onChange={(e) => update("notes", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
        <button onClick={handleSave} disabled={!form.title || !form.date || saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Scheduling..." : "Schedule Meeting"}
        </button>
      </div>
    </Modal>
  );
}
