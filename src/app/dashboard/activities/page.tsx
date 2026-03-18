"use client";

import { getActiveIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  Loader2, Mail, Phone, MessageSquare, DollarSign, UserPlus, Calendar,
  CheckCircle, FileText, Handshake, AlertTriangle, Star, Send, Clock,
  TrendingUp, Zap, Filter,
} from "lucide-react";

// ─── TYPES ───

interface Activity {
  id: string;
  type: "email_sent" | "email_opened" | "call" | "sms" | "payment" | "new_contact" | "deal_created" | "deal_won" | "task_completed" | "form_submitted" | "meeting" | "note" | "automation";
  title: string;
  description: string;
  contact: string;
  time: string;
  value?: number;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  email_sent: { icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
  email_opened: { icon: Mail, color: "text-indigo-600", bg: "bg-indigo-50" },
  call: { icon: Phone, color: "text-emerald-600", bg: "bg-emerald-50" },
  sms: { icon: MessageSquare, color: "text-teal-600", bg: "bg-teal-50" },
  payment: { icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  new_contact: { icon: UserPlus, color: "text-violet-600", bg: "bg-violet-50" },
  deal_created: { icon: Handshake, color: "text-amber-600", bg: "bg-amber-50" },
  deal_won: { icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  task_completed: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  form_submitted: { icon: FileText, color: "text-rose-600", bg: "bg-rose-50" },
  meeting: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
  note: { icon: FileText, color: "text-gray-500", bg: "bg-gray-50" },
  automation: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
};

// ─── DEMO DATA ───

const INDUSTRY_ACTIVITIES: Record<string, Activity[]> = {
  agency_consulting: [
    { id: "a1", type: "email_opened", title: "Proposal email opened", description: "Meridian Law Group opened the website redesign proposal", contact: "Amanda Chen", time: "12 min ago" },
    { id: "a2", type: "deal_won", title: "Deal won — $10K/mo retainer", description: "Sterling Partners signed the Full Stack Marketing retainer", contact: "Sterling Partners", time: "1 hour ago", value: 10000 },
    { id: "a3", type: "automation", title: "Automation: Renewal Alert triggered", description: "Coastal Real Estate retainer renews in 28 days — task created for Rocco", contact: "Coastal Real Estate", time: "2 hours ago" },
    { id: "a4", type: "meeting", title: "Brand review completed", description: "1-hour brand identity review with Summit Athletics — Colton presented mockups", contact: "Summit Athletics", time: "3 hours ago" },
    { id: "a5", type: "email_sent", title: "Monthly report delivered", description: "March performance report sent to Brightview Hotels — ROAS up 34%", contact: "Brightview Hotels", time: "4 hours ago" },
    { id: "a6", type: "form_submitted", title: "New lead from website", description: "Jake Morrison from Apex Construction submitted contact form — interested in social media", contact: "Apex Construction", time: "5 hours ago" },
    { id: "a7", type: "task_completed", title: "Task completed: SEO Migration Plan", description: "Rocco completed the URL redirect map for Meridian Law — 127 redirects mapped", contact: "Meridian Law Group", time: "6 hours ago" },
    { id: "a8", type: "call", title: "Discovery call completed", description: "30-minute call with Apex Construction — qualified as $3K/mo opportunity", contact: "Jake Morrison", time: "Yesterday" },
    { id: "a9", type: "sms", title: "SMS sent: Appointment reminder", description: "Reminded Amanda about tomorrow's website walkthrough at 10 AM", contact: "Amanda Chen", time: "Yesterday" },
    { id: "a10", type: "payment", title: "Payment received — $8,500", description: "Brightview Hotels March retainer payment processed via Stripe", contact: "Brightview Hotels", time: "Yesterday", value: 8500 },
    { id: "a11", type: "note", title: "Internal note added", description: "Rocco: 'Sterling Partners hinting at reducing scope — need retention strategy before April renewal'", contact: "Sterling Partners", time: "2 days ago" },
    { id: "a12", type: "deal_created", title: "New deal created — $36K", description: "Social Media Management proposal for Apex Construction — 12-month retainer", contact: "Apex Construction", time: "2 days ago", value: 36000 },
  ],
  health_wellness: [
    { id: "a1", type: "form_submitted", title: "New patient intake form", description: "Emily Rodriguez completed the online intake — interested in Botox consultation", contact: "Emily Rodriguez", time: "30 min ago" },
    { id: "a2", type: "payment", title: "Payment received — $1,600", description: "Sarah Thompson — Weight Loss Program month 2 payment processed", contact: "Sarah Thompson", time: "1 hour ago", value: 1600 },
    { id: "a3", type: "automation", title: "Automation: Botox rebooking reminder", description: "12-week Botox cycle reached for Maria Santos — SMS sent with rebooking link", contact: "Maria Santos", time: "2 hours ago" },
    { id: "a4", type: "meeting", title: "Consultation completed", description: "30-minute telehealth consultation with Sarah Thompson — dosage adjustment discussed", contact: "Sarah Thompson", time: "3 hours ago" },
    { id: "a5", type: "sms", title: "SMS: Appointment reminder", description: "Sent 24-hour reminder for Maria Santos' Botox appointment tomorrow at 10:30 AM", contact: "Maria Santos", time: "4 hours ago" },
    { id: "a6", type: "email_opened", title: "Welcome email opened", description: "Emily Rodriguez opened the new patient welcome email with intake link", contact: "Emily Rodriguez", time: "5 hours ago" },
    { id: "a7", type: "task_completed", title: "Task: Chart prepared", description: "Front desk prepared patient chart for Emily Rodriguez's consultation", contact: "Emily Rodriguez", time: "6 hours ago" },
    { id: "a8", type: "call", title: "Post-treatment check-in call", description: "Dr. Kim called David Kim — IV therapy recovery going well, wants to book 4-pack", contact: "David Kim", time: "Yesterday" },
    { id: "a9", type: "automation", title: "Automation: Review request sent", description: "48-hour post-visit review request sent to Michael Brown — Google review link included", contact: "Michael Brown", time: "Yesterday" },
    { id: "a10", type: "new_contact", title: "New patient added", description: "Emily Rodriguez added from website intake form — Botox consultation requested", contact: "Emily Rodriguez", time: "Yesterday" },
  ],
  ecommerce: [
    { id: "a1", type: "payment", title: "Subscription payment — $165", description: "VIP Monthly renewal processed for Andrew Krieman", contact: "Andrew Krieman", time: "1 hour ago", value: 165 },
    { id: "a2", type: "automation", title: "Automation: Win-back email sent", description: "60-day inactive trigger — win-back email with special offer sent to Raquel Munoz", contact: "Raquel Munoz", time: "2 hours ago" },
    { id: "a3", type: "email_opened", title: "Win-back email opened", description: "Tyler McLaughlin opened the re-engagement email with discount code", contact: "Tyler McLaughlin", time: "3 hours ago" },
    { id: "a4", type: "sms", title: "SMS received", description: "Chris Persaud: 'Picks were fire today 🔥🔥🔥 4-0 on NCAAB'", contact: "Chris Persaud", time: "4 hours ago" },
    { id: "a5", type: "new_contact", title: "New subscriber", description: "Wayne Barry signed up for Monthly plan — $99/mo", contact: "Wayne Barry", time: "6 hours ago", value: 99 },
    { id: "a6", type: "automation", title: "Automation: VIP milestone reached", description: "Chris Persaud hit 4th purchase — VIP tag added, congratulations email sent", contact: "Chris Persaud", time: "Yesterday" },
    { id: "a7", type: "email_sent", title: "Newsletter sent", description: "Weekly picks preview sent to 94 active subscribers", contact: "All Subscribers", time: "Yesterday" },
    { id: "a8", type: "deal_won", title: "Upgrade to VIP Yearly — $1,485", description: "Wayne Barry upgraded from Monthly ($99) to VIP Yearly ($1,485)", contact: "Wayne Barry", time: "2 days ago", value: 1485 },
  ],
  home_services: [
    { id: "a1", type: "form_submitted", title: "Emergency estimate request", description: "Susan Taylor — active roof leak in master bedroom, needs ASAP response", contact: "Susan Taylor", time: "45 min ago" },
    { id: "a2", type: "call", title: "Estimate follow-up call", description: "Called Richard Wilson about his pending gutter estimate — no answer, left voicemail", contact: "Richard Wilson", time: "2 hours ago" },
    { id: "a3", type: "task_completed", title: "Job completed: Emergency Leak Repair", description: "Crew finished emergency patch at Susan Taylor's — full repair scheduled for next week", contact: "Susan Taylor", time: "3 hours ago" },
    { id: "a4", type: "payment", title: "Payment received — $18,500", description: "Linda Garcia — Full Roof Replacement 50% deposit processed", contact: "Linda Garcia", time: "4 hours ago", value: 18500 },
    { id: "a5", type: "meeting", title: "Site visit completed", description: "HVAC install walkthrough with Thomas Brown — system specs confirmed", contact: "Thomas Brown", time: "Yesterday" },
    { id: "a6", type: "automation", title: "Automation: Maintenance reminder sent", description: "Annual maintenance plan renewal reminder sent to 12 customers", contact: "Multiple", time: "Yesterday" },
    { id: "a7", type: "email_sent", title: "Estimate sent — $4,200", description: "Gutter replacement estimate sent to Barbara Martinez", contact: "Barbara Martinez", time: "2 days ago", value: 4200 },
  ],
  fitness_gym: [
    { id: "a1", type: "new_contact", title: "New trial member", description: "Brandon Lewis signed up for a 7-day free trial via website", contact: "Brandon Lewis", time: "1 hour ago" },
    { id: "a2", type: "meeting", title: "PT session completed", description: "1-hour personal training session with Coach Sarah", contact: "Stephanie Clark", time: "2 hours ago" },
    { id: "a3", type: "automation", title: "Automation: At-risk member alert", description: "Daniel Wright hasn't checked in for 14 days — tagged as At Risk", contact: "Daniel Wright", time: "3 hours ago" },
    { id: "a4", type: "sms", title: "SMS: Class reminder", description: "Reminder sent for Monday 6PM HIIT class to 25 members", contact: "HIIT Group", time: "4 hours ago" },
    { id: "a5", type: "payment", title: "PT package purchased — $960", description: "Stephanie Clark purchased 12-pack PT sessions", contact: "Stephanie Clark", time: "Yesterday", value: 960 },
    { id: "a6", type: "automation", title: "Automation: Birthday reward", description: "Happy Birthday email + free smoothie code sent", contact: "Alex Rivera", time: "Yesterday" },
  ],
  beauty_salon: [
    { id: "a1", type: "form_submitted", title: "Online booking — Blowout + Style", description: "Harper Garcia booked Thursday 3PM with Stylist Alex", contact: "Harper Garcia", time: "30 min ago" },
    { id: "a2", type: "email_sent", title: "Bridal trial confirmation", description: "Confirmed Monday 10AM bridal hair trial with prep instructions", contact: "Charlotte Davis", time: "1 hour ago" },
    { id: "a3", type: "sms", title: "SMS: Running late", description: "Amelia Wilson texted — running 10 min late for keratin appointment", contact: "Amelia Wilson", time: "2 hours ago" },
    { id: "a4", type: "automation", title: "Automation: Rebooking reminder", description: "6-week rebooking reminder sent — last visit was Feb 1", contact: "Nina Patel", time: "3 hours ago" },
    { id: "a5", type: "payment", title: "Bridal package deposit — $600", description: "Charlotte Davis paid 50% deposit for bridal package", contact: "Charlotte Davis", time: "Yesterday", value: 600 },
    { id: "a6", type: "task_completed", title: "Task: Product restock ordered", description: "Keratin smoothing treatment restock placed with supplier", contact: "Internal", time: "Yesterday" },
  ],
  legal: [
    { id: "a1", type: "email_sent", title: "Engagement letter sent", description: "Estate planning engagement letter sent for review and signature", contact: "Patricia Williams", time: "1 hour ago" },
    { id: "a2", type: "form_submitted", title: "New consultation request", description: "Estate planning inquiry — husband recently passed, needs trust update", contact: "Patricia Williams", time: "2 hours ago" },
    { id: "a3", type: "meeting", title: "Client meeting — PI case", description: "1-hour case review with Marcus Johnson in Conference Room A", contact: "Marcus Johnson", time: "3 hours ago" },
    { id: "a4", type: "sms", title: "SMS: Reschedule request", description: "Sarah Mitchell asked to move Wednesday meeting to Thursday", contact: "Sarah Mitchell", time: "4 hours ago" },
    { id: "a5", type: "task_completed", title: "Task: Document review complete", description: "Medical records and police report reviewed for Johnson PI case", contact: "Marcus Johnson", time: "Yesterday" },
    { id: "a6", type: "automation", title: "Automation: Document request reminder", description: "7-day reminder sent — outstanding documents needed for Mitchell divorce", contact: "Sarah Mitchell", time: "Yesterday" },
  ],
  automotive: [
    { id: "a1", type: "task_completed", title: "Service complete: Timing belt", description: "Timing belt replacement finished — vehicle ready for pickup", contact: "Thomas Brown", time: "1 hour ago" },
    { id: "a2", type: "sms", title: "SMS: Vehicle ready", description: "'Your vehicle is ready for pickup!' sent with invoice link", contact: "Thomas Brown", time: "1 hour ago" },
    { id: "a3", type: "payment", title: "Payment received — $1,200", description: "Timing belt replacement payment processed", contact: "Thomas Brown", time: "2 hours ago", value: 1200 },
    { id: "a4", type: "automation", title: "Automation: Maintenance due reminder", description: "60K mile service reminder sent — last service was 30K at 6 months ago", contact: "Nancy Davis", time: "3 hours ago" },
    { id: "a5", type: "form_submitted", title: "Online appointment request", description: "Full brake job requested for Friday morning drop-off", contact: "James Peterson", time: "Yesterday" },
    { id: "a6", type: "automation", title: "Automation: Declined service follow-up", description: "30-day follow-up on declined brake inspection with 10% discount", contact: "James Peterson", time: "2 days ago" },
  ],
  coaching_education: [
    { id: "a1", type: "meeting", title: "1:1 coaching session", description: "Weekly coaching call — reviewed quarterly goals and action items", contact: "Jason Wright", time: "2 hours ago" },
    { id: "a2", type: "automation", title: "Automation: Session reminder", description: "24-hour reminder sent with Zoom link for tomorrow's session", contact: "Jason Wright", time: "3 hours ago" },
    { id: "a3", type: "form_submitted", title: "New application received", description: "VIP Day application from Nathan Harris — wants March 25 date", contact: "Nathan Harris", time: "4 hours ago" },
    { id: "a4", type: "automation", title: "Automation: Stuck intervention", description: "14-day check-in triggered — Lindsey hasn't submitted assignments in 3 weeks", contact: "Lindsey K.", time: "Yesterday" },
    { id: "a5", type: "payment", title: "Mastermind payment — $8,000", description: "Spring 2026 Mastermind Cohort month 1 payment processed", contact: "Cohort Member", time: "Yesterday", value: 8000 },
    { id: "a6", type: "deal_won", title: "New 1:1 coaching client signed", description: "Jason Wright signed 6-month 1:1 coaching package", contact: "Jason Wright", time: "2 days ago", value: 5000 },
  ],
  restaurant_food: [
    { id: "a1", type: "form_submitted", title: "New reservation — party of 6", description: "Friday 7:30 PM reservation for birthday dinner", contact: "Michael Rivera", time: "1 hour ago" },
    { id: "a2", type: "email_sent", title: "Catering proposal sent", description: "Corporate lunch menu + pricing sent to Apex Financial", contact: "Apex Financial", time: "2 hours ago" },
    { id: "a3", type: "automation", title: "Automation: Reservation confirmation", description: "Confirmation email with menu and parking info sent for Friday dinner", contact: "Michael Rivera", time: "3 hours ago" },
    { id: "a4", type: "payment", title: "Meal prep subscription — $480", description: "Weekly meal prep March payment processed", contact: "Marcus Rivera", time: "Yesterday", value: 480 },
    { id: "a5", type: "automation", title: "Automation: Post-dining review request", description: "Google review link sent 24 hours after dining experience", contact: "Table 12 — Johnson Party", time: "Yesterday" },
  ],
  real_estate: [
    { id: "a1", type: "email_opened", title: "Offer letter opened", description: "Amanda Hill opened the offer letter for 4521 Bayshore Dr", contact: "Amanda Hill", time: "30 min ago" },
    { id: "a2", type: "sms", title: "SMS: Showing update", description: "Robert Chen texted — 3 showings today, one couple very interested", contact: "Robert Chen", time: "2 hours ago" },
    { id: "a3", type: "deal_won", title: "Closing completed — $890K", description: "Williams Estate sale closed at First National Title", contact: "Patricia Williams", time: "3 hours ago", value: 26700 },
    { id: "a4", type: "meeting", title: "Open house completed", description: "Saturday open house at 1234 Gulf Blvd — 12 visitors, 4 sign-ins", contact: "Public", time: "Yesterday" },
    { id: "a5", type: "form_submitted", title: "Home valuation request", description: "James Rivera requested a market valuation for 789 Sunset Dr", contact: "James Rivera", time: "Yesterday" },
    { id: "a6", type: "automation", title: "Automation: Anniversary CMA", description: "1-year purchase anniversary — comparative market analysis sent automatically", contact: "Karen Wu", time: "2 days ago" },
  ],
  nonprofit: [
    { id: "a1", type: "payment", title: "Donation received — $500", description: "Monthly recurring donation from Robert Chen", contact: "Robert Chen", time: "1 hour ago", value: 500 },
    { id: "a2", type: "automation", title: "Automation: Thank you + receipt", description: "Tax-deductible receipt and thank you email auto-sent", contact: "Robert Chen", time: "1 hour ago" },
    { id: "a3", type: "email_sent", title: "Gala invitation sent", description: "Spring 2026 Annual Gala invitation sent to 450 supporters", contact: "All Supporters", time: "3 hours ago" },
    { id: "a4", type: "form_submitted", title: "Gala RSVP — attending", description: "Amanda Hill RSVP'd Yes + 1 for the Spring Gala (April 20)", contact: "Amanda Hill", time: "4 hours ago" },
    { id: "a5", type: "automation", title: "Automation: Lapsed donor re-engagement", description: "12-month re-engagement email sent with recent impact stories", contact: "David Park", time: "Yesterday" },
    { id: "a6", type: "deal_won", title: "Corporate partnership signed — $25K", description: "Apex Financial Group committed to $25K annual partnership", contact: "Apex Financial Group", time: "2 days ago", value: 25000 },
  ],
};

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`; }

// ─── MAIN ───

export default function ActivitiesPage() {
  const ic = useIndustry();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const demoIndustry = getActiveIndustry();
    const key = demoIndustry || "ecommerce";

    if (demoIndustry) {
      // Demo mode — show industry demo activities
      setActivities(INDUSTRY_ACTIVITIES[key] || []);
      setLoading(false);
    } else {
      // Real tenant — try real API, fall back to empty
      fetch("/api/contacts?pageSize=50&sortBy=createdAt&sortOrder=desc")
        .then(r => r.json())
        .then(data => {
          if (data.ok && data.data?.length > 0) {
            const acts: Activity[] = data.data.slice(0, 12).map((c: any, i: number) => ({
              id: c.id,
              type: i === 0 ? "new_contact" : i % 3 === 0 ? "payment" : i % 2 === 0 ? "email_sent" : "automation",
              title: i === 0 ? `New contact: ${c.firstName} ${c.lastName}` : i % 3 === 0 ? `Payment from ${c.firstName}` : `Activity: ${c.firstName} ${c.lastName}`,
              description: c.email,
              contact: `${c.firstName} ${c.lastName}`,
              time: new Date(c.createdAt).toLocaleDateString(),
              value: c.customFields?.ltv || undefined,
            }));
            setActivities(acts);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  const types: string[] = Array.from(new Set(activities.map(a => a.type)));
  const filtered = filter === "all" ? activities : activities.filter(a => a.type === filter);

  return (
    <>
      <Header title="Activities" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Activity Timeline</h2>
              <p className="text-xs text-gray-400 mt-0.5">{activities.length} activities</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setFilter("all")} className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${filter === "all" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>All</button>
              {[
                { key: "email_sent", label: "Emails" }, { key: "call", label: "Calls" }, { key: "sms", label: "SMS" },
                { key: "payment", label: "Payments" }, { key: "automation", label: "Automations" },
                { key: "form_submitted", label: "Forms" }, { key: "deal_won", label: "Deals Won" },
              ].filter(f => types.includes(f.key)).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${filter === f.key ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(a => {
                const config = typeConfig[a.type] || typeConfig.note;
                const Icon = config.icon;
                return (
                  <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition">
                    <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-gray-900">{a.title}</span>
                        {a.value && a.value > 0 && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{fmt(a.value)}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{a.description}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{a.contact}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-1">{a.time}</span>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No activities match this filter</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
