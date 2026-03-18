"use client";

import { getDemoIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import { TrendingUp, Zap, ArrowUpRight } from "lucide-react";

/**
 * RECOVERED REVENUE COUNTER
 * 
 * The number that makes cancellation impossible.
 * Tracks the monetary value of Sonji's automations:
 * - Win-back emails that resulted in a purchase
 * - Rebooking reminders that led to appointments
 * - Follow-up sequences that closed deals
 * - Lapsed customer re-engagement
 * 
 * For demo mode: generates realistic recovered revenue based on industry data.
 * For live mode: will track actual automation-triggered conversions.
 */

interface RecoveryMetric {
  label: string;
  amount: number;
  count: number;
  icon: string;
}

const INDUSTRY_RECOVERY: Record<string, { total: number; metrics: RecoveryMetric[] }> = {
  health_wellness: {
    total: 47200,
    metrics: [
      { label: "Rebooking reminders", amount: 22400, count: 56, icon: "📅" },
      { label: "No-show recovery", amount: 8800, count: 22, icon: "🔄" },
      { label: "Lapsed patient win-back", amount: 12000, count: 15, icon: "💌" },
      { label: "Review-driven referrals", amount: 4000, count: 8, icon: "⭐" },
    ],
  },
  fitness_gym: {
    total: 31500,
    metrics: [
      { label: "At-risk member saves", amount: 14400, count: 24, icon: "🏋️" },
      { label: "Trial-to-member conversions", amount: 9600, count: 16, icon: "✅" },
      { label: "Renewal reminders", amount: 5400, count: 9, icon: "🔄" },
      { label: "Referral program signups", amount: 2100, count: 7, icon: "👥" },
    ],
  },
  beauty_salon: {
    total: 38900,
    metrics: [
      { label: "Rebooking before lapse", amount: 18400, count: 92, icon: "✂" },
      { label: "Lapsed client recovery", amount: 11200, count: 56, icon: "💌" },
      { label: "Birthday offer conversions", amount: 4800, count: 24, icon: "🎂" },
      { label: "Review request revenue", amount: 4500, count: 15, icon: "⭐" },
    ],
  },
  agency_consulting: {
    total: 84000,
    metrics: [
      { label: "Proposal follow-up closes", amount: 42000, count: 6, icon: "📝" },
      { label: "Renewal saves", amount: 28000, count: 4, icon: "🔄" },
      { label: "Upsell conversions", amount: 14000, count: 2, icon: "📈" },
    ],
  },
  real_estate: {
    total: 62500,
    metrics: [
      { label: "Sphere of influence referrals", amount: 37500, count: 3, icon: "🏠" },
      { label: "Lead follow-up conversions", amount: 15000, count: 2, icon: "📞" },
      { label: "Past client re-engagement", amount: 10000, count: 1, icon: "💌" },
    ],
  },
  home_services: {
    total: 56000,
    metrics: [
      { label: "Estimate follow-up closes", amount: 32000, count: 4, icon: "📋" },
      { label: "Seasonal maintenance bookings", amount: 16000, count: 8, icon: "🔧" },
      { label: "Review-driven leads", amount: 8000, count: 2, icon: "⭐" },
    ],
  },
  legal: {
    total: 73000,
    metrics: [
      { label: "Speed-to-lead conversions", amount: 45000, count: 5, icon: "⚡" },
      { label: "Engagement follow-up signs", amount: 18000, count: 3, icon: "📝" },
      { label: "Past client referrals", amount: 10000, count: 2, icon: "👥" },
    ],
  },
  coaching_education: {
    total: 42000,
    metrics: [
      { label: "Discovery call follow-ups", amount: 20000, count: 4, icon: "📞" },
      { label: "Alumni upsell to next level", amount: 15000, count: 3, icon: "🎓" },
      { label: "Testimonial-driven leads", amount: 7000, count: 2, icon: "⭐" },
    ],
  },
  restaurant_food: {
    total: 18500,
    metrics: [
      { label: "Lapsed diner return visits", amount: 8400, count: 210, icon: "🍽" },
      { label: "Catering follow-up bookings", amount: 6500, count: 3, icon: "📅" },
      { label: "Birthday offer redemptions", amount: 2400, count: 60, icon: "🎂" },
      { label: "Weekly specials responses", amount: 1200, count: 30, icon: "📱" },
    ],
  },
  automotive: {
    total: 44800,
    metrics: [
      { label: "Maintenance reminder bookings", amount: 24000, count: 60, icon: "🔧" },
      { label: "Estimate follow-up closes", amount: 12800, count: 4, icon: "📋" },
      { label: "Declined service recovery", amount: 8000, count: 10, icon: "🔄" },
    ],
  },
  nonprofit: {
    total: 28500,
    metrics: [
      { label: "Lapsed donor re-engagement", amount: 15000, count: 30, icon: "💚" },
      { label: "Thank-you driven repeat gifts", amount: 8500, count: 85, icon: "🙏" },
      { label: "Year-end campaign uplift", amount: 5000, count: 10, icon: "📊" },
    ],
  },
  ecommerce: {
    total: 52300,
    metrics: [
      { label: "Win-back campaign conversions", amount: 23400, count: 18, icon: "💌" },
      { label: "One-time → repeat buyer", amount: 16800, count: 42, icon: "🔄" },
      { label: "VIP retention saves", amount: 8100, count: 3, icon: "👑" },
      { label: "Cart abandonment recovery", amount: 4000, count: 12, icon: "🛒" },
    ],
  },
};

function fmt(n: number) {
  return n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`;
}

export default function RecoveredRevenue() {
  const [data, setData] = useState<{ total: number; metrics: RecoveryMetric[] } | null>(null);

  useEffect(() => {
    const demoIndustry = getDemoIndustry();
    if (!demoIndustry) return; // Real tenant — no fake recovery data
    setData(INDUSTRY_RECOVERY[demoIndustry] || INDUSTRY_RECOVERY.ecommerce);
  }, []);

  if (!data) return null;

  return (
    <div>
      {/* Hero number */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Sonji Recovered Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-black text-emerald-700">{fmt(data.total)}</p>
          <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" /> recovered
          </span>
        </div>
        <p className="text-xs text-emerald-600/70 mt-1">revenue recovered through Sonji automations this quarter</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        {data.metrics.map((m, i) => {
          const pct = Math.round((m.amount / data.total) * 100);
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg flex-shrink-0">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-600 truncate">{m.label}</span>
                  <span className="text-xs font-bold text-gray-900">{fmt(m.amount)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0 w-8 text-right">{m.count}×</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
