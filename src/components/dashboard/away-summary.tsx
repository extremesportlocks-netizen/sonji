"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, DollarSign, Users, Zap, AlertTriangle, Star, Mail } from "lucide-react";

/**
 * AWAY SUMMARY
 * Shows key events since last login. Appears at top of dashboard.
 * Dismissable — stores in sessionStorage.
 */

interface SummaryItem {
  icon: React.ElementType;
  color: string;
  text: string;
  value?: string;
}

const INDUSTRY_SUMMARIES: Record<string, { headline: string; items: SummaryItem[] }> = {
  agency_consulting: {
    headline: "Here's what happened since you were last here:",
    items: [
      { icon: DollarSign, color: "text-emerald-600", text: "Sterling Partners retainer payment received", value: "$10,000" },
      { icon: Users, color: "text-blue-600", text: "2 new leads from website contact form" },
      { icon: Zap, color: "text-amber-600", text: "7 automations fired — 3 follow-ups, 2 reminders, 2 alerts" },
      { icon: AlertTriangle, color: "text-red-600", text: "Coastal Real Estate still ghosting — now 12 days" },
      { icon: Star, color: "text-yellow-600", text: "New 5-star review from Harbor Dental on Google" },
      { icon: Mail, color: "text-indigo-600", text: "Brightview opened your March report (85% open rate)" },
    ],
  },
  health_wellness: {
    headline: "While you were away:",
    items: [
      { icon: Users, color: "text-blue-600", text: "3 new patient intakes submitted" },
      { icon: DollarSign, color: "text-emerald-600", text: "4 payments processed", value: "$4,800" },
      { icon: Zap, color: "text-amber-600", text: "12 appointment reminders sent automatically" },
      { icon: AlertTriangle, color: "text-red-600", text: "Patricia Lee — 2nd missed appointment" },
      { icon: Star, color: "text-yellow-600", text: "New 5-star Google review from Michael Brown" },
    ],
  },
  ecommerce: {
    headline: "Overnight update:",
    items: [
      { icon: DollarSign, color: "text-emerald-600", text: "3 subscription payments processed", value: "$463" },
      { icon: Users, color: "text-blue-600", text: "Wayne Barry upgraded to VIP Yearly", value: "$1,485" },
      { icon: Zap, color: "text-amber-600", text: "Win-back email opened by Tyler McLaughlin" },
      { icon: AlertTriangle, color: "text-red-600", text: "Andrew Krieman payment still failing — 3 days" },
    ],
  },
  home_services: {
    headline: "Since your last login:",
    items: [
      { icon: AlertTriangle, color: "text-red-600", text: "EMERGENCY: Susan Taylor — active roof leak reported" },
      { icon: DollarSign, color: "text-emerald-600", text: "Linda Garcia deposit received", value: "$18,500" },
      { icon: Zap, color: "text-amber-600", text: "Maintenance reminders sent to 12 customers" },
      { icon: Users, color: "text-blue-600", text: "Barbara Martinez submitted estimate request" },
    ],
  },
};

export default function AwaySummary() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<{ headline: string; items: SummaryItem[] } | null>(null);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("sonji-away-dismissed")) return;
    const di = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = di || "ecommerce";
    const summary = INDUSTRY_SUMMARIES[key] || INDUSTRY_SUMMARIES.ecommerce;
    setData(summary);
    setVisible(true);
  }, []);

  if (!visible || !data) return null;

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("sonji-away-dismissed", "1");
  };

  return (
    <div className="mx-6 mt-4 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border border-indigo-200/50 rounded-xl p-5 relative">
      <button onClick={dismiss} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition">
        <X className="w-4 h-4" />
      </button>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{data.headline}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {data.items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
              <span className="text-sm text-gray-600">{item.text}</span>
              {item.value && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">{item.value}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
