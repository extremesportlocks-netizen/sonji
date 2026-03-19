"use client";

import { getDemoIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Clock, AlertTriangle, TrendingDown } from "lucide-react";

/**
 * DEAL VELOCITY
 * 
 * Tracks how long deals sit in each stage vs expected.
 * Cards visually degrade: green → orange → red.
 * Shifts focus from "here are my leads" to "these are losing momentum."
 */

interface VelocityDeal {
  id: string;
  title: string;
  company: string;
  stage: string;
  stageColor: string;
  value: number;
  daysInStage: number;
  expectedDays: number;
  velocity: "healthy" | "slowing" | "stalled";
}

const STAGE_EXPECTATIONS: Record<string, Record<string, number>> = {
  health_wellness: { "Inquiry": 2, "Consultation Booked": 5, "Treatment Plan": 3, "Payment Collected": 1, "In Treatment": 30, "Follow-up": 7 },
  agency_consulting: { "Discovery": 5, "Proposal Sent": 7, "Negotiation": 10, "Contract Signed": 3, "Onboarding": 7, "Active Client": 90, "Renewal": 14 },
  real_estate: { "Lead": 3, "Contacted": 5, "Showing Scheduled": 7, "Offer Submitted": 5, "Under Contract": 30, "Closed": 1, "Past Client": 365 },
  ecommerce: { "Subscriber": 7, "First Purchase": 14, "Repeat": 30, "VIP": 90, "Win-Back": 14, "Churned": 30 },
  fitness_gym: { "Lead": 2, "Trial Booked": 3, "Trial Completed": 2, "Membership Offered": 5, "Active Member": 30, "At Risk": 7 },
  beauty_salon: { "New Client": 3, "Booked": 1, "Served": 1, "Rebooking Window": 14, "Loyal Regular": 42, "Lapsed": 14 },
  home_services: { "Estimate Requested": 1, "Site Visit": 3, "Estimate Sent": 5, "Follow-up": 3, "Job Booked": 14, "Completed": 1 },
  legal: { "Inquiry": 1, "Consultation Scheduled": 3, "Consultation Done": 2, "Engagement Sent": 5, "Retained": 90, "Case Closed": 1 },
  default: { "Lead": 5, "Qualified": 7, "Proposal": 7, "Negotiation": 10, "Won": 1 },
};

const DEMO_DEALS: Record<string, VelocityDeal[]> = {
  health_wellness: [
    { id: "1", title: "Botox Consultation", company: "Maria Santos", stage: "Consultation Booked", stageColor: "#6366F1", value: 450, daysInStage: 12, expectedDays: 5, velocity: "stalled" },
    { id: "2", title: "IV Therapy Package", company: "David Kim", stage: "Treatment Plan", stageColor: "#F59E0B", value: 1200, daysInStage: 6, expectedDays: 3, velocity: "stalled" },
    { id: "3", title: "Weight Loss Program", company: "Jennifer Adams", stage: "Payment Collected", stageColor: "#10B981", value: 2400, daysInStage: 1, expectedDays: 1, velocity: "healthy" },
    { id: "4", title: "Filler Treatment", company: "Alex Rivera", stage: "Inquiry", stageColor: "#818CF8", value: 800, daysInStage: 4, expectedDays: 2, velocity: "slowing" },
    { id: "5", title: "Wellness Annual Plan", company: "Patricia Lee", stage: "Follow-up", stageColor: "#8B5CF6", value: 3600, daysInStage: 15, expectedDays: 7, velocity: "stalled" },
  ],
  agency_consulting: [
    { id: "1", title: "SEO + PPC Retainer", company: "Brightview Hotels", stage: "Proposal Sent", stageColor: "#6366F1", value: 8500, daysInStage: 14, expectedDays: 7, velocity: "stalled" },
    { id: "2", title: "Social Media Mgmt", company: "Apex Construction", stage: "Discovery", stageColor: "#818CF8", value: 3000, daysInStage: 3, expectedDays: 5, velocity: "healthy" },
    { id: "3", title: "Web Redesign Project", company: "Meridian Law", stage: "Negotiation", stageColor: "#F59E0B", value: 15000, daysInStage: 18, expectedDays: 10, velocity: "slowing" },
    { id: "4", title: "Content Strategy", company: "Harbor Dental", stage: "Proposal Sent", stageColor: "#6366F1", value: 5000, daysInStage: 21, expectedDays: 7, velocity: "stalled" },
    { id: "5", title: "Growth Retainer", company: "Nova Fitness", stage: "Contract Signed", stageColor: "#10B981", value: 5000, daysInStage: 1, expectedDays: 3, velocity: "healthy" },
  ],
  ecommerce: [
    { id: "1", title: "VIP Yearly Upgrade", company: "Andrew K.", stage: "Win-Back", stageColor: "#F59E0B", value: 999, daysInStage: 22, expectedDays: 14, velocity: "slowing" },
    { id: "2", title: "Monthly → 3-Month", company: "Chris P.", stage: "Repeat", stageColor: "#10B981", value: 399, daysInStage: 8, expectedDays: 30, velocity: "healthy" },
    { id: "3", title: "Reactivation", company: "Ramon G.", stage: "Win-Back", stageColor: "#F59E0B", value: 165, daysInStage: 45, expectedDays: 14, velocity: "stalled" },
    { id: "4", title: "VIP Retention", company: "Raquel M.", stage: "VIP", stageColor: "#8B5CF6", value: 999, daysInStage: 5, expectedDays: 90, velocity: "healthy" },
  ],
  fitness_gym: [
    { id: "1", title: "Annual Membership", company: "Brandon Lewis", stage: "Trial Completed", stageColor: "#F59E0B", value: 720, daysInStage: 5, expectedDays: 2, velocity: "stalled" },
    { id: "2", title: "PT Package", company: "Stephanie Clark", stage: "Membership Offered", stageColor: "#F97316", value: 960, daysInStage: 8, expectedDays: 5, velocity: "slowing" },
    { id: "3", title: "At-Risk Save", company: "Daniel Wright", stage: "At Risk", stageColor: "#EF4444", value: 79, daysInStage: 12, expectedDays: 7, velocity: "slowing" },
    { id: "4", title: "Monthly Unlimited", company: "Kevin Young", stage: "Active Member", stageColor: "#10B981", value: 79, daysInStage: 15, expectedDays: 30, velocity: "healthy" },
  ],
  beauty_salon: [
    { id: "1", title: "Bridal Package", company: "Charlotte Davis", stage: "Booked", stageColor: "#6366F1", value: 1200, daysInStage: 1, expectedDays: 1, velocity: "healthy" },
    { id: "2", title: "Lash Refill", company: "Isabella Lee", stage: "Rebooking", stageColor: "#F59E0B", value: 85, daysInStage: 19, expectedDays: 14, velocity: "slowing" },
    { id: "3", title: "Re-engagement", company: "Evelyn Thomas", stage: "Lapsed", stageColor: "#EF4444", value: 95, daysInStage: 28, expectedDays: 14, velocity: "stalled" },
    { id: "4", title: "Keratin Rebook", company: "Amelia Wilson", stage: "Rebooking", stageColor: "#F59E0B", value: 350, daysInStage: 4, expectedDays: 14, velocity: "healthy" },
  ],
  real_estate: [
    { id: "1", title: "Waterfront Home", company: "Robert Chen", stage: "Offer", stageColor: "#F97316", value: 1200000, daysInStage: 8, expectedDays: 5, velocity: "slowing" },
    { id: "2", title: "Investment Duplex", company: "David Nguyen", stage: "Contacted", stageColor: "#6366F1", value: 550000, daysInStage: 12, expectedDays: 5, velocity: "stalled" },
    { id: "3", title: "First-Time Buyer", company: "Amanda Hill", stage: "Under Contract", stageColor: "#10B981", value: 275000, daysInStage: 10, expectedDays: 30, velocity: "healthy" },
    { id: "4", title: "Condo Downtown", company: "Emily Scott", stage: "Lead", stageColor: "#818CF8", value: 320000, daysInStage: 7, expectedDays: 3, velocity: "stalled" },
  ],
  home_services: [
    { id: "1", title: "Full Roof Replace", company: "Linda Garcia", stage: "Site Visit", stageColor: "#6366F1", value: 18500, daysInStage: 6, expectedDays: 3, velocity: "stalled" },
    { id: "2", title: "Leak Repair", company: "Richard Wilson", stage: "Follow-up", stageColor: "#F97316", value: 3500, daysInStage: 5, expectedDays: 3, velocity: "slowing" },
    { id: "3", title: "HVAC Install", company: "Thomas Brown", stage: "Estimate Sent", stageColor: "#F59E0B", value: 8200, daysInStage: 3, expectedDays: 5, velocity: "healthy" },
    { id: "4", title: "Gutter Replacement", company: "Barbara M.", stage: "Job Booked", stageColor: "#10B981", value: 4200, daysInStage: 2, expectedDays: 14, velocity: "healthy" },
  ],
  legal: [
    { id: "1", title: "Contract Dispute", company: "Harbor Constr.", stage: "Engagement Sent", stageColor: "#F97316", value: 15000, daysInStage: 8, expectedDays: 5, velocity: "slowing" },
    { id: "2", title: "Estate Planning", company: "Patricia W.", stage: "Evaluation", stageColor: "#F59E0B", value: 4500, daysInStage: 6, expectedDays: 2, velocity: "stalled" },
    { id: "3", title: "PI Case", company: "Marcus Johnson", stage: "Inquiry", stageColor: "#818CF8", value: 45000, daysInStage: 1, expectedDays: 1, velocity: "healthy" },
    { id: "4", title: "Business Formation", company: "Apex Ventures", stage: "Consultation", stageColor: "#6366F1", value: 3500, daysInStage: 4, expectedDays: 3, velocity: "slowing" },
  ],
  coaching_education: [
    { id: "1", title: "Mastermind Enrollment", company: "Brittany Lopez", stage: "Call Completed", stageColor: "#F97316", value: 8000, daysInStage: 5, expectedDays: 2, velocity: "stalled" },
    { id: "2", title: "1:1 Coaching App", company: "Jason Wright", stage: "Application", stageColor: "#6366F1", value: 5000, daysInStage: 4, expectedDays: 3, velocity: "slowing" },
    { id: "3", title: "VIP Day", company: "Nathan Harris", stage: "Discovery Call", stageColor: "#F59E0B", value: 3000, daysInStage: 2, expectedDays: 5, velocity: "healthy" },
    { id: "4", title: "Alumni Upsell", company: "Laura Davis", stage: "Alumni", stageColor: "#8B5CF6", value: 5000, daysInStage: 20, expectedDays: 30, velocity: "healthy" },
  ],
  restaurant_food: [
    { id: "1", title: "Corporate Lunch", company: "Apex Financial", stage: "Catering Lead", stageColor: "#F59E0B", value: 3500, daysInStage: 6, expectedDays: 3, velocity: "stalled" },
    { id: "2", title: "Win-Back Diner", company: "Olivia Brown", stage: "Lapsed", stageColor: "#EF4444", value: 42, daysInStage: 32, expectedDays: 14, velocity: "stalled" },
    { id: "3", title: "Birthday Party", company: "Sarah Johnson", stage: "Catering Lead", stageColor: "#F59E0B", value: 1800, daysInStage: 2, expectedDays: 3, velocity: "healthy" },
  ],
  automotive: [
    { id: "1", title: "Transmission Service", company: "Linda Garcia", stage: "Estimate Given", stageColor: "#6366F1", value: 2400, daysInStage: 8, expectedDays: 3, velocity: "stalled" },
    { id: "2", title: "AC Recharge", company: "Robert Chen", stage: "Estimate Given", stageColor: "#6366F1", value: 350, daysInStage: 5, expectedDays: 3, velocity: "slowing" },
    { id: "3", title: "Timing Belt", company: "Thomas Brown", stage: "In Service", stageColor: "#F97316", value: 1200, daysInStage: 1, expectedDays: 2, velocity: "healthy" },
    { id: "4", title: "Oil Change Due", company: "Richard Wilson", stage: "Maintenance Due", stageColor: "#8B5CF6", value: 65, daysInStage: 15, expectedDays: 7, velocity: "stalled" },
  ],
  nonprofit: [
    { id: "1", title: "Corporate Partnership", company: "Apex Financial", stage: "Prospect", stageColor: "#818CF8", value: 25000, daysInStage: 14, expectedDays: 7, velocity: "stalled" },
    { id: "2", title: "Gala Sponsor", company: "Harbor Wealth", stage: "Contacted", stageColor: "#6366F1", value: 10000, daysInStage: 5, expectedDays: 5, velocity: "healthy" },
    { id: "3", title: "Lapsed Recovery", company: "Marcus Rivera", stage: "Lapsed", stageColor: "#EF4444", value: 250, daysInStage: 30, expectedDays: 14, velocity: "stalled" },
    { id: "4", title: "Grant Application", company: "Smith Foundation", stage: "Prospect", stageColor: "#818CF8", value: 50000, daysInStage: 8, expectedDays: 14, velocity: "healthy" },
  ],
};

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`; }

export default function DealVelocity() {
  const [deals, setDeals] = useState<VelocityDeal[]>([]);

  useEffect(() => {
    const demoIndustry = getDemoIndustry();
    const key = demoIndustry; if (!key) return;
    setDeals(DEMO_DEALS[key] || DEMO_DEALS.ecommerce);
  }, []);

  if (deals.length === 0) return null;

  const stalledCount = deals.filter(d => d.velocity === "stalled").length;
  const slowingCount = deals.filter(d => d.velocity === "slowing").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Deal Velocity</h3>
          {stalledCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-2.5 h-2.5" /> {stalledCount} stalled
            </span>
          )}
          {slowingCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {slowingCount} slowing
            </span>
          )}
        </div>
        <Link prefetch={false} href="/dashboard/deals" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
      </div>
      <div className="space-y-2">
        {deals.sort((a, b) => {
          const order = { stalled: 0, slowing: 1, healthy: 2 };
          return order[a.velocity] - order[b.velocity];
        }).map((d) => {
          const ratio = d.daysInStage / d.expectedDays;
          const bgColor = d.velocity === "stalled" ? "bg-red-50 border-red-200" : d.velocity === "slowing" ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100";
          const timeColor = d.velocity === "stalled" ? "text-red-600" : d.velocity === "slowing" ? "text-amber-600" : "text-gray-500";
          const barWidth = Math.min(ratio * 100, 100);
          const barColor = d.velocity === "stalled" ? "bg-red-400" : d.velocity === "slowing" ? "bg-amber-400" : "bg-emerald-400";

          return (
            <div key={d.id} className={`p-3 rounded-lg border transition ${bgColor}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.stageColor }} />
                  <span className="text-sm font-medium text-gray-900 truncate">{d.title}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">— {d.company}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 flex-shrink-0 ml-2">{fmt(d.value)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${barWidth}%` }} />
                </div>
                <div className={`flex items-center gap-1 flex-shrink-0 ${timeColor}`}>
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{d.daysInStage}d</span>
                  <span className="text-[10px] text-gray-400">/ {d.expectedDays}d</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-400">{d.stage}</span>
                {d.velocity === "stalled" && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5"><TrendingDown className="w-2.5 h-2.5" /> {ratio.toFixed(1)}× over</span>}
                {d.velocity === "slowing" && <span className="text-[10px] font-bold text-amber-500">{ratio.toFixed(1)}× expected time</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
