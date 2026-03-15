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
  fitness_gym: [
    { id: "1", icon: UserPlus, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "New trial signup — Marcus Rivera booked a free CrossFit class for Thursday", time: "10 min ago" },
    { id: "2", icon: CheckCircle, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Trial converted — Ashley Torres upgraded to Monthly Unlimited ($79/mo)", time: "45 min ago" },
    { id: "3", icon: AlertTriangle, iconColor: "text-red-600", iconBg: "bg-red-100", text: "At-risk alert — Daniel Wright hasn't checked in for 12 days (was 4x/week)", time: "1 hr ago" },
    { id: "4", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "'We miss you' text sent to 28 members with no visit in 7+ days", time: "2 hr ago" },
    { id: "5", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "Milestone — Kevin Young hit 100th visit! Anniversary celebration triggered", time: "3 hr ago" },
    { id: "6", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Renewal processed — Nicole Allen auto-renewed Family Plan ($149/mo)", time: "4 hr ago" },
  ],
  beauty_salon: [
    { id: "1", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Appointment booked — Sophia Martinez, Balayage with Stylist Emma, Saturday 2 PM", time: "15 min ago" },
    { id: "2", icon: CheckCircle, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Service completed — Mia Johnson, Cut & Color ($145). Aftercare tips sent", time: "1 hr ago" },
    { id: "3", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Rebooking reminder sent to Isabella Lee — lash refill overdue by 5 days", time: "2 hr ago" },
    { id: "4", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "5-star review from Amelia Wilson: 'Best keratin treatment I've ever had'", time: "3 hr ago" },
    { id: "5", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Bridal package deposit — Charlotte Davis paid $600 for April 12 wedding", time: "4 hr ago" },
    { id: "6", icon: MessageSquare, iconColor: "text-rose-600", iconBg: "bg-rose-100", text: "Birthday offer sent to Harper Garcia — 20% off any service this week", time: "5 hr ago" },
  ],
  real_estate: [
    { id: "1", icon: Phone, iconColor: "text-teal-600", iconBg: "bg-teal-100", text: "Speed-to-lead — Michael Torres (Zillow inquiry) contacted within 3 minutes", time: "8 min ago" },
    { id: "2", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Showing scheduled — Emily Scott, 3BR Condo downtown, Thursday 4 PM", time: "30 min ago" },
    { id: "3", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Offer accepted — Amanda Hill's first home, $275K, closing April 10", time: "2 hr ago" },
    { id: "4", icon: FileText, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "Under contract — Patricia Williams estate sale ($890K), inspection next week", time: "3 hr ago" },
    { id: "5", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Quarterly market update sent to 189 past clients in sphere of influence", time: "4 hr ago" },
    { id: "6", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "Home anniversary — sent 2-year check-in to the Rodriguez family with CMA offer", time: "Yesterday" },
  ],
  home_services: [
    { id: "1", icon: Phone, iconColor: "text-teal-600", iconBg: "bg-teal-100", text: "New estimate request — James Peterson needs roof inspection after last night's storm", time: "12 min ago" },
    { id: "2", icon: FileText, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "Estimate sent — Linda Garcia, full roof replacement $18,500 with financing options", time: "1 hr ago" },
    { id: "3", icon: Mail, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "2-day follow-up sent to Richard Wilson — $3,500 leak repair estimate still pending", time: "2 hr ago" },
    { id: "4", icon: CheckCircle, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Job completed — Charles Anderson, annual HVAC tune-up ($189). Review request sent", time: "3 hr ago" },
    { id: "5", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "5-star Google review from Susan Taylor: 'Emergency repair done in 2 hours'", time: "4 hr ago" },
    { id: "6", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Seasonal campaign — 'Pre-summer AC check' SMS sent to 145 past HVAC customers", time: "5 hr ago" },
  ],
  legal: [
    { id: "1", icon: Phone, iconColor: "text-teal-600", iconBg: "bg-teal-100", text: "New inquiry — Marcus Johnson, personal injury case. Auto-acknowledgment sent within 30 seconds", time: "5 min ago" },
    { id: "2", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Consultation scheduled — Sarah Mitchell, divorce filing, Wednesday 10 AM", time: "30 min ago" },
    { id: "3", icon: FileText, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "Engagement letter sent to Harbor Construction for contract dispute ($15K retainer)", time: "2 hr ago" },
    { id: "4", icon: AlertTriangle, iconColor: "text-red-600", iconBg: "bg-red-100", text: "Deadline alert — Patricia Williams estate filing due in 7 days. Documents pending", time: "3 hr ago" },
    { id: "5", icon: CheckCircle, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Case closed — Summit Realty real estate closing completed. Review request sent", time: "4 hr ago" },
    { id: "6", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Annual check-in sent to 67 past clients: 'Any legal needs we can help with?'", time: "Yesterday" },
  ],
  coaching_education: [
    { id: "1", icon: UserPlus, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "Lead magnet downloaded — Rachel Green grabbed '10 Steps to Your First $10K Month'", time: "20 min ago" },
    { id: "2", icon: FileText, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Application submitted — Jason Wright applied for 1:1 Coaching ($5,000 program)", time: "1 hr ago" },
    { id: "3", icon: Calendar, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "Discovery call booked — Nathan Harris, VIP Day inquiry, Friday 11 AM", time: "2 hr ago" },
    { id: "4", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Enrollment! — Brittany Lopez joined Mastermind program ($8,000), payment plan started", time: "3 hr ago" },
    { id: "5", icon: Star, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Milestone — Kevin Martinez completed Module 5. Celebration email + check-in sent", time: "4 hr ago" },
    { id: "6", icon: Mail, iconColor: "text-rose-600", iconBg: "bg-rose-100", text: "Alumni upsell — Laura Davis received 'Next Level Program' invite with early-bird pricing", time: "5 hr ago" },
  ],
  restaurant_food: [
    { id: "1", icon: UserPlus, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "New loyalty signup — Noah Anderson joined text list via QR code (10% off first visit)", time: "25 min ago" },
    { id: "2", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Catering deposit — Sarah Johnson paid $900 for 20-person birthday party (Apr 5)", time: "1 hr ago" },
    { id: "3", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Weekly specials text sent to 892 opt-in customers — 'Truffle Pasta Night this Friday'", time: "2 hr ago" },
    { id: "4", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "5-star Yelp review from Jessica Clark: 'Best date night restaurant in the area'", time: "3 hr ago" },
    { id: "5", icon: AlertTriangle, iconColor: "text-red-600", iconBg: "bg-red-100", text: "'We miss you' sent to Olivia Brown — hasn't visited in 32 days (was weekly regular)", time: "4 hr ago" },
    { id: "6", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Birthday offer triggered for Marcus Rivera — free dessert, expires this Saturday", time: "5 hr ago" },
  ],
  automotive: [
    { id: "1", icon: Phone, iconColor: "text-teal-600", iconBg: "bg-teal-100", text: "New lead — James Peterson called about brake noise. Appointment booked for tomorrow", time: "15 min ago" },
    { id: "2", icon: FileText, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "Estimate sent — Linda Garcia, transmission service $2,400 with breakdown attached", time: "1 hr ago" },
    { id: "3", icon: CheckCircle, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Service completed — Nancy Davis, 30K mile service ($450). Digital invoice sent", time: "2 hr ago" },
    { id: "4", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Maintenance reminder — 45 customers due for oil change sent automated texts", time: "3 hr ago" },
    { id: "5", icon: AlertTriangle, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "Declined service recovery — Robert Chen declined AC recharge 30 days ago. Follow-up sent with 10% off", time: "4 hr ago" },
    { id: "6", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "Google review from Charles Anderson: 'Honest pricing, great work on my AC'", time: "Yesterday" },
  ],
  nonprofit: [
    { id: "1", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-100", text: "Donation received — Sarah Johnson gave $150. Personalized thank-you + tax receipt sent instantly", time: "10 min ago" },
    { id: "2", icon: UserPlus, iconColor: "text-indigo-600", iconBg: "bg-indigo-100", text: "New monthly donor — David Lee set up $50/month recurring. Welcome sequence started", time: "1 hr ago" },
    { id: "3", icon: Mail, iconColor: "text-violet-600", iconBg: "bg-violet-100", text: "Impact update sent to 89 monthly donors: 'Your $50/month provided 12 meals this week'", time: "2 hr ago" },
    { id: "4", icon: AlertTriangle, iconColor: "text-red-600", iconBg: "bg-red-100", text: "Lapsed donor alert — Marcus Rivera last donated 14 months ago ($250 total). Re-engagement triggered", time: "3 hr ago" },
    { id: "5", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-100", text: "Event registration — Harbor Wealth Mgmt RSVP'd for Annual Gala (Table of 10, $10K sponsor)", time: "4 hr ago" },
    { id: "6", icon: Star, iconColor: "text-amber-600", iconBg: "bg-amber-100", text: "Volunteer hours logged — 8 volunteers completed 32 hours this week. Appreciation emails sent", time: "Yesterday" },
  ],
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
