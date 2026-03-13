"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { User, Building2, Mail, Phone, Tag, Globe, Save } from "lucide-react";
import { useCRM } from "@/lib/crm-store";

interface CreateContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateContactModal({ open, onClose }: CreateContactModalProps) {
  const { addContact } = useCRM();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", source: "manual", status: "lead", tags: "" });
  const [saving, setSaving] = useState(false);

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const handleSave = () => {
    setSaving(true);
    addContact({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      company: form.company,
      source: form.source,
      status: form.status,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
    setTimeout(() => {
      setSaving(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", company: "", source: "manual", status: "lead", tags: "" });
      onClose();
    }, 500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Contact" subtitle="Create a new contact record" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">First Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="John" value={form.firstName} onChange={(e) => update("firstName", e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Last Name</label>
            <input type="text" placeholder="Doe" value={form.lastName} onChange={(e) => update("lastName", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" placeholder="john@company.com" value={form.email} onChange={(e) => update("email", e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Company</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Acme Inc" value={form.company} onChange={(e) => update("company", e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Source</label>
            <select value={form.source} onChange={(e) => update("source", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
              <option value="manual">Manual Entry</option>
              <option value="form">Intake Form</option>
              <option value="import">CSV Import</option>
              <option value="referral">Referral</option>
              <option value="website">Website</option>
              <option value="social">Social Media</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
            <select value={form.status} onChange={(e) => update("status", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Tags</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="VIP, Enterprise, Q2 (comma separated)" value={form.tags} onChange={(e) => update("tags", e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
        <button onClick={handleSave} disabled={!form.firstName || saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Create Contact"}
        </button>
      </div>
    </Modal>
  );
}
