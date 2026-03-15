"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { Loader2, Users, UserPlus, DollarSign, Zap, RefreshCw, Filter } from "lucide-react";

interface RecentContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  source: string | null;
  createdAt: string;
  customFields: Record<string, any>;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<RecentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const isDemo = demoIndustry && demoIndustry !== "ecommerce";
    const url = isDemo ? `/api/demo/contacts?industry=${demoIndustry}&pageSize=100` : "/api/contacts?pageSize=100&sortBy=createdAt&sortOrder=desc";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setActivities(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? activities :
    filter === "active" ? activities.filter((a) => a.status === "active") :
    filter === "inactive" ? activities.filter((a) => a.status === "inactive") :
    filter === "whale" ? activities.filter((a) => ((a.customFields as any)?.ltv || 0) >= 500) :
    activities;

  return (
    <>
      <Header title="Activities" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
              <p className="text-sm text-gray-500 mt-0.5">Recent CRM activity across your workspace</p>
            </div>
            <div className="flex items-center gap-2">
              {[
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "inactive", label: "Inactive" },
                { key: "whale", label: "High Value" },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${filter === f.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((c) => {
                const cf = (c.customFields as any) || {};
                const ltv = cf.ltv || 0;
                const subStatus = cf.subscriptionStatus || "never";
                return (
                  <div key={c.id} className="flex items-start gap-4 py-4 hover:bg-gray-50/50 -mx-3 px-3 rounded-lg transition">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      subStatus === "active" ? "bg-emerald-50" :
                      ltv >= 500 ? "bg-violet-50" :
                      c.status === "inactive" ? "bg-red-50" : "bg-blue-50"
                    }`}>
                      {subStatus === "active" ? <UserPlus className="w-5 h-5 text-emerald-600" /> :
                       ltv >= 500 ? <DollarSign className="w-5 h-5 text-violet-600" /> :
                       c.status === "inactive" ? <Users className="w-5 h-5 text-red-500" /> :
                       <UserPlus className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                          c.status === "active" ? "bg-emerald-50 text-emerald-700" :
                          c.status === "inactive" ? "bg-red-50 text-red-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>{c.status}</span>
                        {ltv >= 500 && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">High Value</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{c.email}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {ltv > 0 && <span className="text-xs text-gray-500">LTV: <span className="font-semibold text-gray-700">{formatCurrency(ltv)}</span></span>}
                        {cf.purchaseCount > 0 && <span className="text-xs text-gray-500">{cf.purchaseCount} purchases</span>}
                        {subStatus !== "never" && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize ${
                            subStatus === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            subStatus === "canceled" ? "bg-red-50 text-red-500 border-red-200" :
                            "bg-gray-50 text-gray-500 border-gray-200"
                          }`}>{subStatus}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{timeAgo(c.createdAt)}</span>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No activities match this filter</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
