"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, Users, Crown, UserCheck, UserX, TrendingUp, ShoppingCart,
  Handshake, CheckSquare, Send, Activity, Calendar, ChevronDown, Palette,
  Settings2, X, Check, BarChart3, Zap, Target, ArrowUpRight,
} from "lucide-react";

// ═══════════════════════════════════════
// METRIC REGISTRY — Every measurable thing in the CRM
// ═══════════════════════════════════════

interface MetricDef {
  key: string;
  label: string;
  shortLabel: string;
  category: string;
  icon: React.ElementType;
  format: "currency" | "number" | "percent";
  extract: (s: any) => number;
}

const metrics: MetricDef[] = [
  // Revenue
  { key: "total_revenue", label: "Total Lifetime Revenue", shortLabel: "Revenue", category: "Revenue", icon: DollarSign, format: "currency", extract: (s) => s.revenue?.total || 0 },
  { key: "avg_ltv", label: "Average Customer LTV", shortLabel: "Avg LTV", category: "Revenue", icon: TrendingUp, format: "currency", extract: (s) => s.revenue?.avgLTV || 0 },
  { key: "avg_order", label: "Average Order Value", shortLabel: "Avg Order", category: "Revenue", icon: ShoppingCart, format: "currency", extract: (s) => s.revenue?.avgOrder || 0 },
  { key: "total_transactions", label: "Total Transactions", shortLabel: "Transactions", category: "Revenue", icon: BarChart3, format: "number", extract: (s) => s.revenue?.totalPurchases || 0 },
  { key: "paying_customers", label: "Paying Customers", shortLabel: "Paying", category: "Revenue", icon: DollarSign, format: "number", extract: (s) => s.revenue?.contactsWithPurchases || 0 },

  // Contacts
  { key: "total_contacts", label: "Total Contacts", shortLabel: "Contacts", category: "Contacts", icon: Users, format: "number", extract: (s) => s.totalContacts || 0 },
  { key: "whales", label: "High Value Clients ($500+)", shortLabel: "High Value", category: "Contacts", icon: Crown, format: "number", extract: (s) => s.ltvBuckets?.whale || 0 },
  { key: "mid_tier", label: "Mid-Tier Customers ($200-499)", shortLabel: "Mid-Tier", category: "Contacts", icon: Users, format: "number", extract: (s) => s.ltvBuckets?.mid || 0 },
  { key: "low_tier", label: "Low-Tier Customers (<$200)", shortLabel: "Low-Tier", category: "Contacts", icon: Users, format: "number", extract: (s) => s.ltvBuckets?.low || 0 },

  // Subscriptions
  { key: "active_subs", label: "Active Subscribers", shortLabel: "Active Subs", category: "Subscriptions", icon: UserCheck, format: "number", extract: (s) => s.subscriptionBreakdown?.active || 0 },
  { key: "canceled_subs", label: "Canceled Subscriptions", shortLabel: "Canceled", category: "Subscriptions", icon: UserX, format: "number", extract: (s) => s.subscriptionBreakdown?.canceled || 0 },
  { key: "lapsed", label: "Lapsed Customers", shortLabel: "Lapsed", category: "Subscriptions", icon: UserX, format: "number", extract: (s) => s.subscriptionBreakdown?.canceled || 0 },

  // Deals
  { key: "total_deals", label: "Total Deals", shortLabel: "Deals", category: "Pipeline", icon: Handshake, format: "number", extract: (s) => s.totalDeals || 0 },
  { key: "active_deals", label: "Active Deals", shortLabel: "Active Deals", category: "Pipeline", icon: Handshake, format: "number", extract: (s) => s.activeDeals || 0 },
  { key: "won_deals", label: "Won Deals", shortLabel: "Won", category: "Pipeline", icon: Target, format: "number", extract: (s) => s.wonDeals || 0 },

  // Tasks
  { key: "open_tasks", label: "Open Tasks", shortLabel: "Open Tasks", category: "Tasks", icon: CheckSquare, format: "number", extract: (s) => s.openTasks || 0 },
  { key: "total_tasks", label: "Total Tasks", shortLabel: "Tasks", category: "Tasks", icon: CheckSquare, format: "number", extract: (s) => s.totalTasks || 0 },
];

const defaultSlots = ["total_revenue", "total_contacts", "active_subs", "whales", "avg_ltv"];

const gradientPresets = [
  { name: "Midnight", from: "#0f172a", to: "#1e293b" },
  { name: "Violet", from: "#4c1d95", to: "#6d28d9" },
  { name: "Ocean", from: "#0c4a6e", to: "#0369a1" },
  { name: "Emerald", from: "#064e3b", to: "#047857" },
  { name: "Rose", from: "#881337", to: "#be123c" },
  { name: "Amber", from: "#78350f", to: "#b45309" },
  { name: "Slate", from: "#1e293b", to: "#334155" },
  { name: "Indigo", from: "#312e81", to: "#4338ca" },
];

interface SonjiBoxConfig {
  slots: string[];
  gradientFrom: string;
  gradientTo: string;
}

// Industry-specific presets for demo mode
const INDUSTRY_PRESETS: Record<string, { slots: string[]; from: string; to: string }> = {
  health_wellness: { slots: ["total_revenue", "total_contacts", "active_subs", "whales", "avg_order"], from: "#0c4a6e", to: "#0369a1" },
  fitness_gym: { slots: ["active_subs", "total_contacts", "total_revenue", "avg_ltv", "open_tasks"], from: "#064e3b", to: "#047857" },
  beauty_salon: { slots: ["total_revenue", "total_contacts", "active_subs", "avg_order", "whales"], from: "#881337", to: "#be123c" },
  agency_consulting: { slots: ["total_revenue", "active_subs", "total_deals", "avg_ltv", "avg_order"], from: "#312e81", to: "#4338ca" },
  real_estate: { slots: ["total_deals", "active_deals", "total_revenue", "total_contacts", "won_deals"], from: "#78350f", to: "#b45309" },
  home_services: { slots: ["total_revenue", "total_deals", "active_deals", "avg_order", "total_contacts"], from: "#1e293b", to: "#334155" },
  legal: { slots: ["active_deals", "total_revenue", "total_contacts", "avg_ltv", "avg_order"], from: "#0f172a", to: "#1e293b" },
  coaching_education: { slots: ["active_subs", "total_revenue", "total_deals", "total_contacts", "avg_ltv"], from: "#4c1d95", to: "#6d28d9" },
  restaurant_food: { slots: ["total_revenue", "total_contacts", "active_subs", "avg_order", "whales"], from: "#881337", to: "#9f1239" },
  automotive: { slots: ["total_revenue", "total_deals", "active_deals", "avg_order", "total_contacts"], from: "#1e293b", to: "#334155" },
  nonprofit: { slots: ["total_revenue", "active_subs", "total_contacts", "avg_order", "whales"], from: "#064e3b", to: "#047857" },
  ecommerce: { slots: ["total_revenue", "total_contacts", "active_subs", "whales", "avg_ltv"], from: "#0f172a", to: "#1e293b" },
};

// Industry-specific label overrides
const INDUSTRY_LABELS: Record<string, Record<string, string>> = {
  health_wellness: { total_contacts: "Patients", active_subs: "Active Patients", whales: "VIP Patients", total_revenue: "Revenue", avg_order: "Avg Treatment" },
  fitness_gym: { total_contacts: "Members", active_subs: "Active Members", whales: "VIP Members", total_revenue: "Revenue", open_tasks: "At Risk" },
  beauty_salon: { total_contacts: "Clients", active_subs: "Regulars", whales: "VIP Clients", total_revenue: "Revenue", avg_order: "Avg Ticket" },
  agency_consulting: { total_contacts: "Contacts", active_subs: "Active Retainers", total_deals: "Pipeline Deals", avg_ltv: "Avg Client Value", avg_order: "Avg Retainer", total_revenue: "MRR" },
  real_estate: { total_deals: "Active Deals", active_deals: "In Pipeline", total_revenue: "Commission YTD", total_contacts: "In Sphere", won_deals: "Closed" },
  home_services: { total_deals: "Jobs", active_deals: "Estimates Out", avg_order: "Avg Job Value", total_revenue: "Revenue", total_contacts: "Customers" },
  legal: { active_deals: "Active Cases", total_revenue: "Revenue", total_contacts: "Clients", avg_ltv: "Avg Case Value", avg_order: "Avg Retainer" },
  coaching_education: { active_subs: "Active Clients", total_revenue: "Revenue", total_deals: "In Pipeline", total_contacts: "Leads", avg_ltv: "Avg Program" },
  restaurant_food: { total_revenue: "Revenue", total_contacts: "Customers", active_subs: "Regulars", avg_order: "Avg Check", whales: "VIP Diners" },
  automotive: { total_revenue: "Revenue", total_deals: "Work Orders", active_deals: "In Shop", avg_order: "Avg Repair", total_contacts: "Customers" },
  nonprofit: { total_revenue: "Donations", active_subs: "Active Donors", total_contacts: "Supporters", avg_order: "Avg Gift", whales: "Major Donors" },
};

function loadConfig(): SonjiBoxConfig {
  if (typeof window === "undefined") return { slots: defaultSlots, gradientFrom: "#0f172a", gradientTo: "#1e293b" };
  try {
    const s = localStorage.getItem("sonji-box-config");
    if (s) return JSON.parse(s);
  } catch {}
  return { slots: defaultSlots, gradientFrom: "#0f172a", gradientTo: "#1e293b" };
}

function saveConfig(c: SonjiBoxConfig) {
  try { localStorage.setItem("sonji-box-config", JSON.stringify(c)); } catch {}
}

function formatValue(n: number, fmt: "currency" | "number" | "percent") {
  if (fmt === "currency") return n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`;
  if (fmt === "percent") return `${n.toFixed(1)}%`;
  return n.toLocaleString();
}

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════

export default function SonjiBox({ stats }: { stats: any }) {
  const [config, setConfig] = useState<SonjiBoxConfig>(loadConfig);
  const [editing, setEditing] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [demoIndustry, setDemoIndustry] = useState<string | null>(null);

  useEffect(() => {
    const key = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    setDemoIndustry(key && key !== "ecommerce" ? key : null);
  }, []);

  // In demo mode, use industry presets
  const effectiveConfig = demoIndustry && INDUSTRY_PRESETS[demoIndustry]
    ? { slots: INDUSTRY_PRESETS[demoIndustry].slots, gradientFrom: INDUSTRY_PRESETS[demoIndustry].from, gradientTo: INDUSTRY_PRESETS[demoIndustry].to }
    : config;

  // Industry-specific label overrides
  const labelOverrides = demoIndustry ? (INDUSTRY_LABELS[demoIndustry] || {}) : {};

  const updateConfig = (next: Partial<SonjiBoxConfig>) => {
    const updated = { ...config, ...next };
    setConfig(updated);
    saveConfig(updated);
  };

  const setSlotMetric = (slotIdx: number, metricKey: string) => {
    const next = [...config.slots];
    next[slotIdx] = metricKey;
    updateConfig({ slots: next });
    setEditingSlot(null);
  };

  const slotMetrics = effectiveConfig.slots.map(key => metrics.find(m => m.key === key)).filter(Boolean) as MetricDef[];

  // Group metrics by category for picker
  const categories = Array.from(new Set(metrics.map(m => m.category)));

  return (
    <div className="relative rounded-2xl" style={{ background: `linear-gradient(135deg, ${effectiveConfig.gradientFrom}, ${effectiveConfig.gradientTo})` }}>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-4 h-4 text-white/80" />
            </div>
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">sonji</span>
          </div>
          {!demoIndustry && (
            <button onClick={() => { setEditing(!editing); setEditingSlot(null); setShowColorPicker(false); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium rounded-lg transition ${
                editing ? "bg-white/20 text-white" : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60"
              }`}>
              <Settings2 className="w-3 h-3" /> {editing ? "Done" : "Edit"}
            </button>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-5 gap-3">
          {slotMetrics.map((m, i) => {
            const value = m.extract(stats);
            const Icon = m.icon;
            return (
              <div key={`${m.key}-${i}`}
                onClick={() => editing && setEditingSlot(editingSlot === i ? null : i)}
                className={`relative text-center p-3 rounded-xl transition ${
                  editing ? "cursor-pointer bg-white/5 hover:bg-white/10 border border-dashed border-white/20" :
                  "bg-white/[0.06]"
                } ${editingSlot === i ? "ring-2 ring-white/40" : ""}`}>
                <Icon className="w-4 h-4 text-white/30 mx-auto mb-1.5" />
                <p className="text-2xl font-bold text-white tracking-tight">{formatValue(value, m.format)}</p>
                <p className="text-[10px] text-white/40 mt-1 font-medium">{labelOverrides[m.key] || m.shortLabel}</p>
                {editing && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <ChevronDown className="w-2.5 h-2.5 text-white/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Color Picker */}
        {editing && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <button onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-1.5 text-[10px] font-medium text-white/40 hover:text-white/60 transition">
                <Palette className="w-3 h-3" /> {showColorPicker ? "Hide Colors" : "Change Colors"}
              </button>
            </div>
            {showColorPicker && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {gradientPresets.map(g => (
                  <button key={g.name} onClick={() => updateConfig({ gradientFrom: g.from, gradientTo: g.to })}
                    className={`w-8 h-8 rounded-lg border-2 transition ${
                      config.gradientFrom === g.from ? "border-white scale-110" : "border-transparent hover:border-white/30"
                    }`}
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                    title={g.name} />
                ))}
                <div className="flex items-center gap-1 ml-2">
                  <input type="color" value={config.gradientFrom} onChange={(e) => updateConfig({ gradientFrom: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0" title="Custom from" />
                  <span className="text-[10px] text-white/30">→</span>
                  <input type="color" value={config.gradientTo} onChange={(e) => updateConfig({ gradientTo: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0" title="Custom to" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metric Picker Dropdown */}
      {editingSlot !== null && (
        <div className="absolute inset-x-0 bottom-0 translate-y-full z-50 mt-2">
          <div className="mx-6 mb-4 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-72 overflow-y-auto">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-900">Choose metric for slot {editingSlot + 1}</p>
              <button onClick={() => setEditingSlot(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
            </div>
            {categories.map(cat => (
              <div key={cat}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">{cat}</p>
                {metrics.filter(m => m.category === cat).map(m => {
                  const isActive = effectiveConfig.slots[editingSlot] === m.key;
                  const Icon = m.icon;
                  return (
                    <button key={m.key} onClick={() => setSlotMetric(editingSlot, m.key)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 transition ${isActive ? "bg-indigo-50" : ""}`}>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${isActive ? "text-indigo-700 font-semibold" : "text-gray-700"}`}>{m.label}</p>
                        <p className="text-[10px] text-gray-400">Current: {formatValue(m.extract(stats), m.format)}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
