"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { Loader2, Users, DollarSign, ShoppingCart, TrendingUp, Crown, AlertTriangle, UserCheck, UserX, ChevronRight } from "lucide-react";
import Link from "next/link";

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

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function num(n: number) {
  return n.toLocaleString();
}

const subColors: Record<string, string> = {
  active: "bg-emerald-500", canceled: "bg-red-400", expired: "bg-amber-400",
  "one-time": "bg-blue-400", never: "bg-gray-300",
};
const subLabels: Record<string, string> = {
  active: "Active", canceled: "Canceled", expired: "Expired",
  "one-time": "One-Time", never: "Never Purchased",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((res) => { if (res.ok) setData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <><Header title="Analytics" /><div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div></>
  );

  if (!data) return (
    <><Header title="Analytics" /><div className="p-6 text-center py-32"><p className="text-gray-500">Connect Stripe to see analytics</p><Link href="/dashboard/settings" className="text-indigo-600 text-sm font-medium mt-2 inline-block">Go to Settings →</Link></div></>
  );

  const o = data.overview;
  const totalWithSubs = Object.values(data.subscriptionBreakdown).reduce((s, v) => s + v, 0);

  return (
    <>
      <Header title="Analytics" />
      <div className="p-6 space-y-6">

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: fmt(o.totalRevenue), icon: DollarSign, color: "bg-emerald-500", sub: `From ${num(o.contactsWithPurchases)} paying customers` },
            { label: "Total Contacts", value: num(o.totalContacts), icon: Users, color: "bg-indigo-500", sub: `${num(o.activeSubscribers)} active subscribers` },
            { label: "Avg LTV", value: fmt(o.avgLTV), icon: TrendingUp, color: "bg-violet-500", sub: `Across ${num(o.contactsWithPurchases)} customers` },
            { label: "Avg Order", value: fmt(o.avgOrderValue), icon: ShoppingCart, color: "bg-blue-500", sub: `${num(o.totalPurchases)} total purchases` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{s.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Customer Tiers */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Customer Value Tiers</h2>
              <div className="h-4 rounded-full bg-gray-100 overflow-hidden flex mb-4">
                {[
                  { key: "whale", color: "bg-violet-500", count: data.ltvBuckets.whale },
                  { key: "mid", color: "bg-blue-500", count: data.ltvBuckets.mid },
                  { key: "low", color: "bg-amber-400", count: data.ltvBuckets.low },
                  { key: "zero", color: "bg-gray-300", count: data.ltvBuckets.zero },
                ].filter((b) => b.count > 0).map((b) => (
                  <div key={b.key} className={`h-full ${b.color}`}
                    style={{ width: `${(b.count / o.totalContacts) * 100}%` }}
                    title={`${b.key}: ${b.count}`} />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Whales ($500+)", count: data.ltvBuckets.whale, color: "bg-violet-500", icon: Crown },
                  { label: "Mid ($200-499)", count: data.ltvBuckets.mid, color: "bg-blue-500", icon: TrendingUp },
                  { label: "Low (<$200)", count: data.ltvBuckets.low, color: "bg-amber-400", icon: Users },
                  { label: "No Purchase", count: data.ltvBuckets.zero, color: "bg-gray-300", icon: AlertTriangle },
                ].map((t) => (
                  <div key={t.label} className="text-center p-3 rounded-lg bg-gray-50">
                    <div className={`w-8 h-8 rounded-lg ${t.color} flex items-center justify-center mx-auto mb-2`}>
                      <t.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{num(t.count)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.label}</p>
                    <p className="text-[10px] text-gray-400">{o.totalContacts > 0 ? `${((t.count / o.totalContacts) * 100).toFixed(1)}%` : "0%"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Subscription Status</h2>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex mb-4">
                {Object.entries(data.subscriptionBreakdown).sort((a, b) => b[1] - a[1]).map(([status, ct]) => (
                  <div key={status} className={`h-full ${subColors[status] || "bg-gray-400"}`}
                    style={{ width: `${totalWithSubs > 0 ? (ct / totalWithSubs) * 100 : 0}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(data.subscriptionBreakdown).sort((a, b) => b[1] - a[1]).map(([status, ct]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${subColors[status] || "bg-gray-400"}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{num(ct)}</p>
                      <p className="text-xs text-gray-400">{subLabels[status] || status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Top Customers by LTV</h2>
                <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">LTV</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Purchases</th>
                      <th className="text-center py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Days Since</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.topCustomers.slice(0, 15).map((c, i) => (
                      <tr key={c.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-2.5 text-xs text-gray-400 w-8">{i + 1}</td>
                        <td className="py-2.5">
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`text-sm font-bold ${c.ltv >= 500 ? "text-violet-700" : c.ltv >= 200 ? "text-blue-600" : "text-gray-700"}`}>
                            {fmt(c.ltv)}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-sm text-gray-600">{c.purchases}</td>
                        <td className="py-2.5 text-center">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                            c.subscriptionStatus === "active" ? "bg-emerald-50 text-emerald-700" :
                            c.subscriptionStatus === "canceled" ? "bg-red-50 text-red-600" :
                            "bg-gray-100 text-gray-500"
                          }`}>{c.subscriptionStatus}</span>
                        </td>
                        <td className="py-2.5 text-right">
                          {c.daysSince !== null ? (
                            <span className={`text-xs font-medium ${c.daysSince <= 30 ? "text-emerald-600" : c.daysSince <= 90 ? "text-amber-600" : "text-red-500"}`}>
                              {c.daysSince}d
                            </span>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Key Metrics */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Key Metrics</h2>
              <div className="space-y-3">
                {[
                  { label: "Paying Customers", value: num(o.contactsWithPurchases), pct: o.totalContacts > 0 ? `${((o.contactsWithPurchases / o.totalContacts) * 100).toFixed(1)}%` : "0%" },
                  { label: "Active Subscribers", value: num(o.activeSubscribers), pct: o.totalContacts > 0 ? `${((o.activeSubscribers / o.totalContacts) * 100).toFixed(1)}%` : "0%" },
                  { label: "Churn (Canceled)", value: num(o.canceledSubscribers), pct: o.activeSubscribers + o.canceledSubscribers > 0 ? `${((o.canceledSubscribers / (o.activeSubscribers + o.canceledSubscribers)) * 100).toFixed(1)}%` : "0%" },
                  { label: "Never Purchased", value: num(o.neverPurchased), pct: o.totalContacts > 0 ? `${((o.neverPurchased / o.totalContacts) * 100).toFixed(1)}%` : "0%" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{m.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{m.value}</span>
                      <span className="text-xs text-gray-400 ml-2">({m.pct})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Tags */}
            {data.tagBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Customer Segments</h2>
                <div className="space-y-2">
                  {data.tagBreakdown.map((t) => (
                    <div key={t.tag} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          t.tag === "Whale" ? "bg-violet-500" :
                          t.tag === "Active Subscriber" ? "bg-emerald-500" :
                          t.tag === "Lapsed" ? "bg-red-400" :
                          t.tag === "Win-Back" ? "bg-amber-500" :
                          t.tag === "High Frequency" ? "bg-blue-500" :
                          "bg-gray-400"
                        }`} />
                        <span className="text-sm text-gray-700">{t.tag}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{num(t.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Snapshot */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white">
              <h2 className="text-sm font-semibold text-white/70 mb-3">Revenue Snapshot</h2>
              <p className="text-3xl font-bold">{fmt(o.totalRevenue)}</p>
              <p className="text-sm text-white/50 mt-1">Lifetime revenue tracked</p>
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Avg LTV</span>
                  <span className="font-semibold">{fmt(o.avgLTV)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Avg Order</span>
                  <span className="font-semibold">{fmt(o.avgOrderValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Transactions</span>
                  <span className="font-semibold">{num(o.totalPurchases)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
