"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import {
  Search, Filter, Clock, User, Edit3, Trash2, Plus,
  DollarSign, Users, Settings, Shield, Download, Eye,
} from "lucide-react";

interface AuditEntry {
  id: string;
  user: string;
  action: "created" | "updated" | "deleted" | "exported" | "imported" | "logged_in" | "settings_changed" | "sent";
  resource: string;
  detail: string;
  time: string;
  ip?: string;
}

const actionConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  created: { icon: Plus, color: "text-emerald-600", bg: "bg-emerald-50", label: "Created" },
  updated: { icon: Edit3, color: "text-blue-600", bg: "bg-blue-50", label: "Updated" },
  deleted: { icon: Trash2, color: "text-red-600", bg: "bg-red-50", label: "Deleted" },
  exported: { icon: Download, color: "text-indigo-600", bg: "bg-indigo-50", label: "Exported" },
  imported: { icon: Users, color: "text-violet-600", bg: "bg-violet-50", label: "Imported" },
  logged_in: { icon: Shield, color: "text-gray-600", bg: "bg-gray-50", label: "Login" },
  settings_changed: { icon: Settings, color: "text-amber-600", bg: "bg-amber-50", label: "Settings" },
  sent: { icon: Eye, color: "text-teal-600", bg: "bg-teal-50", label: "Sent" },
};

const DEMO_LOG: AuditEntry[] = [
  { id: "a1", user: "Orlando", action: "logged_in", resource: "System", detail: "Logged in from Chrome on macOS", time: "2 min ago", ip: "73.42.xxx.xxx" },
  { id: "a2", user: "Rocco", action: "updated", resource: "Contact", detail: "Updated Meridian Law Group — added SEO redirect map notes", time: "15 min ago" },
  { id: "a3", user: "Colton", action: "created", resource: "Project", detail: "Created project 'Brand Refresh' for Summit Athletics ($12K budget)", time: "1 hour ago" },
  { id: "a4", user: "System", action: "sent", resource: "Automation", detail: "Renewal alert email sent to Coastal Real Estate", time: "2 hours ago" },
  { id: "a5", user: "Rocco", action: "updated", resource: "Deal", detail: "Moved 'Apex Construction Social Media' from Discovery → Proposal", time: "3 hours ago" },
  { id: "a6", user: "Orlando", action: "exported", resource: "Report", detail: "Exported March client report for Brightview Hotels", time: "4 hours ago" },
  { id: "a7", user: "System", action: "imported", resource: "Contacts", detail: "Stripe sync completed — 12 new contacts added", time: "5 hours ago" },
  { id: "a8", user: "Colton", action: "sent", resource: "Email", detail: "Sent proposal email to Summit Athletics", time: "6 hours ago" },
  { id: "a9", user: "Mike", action: "updated", resource: "Task", detail: "Completed 'Meridian website QA — Browser testing'", time: "7 hours ago" },
  { id: "a10", user: "Orlando", action: "settings_changed", resource: "Settings", detail: "Updated Twilio phone number to (239) 555-0100", time: "Yesterday" },
  { id: "a11", user: "Sarah", action: "created", resource: "Email Template", detail: "Created template 'Brand Review Invitation'", time: "Yesterday" },
  { id: "a12", user: "Rocco", action: "deleted", resource: "Contact", detail: "Deleted duplicate contact 'John Smith (duplicate)'", time: "Yesterday" },
  { id: "a13", user: "System", action: "sent", resource: "Automation", detail: "3 new lead auto-responses sent", time: "Yesterday" },
  { id: "a14", user: "Orlando", action: "logged_in", resource: "System", detail: "Logged in from iPhone Safari", time: "2 days ago", ip: "73.42.xxx.xxx" },
  { id: "a15", user: "Colton", action: "logged_in", resource: "System", detail: "Logged in from Chrome on Windows", time: "2 days ago", ip: "98.17.xxx.xxx" },
];

export default function AuditLogPage() {
  const [log, setLog] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    // Check if we should show demo data (ESL admin brain mode only)
    const demoKey = (() => {
      try {
        if (typeof window === "undefined") return null;
        const verified = sessionStorage.getItem("sonji-tenant-verified");
        if (verified !== "true") return localStorage.getItem("sonji-demo-industry") || "ecommerce";
        const user = JSON.parse(sessionStorage.getItem("sonji-user") || "{}");
        if (user.email === "contact@extremesportlocks.com") {
          const dk = localStorage.getItem("sonji-demo-industry");
          const tenant = JSON.parse(sessionStorage.getItem("sonji-tenant") || "{}");
          if (dk && dk !== tenant.industry) return dk;
        }
        return null;
      } catch { return null; }
    })();

    if (demoKey) {
      setLog(DEMO_LOG);
      return;
    }

    // Real tenant — fetch real audit log
    fetch("/api/audit-log?limit=50").then(r => r.json()).then(data => {
      if (data?.data?.length) {
        setLog(data.data.map((e: any) => ({
          id: e.id, user: e.userId?.substring(0, 8) || "System",
          action: e.action?.includes("created") ? "created" : e.action?.includes("updated") ? "updated" : e.action?.includes("deleted") ? "deleted" : e.action?.includes("import") ? "imported" : "logged_in",
          resource: e.action?.split(".")[0] || "System",
          detail: JSON.stringify(e.metadata || {}).substring(0, 100),
          time: new Date(e.createdAt).toLocaleDateString(),
        })));
      }
    }).catch(() => {});
  }, []);

  const filtered = log.filter(e => {
    if (search) { const q = search.toLowerCase(); if (!e.user.toLowerCase().includes(q) && !e.detail.toLowerCase().includes(q) && !e.resource.toLowerCase().includes(q)) return false; }
    if (filterAction !== "all" && e.action !== filterAction) return false;
    return true;
  });

  return (
    <>
      <Header title="Audit Log" />
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit log..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="sent">Sent</option>
                <option value="exported">Exported</option>
                <option value="imported">Imported</option>
                <option value="logged_in">Logins</option>
                <option value="settings_changed">Settings</option>
              </select>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition">
              <Download className="w-3.5 h-3.5" /> Export Log
            </button>
          </div>

          {/* Log */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filtered.map(entry => {
                const ac = actionConfig[entry.action];
                const Icon = ac.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition">
                    <div className={`w-8 h-8 rounded-lg ${ac.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${ac.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-gray-900">{entry.user}</span>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${ac.bg} ${ac.color}`}>{ac.label}</span>
                        <span className="text-xs text-gray-400">{entry.resource}</span>
                      </div>
                      <p className="text-xs text-gray-500">{entry.detail}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{entry.time}</span>
                        {entry.ip && <span className="text-[10px] text-gray-300 font-mono">{entry.ip}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
