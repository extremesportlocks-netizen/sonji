"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/dashboard/header";
import {
  Users, DollarSign, TrendingUp, ShoppingCart, Crown, UserCheck, UserX,
  ChevronRight, Loader2, Search, Handshake, Zap, Upload, Target,
  BarChart3, ArrowUpRight, ArrowDownRight, Send,
} from "lucide-react";

interface Stats {
  totalContacts: number; totalDeals: number; activeDeals: number; wonDeals: number;
  totalTasks: number; openTasks: number;
  recentContacts: any[];
  statusBreakdown: { status: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  revenue: { total: number; totalPurchases: number; avgLTV: number; avgOrder: number; contactsWithPurchases: number };
  ltvBuckets: { whale: number; mid: number; low: number; zero: number };
  subscriptionBreakdown: Record<string, number>;
  topCustomers: { id: string; name: string; email: string; ltv: number; purchases: number; subStatus: string }[];
  tenantName: string; tenantSlug: string;
}

function fmt(n: number) { return n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`; }
function num(n: number) { return n.toLocaleString(); }
function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d/60000);
  if (m < 1) return "Just now"; if (m < 60) return `${m}m`; const h = Math.floor(m/60);
  if (h < 24) return `${h}h`; return `${Math.floor(h/24)}d`;
}

const statusColors: Record<string,string> = { active:"bg-emerald-500", lead:"bg-indigo-500", inactive:"bg-gray-400", lost:"bg-red-400" };
const subColors: Record<string,string> = { active:"bg-emerald-500", canceled:"bg-red-400", expired:"bg-amber-400", "one-time":"bg-blue-400", never:"bg-gray-300" };
const subLabels: Record<string,string> = { active:"Active", canceled:"Canceled", expired:"Expired", "one-time":"One-Time", never:"No Sub" };

export default function DashboardPage() {
  const [s, setS] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { if (d.ok) setS(d.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (<><Header title="Dashboard" /><div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div></>);
  if (!s) return (<><Header title="Dashboard" /><div className="p-6 text-center py-32 text-gray-500">Unable to load dashboard</div></>);

  const hasRevenue = s.revenue.total > 0;
  const totalSubs = Object.values(s.subscriptionBreakdown).reduce((a, b) => a + b, 0);

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-0.5">{s.tenantName} &middot; {num(s.totalContacts)} contacts{hasRevenue ? ` · ${fmt(s.revenue.total)} revenue` : ""}</p>
          </div>
          <Link href="/dashboard/analytics" className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg transition">
            <BarChart3 className="w-3.5 h-3.5" /> Full Analytics
          </Link>
        </div>

        {/* Stat Cards — 2 rows of 4 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: fmt(s.revenue.total), sub: `${num(s.revenue.totalPurchases)} transactions`, icon: DollarSign, color: "bg-emerald-500", show: hasRevenue },
            { label: "Total Contacts", value: num(s.totalContacts), sub: `${num(s.revenue.contactsWithPurchases)} paying`, icon: Users, color: "bg-indigo-500", show: true },
            { label: "Avg Customer LTV", value: fmt(s.revenue.avgLTV), sub: `${fmt(s.revenue.avgOrder)} avg order`, icon: TrendingUp, color: "bg-violet-500", show: hasRevenue },
            { label: "Active Subscribers", value: num(s.subscriptionBreakdown.active || 0), sub: `${num(s.subscriptionBreakdown.canceled || 0)} canceled`, icon: UserCheck, color: "bg-blue-500", show: true },
          ].filter(c => c.show).map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100/50 transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1.5">{c.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                  <c.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — 2/3 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Customer Value + Subscription — side by side */}
            {hasRevenue && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LTV Tiers */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Customer Value</h2>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex mb-4">
                    {[
                      { k: "whale", c: "bg-violet-500", n: s.ltvBuckets.whale },
                      { k: "mid", c: "bg-blue-500", n: s.ltvBuckets.mid },
                      { k: "low", c: "bg-amber-400", n: s.ltvBuckets.low },
                      { k: "zero", c: "bg-gray-300", n: s.ltvBuckets.zero },
                    ].filter(b => b.n > 0).map(b => (
                      <div key={b.k} className={`h-full ${b.c}`} style={{ width: `${(b.n / s.totalContacts) * 100}%` }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Whales ($500+)", n: s.ltvBuckets.whale, color: "text-violet-600", dot: "bg-violet-500" },
                      { label: "Mid ($200-499)", n: s.ltvBuckets.mid, color: "text-blue-600", dot: "bg-blue-500" },
                      { label: "Low (<$200)", n: s.ltvBuckets.low, color: "text-amber-600", dot: "bg-amber-400" },
                      { label: "No purchase", n: s.ltvBuckets.zero, color: "text-gray-500", dot: "bg-gray-300" },
                    ].map(t => (
                      <div key={t.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${t.dot}`} />
                        <span className="text-xs text-gray-500">{t.label}</span>
                        <span className={`text-xs font-bold ${t.color} ml-auto`}>{num(t.n)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription Breakdown */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Subscriptions</h2>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex mb-4">
                    {Object.entries(s.subscriptionBreakdown).sort((a,b) => b[1]-a[1]).map(([k,v]) => (
                      <div key={k} className={`h-full ${subColors[k] || "bg-gray-400"}`} style={{ width: `${totalSubs > 0 ? (v/totalSubs)*100 : 0}%` }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(s.subscriptionBreakdown).sort((a,b) => b[1]-a[1]).slice(0, 4).map(([k,v]) => (
                      <div key={k} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${subColors[k] || "bg-gray-400"}`} />
                        <span className="text-xs text-gray-500">{subLabels[k] || k}</span>
                        <span className="text-xs font-bold text-gray-700 ml-auto">{num(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top Customers */}
            {s.topCustomers.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-900">Top Customers</h2>
                  <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
                </div>
                <div className="space-y-1">
                  {s.topCustomers.map((c, i) => (
                    <Link key={c.id} href={`/dashboard/contacts/${c.id}`} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? "bg-violet-500" : i === 1 ? "bg-blue-500" : "bg-gray-400"}`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email} &middot; {c.purchases} purchases</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${c.ltv >= 500 ? "text-violet-600" : "text-gray-900"}`}>{fmt(c.ltv)}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${
                          c.subStatus === "active" ? "bg-emerald-50 text-emerald-700" :
                          c.subStatus === "canceled" ? "bg-red-50 text-red-500" :
                          "bg-gray-100 text-gray-500"
                        }`}>{c.subStatus}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Status Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Contact Status</h2>
                <span className="text-xs text-gray-400">{num(s.totalContacts)} total</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex mb-3">
                {s.statusBreakdown.sort((a,b) => b.count-a.count).map(st => (
                  <div key={st.status} className={`h-full ${statusColors[st.status.toLowerCase()] || "bg-gray-400"}`}
                    style={{ width: `${(st.count / s.totalContacts) * 100}%` }} />
                ))}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {s.statusBreakdown.sort((a,b) => b.count-a.count).map(st => (
                  <div key={st.status} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusColors[st.status.toLowerCase()] || "bg-gray-400"}`} />
                    <span className="text-xs text-gray-500 capitalize">{st.status}</span>
                    <span className="text-xs font-bold text-gray-700">{num(st.count)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Added */}
            {s.recentContacts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-900">Recently Added</h2>
                  <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
                </div>
                <div className="space-y-1">
                  {s.recentContacts.map((c: any) => (
                    <Link key={c.id} href={`/dashboard/contacts/${c.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600">{c.firstName?.[0]||"?"}{c.lastName?.[0]||""}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.ltv > 0 && <span className="text-xs font-semibold text-gray-700">{fmt(c.ltv)}</span>}
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${
                          c.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          c.status === "inactive" ? "bg-gray-50 text-gray-500 border-gray-200" :
                          "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}>{c.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — 1/3 */}
          <div className="space-y-6">

            {/* Revenue Card */}
            {hasRevenue && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Lifetime Revenue</p>
                <p className="text-3xl font-bold mt-2">{fmt(s.revenue.total)}</p>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Avg LTV</span>
                    <span className="font-semibold">{fmt(s.revenue.avgLTV)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Avg Order</span>
                    <span className="font-semibold">{fmt(s.revenue.avgOrder)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Transactions</span>
                    <span className="font-semibold">{num(s.revenue.totalPurchases)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Paying Customers</span>
                    <span className="font-semibold">{num(s.revenue.contactsWithPurchases)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="space-y-1.5">
                {[
                  { href: "/dashboard/campaigns", icon: Send, c: "bg-violet-50 group-hover:bg-violet-100", ic: "text-violet-600", l: "Send Campaign" },
                  { href: "/dashboard/contacts", icon: Users, c: "bg-indigo-50 group-hover:bg-indigo-100", ic: "text-indigo-600", l: "Browse Contacts" },
                  { href: "/dashboard/deals", icon: Handshake, c: "bg-blue-50 group-hover:bg-blue-100", ic: "text-blue-600", l: "Manage Deals" },
                  { href: "/dashboard/analytics", icon: BarChart3, c: "bg-emerald-50 group-hover:bg-emerald-100", ic: "text-emerald-600", l: "View Analytics" },
                  { href: "/dashboard/settings?tab=integrations", icon: Zap, c: "bg-amber-50 group-hover:bg-amber-100", ic: "text-amber-600", l: "Integrations" },
                ].map(a => (
                  <Link key={a.href} href={a.href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition group">
                    <div className={`w-8 h-8 rounded-lg ${a.c} flex items-center justify-center transition`}><a.icon className={`w-4 h-4 ${a.ic}`} /></div>
                    <span className="text-sm font-medium text-gray-700">{a.l}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            {s.sourceBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Data Sources</h2>
                <div className="space-y-2.5">
                  {s.sourceBreakdown.map(src => (
                    <div key={src.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="text-sm text-gray-600 capitalize">{src.source.replace(/_/g, " ")}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{num(src.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
