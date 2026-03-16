"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/dashboard/header";
import {
  Users, DollarSign, TrendingUp, ShoppingCart, Crown, UserCheck, UserX,
  ChevronRight, Loader2, Handshake, Zap, BarChart3, ArrowUpRight,
  Send, GripVertical, Plus, X, Settings2, RotateCcw, Maximize2, Minimize2,
  Activity, Calendar, CheckSquare, ChevronDown, ChevronUp,
} from "lucide-react";
import SonjiBox from "@/components/dashboard/sonji-box";
import MoneyOnTable from "@/components/dashboard/money-on-table";
import RecoveredRevenue from "@/components/dashboard/recovered-revenue";
import DealVelocity from "@/components/dashboard/deal-velocity";
import GhostingAlerts from "@/components/dashboard/ghosting-alerts";
import NewTenantWelcome from "@/components/dashboard/new-tenant-welcome";
import { getIndustryConfig, type IndustryConfig } from "@/lib/industry-config";
import IndustryActivityFeed from "@/components/dashboard/industry-activity-feed";

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

interface WidgetConfig {
  id: string;
  type: string;
  size: "half" | "full";
}

interface WidgetDef {
  type: string;
  label: string;
  icon: React.ElementType;
  defaultSize: "half" | "full";
  desc: string;
}

interface Stats {
  totalContacts: number; totalDeals: number; activeDeals: number; wonDeals: number;
  totalTasks: number; openTasks: number;
  recentContacts: any[]; statusBreakdown: { status: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  revenue: { total: number; totalPurchases: number; avgLTV: number; avgOrder: number; contactsWithPurchases: number };
  ltvBuckets: { whale: number; mid: number; low: number; zero: number };
  subscriptionBreakdown: Record<string, number>;
  topCustomers: { id: string; name: string; email: string; ltv: number; purchases: number; subStatus: string }[];
  tenantName: string; tenantSlug: string;
}

// ═══════════════════════════════════════
// WIDGET REGISTRY
// ═══════════════════════════════════════

const widgetDefs: WidgetDef[] = [
  { type: "revenue_overview", label: "Sonji Box", icon: Zap, defaultSize: "full", desc: "Your 5 most important metrics — fully customizable" },
  { type: "top_customers", label: "Top Customers", icon: Crown, defaultSize: "full", desc: "Highest value customers ranked by LTV" },
  { type: "customer_tiers", label: "Customer Value Tiers", icon: TrendingUp, defaultSize: "half", desc: "High Value, mid, low tier breakdown" },
  { type: "subscription_breakdown", label: "Subscription Breakdown", icon: UserCheck, defaultSize: "half", desc: "Active, canceled, expired, one-time" },
  { type: "recent_contacts", label: "Recent Contacts", icon: Users, defaultSize: "full", desc: "Last contacts added to your CRM" },
  { type: "quick_actions", label: "Quick Actions", icon: Zap, defaultSize: "half", desc: "Shortcuts to common tasks" },
  { type: "pipeline", label: "Pipeline / Deals", icon: Handshake, defaultSize: "half", desc: "Deal counts by stage" },
  { type: "open_tasks", label: "Open Tasks", icon: CheckSquare, defaultSize: "half", desc: "Your pending tasks" },
  { type: "activity_feed", label: "Activity Feed", icon: Activity, defaultSize: "full", desc: "Recent CRM activity" },
  { type: "upcoming_meetings", label: "Upcoming Meetings", icon: Calendar, defaultSize: "half", desc: "Your next scheduled meetings" },
  { type: "revenue_chart", label: "Revenue Chart", icon: BarChart3, defaultSize: "full", desc: "Monthly revenue bar chart" },
  { type: "campaign_stats", label: "Campaign Stats", icon: Send, defaultSize: "half", desc: "Emails sent, open rates" },
  { type: "money_on_table", label: "Money Left on the Table", icon: DollarSign, defaultSize: "full", desc: "Lapsed revenue + one-click win-back emails" },
  { type: "recovered_revenue", label: "Sonji Recovered Revenue", icon: TrendingUp, defaultSize: "full", desc: "Revenue recovered through Sonji automations" },
  { type: "deal_velocity", label: "Deal Velocity", icon: Activity, defaultSize: "full", desc: "Pipeline momentum — stalled and slowing deals" },
  { type: "ghosting_alerts", label: "Ghosting Alerts", icon: Activity, defaultSize: "full", desc: "Contacts going cold — predictive cooling detection" },
];

const defaultLayout: WidgetConfig[] = [
  { id: "w1", type: "revenue_overview", size: "full" },
  { id: "w2", type: "quick_actions", size: "half" },
  { id: "w3", type: "customer_tiers", size: "half" },
  { id: "w4", type: "subscription_breakdown", size: "half" },
  { id: "w5", type: "top_customers", size: "full" },
  { id: "w13", type: "money_on_table", size: "full" },
  { id: "w14", type: "recovered_revenue", size: "full" },
  { id: "w6", type: "recent_contacts", size: "full" },
  { id: "w7", type: "pipeline", size: "half" },
  { id: "w8", type: "open_tasks", size: "half" },
  { id: "w15", type: "deal_velocity", size: "full" },
  { id: "w9", type: "activity_feed", size: "full" },
  { id: "w10", type: "revenue_chart", size: "full" },
  { id: "w11", type: "upcoming_meetings", size: "half" },
  { id: "w12", type: "campaign_stats", size: "half" },
];

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function fmt(n: number) { return n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`; }
function num(n: number) { return n.toLocaleString(); }

const subColors: Record<string,string> = { active:"bg-emerald-500", canceled:"bg-red-400", expired:"bg-amber-400", "one-time":"bg-blue-400", never:"bg-gray-300" };
const subLabels: Record<string,string> = { active:"Active", canceled:"Canceled", expired:"Expired", "one-time":"One-Time", never:"No Sub" };

function loadLayout(): WidgetConfig[] {
  if (typeof window === "undefined") return defaultLayout;
  try { const s = localStorage.getItem("sonji-dashboard-layout"); return s ? JSON.parse(s) : defaultLayout; } catch { return defaultLayout; }
}
function saveLayout(layout: WidgetConfig[]) {
  try { localStorage.setItem("sonji-dashboard-layout", JSON.stringify(layout)); } catch {}
}

// ═══════════════════════════════════════
// WIDGET COMPONENTS
// ═══════════════════════════════════════

function RevenueOverview({ s }: { s: Stats }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white h-full">
      <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Lifetime Revenue</p>
      <p className="text-3xl font-bold mt-2">{fmt(s.revenue.total)}</p>
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
        <div><span className="text-white/50 text-xs">Avg LTV</span><p className="text-sm font-semibold">{fmt(s.revenue.avgLTV)}</p></div>
        <div><span className="text-white/50 text-xs">Avg Order</span><p className="text-sm font-semibold">{fmt(s.revenue.avgOrder)}</p></div>
        <div><span className="text-white/50 text-xs">Transactions</span><p className="text-sm font-semibold">{num(s.revenue.totalPurchases)}</p></div>
        <div><span className="text-white/50 text-xs">Paying</span><p className="text-sm font-semibold">{num(s.revenue.contactsWithPurchases)}</p></div>
      </div>
    </div>
  );
}

function TopCustomers({ s, ic }: { s: Stats; ic?: IndustryConfig | null }) {
  if (s.topCustomers.length === 0) return <EmptyWidget msg="No customer data yet" cta="Import from Stripe" href="/dashboard/settings?tab=integrations" />;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Top {ic?.contactLabelPlural || "Customers"}</h3>
        <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
      </div>
      <div className="space-y-1">
        {s.topCustomers.map((c, i) => (
          <Link key={c.id} href={`/dashboard/contacts/${c.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? "bg-violet-500" : i === 1 ? "bg-blue-500" : "bg-gray-400"}`}>{i + 1}</div>
              <div><p className="text-sm font-medium text-gray-900">{c.name}</p><p className="text-xs text-gray-400">{c.purchases} purchases</p></div>
            </div>
            <p className={`text-sm font-bold ${c.ltv >= 500 ? "text-violet-600" : "text-gray-900"}`}>{fmt(c.ltv)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CustomerTiers({ s, ic }: { s: Stats; ic?: IndustryConfig | null }) {
  const total = s.totalContacts || 1;
  const hvLabel = ic?.highValueLabel || "High Value";
  const midLabel = ic?.midTierLabel || "Mid";
  const lowLabel = ic?.lowTierLabel || "Low";
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{ic?.contactLabel || "Customer"} Value</h3>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex mb-4">
        {[{ k: "whale", c: "bg-violet-500", n: s.ltvBuckets.whale }, { k: "mid", c: "bg-blue-500", n: s.ltvBuckets.mid }, { k: "low", c: "bg-amber-400", n: s.ltvBuckets.low }, { k: "zero", c: "bg-gray-300", n: s.ltvBuckets.zero }]
          .filter(b => b.n > 0).map(b => <div key={b.k} className={`h-full ${b.c}`} style={{ width: `${(b.n / total) * 100}%` }} />)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[{ l: `${hvLabel} ($500+)`, n: s.ltvBuckets.whale, c: "text-violet-600", d: "bg-violet-500" }, { l: `${midLabel} ($200-499)`, n: s.ltvBuckets.mid, c: "text-blue-600", d: "bg-blue-500" },
          { l: `${lowLabel} (<$200)`, n: s.ltvBuckets.low, c: "text-amber-600", d: "bg-amber-400" }, { l: "No purchase", n: s.ltvBuckets.zero, c: "text-gray-500", d: "bg-gray-300" }]
          .map(t => <div key={t.l} className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${t.d}`} /><span className="text-xs text-gray-500">{t.l}</span><span className={`text-xs font-bold ${t.c} ml-auto`}>{num(t.n)}</span></div>)}
      </div>
    </div>
  );
}

function SubscriptionBreakdown({ s, ic }: { s: Stats; ic?: IndustryConfig | null }) {
  const totalSubs = Object.values(s.subscriptionBreakdown).reduce((a, b) => a + b, 0) || 1;
  const subLabelsMap: Record<string, string> = ic ? {
    active: ic.key === "nonprofit" ? "Active Donors" : ic.key === "agency_consulting" ? "Active Retainers" : ic.key === "fitness_gym" ? "Active Members" : ic.key === "health_wellness" ? "Active Patients" : ic.key === "beauty_salon" ? "Regulars" : "Active",
    canceled: ic.key === "nonprofit" ? "Lapsed Donors" : "Canceled",
    expired: "Expired",
    "one-time": ic.key === "nonprofit" ? "One-Time Gift" : ic.key === "restaurant_food" ? "Walk-In" : "One-Time",
    never: ic.key === "nonprofit" ? "Prospect" : "No Sub",
  } : subLabels;
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{ic?.key === "nonprofit" ? "Donor Status" : ic?.key === "fitness_gym" ? "Membership Status" : ic?.key === "agency_consulting" ? "Client Status" : "Subscriptions"}</h3>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex mb-4">
        {Object.entries(s.subscriptionBreakdown).sort((a,b) => b[1]-a[1]).map(([k,v]) => (
          <div key={k} className={`h-full ${subColors[k] || "bg-gray-400"}`} style={{ width: `${(v/totalSubs)*100}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(s.subscriptionBreakdown).sort((a,b) => b[1]-a[1]).slice(0, 4).map(([k,v]) => (
          <div key={k} className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${subColors[k] || "bg-gray-400"}`} /><span className="text-xs text-gray-500">{(ic ? subLabelsMap[k] : subLabels[k]) || k}</span><span className="text-xs font-bold text-gray-700 ml-auto">{num(v)}</span></div>
        ))}
      </div>
    </div>
  );
}

function RecentContacts({ s, ic }: { s: Stats; ic?: IndustryConfig | null }) {
  if (s.recentContacts.length === 0) return <EmptyWidget msg={`No ${(ic?.contactLabelPlural || "contacts").toLowerCase()} yet`} cta="Import from Stripe" href="/dashboard/settings?tab=integrations" />;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recently Added</h3>
        <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
      </div>
      <div className="space-y-1">
        {s.recentContacts.slice(0, 6).map((c: any) => (
          <Link key={c.id} href={`/dashboard/contacts/${c.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600">{c.firstName?.[0]||"?"}{c.lastName?.[0]||""}</span>
              </div>
              <div><p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p><p className="text-xs text-gray-400">{c.email}</p></div>
            </div>
            <div className="flex items-center gap-2">
              {c.ltv > 0 && <span className="text-xs font-semibold text-gray-700">{fmt(c.ltv)}</span>}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${c.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{c.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function QuickActions({ ic }: { ic?: IndustryConfig | null }) {
  const contactWord = ic ? `Browse ${ic.contactLabelPlural}` : "Browse Contacts";
  const dealWord = ic ? `Manage ${ic.dealLabelPlural}` : "Manage Deals";
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <div className="space-y-1.5">
        {[
          { href: "/dashboard/campaigns", icon: Send, c: "bg-violet-50 group-hover:bg-violet-100", ic: "text-violet-600", l: "Send Campaign" },
          { href: "/dashboard/contacts", icon: Users, c: "bg-indigo-50 group-hover:bg-indigo-100", ic: "text-indigo-600", l: contactWord },
          { href: "/dashboard/deals", icon: Handshake, c: "bg-blue-50 group-hover:bg-blue-100", ic: "text-blue-600", l: dealWord },
          { href: "/dashboard/analytics", icon: BarChart3, c: "bg-emerald-50 group-hover:bg-emerald-100", ic: "text-emerald-600", l: "View Analytics" },
          { href: "/dashboard/settings?tab=integrations", icon: Zap, c: "bg-amber-50 group-hover:bg-amber-100", ic: "text-amber-600", l: "Integrations" },
        ].map(a => (
          <Link key={a.l} href={a.href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition group">
            <div className={`w-8 h-8 rounded-lg ${a.c} flex items-center justify-center transition`}><a.icon className={`w-4 h-4 ${a.ic}`} /></div>
            <span className="text-sm font-medium text-gray-700">{a.l}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Pipeline({ s }: { s: Stats }) {
  const pipelineStages = (s as any).pipeline as { stage: string; color: string; count: number }[] | undefined;

  // If we have detailed pipeline stages (demo mode), show visual funnel
  if (pipelineStages && pipelineStages.length > 0) {
    const maxCount = Math.max(...pipelineStages.map(p => p.count), 1);
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Pipeline</h3>
          <Link href="/dashboard/deals" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
        </div>
        <div className="space-y-2">
          {pipelineStages.map((p, i) => (
            <div key={p.stage} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-xs text-gray-600 w-32 truncate flex-shrink-0">{p.stage}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.max((p.count / maxCount) * 100, 4)}%`, backgroundColor: p.color, opacity: 0.7 }} />
              </div>
              <span className="text-xs font-bold text-gray-700 w-8 text-right">{p.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback: simple 3-stat view for real data
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Pipeline</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-indigo-50 rounded-xl"><p className="text-2xl font-bold text-indigo-700">{s.totalDeals}</p><p className="text-[10px] text-gray-500">Total Deals</p></div>
        <div className="text-center p-3 bg-blue-50 rounded-xl"><p className="text-2xl font-bold text-blue-700">{s.activeDeals}</p><p className="text-[10px] text-gray-500">Active</p></div>
        <div className="text-center p-3 bg-emerald-50 rounded-xl"><p className="text-2xl font-bold text-emerald-700">{s.wonDeals}</p><p className="text-[10px] text-gray-500">Won</p></div>
      </div>
      <Link href="/dashboard/deals" className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-3">Go to Pipeline <ChevronRight className="w-3 h-3" /></Link>
    </div>
  );
}

function OpenTasks({ s }: { s: Stats }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Tasks</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-amber-50 rounded-xl"><p className="text-2xl font-bold text-amber-700">{s.openTasks}</p><p className="text-[10px] text-gray-500">Open</p></div>
        <div className="text-center p-3 bg-gray-50 rounded-xl"><p className="text-2xl font-bold text-gray-700">{s.totalTasks}</p><p className="text-[10px] text-gray-500">Total</p></div>
      </div>
      <Link href="/dashboard/tasks" className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-3">Go to Tasks <ChevronRight className="w-3 h-3" /></Link>
    </div>
  );
}

function ActivityFeed({ s }: { s: Stats }) {
  if (s.recentContacts.length === 0) return <EmptyWidget msg="No activity yet" cta="Get started" href="/dashboard/contacts" />;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <Link href="/dashboard/activities" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
      </div>
      <div className="space-y-2">
        {s.recentContacts.slice(0, 5).map((c: any, i: number) => (
          <div key={c.id} className="flex items-center gap-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">{c.firstName} {c.lastName}</span> was added as a contact</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingMeetings() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Meetings</h3>
      <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center">
        <Calendar className="w-6 h-6 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-500">No meetings scheduled</p>
        <Link href="/dashboard/meetings" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1 inline-block">Schedule one →</Link>
      </div>
    </div>
  );
}

function RevenueChart({ s }: { s: Stats }) {
  // Simple visual bar representation
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const total = s.revenue.total;
  const perMonth = total > 0 ? [0.12, 0.15, 0.18, 0.14, 0.20, 0.21].map(p => Math.round(total * p)) : [0,0,0,0,0,0];
  const max = Math.max(...perMonth, 1);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Revenue Trend</h3>
        <Link href="/dashboard/analytics" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">Full analytics <ChevronRight className="w-3 h-3" /></Link>
      </div>
      <div className="flex items-end gap-3 h-32">
        {months.map((m, i) => (
          <div key={m} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-indigo-100 rounded-t-lg relative overflow-hidden" style={{ height: `${Math.max((perMonth[i]/max)*100, 4)}%` }}>
              <div className="absolute inset-0 bg-indigo-500 rounded-t-lg" style={{ opacity: 0.6 + (i * 0.08) }} />
            </div>
            <span className="text-[10px] text-gray-400">{m}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Estimated distribution across recent months</p>
    </div>
  );
}

function CampaignStats() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Campaign Stats</h3>
      <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center">
        <Send className="w-6 h-6 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-500">Send your first campaign to see stats</p>
        <Link href="/dashboard/campaigns" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1 inline-block">Create campaign →</Link>
      </div>
    </div>
  );
}

function EmptyWidget({ msg, cta, href }: { msg: string; cta: string; href: string }) {
  return (
    <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center">
      <p className="text-xs text-gray-500">{msg}</p>
      <Link href={href} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1 inline-block">{cta} →</Link>
    </div>
  );
}

// Widget renderer
function renderWidget(type: string, s: Stats, ic?: IndustryConfig | null) {
  switch (type) {
    case "revenue_overview": return <SonjiBox stats={s} />;
    case "top_customers": return <TopCustomers s={s} ic={ic} />;
    case "customer_tiers": return <CustomerTiers s={s} ic={ic} />;
    case "subscription_breakdown": return <SubscriptionBreakdown s={s} ic={ic} />;
    case "recent_contacts": return <RecentContacts s={s} ic={ic} />;
    case "quick_actions": return <QuickActions ic={ic} />;
    case "pipeline": return <Pipeline s={s} />;
    case "open_tasks": return <OpenTasks s={s} />;
    case "activity_feed": {
      const demoKey = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
      return demoKey ? <IndustryActivityFeed industry={demoKey} /> : <ActivityFeed s={s} />;
    }
    case "upcoming_meetings": return <UpcomingMeetings />;
    case "revenue_chart": return <RevenueChart s={s} />;
    case "campaign_stats": return <CampaignStats />;
    case "money_on_table": return <MoneyOnTable />;
    case "recovered_revenue": return <RecoveredRevenue />;
    case "deal_velocity": return <DealVelocity />;
    case "ghosting_alerts": return <GhostingAlerts />;
    default: return <p className="text-sm text-gray-500">Unknown widget</p>;
  }
}

// ═══════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════

export default function DashboardPage() {
  const [s, setS] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<WidgetConfig[]>(defaultLayout);
  const [editMode, setEditMode] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [ic, setIc] = useState<IndustryConfig | null>(null);

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const isDemo = demoIndustry && demoIndustry !== "ecommerce";
    const url = isDemo
      ? `/api/demo?industry=${demoIndustry}`
      : "/api/dashboard";
    fetch(url).then(r => r.json()).then(d => { if (d.ok || d.data) setS(d.data); }).catch(() => {}).finally(() => setLoading(false));
    setLayout(loadLayout());

    // Set industry config for demo mode
    if (isDemo && demoIndustry) {
      setIc(getIndustryConfig(demoIndustry));
    }
  }, []);

  const updateLayout = (next: WidgetConfig[]) => {
    setLayout(next);
    saveLayout(next);
  };

  const removeWidget = (id: string) => updateLayout(layout.filter(w => w.id !== id));

  const addWidget = (type: string) => {
    const def = widgetDefs.find(d => d.type === type);
    if (!def) return;
    const id = `w_${Date.now()}`;
    updateLayout([...layout, { id, type, size: def.defaultSize }]);
    setShowLibrary(false);
  };

  const toggleSize = (id: string) => {
    updateLayout(layout.map(w => w.id === id ? { ...w, size: w.size === "half" ? "full" : "half" } : w));
  };

  const resetLayout = () => { updateLayout(defaultLayout); setEditMode(false); };

  // Drag handlers
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    const next = [...layout];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    setLayout(next);
    setDragIdx(targetIdx);
  };
  const handleDragEnd = () => { setDragIdx(null); saveLayout(layout); };

  const activeTypes = new Set(layout.map(w => w.type));
  const availableWidgets = widgetDefs.filter(d => !activeTypes.has(d.type));

  if (loading) return (<><Header title="Dashboard" /><div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div></>);
  if (!s) return (<><Header title="Dashboard" /><div className="p-6 text-center py-32 text-gray-500">Unable to load dashboard</div></>);

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-0.5">{s.tenantName} · {num(s.totalContacts)} {(ic?.contactLabelPlural || "contacts").toLowerCase()}{s.revenue.total > 0 ? ` · ${fmt(s.revenue.total)} ${(ic?.revenueLabel || "revenue").toLowerCase()}` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {editMode && (
              <>
                <button onClick={resetLayout} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                <button onClick={() => setShowLibrary(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition">
                  <Plus className="w-3 h-3" /> Add Widget
                </button>
              </>
            )}
            <button onClick={() => { setEditMode(!editMode); setShowLibrary(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                editMode ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-gray-500 hover:text-gray-700 border border-gray-200"
              }`}>
              <Settings2 className="w-3 h-3" /> {editMode ? "Done" : "Customize"}
            </button>
          </div>
        </div>

        {/* New Tenant Welcome */}
        <NewTenantWelcome stats={s} />

        {/* Widget Library Modal */}
        {showLibrary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowLibrary(false)}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[60vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Add Widget</h2>
                <button onClick={() => setShowLibrary(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              {availableWidgets.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">All widgets are already on your dashboard</p>
              ) : (
                <div className="space-y-2">
                  {availableWidgets.map(w => (
                    <button key={w.type} onClick={() => addWidget(w.type)}
                      className="w-full flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition text-left">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <w.icon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{w.label}</p>
                        <p className="text-xs text-gray-400">{w.desc}</p>
                      </div>
                      <Plus className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Widget Grid */}
        <div className="grid grid-cols-2 gap-4">
          {layout.map((w, idx) => {
            const def = widgetDefs.find(d => d.type === w.type);
            return (
              <div key={w.id}
                className={`${w.size === "full" ? "col-span-2" : "col-span-2 lg:col-span-1"}
                  bg-white rounded-xl border ${editMode ? "border-indigo-200 border-dashed" : "border-gray-100"} p-5
                  ${dragIdx === idx ? "opacity-40" : ""}
                  transition hover:shadow-md hover:shadow-gray-100/50`}
                draggable={editMode}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
              >
                {/* Edit controls */}
                {editMode && (
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                      <span className="text-xs font-medium text-gray-500">{def?.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleSize(w.id)} className="p-1 text-gray-400 hover:text-gray-600 rounded transition" title={w.size === "full" ? "Half width" : "Full width"}>
                        {w.size === "full" ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => removeWidget(w.id)} className="p-1 text-gray-400 hover:text-red-500 rounded transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                {renderWidget(w.type, s, ic)}
              </div>
            );
          })}
        </div>

        {layout.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Your dashboard is empty</p>
            <button onClick={() => { setEditMode(true); setShowLibrary(true); }}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              Add Widgets
            </button>
          </div>
        )}
      </div>
    </>
  );
}
