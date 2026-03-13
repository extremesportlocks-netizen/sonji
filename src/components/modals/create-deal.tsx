"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { Handshake, DollarSign, Calendar, User, Save } from "lucide-react";
import { useCRM } from "@/lib/crm-store";

interface CreateDealModalProps {
  open: boolean;
  onClose: () => void;
}

const stages = ["Lead", "Sales Qualified", "Meeting Booked", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];
const pipelines = ["Default Pipeline", "Enterprise Pipeline", "Inbound Pipeline"];

export default function CreateDealModal({ open, onClose }: CreateDealModalProps) {
  const { addDeal, contacts } = useCRM();
  const contactNames = contacts.map((c) => `${c.firstName} ${c.lastName}`);
  const teamMembers = ["Orlando", "Sarah Chen", "Marcus Rivera", "Emily Rodriguez"];
  const [form, setForm] = useState({ title: "", value: "", stage: "Lead", pipeline: "Default Pipeline", contact: "", assignee: "Orlando", closeDate: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });
  const handleSave = () => {
    setSaving(true);
    addDeal({
      title: form.title,
      value: parseFloat(form.value) || 0,
      stage: form.stage,
      pipeline: form.pipeline,
      contactId: "",
      contactName: form.contact,
      assignedTo: form.assignee,
      closeDate: form.closeDate,
      notes: form.notes,
    });
    setTimeout(() => {
      setSaving(false);
      setForm({ title: "", value: "", stage: "Lead", pipeline: "Default Pipeline", contact: "", assignee: "Orlando", closeDate: "", notes: "" });
      onClose();
    }, 500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Deal" subtitle="Add a new deal to your pipeline" size="lg">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Deal Title *</label>
          <div className="relative">
            <Handshake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Enterprise Platform Migration" value={form.title} onChange={(e) => update("title", e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Value</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="number" placeholder="25,000" value={form.value} onChange={(e) => update("value", e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Expected Close</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="date" value={form.closeDate} onChange={(e) => update("closeDate", e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Pipeline</label>
            <select value={form.pipeline} onChange={(e) => update("pipeline", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
              {pipelines.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Stage</label>
            <select value={form.stage} onChange={(e) => update("stage", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
              {stages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Contact</label>
            <select value={form.contact} onChange={(e) => update("contact", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
              <option value="">Select contact...</option>
              {contactNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Assigned To</label>
            <select value={form.assignee} onChange={(e) => update("assignee", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
              {teamMembers.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Notes</label>
          <textarea rows={3} placeholder="Add any notes about this deal..." value={form.notes} onChange={(e) => update("notes", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 resize-none" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
        <button onClick={handleSave} disabled={!form.title || saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Create Deal"}
        </button>
      </div>
    </Modal>
  );
}
