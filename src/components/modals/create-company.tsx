"use client";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import { useCRM } from "@/lib/crm-store";

export default function CreateCompanyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    try {
      await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, industry, employeeCount: size ? parseInt(size) : null }),
      });
    } catch {}
    setSaving(false);
    setName(""); setDomain(""); setIndustry(""); setSize("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Company">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Company Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="acme.com"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Industry</label>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Technology"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Employees</label>
            <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="50"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
        <button onClick={handleSave} disabled={!name || saving}
          className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50">
          {saving ? "Creating..." : "Create Company"}
        </button>
      </div>
    </Modal>
  );
}
