"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Code, Copy, CheckCircle, ChevronRight, Lock, Globe,
  Users, Handshake, FileText, DollarSign, Calendar, Zap,
} from "lucide-react";

const endpoints = [
  {
    group: "Contacts",
    icon: Users,
    items: [
      { method: "GET", path: "/api/contacts", desc: "List contacts with pagination, filtering, and sorting" },
      { method: "GET", path: "/api/contacts/:id", desc: "Get a single contact by ID" },
      { method: "POST", path: "/api/contacts", desc: "Create a new contact" },
      { method: "PUT", path: "/api/contacts/:id", desc: "Update an existing contact" },
      { method: "DELETE", path: "/api/contacts/:id", desc: "Delete a contact" },
      { method: "POST", path: "/api/contacts/import", desc: "Bulk import contacts from CSV" },
    ],
  },
  {
    group: "Deals",
    icon: Handshake,
    items: [
      { method: "GET", path: "/api/deals", desc: "List deals with pipeline filtering" },
      { method: "POST", path: "/api/deals", desc: "Create a new deal" },
      { method: "PUT", path: "/api/deals/:id", desc: "Update deal (stage, value, etc.)" },
      { method: "DELETE", path: "/api/deals/:id", desc: "Delete a deal" },
    ],
  },
  {
    group: "Tasks",
    icon: FileText,
    items: [
      { method: "GET", path: "/api/tasks", desc: "List tasks with status filtering" },
      { method: "POST", path: "/api/tasks", desc: "Create a new task" },
      { method: "PUT", path: "/api/tasks/:id", desc: "Update task status, assignee, etc." },
      { method: "DELETE", path: "/api/tasks/:id", desc: "Delete a task" },
    ],
  },
  {
    group: "Invoices",
    icon: DollarSign,
    items: [
      { method: "GET", path: "/api/invoices", desc: "List invoices" },
      { method: "POST", path: "/api/invoices", desc: "Create invoice and send to client" },
      { method: "PUT", path: "/api/invoices/:id", desc: "Update invoice status" },
    ],
  },
  {
    group: "Automations",
    icon: Zap,
    items: [
      { method: "GET", path: "/api/automations", desc: "List automations with status" },
      { method: "POST", path: "/api/automations/:id/trigger", desc: "Manually trigger an automation" },
      { method: "PUT", path: "/api/automations/:id", desc: "Enable/disable automation" },
    ],
  },
  {
    group: "Webhooks",
    icon: Globe,
    items: [
      { method: "POST", path: "/api/webhooks", desc: "Register a webhook endpoint" },
      { method: "GET", path: "/api/webhooks", desc: "List registered webhooks" },
      { method: "DELETE", path: "/api/webhooks/:id", desc: "Remove a webhook" },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function APIDocsPage() {
  const [copied, setCopied] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Contacts");

  const apiKey = "sk_live_sonji_••••••••••••••••••••1234";
  const copyKey = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <>
      <Header title="API Documentation" />
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* API Key */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold">Your API Key</h2>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white/10 rounded-lg px-4 py-2.5 text-sm font-mono">{apiKey}</code>
              <button onClick={copyKey} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm">
                {copied ? <><CheckCircle className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">Base URL: <code className="text-gray-300">https://api.sonji.io/v1</code> · Include your API key in the <code className="text-gray-300">Authorization: Bearer</code> header.</p>
          </div>

          {/* Quick Example */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Start</h3>
            <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
              <div className="text-gray-400">{"// List contacts"}</div>
              <div className="text-emerald-400">curl</div>
              <div className="text-white ml-2">-H {`"Authorization: Bearer sk_live_sonji_..."`}</div>
              <div className="text-white ml-2">https://api.sonji.io/v1/contacts?page=1&pageSize=25</div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">Rate Limit</p>
              <p className="text-lg font-bold text-gray-900">1,000 <span className="text-xs text-gray-400 font-normal">req/min</span></p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">Endpoints</p>
              <p className="text-lg font-bold text-gray-900">{endpoints.reduce((s, g) => s + g.items.length, 0)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">Auth</p>
              <p className="text-lg font-bold text-gray-900">Bearer Token</p>
            </div>
          </div>

          {/* Endpoints */}
          <div className="space-y-3">
            {endpoints.map(group => {
              const Icon = group.icon;
              const isExpanded = expandedGroup === group.group;
              return (
                <div key={group.group} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button onClick={() => setExpandedGroup(isExpanded ? null : group.group)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{group.group}</span>
                      <span className="text-[10px] text-gray-400">{group.items.length} endpoints</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {group.items.map((ep, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${methodColors[ep.method]}`}>{ep.method}</span>
                          <code className="text-sm font-mono text-gray-900">{ep.path}</code>
                          <span className="text-xs text-gray-400 ml-auto">{ep.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Webhook Events */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Webhook Events</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                "contact.created", "contact.updated", "contact.deleted",
                "deal.created", "deal.stage_changed", "deal.won", "deal.lost",
                "task.created", "task.completed",
                "payment.received", "payment.failed", "subscription.created",
                "subscription.canceled", "invoice.sent", "invoice.paid",
                "automation.triggered", "form.submitted",
              ].map(event => (
                <code key={event} className="text-xs font-mono text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">{event}</code>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
