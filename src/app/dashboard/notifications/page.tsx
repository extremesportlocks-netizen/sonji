"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import {
  Bell, Check, CheckCheck, Trash2, Filter, Mail, DollarSign,
  Users, Zap, AlertTriangle, Star, FileText, Calendar,
  MessageSquare, TrendingUp, Ghost,
} from "lucide-react";

interface Notification {
  id: string;
  type: "payment" | "lead" | "automation" | "ghosting" | "review" | "deal" | "task" | "system";
  title: string;
  detail: string;
  time: string;
  read: boolean;
  icon: string;
}

const typeColors: Record<string, string> = {
  payment: "bg-green-50 text-green-600",
  lead: "bg-blue-50 text-blue-600",
  automation: "bg-amber-50 text-amber-600",
  ghosting: "bg-red-50 text-red-600",
  review: "bg-yellow-50 text-yellow-600",
  deal: "bg-indigo-50 text-indigo-600",
  task: "bg-emerald-50 text-emerald-600",
  system: "bg-gray-50 text-gray-600",
};

const INDUSTRY_NOTIFS: Record<string, Notification[]> = {
  agency_consulting: [
    { id: "n1", type: "deal", title: "Deal won — Sterling Partners $10K/mo", detail: "Full Stack Marketing retainer signed. Project auto-created.", time: "1 hour ago", read: false, icon: "🤝" },
    { id: "n2", type: "ghosting", title: "Ghosting Alert: Coastal Real Estate", detail: "Email frequency dropped 80%. 12 days inactive. $72K LTV at risk.", time: "2 hours ago", read: false, icon: "👻" },
    { id: "n3", type: "automation", title: "3 automations fired", detail: "2 new lead responses + 1 renewal alert for Harbor Dental.", time: "3 hours ago", read: false, icon: "⚡" },
    { id: "n4", type: "lead", title: "New lead: Apex Construction", detail: "Jake Morrison submitted contact form. Interested in social media.", time: "5 hours ago", read: true, icon: "📋" },
    { id: "n5", type: "payment", title: "Brightview Hotels — $8,500 received", detail: "March retainer payment processed via Stripe.", time: "Yesterday", read: true, icon: "💳" },
    { id: "n6", type: "review", title: "New 5-star review — Harbor Dental", detail: "'Best dental marketing agency we've worked with!' on Google.", time: "Yesterday", read: true, icon: "⭐" },
    { id: "n7", type: "task", title: "Task completed: SEO Redirect Map", detail: "Rocco completed 127 URL redirects for Meridian Law Group.", time: "Yesterday", read: true, icon: "✅" },
    { id: "n8", type: "system", title: "Stripe sync completed", detail: "4,075 contacts imported. $840,796 total revenue tracked.", time: "2 days ago", read: true, icon: "🔄" },
    { id: "n9", type: "automation", title: "Monthly reports auto-generated", detail: "March reports ready for Brightview, Sterling, Harbor, Coastal.", time: "2 days ago", read: true, icon: "📊" },
    { id: "n10", type: "deal", title: "New deal created — Apex Construction", detail: "Social Media Management $36K/year. Stage: Discovery.", time: "2 days ago", read: true, icon: "🎯" },
    { id: "n11", type: "ghosting", title: "Sterling Partners velocity drop", detail: "Response time slowed from same-day to 3-day average.", time: "3 days ago", read: true, icon: "⚠️" },
    { id: "n12", type: "lead", title: "2 new website visitors from Google Ads", detail: "Landed on services page. UTM: google_ads/brand.", time: "3 days ago", read: true, icon: "🔍" },
  ],
  health_wellness: [
    { id: "n1", type: "lead", title: "New patient intake: Emily Rodriguez", detail: "Botox consultation requested. Form submitted 30 min ago.", time: "30 min ago", read: false, icon: "📝" },
    { id: "n2", type: "payment", title: "Sarah Thompson — $1,600 received", detail: "Weight Loss Program month 2 payment.", time: "1 hour ago", read: false, icon: "💳" },
    { id: "n3", type: "automation", title: "Botox rebooking reminder sent", detail: "Maria Santos — 12-week cycle reached.", time: "2 hours ago", read: false, icon: "⚡" },
    { id: "n4", type: "ghosting", title: "Patricia Lee — missed 2nd appointment", detail: "No-show pattern detected. 18 days since last visit.", time: "4 hours ago", read: true, icon: "👻" },
    { id: "n5", type: "review", title: "5-star review from Michael Brown", detail: "'Amazing experience! Dr. Patel is fantastic.' on Google.", time: "Yesterday", read: true, icon: "⭐" },
    { id: "n6", type: "automation", title: "12 appointment reminders sent", detail: "24-hour SMS reminders for tomorrow's patients.", time: "Yesterday", read: true, icon: "📱" },
    { id: "n7", type: "task", title: "David Kim — IV therapy 4-pack booked", detail: "Front desk confirmed booking and processed payment.", time: "Yesterday", read: true, icon: "✅" },
    { id: "n8", type: "system", title: "Consent forms updated", detail: "New telehealth regulations take effect April 1.", time: "2 days ago", read: true, icon: "📄" },
  ],
  ecommerce: [
    { id: "n1", type: "payment", title: "Andrew Krieman — payment failed", detail: "VIP Monthly $165 card declined. 3rd attempt.", time: "1 hour ago", read: false, icon: "⚠️" },
    { id: "n2", type: "automation", title: "Win-back email sent to Raquel Munoz", detail: "60-day inactive trigger. Special offer included.", time: "2 hours ago", read: false, icon: "⚡" },
    { id: "n3", type: "deal", title: "Wayne Barry upgraded to VIP Yearly", detail: "Monthly $99 → Yearly $1,485. Great conversion.", time: "6 hours ago", read: true, icon: "🎉" },
    { id: "n4", type: "automation", title: "Chris Persaud hit VIP milestone", detail: "4th purchase — congratulations email sent.", time: "Yesterday", read: true, icon: "🏆" },
    { id: "n5", type: "lead", title: "New subscriber: Wayne Barry", detail: "Signed up for Monthly plan at $99/mo.", time: "2 days ago", read: true, icon: "🆕" },
    { id: "n6", type: "system", title: "Weekly newsletter sent", detail: "Picks preview delivered to 94 active subscribers.", time: "2 days ago", read: true, icon: "📧" },
  ],
  home_services: [
    { id: "n1", type: "lead", title: "EMERGENCY: Susan Taylor — roof leak", detail: "Active leak in master bedroom. Needs same-day response.", time: "45 min ago", read: false, icon: "🚨" },
    { id: "n2", type: "payment", title: "Linda Garcia — $18,500 deposit", detail: "Full roof replacement 50% deposit processed via Stripe.", time: "4 hours ago", read: false, icon: "💳" },
    { id: "n3", type: "ghosting", title: "Richard Wilson — no response 14 days", detail: "Gutter estimate sent, no reply. $4,200 at risk.", time: "5 hours ago", read: true, icon: "👻" },
    { id: "n4", type: "automation", title: "12 maintenance reminders sent", detail: "Annual plan renewal notices delivered.", time: "Yesterday", read: true, icon: "⚡" },
    { id: "n5", type: "review", title: "5-star Google review from Barbara Martinez", detail: "'Professional crew, fair pricing. Highly recommend!'", time: "2 days ago", read: true, icon: "⭐" },
  ],
  fitness_gym: [
    { id: "n1", type: "ghosting", title: "Daniel Wright — 14 days inactive", detail: "No gym check-in for 14 days. At-risk member.", time: "3 hours ago", read: false, icon: "👻" },
    { id: "n2", type: "payment", title: "Stephanie Clark — PT package $960", detail: "12-pack personal training sessions purchased.", time: "Yesterday", read: false, icon: "💳" },
    { id: "n3", type: "lead", title: "New trial signup: Brandon Lewis", detail: "7-day free trial activated from website.", time: "Yesterday", read: true, icon: "🆕" },
    { id: "n4", type: "automation", title: "Birthday reward sent to Alex Rivera", detail: "Happy birthday email + free smoothie code.", time: "Yesterday", read: true, icon: "🎂" },
  ],
  beauty_salon: [
    { id: "n1", type: "lead", title: "New online booking: Harper Garcia", detail: "Blowout + Style, Thursday 3 PM with Stylist Alex.", time: "1 hour ago", read: false, icon: "📅" },
    { id: "n2", type: "payment", title: "Charlotte Davis — bridal deposit $600", detail: "Bridal package 50% deposit processed.", time: "Yesterday", read: false, icon: "💳" },
    { id: "n3", type: "automation", title: "Rebooking reminder sent to Nina Patel", detail: "6 weeks since last visit. Rebooking link included.", time: "3 hours ago", read: true, icon: "⚡" },
    { id: "n4", type: "review", title: "5-star review from Amelia Wilson", detail: "'Best keratin treatment I've ever had!'", time: "Yesterday", read: true, icon: "⭐" },
  ],
  real_estate: [
    { id: "n1", type: "deal", title: "Offer submitted: 4521 Bayshore Dr", detail: "Amanda Hill offering $425K. Pre-approval attached.", time: "30 min ago", read: false, icon: "🏠" },
    { id: "n2", type: "payment", title: "Williams Estate — closing complete", detail: "$890K sale closed. Commission: $26,700.", time: "3 hours ago", read: false, icon: "💳" },
    { id: "n3", type: "automation", title: "Anniversary CMA sent to Karen Wu", detail: "1-year purchase anniversary market analysis.", time: "Yesterday", read: true, icon: "⚡" },
    { id: "n4", type: "lead", title: "New inquiry: Home valuation request", detail: "James Rivera — 789 Sunset Dr.", time: "Yesterday", read: true, icon: "📋" },
  ],
  coaching_education: [
    { id: "n1", type: "lead", title: "VIP Day application: Nathan Harris", detail: "Referred by Jason Wright. March 25 preferred.", time: "4 hours ago", read: false, icon: "📋" },
    { id: "n2", type: "ghosting", title: "Lindsey K. — 3 weeks no submissions", detail: "No assignments in 21 days. Stuck intervention triggered.", time: "Yesterday", read: false, icon: "👻" },
    { id: "n3", type: "payment", title: "Mastermind cohort — $48,000", detail: "Spring 2026 cohort fully enrolled. 6 participants.", time: "2 days ago", read: true, icon: "💳" },
    { id: "n4", type: "automation", title: "Session reminders sent to 4 clients", detail: "24-hour Zoom link reminders.", time: "Yesterday", read: true, icon: "⚡" },
  ],
  restaurant_food: [
    { id: "n1", type: "lead", title: "New reservation: Michael Rivera party of 6", detail: "Friday 7:30 PM. Birthday celebration. Corner booth requested.", time: "2 hours ago", read: false, icon: "📅" },
    { id: "n2", type: "deal", title: "Catering inquiry: Apex Financial", detail: "Corporate lunch for 35 on April 12. Budget: $3,500.", time: "Today", read: false, icon: "🍽️" },
    { id: "n3", type: "automation", title: "Post-dining feedback sent", detail: "Review request to 8 diners from last night.", time: "Yesterday", read: true, icon: "⚡" },
    { id: "n4", type: "payment", title: "Wedding deposit: Emily & David $4,250", detail: "Reception 50% deposit processed.", time: "2 days ago", read: true, icon: "💳" },
  ],
  automotive: [
    { id: "n1", type: "task", title: "Thomas Brown — post-service noise", detail: "Cold-start squealing after timing belt. May need tension adjustment.", time: "8 hours ago", read: false, icon: "🔧" },
    { id: "n2", type: "lead", title: "Enterprise Fleet — 5 vehicles need service", detail: "30K mile service block requested for next week.", time: "Today", read: false, icon: "🚗" },
    { id: "n3", type: "review", title: "5-star review from Nancy Davis", detail: "'Great service! In and out in under 2 hours.'", time: "Yesterday", read: true, icon: "⭐" },
    { id: "n4", type: "automation", title: "Declined service follow-up sent", detail: "James Peterson — brake inspection with 10% discount.", time: "2 days ago", read: true, icon: "⚡" },
  ],
  legal: [
    { id: "n1", type: "task", title: "Marcus Johnson docs uploaded", detail: "Medical records received for PI case.", time: "1 hour ago", read: false, icon: "📎" },
    { id: "n2", type: "lead", title: "New consultation: Patricia Williams", detail: "Estate planning — husband recently passed.", time: "2 hours ago", read: false, icon: "📋" },
    { id: "n3", type: "system", title: "Deposition scheduled: Mitchell v. Mitchell", detail: "Thursday at 2 PM, Conference Room A.", time: "3 hours ago", read: true, icon: "📅" },
    { id: "n4", type: "payment", title: "Harbor Construction — $3,750 retainer", detail: "Contract review retainer payment received.", time: "Yesterday", read: true, icon: "💳" },
    { id: "n5", type: "automation", title: "Document reminder sent to Sarah Mitchell", detail: "Outstanding docs needed for divorce case.", time: "Yesterday", read: true, icon: "⚡" },
  ],
  nonprofit: [
    { id: "n1", type: "payment", title: "Robert Chen — monthly donation $500", detail: "Recurring monthly contribution processed.", time: "1 hour ago", read: false, icon: "💚" },
    { id: "n2", type: "lead", title: "Volunteer application: Sarah Lopez", detail: "Event planning experience. Heard from Amanda Hill.", time: "Today", read: false, icon: "📋" },
    { id: "n3", type: "deal", title: "Sponsorship inquiry: Community Bank", detail: "Interested in Gold/Platinum gala sponsorship.", time: "Yesterday", read: true, icon: "🤝" },
    { id: "n4", type: "automation", title: "Donation receipts auto-sent", detail: "Tax-deductible receipts for 8 March donations.", time: "Yesterday", read: true, icon: "⚡" },
    { id: "n5", type: "system", title: "Gala RSVP count: 45/100 seats", detail: "Spring Gala at 45% capacity. 55 seats remaining.", time: "2 days ago", read: true, icon: "🎉" },
  ],
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    const di = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = di || "ecommerce";
    setNotifs(INDUSTRY_NOTIFS[key] || INDUSTRY_NOTIFS.ecommerce);
  }, []);

  const filtered = filter === "unread" ? notifs.filter(n => !n.read) : notifs;
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <>
      <Header title="Notifications" />
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-900">All Notifications</h2>
              {unreadCount > 0 && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{unreadCount} unread</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilter("all")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${filter === "all" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>All</button>
              <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${filter === "unread" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>Unread</button>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {filtered.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition cursor-pointer ${!n.read ? "bg-indigo-50/20" : ""}`}>
                <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm leading-snug ${!n.read ? "text-gray-900 font-semibold" : "text-gray-700"}`}>{n.title}</p>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${typeColors[n.type]}`}>{n.type}</span>
                  </div>
                  <p className="text-xs text-gray-500">{n.detail}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                </div>
                {!n.read && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No {filter === "unread" ? "unread " : ""}notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
