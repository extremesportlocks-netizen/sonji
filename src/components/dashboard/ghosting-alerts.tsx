"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, TrendingDown, Clock, ChevronRight, Mail, Ghost, Thermometer } from "lucide-react";

/**
 * GHOSTING ALERTS — PREDICTIVE "COOLING" DETECTION
 * 
 * From Gemini V2 analysis: catch the velocity shift BEFORE they lapse.
 * If a fast-responding lead suddenly takes 48 hours to reply, flag as "Cooling."
 * 
 * Monitors:
 * - Purchase frequency declining
 * - Days since last activity increasing vs their baseline
 * - Subscription approaching end with no renewal signal
 */

interface CoolingContact {
  id: string;
  name: string;
  email: string;
  signal: string;
  severity: "warning" | "critical";
  daysSinceActivity: number;
  baselineFrequency: string;
  currentFrequency: string;
  ltv: number;
  action: string;
}

const INDUSTRY_ALERTS: Record<string, CoolingContact[]> = {
  agency_consulting: [
    { id: "g1", name: "Coastal Real Estate", email: "john@coastalre.com", signal: "Email frequency dropped 80% — was 5/week, now 1/week", severity: "critical", daysSinceActivity: 12, baselineFrequency: "5 emails/week", currentFrequency: "1 email/week", ltv: 72000, action: "Schedule check-in call" },
    { id: "g2", name: "Summit Athletics", email: "mark@summitathletics.com", signal: "No response to last 2 deliverables — usually responds same day", severity: "warning", daysSinceActivity: 8, baselineFrequency: "Same-day response", currentFrequency: "8 days, no response", ltv: 36000, action: "Send personal check-in" },
    { id: "g3", name: "Pinnacle Fitness", email: "sarah@pinnaclefitness.com", signal: "Contract renewal in 15 days — no engagement in 3 weeks", severity: "critical", daysSinceActivity: 21, baselineFrequency: "Weekly check-ins", currentFrequency: "Silent for 21 days", ltv: 42000, action: "Urgent: AM call required" },
  ],
  health_wellness: [
    { id: "g1", name: "Patricia Lee", email: "patricia.lee@gmail.com", signal: "Missed 2 consecutive appointments — was never a no-show before", severity: "critical", daysSinceActivity: 18, baselineFrequency: "Monthly visits", currentFrequency: "2 missed appointments", ltv: 3600, action: "Personal call from provider" },
    { id: "g2", name: "David Kim", email: "david.kim@outlook.com", signal: "IV therapy patient — 45 days since last visit (usually every 2 weeks)", severity: "warning", daysSinceActivity: 45, baselineFrequency: "Every 14 days", currentFrequency: "45 days gap", ltv: 2400, action: "Send check-in text" },
    { id: "g3", name: "Alex Rivera", email: "alex.rivera@icloud.com", signal: "Botox rebooking overdue by 3 weeks — was on exact 12-week cycle", severity: "warning", daysSinceActivity: 105, baselineFrequency: "Every 12 weeks", currentFrequency: "15 weeks (3 overdue)", ltv: 4200, action: "Rebooking reminder with incentive" },
  ],
  ecommerce: [
    { id: "g1", name: "Andrew Krieman", email: "andrew.k@gmail.com", signal: "VIP Yearly subscriber — purchase frequency dropped from weekly to nothing", severity: "critical", daysSinceActivity: 34, baselineFrequency: "Weekly picks buyer", currentFrequency: "34 days inactive", ltv: 5407, action: "Personal outreach from Orlando" },
    { id: "g2", name: "Tyler McLaughlin", email: "tyler.m@yahoo.com", signal: "Monthly subscriber viewing picks less — login frequency dropped 60%", severity: "warning", daysSinceActivity: 8, baselineFrequency: "Daily logins", currentFrequency: "2 logins this week", ltv: 1485, action: "Send engagement email" },
    { id: "g3", name: "Raquel Munoz", email: "raquel.m@outlook.com", signal: "Was top-5 customer, now 45 days since last purchase", severity: "critical", daysSinceActivity: 45, baselineFrequency: "Bi-weekly purchases", currentFrequency: "45 days gap", ltv: 5800, action: "VIP win-back call" },
  ],
  home_services: [
    { id: "g1", name: "Richard Wilson", email: "richard.w@gmail.com", signal: "Estimate sent 14 days ago — usually decides within 3 days", severity: "critical", daysSinceActivity: 14, baselineFrequency: "3-day decision", currentFrequency: "14 days, no response", ltv: 3500, action: "Follow-up call with urgency" },
    { id: "g2", name: "Thomas Brown", email: "thomas.b@outlook.com", signal: "HVAC maintenance plan — skipped spring tune-up appointment", severity: "warning", daysSinceActivity: 30, baselineFrequency: "Seasonal (spring/fall)", currentFrequency: "Skipped spring", ltv: 8200, action: "Schedule reschedule call" },
  ],
  fitness_gym: [
    { id: "g1", name: "Daniel Wright", email: "daniel.w@gmail.com", signal: "Was 4x/week gym goer — down to 0 visits in 14 days", severity: "critical", daysSinceActivity: 14, baselineFrequency: "4 visits/week", currentFrequency: "0 visits in 14 days", ltv: 1440, action: "Trainer personal outreach" },
    { id: "g2", name: "Stephanie Clark", email: "steph.c@gmail.com", signal: "PT client cancelled last 2 sessions — was never a cancel", severity: "warning", daysSinceActivity: 10, baselineFrequency: "2 sessions/week", currentFrequency: "2 cancellations", ltv: 2880, action: "Coach check-in text" },
  ],
  beauty_salon: [
    { id: "g1", name: "Harper Garcia", email: "harper.g@gmail.com", signal: "Monthly blowout regular — 8 weeks since last visit (usually 4)", severity: "critical", daysSinceActivity: 56, baselineFrequency: "Every 4 weeks", currentFrequency: "8 weeks gap", ltv: 1920, action: "Send rebooking offer" },
    { id: "g2", name: "Amelia Wilson", email: "amelia.w@outlook.com", signal: "Keratin treatment overdue — was on exact 12-week cycle", severity: "warning", daysSinceActivity: 90, baselineFrequency: "Every 12 weeks", currentFrequency: "No rebook at 12 weeks", ltv: 2100, action: "Personal text from stylist" },
  ],
  real_estate: [
    { id: "g1", name: "Amanda Hill", email: "amanda.h@gmail.com", signal: "Active buyer went silent — was viewing 3 properties/week, now zero", severity: "critical", daysSinceActivity: 10, baselineFrequency: "3 viewings/week", currentFrequency: "10 days, no activity", ltv: 8250, action: "Urgent: personal call" },
    { id: "g2", name: "James Peterson", email: "james.p@outlook.com", signal: "Pre-approved buyer — hasn't responded to last 2 property matches", severity: "warning", daysSinceActivity: 7, baselineFrequency: "Same-day responses", currentFrequency: "7 days silence", ltv: 12000, action: "Text: 'Still looking?'" },
  ],
  legal: [
    { id: "g1", name: "Marcus Johnson", email: "marcus.j@gmail.com", signal: "PI client — hasn't returned document request in 21 days", severity: "critical", daysSinceActivity: 21, baselineFrequency: "3-day turnaround", currentFrequency: "21 days, no response", ltv: 45000, action: "Attorney call — case at risk" },
    { id: "g2", name: "Sarah Mitchell", email: "sarah.m@outlook.com", signal: "Divorce client — missed scheduled check-in, no reschedule", severity: "warning", daysSinceActivity: 12, baselineFrequency: "Weekly check-ins", currentFrequency: "Missed + no reply", ltv: 5000, action: "Paralegal follow-up" },
  ],
  coaching_education: [
    { id: "g1", name: "Jason Wright", email: "jason.w@gmail.com", signal: "1:1 coaching client — missed last session, no reschedule in 10 days", severity: "critical", daysSinceActivity: 10, baselineFrequency: "Weekly sessions", currentFrequency: "Missed + 10 days silent", ltv: 5000, action: "Personal text from coach" },
    { id: "g2", name: "Cohort Member #4", email: "lindsey.k@gmail.com", signal: "Mastermind participant — hasn't completed any assignments in 3 weeks", severity: "warning", daysSinceActivity: 21, baselineFrequency: "Weekly submissions", currentFrequency: "3 weeks no submissions", ltv: 8000, action: "Schedule 1:1 check-in" },
  ],
  restaurant_food: [
    { id: "g1", name: "Emily & David", email: "emily.david@gmail.com", signal: "Wedding catering client — hasn't responded to menu finalization in 12 days", severity: "critical", daysSinceActivity: 12, baselineFrequency: "2-day responses", currentFrequency: "12 days silence", ltv: 8500, action: "Urgent call — deadline approaching" },
    { id: "g2", name: "Marcus Rivera", email: "marcus.r@outlook.com", signal: "Weekly meal prep customer — skipped this week's order", severity: "warning", daysSinceActivity: 7, baselineFrequency: "Weekly orders", currentFrequency: "Skipped this week", ltv: 1920, action: "Text: 'Want to order this week?'" },
  ],
  automotive: [
    { id: "g1", name: "James Peterson", email: "james.p@gmail.com", signal: "Brake job recommended 30 days ago — usually schedules within a week", severity: "critical", daysSinceActivity: 30, baselineFrequency: "1-week scheduling", currentFrequency: "30 days, no booking", ltv: 3200, action: "Safety follow-up call" },
    { id: "g2", name: "Nancy Davis", email: "nancy.d@outlook.com", signal: "30K service customer — 6 months overdue for 60K service", severity: "warning", daysSinceActivity: 180, baselineFrequency: "Every 30K miles", currentFrequency: "6 months overdue", ltv: 2800, action: "Maintenance reminder email" },
  ],
  nonprofit: [
    { id: "g1", name: "Robert Chen", email: "robert.c@gmail.com", signal: "Major donor ($5K+/yr) — missed annual gala RSVP deadline, usually first to respond", severity: "critical", daysSinceActivity: 14, baselineFrequency: "Immediate RSVPs", currentFrequency: "No response to gala invite", ltv: 25000, action: "ED personal call" },
    { id: "g2", name: "Monthly Donor Group", email: "3 donors", signal: "3 monthly donors' cards declined this month — higher than usual", severity: "warning", daysSinceActivity: 5, baselineFrequency: "0-1 failures/month", currentFrequency: "3 failures this month", ltv: 3600, action: "Payment update reminder emails" },
  ],
};

export default function GhostingAlerts() {
  const [alerts, setAlerts] = useState<CoolingContact[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = demoIndustry || "ecommerce";
    setAlerts(INDUSTRY_ALERTS[key] || []);
  }, []);

  const visible = alerts.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  const criticalCount = visible.filter(a => a.severity === "critical").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Ghosting Alerts</h3>
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5" /> {criticalCount} critical
            </span>
          )}
        </div>
        <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
      </div>
      <div className="space-y-2.5">
        {visible.map(a => (
          <div key={a.id} className={`rounded-lg border p-3 transition ${
            a.severity === "critical" ? "bg-red-50/50 border-red-200" : "bg-amber-50/30 border-amber-200"
          }`}>
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Ghost className={`w-4 h-4 ${a.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                <span className="text-sm font-medium text-gray-900">{a.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  a.severity === "critical" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                }`}>{a.severity}</span>
              </div>
              <button onClick={() => setDismissed(prev => { const next = new Set(prev); next.add(a.id); return next; })}
                className="text-xs text-gray-400 hover:text-gray-600 transition">dismiss</button>
            </div>
            <p className="text-xs text-gray-600 mb-2 ml-6">{a.signal}</p>
            <div className="flex items-center gap-4 ml-6">
              <div className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400">{a.baselineFrequency} → {a.currentFrequency}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400">{a.daysSinceActivity}d inactive</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 ml-6">
              <span className="text-[10px] font-medium text-gray-500">LTV: ${a.ltv.toLocaleString()}</span>
              <span className={`text-[10px] font-bold ${a.severity === "critical" ? "text-red-600" : "text-amber-600"}`}>→ {a.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
