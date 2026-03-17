"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import {
  Search, Check, ExternalLink, Zap, Plus, Settings,
  CreditCard, Mail, Phone, MessageSquare, Calendar,
  BarChart3, Globe, Database, Shield, FileText,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  desc: string;
  category: string;
  icon: string;
  status: "connected" | "available" | "coming_soon";
  popular?: boolean;
}

const integrations: Integration[] = [
  // Platform-level (always connected for every tenant)
  { id: "clerk", name: "Clerk", desc: "User authentication, SSO, and team management", category: "Auth", icon: "🔐", status: "connected" },
  { id: "inngest", name: "Inngest", desc: "Background jobs, event-driven workflows, and retries", category: "Infrastructure", icon: "⚡", status: "connected" },

  // Tenant-configured (default to available, dynamically updated on mount)
  { id: "stripe", name: "Stripe", desc: "Payment processing, subscriptions, invoicing, and customer sync", category: "Payments", icon: "💳", status: "available" },
  { id: "resend", name: "Resend", desc: "Transactional and marketing email delivery", category: "Email", icon: "📧", status: "available" },
  { id: "twilio", name: "Twilio", desc: "SMS messaging, voice calls, and 10DLC compliance", category: "SMS", icon: "📱", status: "available" },

  // Available
  { id: "google-calendar", name: "Google Calendar", desc: "Sync meetings, booking pages, and availability", category: "Calendar", icon: "📅", status: "available", popular: true },
  { id: "google-analytics", name: "Google Analytics", desc: "Website traffic, conversions, and attribution tracking", category: "Analytics", icon: "📊", status: "available", popular: true },
  { id: "slack", name: "Slack", desc: "Team notifications, deal alerts, and activity feeds", category: "Communication", icon: "💬", status: "available", popular: true },
  { id: "zapier", name: "Zapier", desc: "Connect to 5,000+ apps with zero-code automations", category: "Automation", icon: "⚡", status: "available", popular: true },
  { id: "quickbooks", name: "QuickBooks", desc: "Accounting sync — invoices, payments, and expenses", category: "Accounting", icon: "📒", status: "available" },
  { id: "google-sheets", name: "Google Sheets", desc: "Export data, reports, and dashboards to spreadsheets", category: "Productivity", icon: "📊", status: "available" },
  { id: "facebook", name: "Facebook Ads", desc: "Lead sync from Facebook/Instagram ad campaigns", category: "Advertising", icon: "📘", status: "available" },
  { id: "google-ads", name: "Google Ads", desc: "PPC campaign sync, conversion tracking, ROAS reporting", category: "Advertising", icon: "🔍", status: "available" },
  { id: "zoom", name: "Zoom", desc: "Video meeting links auto-added to scheduled meetings", category: "Video", icon: "🎥", status: "available" },
  { id: "mailchimp", name: "Mailchimp", desc: "Import existing lists and campaigns (one-way migration)", category: "Email", icon: "🐒", status: "available" },
  { id: "wordpress", name: "WordPress", desc: "Embed forms, sync contacts from WP site submissions", category: "Website", icon: "🌐", status: "available" },
  { id: "hubspot", name: "HubSpot (Import)", desc: "One-click migration from HubSpot — contacts, deals, notes", category: "Migration", icon: "🔄", status: "available" },
  { id: "ghl", name: "GoHighLevel (Import)", desc: "One-click migration from GHL — contacts, pipelines, automations", category: "Migration", icon: "🔄", status: "available" },

  // Coming Soon
  { id: "grapejs", name: "GrapeJS Page Builder", desc: "Drag-and-drop landing pages and funnels — the GHL killer", category: "Website", icon: "🎨", status: "coming_soon" },
  { id: "openai", name: "OpenAI / Claude API", desc: "Custom AI agents per tenant for chat, email drafting, and analysis", category: "AI", icon: "🤖", status: "coming_soon" },
  { id: "google-my-business", name: "Google Business Profile", desc: "Review monitoring, response management, and local SEO", category: "Reviews", icon: "⭐", status: "coming_soon" },
  { id: "shopify", name: "Shopify", desc: "E-commerce sync — orders, customers, and products", category: "E-Commerce", icon: "🛒", status: "coming_soon" },
  { id: "square", name: "Square", desc: "POS integration for retail and restaurant businesses", category: "Payments", icon: "⬛", status: "coming_soon" },
  { id: "whatsapp", name: "WhatsApp Business", desc: "WhatsApp messaging for international customer support", category: "SMS", icon: "💚", status: "coming_soon" },
];

const statusConfig = {
  connected: { label: "Connected", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", dotColor: "bg-emerald-500" },
  available: { label: "Available", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", dotColor: "bg-blue-500" },
  coming_soon: { label: "Coming Soon", color: "text-gray-400", bg: "bg-gray-50 border-gray-200", dotColor: "bg-gray-300" },
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "connected" | "available" | "coming_soon">("all");
  const [items, setItems] = useState(integrations);

  // Check which integrations the tenant actually has connected
  useEffect(() => {
    fetch("/api/tenant-settings")
      .then(r => r.json())
      .then(data => {
        const s = data.settings || {};
        setItems(prev => prev.map(item => {
          if (item.id === "stripe" && s.stripeSecretKey) return { ...item, status: "connected" as const };
          if (item.id === "resend" && s.resendApiKey) return { ...item, status: "connected" as const };
          if (item.id === "twilio" && (s.sms?.subAccountSid || s.twilioAccountSid)) return { ...item, status: "connected" as const };
          return item;
        }));
      })
      .catch(() => {});
  }, []);

  const filtered = items.filter(i => {
    if (search) { const q = search.toLowerCase(); if (!i.name.toLowerCase().includes(q) && !i.desc.toLowerCase().includes(q) && !i.category.toLowerCase().includes(q)) return false; }
    if (filter !== "all" && i.status !== filter) return false;
    return true;
  });

  const connected = items.filter(i => i.status === "connected").length;
  const available = items.filter(i => i.status === "available").length;
  const coming = items.filter(i => i.status === "coming_soon").length;

  return (
    <>
      <Header title="Integrations" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 bg-emerald-500 rounded-full" /><span className="text-xs text-gray-400">Connected</span></div>
            <p className="text-2xl font-bold text-emerald-600">{connected}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /><span className="text-xs text-gray-400">Available</span></div>
            <p className="text-2xl font-bold text-blue-600">{available}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 bg-gray-300 rounded-full" /><span className="text-xs text-gray-400">Coming Soon</span></div>
            <p className="text-2xl font-bold text-gray-400">{coming}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search integrations..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            {(["all", "connected", "available", "coming_soon"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${filter === f ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>
                {f === "all" ? "All" : f === "coming_soon" ? "Coming Soon" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(integ => {
            const sc = statusConfig[integ.status];
            return (
              <div key={integ.id} className={`bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition group ${integ.status === "coming_soon" ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integ.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{integ.name}</h3>
                        {integ.popular && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Popular</span>}
                      </div>
                      <span className="text-[10px] text-gray-400">{integ.category}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} /> {sc.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{integ.desc}</p>
                <div className="flex items-center gap-2">
                  {integ.status === "connected" && (
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                      <Settings className="w-3.5 h-3.5" /> Configure
                    </button>
                  )}
                  {integ.status === "available" && (
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                      <Plus className="w-3.5 h-3.5" /> Connect
                    </button>
                  )}
                  {integ.status === "coming_soon" && (
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed">
                      Coming Soon
                    </button>
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
