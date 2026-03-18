"use client";

import { getActiveIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

/**
 * CLIENT HEALTH SCORE
 * 
 * Combines multiple signals into a 0-100 health score per client:
 * - Communication frequency (are they responsive?)
 * - Payment reliability (on time? overdue?)
 * - Deal stage progression (moving forward or stalled?)
 * - Activity recency (when was last interaction?)
 * 
 * Green 80-100, Amber 50-79, Red 0-49
 */

interface ClientHealth {
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  signal: string;
  lastActivity: string;
}

const INDUSTRY_HEALTH: Record<string, ClientHealth[]> = {
  agency_consulting: [
    { name: "Brightview Hotels", score: 92, trend: "up", signal: "Engaged, on-time payments, growing scope", lastActivity: "2 hours ago" },
    { name: "Sterling Partners", score: 78, trend: "down", signal: "Hinting at scope reduction — renewal at risk", lastActivity: "2 days ago" },
    { name: "Meridian Law Group", score: 88, trend: "up", signal: "Active on website redesign, responsive", lastActivity: "1 day ago" },
    { name: "Harbor Dental", score: 85, trend: "stable", signal: "Content approved, steady engagement", lastActivity: "2 days ago" },
    { name: "Summit Athletics", score: 72, trend: "stable", signal: "Brand project on track, moderate engagement", lastActivity: "3 days ago" },
    { name: "Coastal Real Estate", score: 38, trend: "down", signal: "Email frequency dropped 80%, on hold", lastActivity: "12 days ago" },
    { name: "Apex Construction", score: 65, trend: "up", signal: "New prospect, in discovery — not yet committed", lastActivity: "1 day ago" },
    { name: "Nova Fitness", score: 0, trend: "down", signal: "Churned — project completed, no renewal", lastActivity: "15 days ago" },
  ],
  health_wellness: [
    { name: "Sarah Thompson", score: 90, trend: "up", signal: "Active treatment, engaged, on-time payments", lastActivity: "1 hour ago" },
    { name: "Maria Santos", score: 85, trend: "stable", signal: "Regular Botox patient, consistent schedule", lastActivity: "2 days ago" },
    { name: "David Kim", score: 82, trend: "up", signal: "Upgrading to IV therapy 4-pack", lastActivity: "Yesterday" },
    { name: "Emily Rodriguez", score: 70, trend: "up", signal: "New patient — intake submitted, consultation pending", lastActivity: "30 min ago" },
    { name: "Patricia Lee", score: 32, trend: "down", signal: "Missed 2 appointments — ghosting risk", lastActivity: "18 days ago" },
    { name: "Alex Rivera", score: 48, trend: "down", signal: "Botox rebooking 3 weeks overdue", lastActivity: "15 weeks ago" },
  ],
  ecommerce: [
    { name: "Chris Persaud", score: 95, trend: "up", signal: "VIP milestone, highly engaged, 4-0 today", lastActivity: "4 hours ago" },
    { name: "Wayne Barry", score: 88, trend: "up", signal: "Upgrading monthly → yearly VIP", lastActivity: "Today" },
    { name: "Tyler McLaughlin", score: 62, trend: "down", signal: "Login frequency down 60%", lastActivity: "8 days ago" },
    { name: "Andrew Krieman", score: 35, trend: "down", signal: "VIP payment failed, 34 days inactive", lastActivity: "34 days ago" },
    { name: "Raquel Munoz", score: 28, trend: "down", signal: "Top-5 customer, 45 days since last purchase", lastActivity: "45 days ago" },
  ],
  home_services: [
    { name: "Linda Garcia", score: 88, trend: "stable", signal: "Roof job in progress, deposit paid, engaged", lastActivity: "9 hours ago" },
    { name: "Thomas Brown", score: 82, trend: "up", signal: "HVAC install confirmed, responsive", lastActivity: "Yesterday" },
    { name: "Susan Taylor", score: 90, trend: "up", signal: "Emergency handled quickly — high satisfaction", lastActivity: "3 hours ago" },
    { name: "Richard Wilson", score: 30, trend: "down", signal: "Estimate sent 14 days ago, no response", lastActivity: "14 days ago" },
  ],
  legal: [
    { name: "Marcus Johnson", score: 72, trend: "down", signal: "Documents 21 days overdue — case progress stalled", lastActivity: "21 days ago" },
    { name: "Sarah Mitchell", score: 68, trend: "stable", signal: "Active case, missed check-in but responsive", lastActivity: "2 days ago" },
    { name: "Harbor Construction", score: 85, trend: "up", signal: "Mediation prep underway, fully engaged", lastActivity: "Yesterday" },
    { name: "Patricia Williams", score: 78, trend: "up", signal: "New client — engagement letter pending", lastActivity: "Today" },
  ],
  fitness_gym: [
    { name: "Stephanie Clark", score: 92, trend: "up", signal: "Just purchased PT 12-pack, highly engaged", lastActivity: "Yesterday" },
    { name: "Brandon Lewis", score: 75, trend: "up", signal: "New trial member — 3 check-ins in first week", lastActivity: "Today" },
    { name: "Daniel Wright", score: 28, trend: "down", signal: "14 days no check-in — at-risk member", lastActivity: "14 days ago" },
    { name: "Alex Rivera", score: 55, trend: "stable", signal: "Attends group classes only, moderate engagement", lastActivity: "5 days ago" },
  ],
  beauty_salon: [
    { name: "Charlotte Davis", score: 95, trend: "up", signal: "Bridal package booked — $1,200 commitment", lastActivity: "Yesterday" },
    { name: "Amelia Wilson", score: 82, trend: "stable", signal: "Regular keratin client, consistent 6-week cycle", lastActivity: "2 days ago" },
    { name: "Harper Garcia", score: 78, trend: "up", signal: "Just booked online — new recurring client potential", lastActivity: "Today" },
    { name: "Nina Patel", score: 35, trend: "down", signal: "6 weeks overdue for rebooking — going cold", lastActivity: "6 weeks ago" },
  ],
  real_estate: [
    { name: "Amanda Hill", score: 88, trend: "up", signal: "Submitting offer today — highly motivated buyer", lastActivity: "30 min ago" },
    { name: "Robert Chen", score: 82, trend: "stable", signal: "Active listing — 3 showings this week", lastActivity: "Today" },
    { name: "Patricia Williams", score: 90, trend: "up", signal: "Closing complete — commission received", lastActivity: "3 hours ago" },
    { name: "James Rivera", score: 45, trend: "down", signal: "Submitted valuation request but hasn't responded since", lastActivity: "8 days ago" },
  ],
  coaching_education: [
    { name: "Jason Wright", score: 92, trend: "up", signal: "Active 1:1 client, highly engaged, refers others", lastActivity: "2 hours ago" },
    { name: "Mastermind Cohort", score: 88, trend: "stable", signal: "6 participants, all engaged, week 3 of 12", lastActivity: "Yesterday" },
    { name: "Nathan Harris", score: 70, trend: "up", signal: "VIP Day application — new prospect, high intent", lastActivity: "Today" },
    { name: "Lindsey K.", score: 32, trend: "down", signal: "3 weeks no assignments — stuck intervention needed", lastActivity: "21 days ago" },
  ],
  restaurant_food: [
    { name: "Apex Financial Group", score: 85, trend: "up", signal: "Corporate catering inquiry — $3.5K opportunity", lastActivity: "Today" },
    { name: "Michael Rivera", score: 78, trend: "stable", signal: "Regular diner, birthday reservation this week", lastActivity: "2 hours ago" },
    { name: "Marcus Rivera", score: 90, trend: "up", signal: "Weekly meal prep subscriber — $480/mo recurring", lastActivity: "Today" },
    { name: "Emily & David", score: 88, trend: "stable", signal: "Wedding reception deposit paid, menu finalization pending", lastActivity: "Yesterday" },
  ],
  automotive: [
    { name: "Thomas Brown", score: 72, trend: "down", signal: "Post-service noise complaint — needs follow-up call", lastActivity: "8 hours ago" },
    { name: "Enterprise Fleet", score: 88, trend: "up", signal: "5 vehicles need service — $4.8K opportunity", lastActivity: "Today" },
    { name: "Nancy Davis", score: 92, trend: "up", signal: "Left 5-star review after 30K service", lastActivity: "Yesterday" },
    { name: "James Peterson", score: 48, trend: "down", signal: "Declined brake service 30 days ago — safety concern", lastActivity: "30 days ago" },
  ],
  nonprofit: [
    { name: "Robert Chen", score: 95, trend: "up", signal: "Major donor wants to increase to $1K/mo", lastActivity: "Today" },
    { name: "Amanda Hill", score: 82, trend: "stable", signal: "Gala RSVP'd, active volunteer", lastActivity: "4 hours ago" },
    { name: "Community Bank", score: 70, trend: "up", signal: "Sponsorship inquiry — Gold/Platinum tier interest", lastActivity: "Yesterday" },
    { name: "David Park", score: 28, trend: "down", signal: "12 months since last donation — lapsed donor", lastActivity: "12 months ago" },
  ],
};

export default function ClientHealth() {
  const [clients, setClients] = useState<ClientHealth[]>([]);

  useEffect(() => {
    const demoIndustry = getActiveIndustry();
    const key = demoIndustry; if (!key) return;
    setClients(INDUSTRY_HEALTH[key] || []);
  }, []);

  if (clients.length === 0) return null;

  const avgScore = Math.round(clients.reduce((s, c) => s + c.score, 0) / clients.length);
  const atRisk = clients.filter(c => c.score < 50).length;
  const scoreColor = (s: number) => s >= 80 ? "text-emerald-600" : s >= 50 ? "text-amber-600" : "text-red-600";
  const scoreBg = (s: number) => s >= 80 ? "bg-emerald-50" : s >= 50 ? "bg-amber-50" : "bg-red-50";
  const trendIcon = (t: string) => t === "up" ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : t === "down" ? <TrendingDown className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3 text-gray-400" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Client Health</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreBg(avgScore)} ${scoreColor(avgScore)}`}>Avg: {avgScore}</span>
          {atRisk > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" /> {atRisk} at risk
            </span>
          )}
        </div>
        <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
          All contacts <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {clients.slice(0, 6).map(c => (
          <div key={c.name} className="flex items-center gap-3 py-1.5">
            {/* Score Circle */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${scoreBg(c.score)}`}>
              <span className={`text-xs font-bold ${scoreColor(c.score)}`}>{c.score}</span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-medium text-gray-900 truncate">{c.name}</span>
                {trendIcon(c.trend)}
              </div>
              <p className="text-[10px] text-gray-400 truncate">{c.signal}</p>
            </div>
            {/* Last Activity */}
            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{c.lastActivity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
