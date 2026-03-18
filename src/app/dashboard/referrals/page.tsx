"use client";

import { getDemoIndustry } from "@/lib/tenant-utils";
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
  fitness_gym: {
    link: "https://sonji.io/ref/iron-republic",
    totalCommission: 960, totalReferred: 12, conversionRate: 42,
    referrals: [
      { id: "r1", referrer: "Stephanie Clark", referred: "2 coworkers", date: "Mar 12", status: "converted", revenue: 158, commission: 48 },
      { id: "r2", referrer: "Brandon Lewis", referred: "College roommate", date: "Mar 14", status: "pending", revenue: 0, commission: 0 },
    ],
  },
  beauty_salon: {
    link: "https://sonji.io/ref/luxe-beauty",
    totalCommission: 1250, totalReferred: 18, conversionRate: 55,
    referrals: [
      { id: "r1", referrer: "Charlotte Davis", referred: "Bridal party (4)", date: "Mar 10", status: "converted", revenue: 2400, commission: 240 },
      { id: "r2", referrer: "Amelia Wilson", referred: "Sister", date: "Mar 14", status: "active", revenue: 350, commission: 35 },
    ],
  },
  real_estate: {
    link: "https://sonji.io/ref/summit-realty",
    totalCommission: 8900, totalReferred: 6, conversionRate: 33,
    referrals: [
      { id: "r1", referrer: "Amanda Hill", referred: "Colleague at work", date: "Mar 8", status: "active", revenue: 0, commission: 0 },
      { id: "r2", referrer: "Karen Wu", referred: "Neighbor selling home", date: "Feb 15", status: "converted", revenue: 890000, commission: 8900 },
    ],
  },
  home_services: {
    link: "https://sonji.io/ref/apex-roofing",
    totalCommission: 2800, totalReferred: 15, conversionRate: 40,
    referrals: [
      { id: "r1", referrer: "Linda Garcia", referred: "Nextdoor neighbors (3)", date: "Mar 12", status: "converted", revenue: 12500, commission: 1250 },
      { id: "r2", referrer: "Thomas Brown", referred: "Barbara Martinez", date: "Mar 5", status: "converted", revenue: 4200, commission: 420 },
    ],
  },
  legal: {
    link: "https://sonji.io/ref/sterling-law",
    totalCommission: 3200, totalReferred: 8, conversionRate: 25,
    referrals: [
      { id: "r1", referrer: "Marcus Johnson", referred: "Friend (PI case)", date: "Mar 10", status: "active", revenue: 0, commission: 0 },
      { id: "r2", referrer: "Harbor Construction", referred: "Subcontractor", date: "Feb 20", status: "converted", revenue: 8500, commission: 850 },
    ],
  },
  coaching_education: {
    link: "https://sonji.io/ref/elevate-coaching",
    totalCommission: 4500, totalReferred: 10, conversionRate: 30,
    referrals: [
      { id: "r1", referrer: "Jason Wright", referred: "Nathan Harris", date: "Mar 14", status: "pending", revenue: 0, commission: 0 },
      { id: "r2", referrer: "Mastermind Cohort", referred: "3 referrals total", date: "Mar 1", status: "converted", revenue: 15000, commission: 1500 },
    ],
  },
  restaurant_food: {
    link: "https://sonji.io/ref/copper-table",
    totalCommission: 680, totalReferred: 22, conversionRate: 68,
    referrals: [
      { id: "r1", referrer: "Michael Rivera", referred: "Work colleagues (4)", date: "Mar 12", status: "converted", revenue: 1200, commission: 120 },
      { id: "r2", referrer: "Apex Financial Group", referred: "Client entertainment", date: "Mar 8", status: "active", revenue: 3500, commission: 350 },
    ],
  },
  automotive: {
    link: "https://sonji.io/ref/precision-auto",
    totalCommission: 1200, totalReferred: 18, conversionRate: 45,
    referrals: [
      { id: "r1", referrer: "Thomas Brown", referred: "Wife's car", date: "Mar 14", status: "converted", revenue: 450, commission: 45 },
      { id: "r2", referrer: "Enterprise Fleet", referred: "Corporate fleet referral", date: "Mar 1", status: "converted", revenue: 4800, commission: 480 },
    ],
  },
  nonprofit: {
    link: "https://sonji.io/ref/harbor-foundation",
    totalCommission: 0, totalReferred: 12, conversionRate: 50,
    referrals: [
      { id: "r1", referrer: "Robert Chen", referred: "Business partner", date: "Mar 10", status: "converted", revenue: 12000, commission: 0 },
      { id: "r2", referrer: "Amanda Hill", referred: "Community group", date: "Mar 5", status: "active", revenue: 0, commission: 0 },
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
    const di = getDemoIndustry();
    const key = di; if (!key) return;
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
