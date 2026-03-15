"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import Link from "next/link";
import { useIndustry } from "@/lib/use-industry";
import {
  BarChart3, TrendingUp, Users, DollarSign, Crown, UserCheck, UserX,
  Star, ChevronRight, Loader2, Download, PieChart, Target, ShoppingCart,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalContacts: number; totalRevenue: number; totalPurchases: number;
    avgLTV: number; avgOrderValue: number; activeSubscribers: number;
    canceledSubscribers: number; oneTimeBuyers: number; neverPurchased: number;
    contactsWithPurchases: number;
  };
  ltvBuckets: { whale: number; mid: number; low: number; zero: number };
  subscriptionBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  tagBreakdown: { tag: string; count: number }[];
  topCustomers: { id: string; name: string; email: string; ltv: number; purchases: number; subscriptionStatus: string; daysSince: number | null }[];
}

function fmt(n: number) { return n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`; }
function num(n: number) { return n.toLocaleString(); }
function pct(a: number, b: number) { return b > 0 ? `${((a/b)*100).toFixed(1)}%` : "0%"; }

const subColors: Record<string,string> = { active:"bg-emerald-500", canceled:"bg-red-400", expired:"bg-amber-400", "one-time":"bg-blue-400", never:"bg-gray-300" };
const subLabels: Record<string,string> = { active:"Active", canceled:"Canceled", expired:"Expired", "one-time":"One-Time", never:"Never" };

type ReportView = "overview" | "revenue" | "customers" | "subscriptions" | "segments";

const reportTabsDef = [
  { key: "overview" as ReportView, label: "Overview", icon: BarChart3 },
  { key: "revenue" as ReportView, label: "Revenue", icon: DollarSign },
  { key: "customers" as ReportView, label: "Top Customers", icon: Crown },
  { key: "subscriptions" as ReportView, label: "Subscriptions", icon: UserCheck },
  { key: "segments" as ReportView, label: "Segments", icon: Target },
];

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ReportView>("overview");
  const ic = useIndustry();
  const hvLabel = ic?.highValueLabel || "High Value";

  const reportTabs = reportTabsDef.map(t => t.key === "customers" ? { ...t, label: `Top ${ic?.contactLabelPlural || "Customers"}` } : t);

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const isDemo = demoIndustry && demoIndustry !== "ecommerce";
    const url = isDemo ? `/api/demo?industry=${demoIndustry}` : "/api/analytics";
    fetch(url).then(r => r.json()).then(d => { if (d.ok) setData(isDemo ? d.data : d.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (<><Header title="Reports" /><div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div></>);
  if (!data) return (<><Header title="Reports" /><div className="p-6 text-center py-32"><p className="text-gray-500">Connect Stripe to generate reports</p><Link href="/dashboard/settings" className="text-indigo-600 text-sm font-medium mt-2 inline-block">Go to Settings →</Link></div></>);

  const o = data.overview;
  const totalSubs = Object.values(data.subscriptionBreakdown).reduce((a, b) => a + b, 0);
  const churnRate = (o.activeSubscribers + o.canceledSubscribers) > 0
    ? ((o.canceledSubscribers / (o.activeSubscribers + o.canceledSubscribers)) * 100).toFixed(1) : "0";

  return (
    <>
      <Header title="Reports" />
      <div className="p-6">
        <div className="flex gap-6">
          {/* Left nav */}
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-1">
              {reportTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.key} onClick={() => setView(tab.key)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      view === tab.key ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
                    }`}>
                    <Icon className={`w-4 h-4 ${view === tab.key ? "text-indigo-600" : "text-gray-400"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-4xl">

            {/* OVERVIEW */}
            {view === "overview" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Business Overview</h2>
                  <p className="text-sm text-gray-500 mb-6">Key metrics from your Stripe data</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Revenue", value: fmt(o.totalRevenue), icon: DollarSign, color: "bg-emerald-500" },
                      { label: `Paying ${ic?.contactLabelPlural || "Customers"}`, value: num(o.contactsWithPurchases), icon: Users, color: "bg-indigo-500" },
                      { label: "Avg LTV", value: fmt(o.avgLTV), icon: TrendingUp, color: "bg-violet-500" },
                      { label: "Avg Order", value: fmt(o.avgOrderValue), icon: ShoppingCart, color: "bg-blue-500" },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                            <s.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs text-gray-500">{s.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Tiers</h3>
                    <div className="space-y-3">
                      {[
                        { label: `${hvLabel} ($500+)`, n: data.ltvBuckets.whale, color: "bg-violet-500" },
                        { label: "Mid ($200-499)", n: data.ltvBuckets.mid, color: "bg-blue-500" },
                        { label: "Low (<$200)", n: data.ltvBuckets.low, color: "bg-amber-400" },
                        { label: "No purchase", n: data.ltvBuckets.zero, color: "bg-gray-300" },
                      ].map((t) => (
                        <div key={t.label} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${t.color}`} />
                          <span className="text-sm text-gray-600 flex-1">{t.label}</span>
                          <span className="text-sm font-bold text-gray-900">{num(t.n)}</span>
                          <span className="text-xs text-gray-400 w-12 text-right">{pct(t.n, o.totalContacts)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Subscription Health</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Active</span><span className="font-bold text-emerald-600">{num(o.activeSubscribers)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Canceled</span><span className="font-bold text-red-500">{num(o.canceledSubscribers)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">One-Time Buyers</span><span className="font-bold text-blue-600">{num(o.oneTimeBuyers)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Churn Rate</span><span className="font-bold text-gray-900">{churnRate}%</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Never Purchased</span><span className="font-bold text-gray-400">{num(o.neverPurchased)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REVENUE */}
            {view === "revenue" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                  <p className="text-sm text-white/50">Total Lifetime Revenue</p>
                  <p className="text-4xl font-bold mt-2">{fmt(o.totalRevenue)}</p>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
                    <div><p className="text-2xl font-bold">{num(o.totalPurchases)}</p><p className="text-xs text-white/50">Transactions</p></div>
                    <div><p className="text-2xl font-bold">{fmt(o.avgLTV)}</p><p className="text-xs text-white/50">Avg LTV</p></div>
                    <div><p className="text-2xl font-bold">{fmt(o.avgOrderValue)}</p><p className="text-xs text-white/50">Avg Order</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue by Customer Tier</h3>
                  <div className="space-y-4">
                    {[
                      { label: `${hvLabel} ($500+)`, n: data.ltvBuckets.whale, color: "bg-violet-500", est: data.ltvBuckets.whale * 750 },
                      { label: "Mid-Tier ($200-499)", n: data.ltvBuckets.mid, color: "bg-blue-500", est: data.ltvBuckets.mid * 320 },
                      { label: "Low-Tier (<$200)", n: data.ltvBuckets.low, color: "bg-amber-400", est: data.ltvBuckets.low * 80 },
                    ].map((t) => (
                      <div key={t.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-700">{t.label}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">{num(t.n)} {(ic?.contactLabelPlural || "customers").toLowerCase()}</span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${t.color}`} style={{ width: `${o.totalContacts > 0 ? (t.n / o.totalContacts) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TOP CUSTOMERS */}
            {view === "customers" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Top {ic?.contactLabelPlural || "Customers"} by LTV</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Your highest value {(ic?.contactLabelPlural || "customers").toLowerCase()} ranked by lifetime spending</p>
                  </div>
                  <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all {(ic?.contactLabelPlural || "contacts").toLowerCase()} <ChevronRight className="w-3 h-3" /></Link>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 text-xs font-semibold text-gray-500 uppercase w-8">#</th>
                      <th className="text-left py-2.5 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                      <th className="text-right py-2.5 text-xs font-semibold text-gray-500 uppercase">LTV</th>
                      <th className="text-right py-2.5 text-xs font-semibold text-gray-500 uppercase">Orders</th>
                      <th className="text-center py-2.5 text-xs font-semibold text-gray-500 uppercase">Sub Status</th>
                      <th className="text-right py-2.5 text-xs font-semibold text-gray-500 uppercase">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.topCustomers.map((c, i) => (
                      <tr key={c.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 text-sm text-gray-400">{i + 1}</td>
                        <td className="py-3">
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-sm font-bold ${c.ltv >= 500 ? "text-violet-700" : c.ltv >= 200 ? "text-blue-600" : "text-gray-700"}`}>{fmt(c.ltv)}</span>
                        </td>
                        <td className="py-3 text-right text-sm text-gray-600">{c.purchases}</td>
                        <td className="py-3 text-center">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                            c.subscriptionStatus === "active" ? "bg-emerald-50 text-emerald-700" :
                            c.subscriptionStatus === "canceled" ? "bg-red-50 text-red-600" :
                            "bg-gray-100 text-gray-500"
                          }`}>{c.subscriptionStatus}</span>
                        </td>
                        <td className="py-3 text-right">
                          {c.daysSince !== null ? (
                            <span className={`text-xs font-medium ${c.daysSince <= 30 ? "text-emerald-600" : c.daysSince <= 90 ? "text-amber-600" : "text-red-500"}`}>{c.daysSince}d ago</span>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUBSCRIPTIONS */}
            {view === "subscriptions" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Breakdown</h2>
                  <div className="h-4 rounded-full bg-gray-100 overflow-hidden flex mb-6">
                    {Object.entries(data.subscriptionBreakdown).sort((a,b) => b[1]-a[1]).map(([k,v]) => (
                      <div key={k} className={`h-full ${subColors[k] || "bg-gray-400"}`} style={{ width: `${totalSubs > 0 ? (v/totalSubs)*100 : 0}%` }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.entries(data.subscriptionBreakdown).sort((a,b) => b[1]-a[1]).map(([k,v]) => (
                      <div key={k} className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className={`w-3 h-3 rounded-full ${subColors[k] || "bg-gray-400"} mx-auto mb-2`} />
                        <p className="text-2xl font-bold text-gray-900">{num(v)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{subLabels[k] || k}</p>
                        <p className="text-[10px] text-gray-400">{pct(v, totalSubs)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Active Subscribers</span><span className="text-sm font-bold text-emerald-600">{num(o.activeSubscribers)}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Churn Rate</span><span className="text-sm font-bold text-gray-900">{churnRate}%</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Recovery Potential</span><span className="text-sm font-bold text-amber-600">{num(o.canceledSubscribers)} lapsed</span></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Type</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Subscribers (active + canceled)</span><span className="text-sm font-bold">{num(o.activeSubscribers + o.canceledSubscribers)}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">One-Time Buyers</span><span className="text-sm font-bold">{num(o.oneTimeBuyers)}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Never Purchased</span><span className="text-sm font-bold text-gray-400">{num(o.neverPurchased)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEGMENTS */}
            {view === "segments" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Customer Segments</h2>
                  <p className="text-sm text-gray-500 mb-6">Auto-generated segments based on Stripe purchase data</p>
                  <div className="space-y-3">
                    {data.tagBreakdown.map((t, i) => (
                      <div key={t.tag} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                          t.tag === "Whale" ? "bg-violet-500" :
                          t.tag === "Active Subscriber" ? "bg-emerald-500" :
                          t.tag === "Lapsed" ? "bg-red-400" :
                          t.tag === "Win-Back" ? "bg-amber-500" :
                          t.tag === "High Frequency" ? "bg-blue-500" :
                          t.tag === "Recently Active" ? "bg-cyan-500" :
                          "bg-gray-400"
                        }`}>{i + 1}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{t.tag}</p>
                          <p className="text-xs text-gray-400">{pct(t.count, o.totalContacts)} of contacts</p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{num(t.count)}</span>
                        <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View →</Link>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Status Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(data.statusBreakdown).sort((a,b) => b[1]-a[1]).map(([status, ct]) => (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 capitalize">{status}</span>
                          <span className="text-sm font-bold text-gray-900">{num(ct)} ({pct(ct, o.totalContacts)})</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${
                            status === "active" ? "bg-emerald-500" : status === "lead" ? "bg-indigo-500" : status === "inactive" ? "bg-gray-400" : "bg-red-400"
                          }`} style={{ width: `${(ct / o.totalContacts) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
