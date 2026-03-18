"use client";

import { getActiveIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import { X, TrendingUp, DollarSign, Users, Zap, AlertTriangle, Star, Mail, FileText } from "lucide-react";

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
  legal: {
    headline: "Case updates since you were away:",
    items: [
      { icon: FileText, color: "text-indigo-600", text: "Marcus Johnson uploaded medical records for PI case" },
      { icon: Users, color: "text-blue-600", text: "New consultation request — Patricia Williams (estate planning)" },
      { icon: Zap, color: "text-amber-600", text: "Document reminders auto-sent to 2 clients" },
      { icon: DollarSign, color: "text-emerald-600", text: "Harbor Construction retainer payment received", value: "$3,750" },
    ],
  },
  fitness_gym: {
    headline: "Gym update since your last login:",
    items: [
      { icon: AlertTriangle, color: "text-red-600", text: "Daniel Wright — 14 days inactive, flagged as at-risk" },
      { icon: Users, color: "text-blue-600", text: "Brandon Lewis signed up for 7-day free trial" },
      { icon: DollarSign, color: "text-emerald-600", text: "Stephanie Clark purchased PT 12-pack", value: "$960" },
      { icon: Zap, color: "text-amber-600", text: "Birthday reward sent to Alex Rivera" },
    ],
  },
  beauty_salon: {
    headline: "Salon update since you were away:",
    items: [
      { icon: Users, color: "text-blue-600", text: "Harper Garcia booked online — Blowout + Style Thursday 3 PM" },
      { icon: DollarSign, color: "text-emerald-600", text: "Charlotte Davis paid bridal package deposit", value: "$600" },
      { icon: Zap, color: "text-amber-600", text: "3 rebooking reminders sent to overdue clients" },
      { icon: Star, color: "text-yellow-600", text: "5-star review from Amelia Wilson on Google" },
    ],
  },
  real_estate: {
    headline: "Market update since your last login:",
    items: [
      { icon: DollarSign, color: "text-emerald-600", text: "Williams Estate closed — commission received", value: "$26,700" },
      { icon: Users, color: "text-blue-600", text: "Amanda Hill wants to submit offer on 4521 Bayshore Dr" },
      { icon: TrendingUp, color: "text-indigo-600", text: "Robert Chen waterfront listing got 3 showings" },
      { icon: Zap, color: "text-amber-600", text: "Anniversary CMA auto-sent to Karen Wu" },
    ],
  },
  coaching_education: {
    headline: "Coaching update since you were away:",
    items: [
      { icon: Users, color: "text-blue-600", text: "Nathan Harris submitted VIP Day application (referred by Jason)" },
      { icon: AlertTriangle, color: "text-red-600", text: "Lindsey K. — 3 weeks no assignments, stuck intervention triggered" },
      { icon: DollarSign, color: "text-emerald-600", text: "Mastermind Spring Cohort fully enrolled", value: "$48,000" },
      { icon: Zap, color: "text-amber-600", text: "4 session reminders sent automatically" },
    ],
  },
  restaurant_food: {
    headline: "Restaurant update since your last login:",
    items: [
      { icon: Users, color: "text-blue-600", text: "Michael Rivera reserved for Friday birthday dinner — party of 6" },
      { icon: DollarSign, color: "text-emerald-600", text: "Emily & David wedding reception deposit", value: "$4,250" },
      { icon: Mail, color: "text-indigo-600", text: "Apex Financial inquired about corporate catering for 35" },
      { icon: Zap, color: "text-amber-600", text: "Post-dining feedback sent to 8 guests" },
    ],
  },
  automotive: {
    headline: "Shop update since you were away:",
    items: [
      { icon: AlertTriangle, color: "text-red-600", text: "Thomas Brown reporting post-service noise — needs callback" },
      { icon: Users, color: "text-blue-600", text: "Enterprise Fleet requested 5-vehicle service block" },
      { icon: Star, color: "text-yellow-600", text: "5-star Google review from Nancy Davis" },
      { icon: Zap, color: "text-amber-600", text: "Declined service follow-ups sent with 10% discount" },
    ],
  },
  nonprofit: {
    headline: "Foundation update since you were away:",
    items: [
      { icon: DollarSign, color: "text-emerald-600", text: "Robert Chen wants to increase monthly donation to $1K", value: "$1,000/mo" },
      { icon: Users, color: "text-blue-600", text: "Sarah Lopez submitted volunteer application" },
      { icon: Mail, color: "text-indigo-600", text: "Community Bank inquired about gala sponsorship" },
      { icon: Zap, color: "text-amber-600", text: "Tax receipts auto-sent for 8 March donations" },
    ],
  },
};

export default function AwaySummary() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<{ headline: string; items: SummaryItem[] } | null>(null);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("sonji-away-dismissed")) return;
    const di = getActiveIndustry();
    // Only show for demo visitors (when demo key exists) — real tenants get real data
    if (!di) return;
    const summary = INDUSTRY_SUMMARIES[di] || INDUSTRY_SUMMARIES.ecommerce;
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
