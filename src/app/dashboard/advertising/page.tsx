"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  Megaphone, TrendingUp, TrendingDown, DollarSign, Users, MousePointerClick,
  Eye, Target, AlertTriangle, ArrowUpRight, ArrowDownRight, ExternalLink,
  Search, SlidersHorizontal, ChevronDown, BarChart3, Zap, RefreshCw,
  Filter, ArrowRight, Crown, Ban, Clock, Loader2,
} from "lucide-react";

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

interface AdAccount {
  id: string;
  clientName: string;
  platform: "meta" | "google";
  accountId: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  ctr: number;
  roas: number;
  crmRevenue: number;
  campaigns: number;
  activeCampaigns: number;
  status: "active" | "paused" | "review";
  trend: number; // percent change from last period
}

interface Campaign {
  id: string;
  name: string;
  client: string;
  platform: "meta" | "google";
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  roas: number;
  status: "active" | "paused" | "ended";
  adSets: number;
}

interface Alert {
  id: string;
  type: "overspend" | "low_roas" | "no_leads" | "budget_cap" | "high_cpl";
  severity: "critical" | "warning" | "info";
  client: string;
  campaign: string;
  platform: "meta" | "google";
  message: string;
  metric: string;
}

interface LeadAttribution {
  id: string;
  contactName: string;
  email: string;
  source: string;
  campaign: string;
  platform: "meta" | "google";
  client: string;
  adSpend: number;
  crmValue: number;
  date: string;
}

// ═══════════════════════════════════════
// DEMO DATA — AGENCY CONSULTING
// ═══════════════════════════════════════

const AGENCY_ACCOUNTS: AdAccount[] = [
  { id: "acc-1", clientName: "Meridian Dental Group", platform: "meta", accountId: "act_2847191", spend: 12400, impressions: 892000, clicks: 14200, leads: 187, cpl: 66.31, ctr: 1.59, roas: 4.2, crmRevenue: 52080, campaigns: 6, activeCampaigns: 4, status: "active", trend: 12 },
  { id: "acc-2", clientName: "Meridian Dental Group", platform: "google", accountId: "847-291-4821", spend: 8200, impressions: 445000, clicks: 18900, leads: 142, cpl: 57.75, ctr: 4.25, roas: 5.1, crmRevenue: 41820, campaigns: 8, activeCampaigns: 5, status: "active", trend: 8 },
  { id: "acc-3", clientName: "Apex Fitness Studios", platform: "meta", accountId: "act_3918274", spend: 18700, impressions: 1240000, clicks: 22100, leads: 312, cpl: 59.94, ctr: 1.78, roas: 3.8, crmRevenue: 71060, campaigns: 9, activeCampaigns: 7, status: "active", trend: -3 },
  { id: "acc-4", clientName: "Apex Fitness Studios", platform: "google", accountId: "291-847-3928", spend: 6800, impressions: 312000, clicks: 9400, leads: 89, cpl: 76.40, ctr: 3.01, roas: 2.9, crmRevenue: 19720, campaigns: 4, activeCampaigns: 3, status: "active", trend: -8 },
  { id: "acc-5", clientName: "Coastal Living Realty", platform: "meta", accountId: "act_5827391", spend: 24500, impressions: 1820000, clicks: 31200, leads: 94, cpl: 260.64, ctr: 1.71, roas: 8.6, crmRevenue: 210700, campaigns: 5, activeCampaigns: 3, status: "active", trend: 22 },
  { id: "acc-6", clientName: "Coastal Living Realty", platform: "google", accountId: "193-482-7291", spend: 31200, impressions: 920000, clicks: 42100, leads: 127, cpl: 245.67, ctr: 4.58, roas: 7.2, crmRevenue: 224640, campaigns: 12, activeCampaigns: 9, status: "active", trend: 15 },
  { id: "acc-7", clientName: "Harbor Law Associates", platform: "meta", accountId: "act_6182947", spend: 9800, impressions: 620000, clicks: 8900, leads: 43, cpl: 227.91, ctr: 1.44, roas: 6.4, crmRevenue: 62720, campaigns: 3, activeCampaigns: 2, status: "active", trend: 5 },
  { id: "acc-8", clientName: "Harbor Law Associates", platform: "google", accountId: "482-193-8271", spend: 15600, impressions: 380000, clicks: 14200, leads: 67, cpl: 232.84, ctr: 3.74, roas: 5.8, crmRevenue: 90480, campaigns: 7, activeCampaigns: 5, status: "active", trend: -2 },
  { id: "acc-9", clientName: "Brightside Pediatrics", platform: "meta", accountId: "act_7291048", spend: 7200, impressions: 580000, clicks: 9800, leads: 156, cpl: 46.15, ctr: 1.69, roas: 3.4, crmRevenue: 24480, campaigns: 4, activeCampaigns: 3, status: "active", trend: 18 },
  { id: "acc-10", clientName: "Verde Landscaping", platform: "meta", accountId: "act_8291047", spend: 4200, impressions: 320000, clicks: 5400, leads: 78, cpl: 53.85, ctr: 1.69, roas: 2.1, crmRevenue: 8820, campaigns: 3, activeCampaigns: 2, status: "active", trend: -12 },
  { id: "acc-11", clientName: "Verde Landscaping", platform: "google", accountId: "384-291-4820", spend: 3100, impressions: 180000, clicks: 6200, leads: 52, cpl: 59.62, ctr: 3.44, roas: 2.4, crmRevenue: 7440, campaigns: 3, activeCampaigns: 2, status: "active", trend: -5 },
  { id: "acc-12", clientName: "LuxeAuto Detailing", platform: "meta", accountId: "act_9201847", spend: 5800, impressions: 410000, clicks: 7200, leads: 94, cpl: 61.70, ctr: 1.76, roas: 3.2, crmRevenue: 18560, campaigns: 4, activeCampaigns: 3, status: "active", trend: 7 },
  { id: "acc-13", clientName: "Summit Home Inspections", platform: "google", accountId: "291-384-5820", spend: 2800, impressions: 145000, clicks: 4800, leads: 61, cpl: 45.90, ctr: 3.31, roas: 4.1, crmRevenue: 11480, campaigns: 3, activeCampaigns: 3, status: "active", trend: 14 },
  { id: "acc-14", clientName: "Rosewood Spa & Salon", platform: "meta", accountId: "act_1029384", spend: 8900, impressions: 720000, clicks: 12400, leads: 201, cpl: 44.28, ctr: 1.72, roas: 3.6, crmRevenue: 32040, campaigns: 5, activeCampaigns: 4, status: "active", trend: 9 },
  { id: "acc-15", clientName: "TrueNorth Financial", platform: "meta", accountId: "act_2039481", spend: 11200, impressions: 680000, clicks: 9100, leads: 38, cpl: 294.74, ctr: 1.34, roas: 9.2, crmRevenue: 103040, campaigns: 3, activeCampaigns: 2, status: "active", trend: 4 },
  { id: "acc-16", clientName: "TrueNorth Financial", platform: "google", accountId: "192-384-9281", spend: 14800, impressions: 420000, clicks: 11200, leads: 51, cpl: 290.20, ctr: 2.67, roas: 8.8, crmRevenue: 130240, campaigns: 6, activeCampaigns: 4, status: "active", trend: 11 },
];

const TOP_CAMPAIGNS: Campaign[] = [
  { id: "cp-1", name: "Luxury Listings — Waterfront", client: "Coastal Living Realty", platform: "meta", spend: 8200, impressions: 620000, clicks: 10400, leads: 28, cpl: 292.86, roas: 12.4, status: "active", adSets: 4 },
  { id: "cp-2", name: "Google Search — Estate Planning", client: "Harbor Law Associates", platform: "google", spend: 6400, impressions: 142000, clicks: 5800, leads: 31, cpl: 206.45, roas: 8.2, status: "active", adSets: 6 },
  { id: "cp-3", name: "High Net Worth — Retirement", client: "TrueNorth Financial", platform: "google", spend: 7200, impressions: 180000, clicks: 4800, leads: 22, cpl: 327.27, roas: 11.6, status: "active", adSets: 3 },
  { id: "cp-4", name: "New Patient — Invisalign", client: "Meridian Dental Group", platform: "meta", spend: 4100, impressions: 310000, clicks: 5200, leads: 67, cpl: 61.19, roas: 5.8, status: "active", adSets: 3 },
  { id: "cp-5", name: "January Challenge — Signup", client: "Apex Fitness Studios", platform: "meta", spend: 6800, impressions: 520000, clicks: 9200, leads: 142, cpl: 47.89, roas: 4.6, status: "active", adSets: 5 },
  { id: "cp-6", name: "Wedding Season — Bridal Pkg", client: "Rosewood Spa & Salon", platform: "meta", spend: 3200, impressions: 280000, clicks: 4800, leads: 89, cpl: 35.96, roas: 4.2, status: "active", adSets: 2 },
  { id: "cp-7", name: "Google Search — Home Inspection", client: "Summit Home Inspections", platform: "google", spend: 1800, impressions: 82000, clicks: 2900, leads: 38, cpl: 47.37, roas: 5.4, status: "active", adSets: 4 },
  { id: "cp-8", name: "Spring Cleanup — Retainer", client: "Verde Landscaping", platform: "meta", spend: 1400, impressions: 110000, clicks: 1800, leads: 22, cpl: 63.64, roas: 1.8, status: "active", adSets: 2 },
];

const ALERTS: Alert[] = [
  { id: "al-1", type: "low_roas", severity: "critical", client: "Verde Landscaping", campaign: "Spring Cleanup — Retainer", platform: "meta", message: "ROAS dropped below 2.0x — campaign may not be profitable after costs", metric: "1.8x ROAS" },
  { id: "al-2", type: "high_cpl", severity: "warning", client: "TrueNorth Financial", campaign: "High Net Worth — Retirement", platform: "google", message: "CPL of $327 is 18% above your $275 target for this vertical", metric: "$327 CPL" },
  { id: "al-3", type: "no_leads", severity: "warning", client: "Apex Fitness Studios", campaign: "Google PMax — Local", platform: "google", message: "0 leads in the last 48 hours despite $420 spend", metric: "0 leads / 48h" },
  { id: "al-4", type: "overspend", severity: "info", client: "Coastal Living Realty", campaign: "Luxury Listings — Waterfront", platform: "meta", message: "Spend is 12% over the monthly budget — adjust or approve overage", metric: "112% of budget" },
  { id: "al-5", type: "budget_cap", severity: "info", client: "Meridian Dental Group", campaign: "Emergency Dental — After Hours", platform: "google", message: "Daily budget cap hit 5 of last 7 days — potential leads being missed", metric: "5/7 days capped" },
];

const LEAD_ATTRIBUTIONS: LeadAttribution[] = [
  { id: "la-1", contactName: "Sarah Mitchell", email: "sarah.m@gmail.com", source: "Facebook Lead Ad", campaign: "January Challenge — Signup", platform: "meta", client: "Apex Fitness Studios", adSpend: 4.20, crmValue: 1200, date: "2h ago" },
  { id: "la-2", contactName: "James Rodriguez", email: "jrodriguez@outlook.com", source: "Google Search", campaign: "Google Search — Estate Planning", platform: "google", client: "Harbor Law Associates", adSpend: 142.00, crmValue: 8500, date: "3h ago" },
  { id: "la-3", contactName: "Emily Chen", email: "emily.c@icloud.com", source: "Instagram Story Ad", campaign: "Wedding Season — Bridal Pkg", platform: "meta", client: "Rosewood Spa & Salon", adSpend: 8.40, crmValue: 420, date: "4h ago" },
  { id: "la-4", contactName: "Michael Torres", email: "mtorres@gmail.com", source: "Google Search", campaign: "New Patient — Invisalign", platform: "google", client: "Meridian Dental Group", adSpend: 52.00, crmValue: 4800, date: "5h ago" },
  { id: "la-5", contactName: "Jessica Brown", email: "jbrown@yahoo.com", source: "Facebook Carousel", campaign: "Luxury Listings — Waterfront", platform: "meta", client: "Coastal Living Realty", adSpend: 18.60, crmValue: 12400, date: "6h ago" },
  { id: "la-6", contactName: "David Park", email: "dpark@gmail.com", source: "Google Display", campaign: "High Net Worth — Retirement", platform: "google", client: "TrueNorth Financial", adSpend: 88.00, crmValue: 24000, date: "8h ago" },
];

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function fmt(n: number) { return n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`; }
function num(n: number) { return n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : n.toLocaleString(); }
function pct(n: number) { return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`; }

function PlatformBadge({ platform }: { platform: "meta" | "google" }) {
  return platform === "meta" ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-600 border border-blue-100">
      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[7px] font-black">f</span>
      Meta
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
      <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 flex items-center justify-center text-white text-[7px] font-black">G</span>
      Google
    </span>
  );
}

function TrendBadge({ trend }: { trend: number }) {
  if (trend > 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
      <ArrowUpRight className="w-3 h-3" />{trend}%
    </span>
  );
  if (trend < 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500">
      <ArrowDownRight className="w-3 h-3" />{Math.abs(trend)}%
    </span>
  );
  return <span className="text-[10px] text-gray-400">—</span>;
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════

export default function AdvertisingPage() {
  const ic = useIndustry();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [platformFilter, setPlatformFilter] = useState<"all" | "meta" | "google">("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"clients" | "campaigns" | "attribution">("clients");
  const [sortBy, setSortBy] = useState<string>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Filter accounts
  const accounts = useMemo(() => {
    let filtered = AGENCY_ACCOUNTS;
    if (platformFilter !== "all") filtered = filtered.filter(a => a.platform === platformFilter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a => a.clientName.toLowerCase().includes(q) || a.accountId.includes(q));
    }
    return filtered;
  }, [platformFilter, search]);

  // Aggregate by client
  const clientAgg = useMemo(() => {
    const map = new Map<string, { name: string; totalSpend: number; totalLeads: number; totalRevenue: number; totalImpressions: number; totalClicks: number; accounts: AdAccount[]; avgTrend: number }>();
    accounts.forEach(a => {
      const existing = map.get(a.clientName) || { name: a.clientName, totalSpend: 0, totalLeads: 0, totalRevenue: 0, totalImpressions: 0, totalClicks: 0, accounts: [], avgTrend: 0 };
      existing.totalSpend += a.spend;
      existing.totalLeads += a.leads;
      existing.totalRevenue += a.crmRevenue;
      existing.totalImpressions += a.impressions;
      existing.totalClicks += a.clicks;
      existing.accounts.push(a);
      map.set(a.clientName, existing);
    });
    const arr = Array.from(map.values()).map(c => ({
      ...c,
      cpl: c.totalLeads > 0 ? c.totalSpend / c.totalLeads : 0,
      roas: c.totalSpend > 0 ? c.totalRevenue / c.totalSpend : 0,
      trueROI: c.totalSpend > 0 ? ((c.totalRevenue - c.totalSpend) / c.totalSpend) * 100 : 0,
      avgTrend: c.accounts.reduce((s, a) => s + a.trend, 0) / c.accounts.length,
      platforms: Array.from(new Set(c.accounts.map(a => a.platform))),
    }));
    if (sortBy === "spend") arr.sort((a, b) => sortDir === "desc" ? b.totalSpend - a.totalSpend : a.totalSpend - b.totalSpend);
    else if (sortBy === "leads") arr.sort((a, b) => sortDir === "desc" ? b.totalLeads - a.totalLeads : a.totalLeads - b.totalLeads);
    else if (sortBy === "roas") arr.sort((a, b) => sortDir === "desc" ? b.roas - a.roas : a.roas - b.roas);
    else if (sortBy === "revenue") arr.sort((a, b) => sortDir === "desc" ? b.totalRevenue - a.totalRevenue : a.totalRevenue - b.totalRevenue);
    else if (sortBy === "cpl") arr.sort((a, b) => sortDir === "asc" ? a.cpl - b.cpl : b.cpl - a.cpl);
    return arr;
  }, [accounts, sortBy, sortDir]);

  // Totals
  const totals = useMemo(() => {
    const t = { spend: 0, impressions: 0, clicks: 0, leads: 0, revenue: 0, campaigns: 0, activeCampaigns: 0, clients: new Set<string>() };
    accounts.forEach(a => {
      t.spend += a.spend; t.impressions += a.impressions; t.clicks += a.clicks;
      t.leads += a.leads; t.revenue += a.crmRevenue; t.campaigns += a.campaigns;
      t.activeCampaigns += a.activeCampaigns; t.clients.add(a.clientName);
    });
    return { ...t, clientCount: t.clients.size, cpl: t.leads > 0 ? t.spend / t.leads : 0, roas: t.spend > 0 ? t.revenue / t.spend : 0, ctr: t.impressions > 0 ? (t.clicks / t.impressions) * 100 : 0 };
  }, [accounts]);

  // Platform split
  const metaTotals = useMemo(() => {
    const m = AGENCY_ACCOUNTS.filter(a => a.platform === "meta");
    const spend = m.reduce((s, a) => s + a.spend, 0);
    const leads = m.reduce((s, a) => s + a.leads, 0);
    const revenue = m.reduce((s, a) => s + a.crmRevenue, 0);
    return { spend, leads, revenue, cpl: leads > 0 ? spend / leads : 0, roas: spend > 0 ? revenue / spend : 0, accounts: m.length };
  }, []);

  const googleTotals = useMemo(() => {
    const g = AGENCY_ACCOUNTS.filter(a => a.platform === "google");
    const spend = g.reduce((s, a) => s + a.spend, 0);
    const leads = g.reduce((s, a) => s + a.leads, 0);
    const revenue = g.reduce((s, a) => s + a.crmRevenue, 0);
    return { spend, leads, revenue, cpl: leads > 0 ? spend / leads : 0, roas: spend > 0 ? revenue / spend : 0, accounts: g.length };
  }, []);

  const toggleSort = (key: string) => {
    if (sortBy === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("desc"); }
  };

  return (
    <>
      <Header title="Ad Intelligence" />
      <div className="p-6 space-y-6">

        {/* ─── TOP BAR ─── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {(["7d", "30d", "90d"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {(["all", "meta", "google"] as const).map(p => (
                <button key={p} onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${platformFilter === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {p === "all" ? "All Platforms" : p === "meta" ? "Meta" : "Google"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
                className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-white w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              <RefreshCw className="w-3.5 h-3.5" /> Sync Now
            </button>
          </div>
        </div>

        {/* ─── OVERVIEW STATS ─── */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: "Total Ad Spend", value: fmt(totals.spend), icon: DollarSign, color: "text-red-600 bg-red-50", sub: `${totals.activeCampaigns} active campaigns` },
            { label: "Leads Generated", value: num(totals.leads), icon: Users, color: "text-indigo-600 bg-indigo-50", sub: `Across ${totals.clientCount} clients` },
            { label: "Avg Cost Per Lead", value: `$${totals.cpl.toFixed(2)}`, icon: Target, color: "text-amber-600 bg-amber-50", sub: `${num(totals.clicks)} total clicks` },
            { label: "Overall ROAS", value: `${totals.roas.toFixed(1)}x`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50", sub: `${fmt(totals.revenue)} CRM revenue` },
            { label: "CRM Revenue", value: fmt(totals.revenue), icon: Crown, color: "text-violet-600 bg-violet-50", sub: `From ad-attributed leads` },
            { label: "True ROI", value: `${totals.spend > 0 ? (((totals.revenue - totals.spend) / totals.spend) * 100).toFixed(0) : 0}%`, icon: Zap, color: "text-blue-600 bg-blue-50", sub: `Revenue minus ad spend` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-sm transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ─── PLATFORM COMPARISON ─── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Meta */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <span className="text-white text-lg font-black">f</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Meta Ads</h3>
                <p className="text-[10px] text-gray-400">{metaTotals.accounts} ad accounts connected</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div><p className="text-[10px] text-gray-400 mb-0.5">Spend</p><p className="text-sm font-bold text-gray-900">{fmt(metaTotals.spend)}</p></div>
              <div><p className="text-[10px] text-gray-400 mb-0.5">Leads</p><p className="text-sm font-bold text-gray-900">{num(metaTotals.leads)}</p></div>
              <div><p className="text-[10px] text-gray-400 mb-0.5">CPL</p><p className="text-sm font-bold text-gray-900">${metaTotals.cpl.toFixed(0)}</p></div>
              <div><p className="text-[10px] text-gray-400 mb-0.5">ROAS</p><p className="text-sm font-bold text-emerald-600">{metaTotals.roas.toFixed(1)}x</p></div>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(metaTotals.spend / (metaTotals.spend + googleTotals.spend)) * 100}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{((metaTotals.spend / (metaTotals.spend + googleTotals.spend)) * 100).toFixed(0)}% of total spend</p>
          </div>

          {/* Google */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 flex items-center justify-center">
                <span className="text-white text-lg font-black">G</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Google Ads</h3>
                <p className="text-[10px] text-gray-400">{googleTotals.accounts} ad accounts (via MCC)</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div><p className="text-[10px] text-gray-400 mb-0.5">Spend</p><p className="text-sm font-bold text-gray-900">{fmt(googleTotals.spend)}</p></div>
              <div><p className="text-[10px] text-gray-400 mb-0.5">Leads</p><p className="text-sm font-bold text-gray-900">{num(googleTotals.leads)}</p></div>
              <div><p className="text-[10px] text-gray-400 mb-0.5">CPL</p><p className="text-sm font-bold text-gray-900">${googleTotals.cpl.toFixed(0)}</p></div>
              <div><p className="text-[10px] text-gray-400 mb-0.5">ROAS</p><p className="text-sm font-bold text-emerald-600">{googleTotals.roas.toFixed(1)}x</p></div>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-red-400 to-yellow-400 rounded-full" style={{ width: `${(googleTotals.spend / (metaTotals.spend + googleTotals.spend)) * 100}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{((googleTotals.spend / (metaTotals.spend + googleTotals.spend)) * 100).toFixed(0)}% of total spend</p>
          </div>
        </div>

        {/* ─── ALERTS ─── */}
        {ALERTS.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Campaign Alerts</h3>
                <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">{ALERTS.filter(a => a.severity === "critical").length}</span>
              </div>
            </div>
            <div className="space-y-2">
              {ALERTS.map(alert => (
                <div key={alert.id} className={`flex items-center gap-4 p-3 rounded-lg border ${
                  alert.severity === "critical" ? "bg-red-50/50 border-red-100" :
                  alert.severity === "warning" ? "bg-amber-50/50 border-amber-100" :
                  "bg-blue-50/50 border-blue-100"
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.severity === "critical" ? "bg-red-100 text-red-600" :
                    alert.severity === "warning" ? "bg-amber-100 text-amber-600" :
                    "bg-blue-100 text-blue-600"
                  }`}>
                    {alert.type === "low_roas" ? <TrendingDown className="w-4 h-4" /> :
                     alert.type === "high_cpl" ? <DollarSign className="w-4 h-4" /> :
                     alert.type === "no_leads" ? <Ban className="w-4 h-4" /> :
                     alert.type === "overspend" ? <AlertTriangle className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-gray-900">{alert.client}</span>
                      <PlatformBadge platform={alert.platform} />
                      <span className="text-[10px] text-gray-400 truncate">· {alert.campaign}</span>
                    </div>
                    <p className="text-xs text-gray-500">{alert.message}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                    alert.severity === "critical" ? "bg-red-100 text-red-700" :
                    alert.severity === "warning" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{alert.metric}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TABS ─── */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {[
            { key: "clients", label: "Client Performance", count: clientAgg.length },
            { key: "campaigns", label: "Top Campaigns", count: TOP_CAMPAIGNS.length },
            { key: "attribution", label: "Lead Attribution", count: LEAD_ATTRIBUTIONS.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                tab === t.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {t.label} <span className="text-[10px] text-gray-400 ml-1">{t.count}</span>
            </button>
          ))}
        </div>

        {/* ─── TAB: CLIENT PERFORMANCE ─── */}
        {tab === "clients" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left pl-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="text-left py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Platforms</th>
                  <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => toggleSort("spend")}>
                    Ad Spend {sortBy === "spend" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => toggleSort("leads")}>
                    Leads {sortBy === "leads" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => toggleSort("cpl")}>
                    CPL {sortBy === "cpl" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => toggleSort("roas")}>
                    ROAS {sortBy === "roas" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => toggleSort("revenue")}>
                    CRM Revenue {sortBy === "revenue" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="text-right py-3 pr-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">True ROI</th>
                  <th className="text-right py-3 pr-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clientAgg.map(client => (
                  <tr key={client.name} className="hover:bg-gray-50/70 transition group cursor-pointer">
                    <td className="pl-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition">{client.name}</p>
                      <p className="text-[10px] text-gray-400">{client.accounts.length} ad account{client.accounts.length > 1 ? "s" : ""}</p>
                    </td>
                    <td className="py-3.5">
                      <div className="flex gap-1">
                        {client.platforms.map(p => <PlatformBadge key={p} platform={p as any} />)}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <span className="text-sm font-bold text-gray-900">{fmt(client.totalSpend)}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">{num(client.totalLeads)}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <span className={`text-sm font-semibold ${client.cpl > 200 ? "text-amber-600" : "text-gray-900"}`}>${client.cpl.toFixed(0)}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <span className={`text-sm font-bold ${client.roas >= 5 ? "text-emerald-600" : client.roas >= 3 ? "text-blue-600" : client.roas >= 2 ? "text-amber-600" : "text-red-600"}`}>
                        {client.roas.toFixed(1)}x
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <span className="text-sm font-bold text-gray-900">{fmt(client.totalRevenue)}</span>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        client.trueROI >= 500 ? "bg-emerald-50 text-emerald-700" :
                        client.trueROI >= 200 ? "bg-blue-50 text-blue-700" :
                        client.trueROI >= 100 ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-600"
                      }`}>{client.trueROI.toFixed(0)}%</span>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <TrendBadge trend={client.avgTrend} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="pl-5 py-3 text-sm font-bold text-gray-900">All Clients</td>
                  <td className="py-3"><span className="text-[10px] text-gray-400">{totals.clientCount} clients</span></td>
                  <td className="py-3 pr-4 text-right text-sm font-bold text-gray-900">{fmt(totals.spend)}</td>
                  <td className="py-3 pr-4 text-right text-sm font-bold text-gray-900">{num(totals.leads)}</td>
                  <td className="py-3 pr-4 text-right text-sm font-bold text-gray-900">${totals.cpl.toFixed(0)}</td>
                  <td className="py-3 pr-4 text-right text-sm font-bold text-emerald-600">{totals.roas.toFixed(1)}x</td>
                  <td className="py-3 pr-4 text-right text-sm font-bold text-gray-900">{fmt(totals.revenue)}</td>
                  <td className="py-3 pr-5 text-right">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                      {totals.spend > 0 ? (((totals.revenue - totals.spend) / totals.spend) * 100).toFixed(0) : 0}%
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ─── TAB: TOP CAMPAIGNS ─── */}
        {tab === "campaigns" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left pl-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Campaign</th>
                  <th className="text-left py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="text-left py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Platform</th>
                  <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Spend</th>
                  <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Leads</th>
                  <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">CPL</th>
                  <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ROAS</th>
                  <th className="text-right py-3 pr-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ad Sets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TOP_CAMPAIGNS.sort((a, b) => b.roas - a.roas).map((cp, i) => (
                  <tr key={cp.id} className="hover:bg-gray-50/70 transition">
                    <td className="pl-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400"
                        }`}>{i + 1}</span>
                        <p className="text-sm font-semibold text-gray-900">{cp.name}</p>
                      </div>
                    </td>
                    <td className="py-3.5 text-sm text-gray-600">{cp.client}</td>
                    <td className="py-3.5"><PlatformBadge platform={cp.platform} /></td>
                    <td className="py-3.5 pr-4 text-right text-sm font-semibold text-gray-900">{fmt(cp.spend)}</td>
                    <td className="py-3.5 pr-4 text-right text-sm font-semibold text-gray-900">{cp.leads}</td>
                    <td className="py-3.5 pr-4 text-right text-sm text-gray-600">${cp.cpl.toFixed(0)}</td>
                    <td className="py-3.5 pr-4 text-right">
                      <span className={`text-sm font-bold ${cp.roas >= 8 ? "text-emerald-600" : cp.roas >= 4 ? "text-blue-600" : "text-amber-600"}`}>
                        {cp.roas.toFixed(1)}x
                      </span>
                    </td>
                    <td className="py-3.5 pr-5 text-right text-sm text-gray-500">{cp.adSets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB: LEAD ATTRIBUTION ─── */}
        {tab === "attribution" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-indigo-200" />
                <h3 className="text-sm font-bold">Ad → CRM Attribution</h3>
              </div>
              <p className="text-sm text-indigo-200">Track exactly which ad clicks turned into real customers and revenue. This is the insight layer Supermetrics will never have — because they don{"'"}t have your CRM data.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left pl-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="text-left py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Source</th>
                    <th className="text-left py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Campaign</th>
                    <th className="text-left py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ad Cost</th>
                    <th className="text-right py-3 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">CRM Value</th>
                    <th className="text-right py-3 pr-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ROI</th>
                    <th className="text-right py-3 pr-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {LEAD_ATTRIBUTIONS.map(la => {
                    const roi = la.adSpend > 0 ? ((la.crmValue - la.adSpend) / la.adSpend) * 100 : 0;
                    return (
                      <tr key={la.id} className="hover:bg-gray-50/70 transition">
                        <td className="pl-5 py-3.5">
                          <p className="text-sm font-semibold text-gray-900">{la.contactName}</p>
                          <p className="text-[10px] text-gray-400">{la.email}</p>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            <PlatformBadge platform={la.platform} />
                            <span className="text-xs text-gray-500">{la.source}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-xs text-gray-600 max-w-[180px] truncate">{la.campaign}</td>
                        <td className="py-3.5 text-xs text-gray-600">{la.client}</td>
                        <td className="py-3.5 pr-4 text-right text-xs text-gray-500">${la.adSpend.toFixed(2)}</td>
                        <td className="py-3.5 pr-4 text-right text-sm font-bold text-gray-900">{fmt(la.crmValue)}</td>
                        <td className="py-3.5 pr-5 text-right">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{roi.toFixed(0)}%</span>
                        </td>
                        <td className="py-3.5 pr-5 text-right text-[10px] text-gray-400">{la.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── CONNECT PROMPT (shown when no accounts connected) ─── */}
        {/* This will be shown for non-agency industries or fresh tenants */}

      </div>
    </>
  );
}
