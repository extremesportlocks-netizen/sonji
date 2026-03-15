"use client";

import Link from "next/link";
import { ChevronRight, Phone, Mail, Calendar, FileText, DollarSign, UserPlus, Star, AlertTriangle, CheckCircle, MessageSquare } from "lucide-react";

/**
 * INDUSTRY ACTIVITY FEED
 * 
 * Shows realistic activity entries specific to each industry.
 * Healthcare: consultations, treatments, follow-ups
 * Agency: proposals, kickoffs, deliverables
 * E-Commerce: purchases, refunds, reviews
 */

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  text: string;
  time: string;
}

const ACTIVITIES: Record<string, ActivityItem[]> = {
  health_wellness: [
    { id: "1", icon: UserPlus, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "New patient inquiry from Google — Emily Rodriguez requested Botox consultation", time: "12 min ago" },
    { id: "2", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Consultation booked — James Wilson, IV Therapy evaluation, tomorrow 2:00 PM", time: "28 min ago" },
    { id: "3", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Payment collected — Sarah Chen paid $1,200 for Weight Loss 3-month program", time: "1 hr ago" },
    { id: "4", icon: CheckCircle, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Treatment completed — Sophia Martinez finished Botox session, aftercare email sent", time: "2 hr ago" },
    { id: "5", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "5-star review received from Michael Brown: 'Amazing results, so professional'", time: "3 hr ago" },
    { id: "6", icon: Mail, iconColor: "text-rose-600", iconBg: "bg-rose-100", text: "Rebooking reminder sent to 24 patients overdue for follow-up appointments", time: "4 hr ago" },
    { id: "7", icon: AlertTriangle, iconColor: "text-red-600", iconBg: "bg-red-100", text: "No-show alert — David Lee missed 10:00 AM consultation, reschedule link auto-sent", time: "5 hr ago" },
    { id: "8", icon: Phone, iconColor: "text-teal-600", iconBg: "bg-teal-100", text: "Follow-up call completed — Emma Thomas confirmed Week 2 progress is on track", time: "Yesterday" },
  ],
  agency_consulting: [
    { id: "1", icon: FileText, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "Proposal sent — $8,500/mo retainer to Brightview Hotels for SEO + PPC management", time: "15 min ago" },
    { id: "2", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Contract signed — Nova Fitness locked in $5,000/mo Growth retainer for 12 months", time: "1 hr ago" },
    { id: "3", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Kickoff call scheduled — Meridian Law Group onboarding, Thursday 3:00 PM", time: "2 hr ago" },
    { id: "4", icon: AlertTriangle, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "Renewal alert — Coastal Real Estate contract expires in 28 days, schedule check-in", time: "3 hr ago" },
    { id: "5", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Monthly report delivered to 12 active clients — automated via campaign engine", time: "4 hr ago" },
    { id: "6", icon: UserPlus, iconColor: "text-rose-600", iconBg: "bg-rose-100", text: "New lead from referral — Apex Construction interested in social media management", time: "5 hr ago" },
    { id: "7", icon: CheckCircle, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Deliverable completed — Q1 analytics deck for Sterling Partners uploaded and sent", time: "6 hr ago" },
    { id: "8", icon: MessageSquare, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Client feedback — Harbor Dental rated satisfaction 9/10 on quarterly NPS survey", time: "Yesterday" },
  ],
  ecommerce: [
    { id: "1", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "New purchase — John Smith bought VIP Yearly Package ($999) via checkout", time: "8 min ago" },
    { id: "2", icon: UserPlus, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "New subscriber — Tyler McLaughlin signed up for Monthly Package ($165)", time: "22 min ago" },
    { id: "3", icon: AlertTriangle, iconColor: "text-red-600", iconBg: "bg-red-100", text: "Subscription canceled — Andrew Krieman (VIP Yearly, $5,407 LTV) — win-back triggered", time: "1 hr ago" },
    { id: "4", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Win-back campaign sent to 47 lapsed customers with 60+ days inactive", time: "2 hr ago" },
    { id: "5", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "VIP milestone — Chris Persaud reached $6,300 lifetime value (13 purchases)", time: "3 hr ago" },
    { id: "6", icon: CheckCircle, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Subscription renewed — Ramon Garcia auto-renewed VIP Yearly ($999)", time: "5 hr ago" },
    { id: "7", icon: MessageSquare, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Support message from Wayne Barry — 'How do I upgrade to yearly?'", time: "6 hr ago" },
    { id: "8", icon: Phone, iconColor: "text-teal-600", iconBg: "bg-teal-100", text: "Telegram alert sent — Today's NCAAB picks are live for 94 active subscribers", time: "Yesterday" },
  ],
  // Defaults for other industries
  default: [
    { id: "1", icon: UserPlus, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "New contact added to CRM", time: "15 min ago" },
    { id: "2", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Payment received from client", time: "1 hr ago" },
    { id: "3", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Appointment scheduled for tomorrow", time: "2 hr ago" },
    { id: "4", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Follow-up email sent to 18 contacts", time: "3 hr ago" },
    { id: "5", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "5-star review received", time: "4 hr ago" },
  ],
};

export default function IndustryActivityFeed({ industry }: { industry: string | null }) {
  const activities = ACTIVITIES[industry || "default"] || ACTIVITIES.default;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <Link href="/dashboard/activities" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
      </div>
      <div className="space-y-2.5">
        {activities.slice(0, 6).map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full ${a.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${a.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">{a.text}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
