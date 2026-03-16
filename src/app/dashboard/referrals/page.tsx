"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  Users, DollarSign, Link2, Copy, ExternalLink, TrendingUp,
  CheckCircle, Clock, Star, Gift, Share2, BarChart3,
} from "lucide-react";

interface Referral {
  id: string;
  referrer: string;
  referred: string;
  date: string;
  status: "active" | "pending" | "converted" | "expired";
  revenue: number;
  commission: number;
}

const INDUSTRY_REFERRALS: Record<string, { link: string; referrals: Referral[]; totalCommission: number; totalReferred: number; conversionRate: number }> = {
  agency_consulting: {
    link: "https://sonji.io/ref/power-marketing",
    totalCommission: 4200,
    totalReferred: 14,
    conversionRate: 28.5,
    referrals: [
      { id: "r1", referrer: "Marcus R. (Apex Consulting)", referred: "Summit Athletics", date: "Mar 10", status: "converted", revenue: 12000, commission: 1200 },
      { id: "r2", referrer: "Jessica M. (Glow Med Spa)", referred: "Coastal Dermatology", date: "Mar 8", status: "converted", revenue: 8500, commission: 850 },
      { id: "r3", referrer: "Harbor Dental", referred: "Bright Smile Dental", date: "Mar 14", status: "pending", revenue: 0, commission: 0 },
      { id: "r4", referrer: "Brightview Hotels", referred: "Marina Bay Resort", date: "Mar 12", status: "active", revenue: 3000, commission: 300 },
      { id: "r5", referrer: "Marcus R. (Apex Consulting)", referred: "Peak Contractors", date: "Feb 28", status: "converted", revenue: 9500, commission: 950 },
      { id: "r6", referrer: "Sterling Partners", referred: "Zenith Financial", date: "Mar 1", status: "expired", revenue: 0, commission: 0 },
    ],
  },
  health_wellness: {
    link: "https://sonji.io/ref/glow-med-spa",
    totalCommission: 1800,
    totalReferred: 8,
    conversionRate: 37.5,
    referrals: [
      { id: "r1", referrer: "Sarah Thompson", referred: "Emily Rodriguez", date: "Mar 14", status: "converted", revenue: 1600, commission: 160 },
      { id: "r2", referrer: "Maria Santos", referred: "2 friends", date: "Mar 10", status: "pending", revenue: 0, commission: 0 },
      { id: "r3", referrer: "David Kim", referred: "James Park", date: "Mar 5", status: "converted", revenue: 2400, commission: 240 },
    ],
  },
  ecommerce: {
    link: "https://sonji.io/ref/esl-sports",
    totalCommission: 2970,
    totalReferred: 23,
    conversionRate: 18.2,
    referrals: [
      { id: "r1", referrer: "Chris Persaud", referred: "3 friends", date: "Mar 12", status: "converted", revenue: 297, commission: 89 },
      { id: "r2", referrer: "Wayne Barry", referred: "DFS Discord Server", date: "Mar 8", status: "active", revenue: 594, commission: 178 },
      { id: "r3", referrer: "Tyler McLaughlin", referred: "Reddit r/sportsbetting", date: "Feb 20", status: "converted", revenue: 1485, commission: 445 },
    ],
  },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  converted: { label: "Converted", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  expired: { label: "Expired", color: "text-gray-400", bg: "bg-gray-50 border-gray-200" },
};

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`; }

export default function ReferralsPage() {
  const ic = useIndustry();
  const [data, setData] = useState<typeof INDUSTRY_REFERRALS.agency_consulting | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const di = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = di || "ecommerce";
    setData(INDUSTRY_REFERRALS[key] || INDUSTRY_REFERRALS.ecommerce);
  }, []);

  if (!data) return <><Header title="Referrals" /><div className="p-6">Loading...</div></>;

  const copyLink = () => {
    navigator.clipboard.writeText(data.link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header title="Referrals" />
      <div className="p-6 space-y-6">
        {/* Referral Link Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold mb-1">Your Referral Link</h2>
              <p className="text-sm text-white/60">Share this link and earn 10% commission on every referred customer</p>
            </div>
            <Gift className="w-10 h-10 text-white/20" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 bg-white/10 rounded-lg px-4 py-2.5 text-sm font-mono truncate">{data.link}</div>
            <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 font-medium text-sm rounded-lg hover:bg-white/90 transition">
              {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-400">Total Referred</span></div>
            <p className="text-2xl font-bold text-gray-900">{data.totalReferred}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-400">Conversion Rate</span></div>
            <p className="text-2xl font-bold text-emerald-600">{data.conversionRate}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-400">Total Commission</span></div>
            <p className="text-2xl font-bold text-green-600">{fmt(data.totalCommission)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-400">Commission Rate</span></div>
            <p className="text-2xl font-bold text-amber-600">10%</p>
          </div>
        </div>

        {/* Referral Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Referral History</h3>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Referrer</th>
              <th className="text-left text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Referred</th>
              <th className="text-left text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Date</th>
              <th className="text-left text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Status</th>
              <th className="text-right text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Revenue</th>
              <th className="text-right text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Commission</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {data.referrals.map(r => {
                const sc = statusConfig[r.status];
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3 text-sm text-gray-900 font-medium">{r.referrer}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{r.referred}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{r.date}</td>
                    <td className="px-5 py-3"><span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span></td>
                    <td className="px-5 py-3 text-sm text-right text-gray-700 font-medium">{r.revenue > 0 ? fmt(r.revenue) : "—"}</td>
                    <td className="px-5 py-3 text-sm text-right font-bold text-emerald-600">{r.commission > 0 ? fmt(r.commission) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
