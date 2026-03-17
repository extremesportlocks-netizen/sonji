"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  Mail, Plus, Copy, Eye, Edit3, Star, Trash2, Search,
  Users, DollarSign, Calendar, Heart, Zap, Send,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: "welcome" | "follow_up" | "billing" | "reminder" | "nurture" | "win_back" | "review" | "onboarding";
  subject: string;
  preview: string;
  uses: number;
  openRate: number;
  clickRate: number;
  starred: boolean;
}

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  welcome: { label: "Welcome", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  follow_up: { label: "Follow-Up", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  billing: { label: "Billing", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  reminder: { label: "Reminder", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  nurture: { label: "Nurture", color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  win_back: { label: "Win-Back", color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  review: { label: "Review Request", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  onboarding: { label: "Onboarding", color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
};

const INDUSTRY_TEMPLATES: Record<string, Template[]> = {
  agency_consulting: [
    { id: "t1", name: "New Lead Welcome", category: "welcome", subject: "Thanks for reaching out — here's what happens next", preview: "Hi {{firstName}}, thanks for your interest in {{companyName}}. We received your inquiry and our team will review it within 24 hours...", uses: 47, openRate: 72, clickRate: 24, starred: true },
    { id: "t2", name: "Proposal Follow-Up (Day 3)", category: "follow_up", subject: "Quick follow-up on your {{companyName}} proposal", preview: "Hi {{firstName}}, I wanted to follow up on the proposal we sent on {{proposalDate}}. I know you're busy, so I'll keep this brief...", uses: 32, openRate: 58, clickRate: 18, starred: true },
    { id: "t3", name: "Monthly Report Delivery", category: "billing", subject: "Your March 2026 performance report is ready", preview: "Hi {{firstName}}, your March performance report for {{companyName}} is attached. Here are the highlights: Revenue: {{revenue}}...", uses: 15, openRate: 85, clickRate: 45, starred: false },
    { id: "t4", name: "Client Onboarding Kickoff", category: "onboarding", subject: "Welcome aboard! Here's your onboarding plan", preview: "Hi {{firstName}}, welcome to {{agencyName}}! We're excited to get started. Here's your 30-day onboarding plan with key milestones...", uses: 8, openRate: 92, clickRate: 56, starred: true },
    { id: "t5", name: "Retainer Renewal Reminder", category: "reminder", subject: "Your {{companyName}} retainer renews in {{daysUntil}} days", preview: "Hi {{firstName}}, this is a friendly reminder that your retainer with {{agencyName}} renews on {{renewalDate}}. Before then, I'd love to...", uses: 12, openRate: 68, clickRate: 32, starred: false },
    { id: "t6", name: "Client Going Cold — Check-In", category: "nurture", subject: "Haven't heard from you — everything okay?", preview: "Hi {{firstName}}, I noticed we haven't connected in a while and wanted to check in. Is there anything on your mind about our work together?...", uses: 9, openRate: 44, clickRate: 12, starred: false },
    { id: "t7", name: "NPS Survey (90-Day)", category: "review", subject: "Quick question: How are we doing?", preview: "Hi {{firstName}}, you've been with us for 90 days and I'd love your honest feedback. On a scale of 0-10, how likely are you to recommend...", uses: 6, openRate: 52, clickRate: 38, starred: false },
    { id: "t8", name: "Win-Back — Former Client", category: "win_back", subject: "We miss working with {{companyName}}", preview: "Hi {{firstName}}, it's been a few months since we worked together and I wanted to reach out. We've added some exciting new capabilities...", uses: 4, openRate: 35, clickRate: 8, starred: false },
  ],
  health_wellness: [
    { id: "t1", name: "New Patient Welcome", category: "welcome", subject: "Welcome to {{clinicName}} — your journey starts here", preview: "Hi {{firstName}}, we're excited to welcome you as a new patient! Your consultation is scheduled for {{appointmentDate}}...", uses: 34, openRate: 78, clickRate: 32, starred: true },
    { id: "t2", name: "Appointment Reminder (24hr)", category: "reminder", subject: "Reminder: Your appointment is tomorrow at {{time}}", preview: "Hi {{firstName}}, this is a friendly reminder about your appointment tomorrow at {{time}} with {{providerName}}...", uses: 128, openRate: 82, clickRate: 8, starred: true },
    { id: "t3", name: "Post-Treatment Check-In", category: "follow_up", subject: "How are you feeling after your {{treatment}}?", preview: "Hi {{firstName}}, it's been 3 days since your {{treatment}} and I wanted to check in. Please let us know if you're experiencing...", uses: 45, openRate: 65, clickRate: 15, starred: false },
    { id: "t4", name: "Botox Rebooking (12 Weeks)", category: "reminder", subject: "Time for your next Botox appointment", preview: "Hi {{firstName}}, it's been 12 weeks since your last Botox treatment — the perfect time to rebook for optimal results...", uses: 22, openRate: 55, clickRate: 42, starred: true },
    { id: "t5", name: "Review Request", category: "review", subject: "How was your visit to {{clinicName}}?", preview: "Hi {{firstName}}, we hope you had a great experience at your recent visit. Would you mind leaving us a quick review?...", uses: 38, openRate: 48, clickRate: 22, starred: false },
    { id: "t6", name: "Lapsed Patient Win-Back", category: "win_back", subject: "We miss you at {{clinicName}}", preview: "Hi {{firstName}}, it's been a while since your last visit and we wanted to let you know about some new services we're offering...", uses: 12, openRate: 32, clickRate: 10, starred: false },
  ],
  ecommerce: [
    { id: "t1", name: "Welcome + First Purchase", category: "welcome", subject: "Welcome to {{brandName}} — here's what's inside", preview: "Hey {{firstName}}! Welcome to the crew. As a new subscriber, here's what you can expect: weekly picks, exclusive insights...", uses: 94, openRate: 68, clickRate: 35, starred: true },
    { id: "t2", name: "Win-Back (60 Days)", category: "win_back", subject: "We haven't seen you in a while...", preview: "Hey {{firstName}}, it's been 60 days since your last activity and we miss having you around. Here's a special offer...", uses: 47, openRate: 28, clickRate: 12, starred: false },
    { id: "t3", name: "VIP Milestone", category: "nurture", subject: "Congrats! You just hit VIP status 🎉", preview: "Hey {{firstName}}, you've reached VIP status with your {{purchaseCount}}th purchase! Here's what that unlocks for you...", uses: 18, openRate: 75, clickRate: 48, starred: true },
    { id: "t4", name: "Subscription Renewal", category: "billing", subject: "Your {{planName}} subscription renews on {{date}}", preview: "Hey {{firstName}}, your {{planName}} subscription renews on {{date}} for {{amount}}. No action needed — unless you want to upgrade...", uses: 94, openRate: 55, clickRate: 8, starred: false },
    { id: "t5", name: "Cancellation Save", category: "win_back", subject: "Before you go — can we make it right?", preview: "Hey {{firstName}}, I saw you're thinking about canceling. I wanted to personally reach out to see if there's anything...", uses: 12, openRate: 42, clickRate: 18, starred: true },
  ],
  fitness_gym: [
    { id: "t1", name: "Free Trial Welcome", category: "welcome", subject: "Welcome to {{gymName}} — your trial starts now!", preview: "Hey {{firstName}}! Your 7-day free trial is active. Here's what to expect and how to make the most of it...", uses: 78, openRate: 72, clickRate: 38, starred: true },
    { id: "t2", name: "Trial Expiring (Day 5)", category: "nurture", subject: "Your trial ends in 2 days — ready to join?", preview: "Hey {{firstName}}, your free trial ends on {{expiryDate}}. We've loved having you! Here's a special offer to keep going...", uses: 45, openRate: 58, clickRate: 32, starred: true },
    { id: "t3", name: "At-Risk Member", category: "win_back", subject: "We miss you at {{gymName}}!", preview: "Hey {{firstName}}, we noticed you haven't checked in for a while. Everything okay? We'd love to help you get back on track...", uses: 22, openRate: 38, clickRate: 12, starred: false },
    { id: "t4", name: "Class Reminder", category: "reminder", subject: "Your {{className}} class is tomorrow at {{time}}", preview: "Hey {{firstName}}, just a reminder about your {{className}} class tomorrow at {{time}}. See you there!", uses: 234, openRate: 75, clickRate: 5, starred: false },
  ],
  beauty_salon: [
    { id: "t1", name: "Appointment Confirmation", category: "reminder", subject: "Confirmed: {{service}} on {{date}} at {{time}}", preview: "Hi {{firstName}}, your {{service}} appointment is confirmed for {{date}} at {{time}} with {{stylist}}...", uses: 312, openRate: 82, clickRate: 8, starred: true },
    { id: "t2", name: "Rebooking Reminder (6 Weeks)", category: "reminder", subject: "Time for your next visit!", preview: "Hi {{firstName}}, it's been 6 weeks since your last visit. Ready to rebook? We have openings this week...", uses: 89, openRate: 48, clickRate: 35, starred: true },
    { id: "t3", name: "Post-Visit Thank You", category: "follow_up", subject: "Thanks for visiting {{salonName}}!", preview: "Hi {{firstName}}, thanks for coming in today! We hope you love your new look. Here are some aftercare tips...", uses: 156, openRate: 55, clickRate: 22, starred: false },
    { id: "t4", name: "Bridal Package Inquiry", category: "welcome", subject: "Congratulations! Let's plan your bridal look", preview: "Hi {{firstName}}, congrats on your upcoming wedding! We'd love to help you look your best on your special day...", uses: 8, openRate: 88, clickRate: 56, starred: true },
  ],
  real_estate: [
    { id: "t1", name: "New Listing Alert", category: "nurture", subject: "New listing matching your criteria: {{address}}", preview: "Hi {{firstName}}, a new property just hit the market that matches your search. {{bedrooms}} bed, {{bathrooms}} bath...", uses: 124, openRate: 62, clickRate: 45, starred: true },
    { id: "t2", name: "Open House Invitation", category: "reminder", subject: "You're invited: Open House at {{address}}", preview: "Hi {{firstName}}, join us this {{day}} from {{startTime}} to {{endTime}} for an open house at {{address}}...", uses: 67, openRate: 48, clickRate: 28, starred: false },
    { id: "t3", name: "Anniversary CMA", category: "nurture", subject: "Happy home anniversary! Here's what your home is worth", preview: "Hi {{firstName}}, it's been 1 year since you purchased {{address}}. I've prepared a complimentary market analysis...", uses: 34, openRate: 72, clickRate: 38, starred: true },
    { id: "t4", name: "Closing Congratulations", category: "follow_up", subject: "Congratulations on your new home! 🏠🎉", preview: "Hi {{firstName}}, congratulations on closing on {{address}}! It was a pleasure working with you...", uses: 28, openRate: 92, clickRate: 15, starred: false },
  ],
  home_services: [
    { id: "t1", name: "Estimate Follow-Up", category: "follow_up", subject: "Your {{service}} estimate from {{companyName}}", preview: "Hi {{firstName}}, thanks for requesting an estimate for {{service}}. Attached is your detailed quote for ${{amount}}...", uses: 89, openRate: 65, clickRate: 32, starred: true },
    { id: "t2", name: "Job Complete + Review", category: "review", subject: "Your {{service}} is complete — how did we do?", preview: "Hi {{firstName}}, we've completed your {{service}}. We hope you're happy with the results! Would you mind leaving us a review?...", uses: 45, openRate: 52, clickRate: 28, starred: true },
    { id: "t3", name: "Seasonal HVAC Reminder", category: "reminder", subject: "Time for your {{season}} HVAC tune-up", preview: "Hi {{firstName}}, {{season}} is coming! Schedule your HVAC tune-up now to avoid breakdowns when you need it most...", uses: 120, openRate: 42, clickRate: 22, starred: false },
    { id: "t4", name: "Storm Alert Follow-Up", category: "nurture", subject: "Storm damage? We're here to help", preview: "Hi {{firstName}}, after the recent storms in {{area}}, we wanted to check in. If you notice any roof or exterior damage...", uses: 15, openRate: 68, clickRate: 35, starred: false },
  ],
  legal: [
    { id: "t1", name: "Consultation Confirmation", category: "reminder", subject: "Your consultation is confirmed for {{date}}", preview: "Dear {{firstName}}, this confirms your consultation with {{attorneyName}} on {{date}} at {{time}}. Please bring...", uses: 45, openRate: 78, clickRate: 12, starred: true },
    { id: "t2", name: "Document Request Reminder", category: "reminder", subject: "Reminder: Outstanding documents needed for your case", preview: "Dear {{firstName}}, we still need the following documents to proceed with your case: {{documentList}}...", uses: 28, openRate: 62, clickRate: 45, starred: true },
    { id: "t3", name: "Case Milestone Update", category: "follow_up", subject: "Update on your {{caseType}} case", preview: "Dear {{firstName}}, I wanted to update you on the progress of your {{caseType}} case. This week we...", uses: 34, openRate: 85, clickRate: 18, starred: false },
    { id: "t4", name: "Review Request", category: "review", subject: "A quick favor — share your experience", preview: "Dear {{firstName}}, now that your case is resolved, would you be willing to share your experience working with us?...", uses: 12, openRate: 42, clickRate: 28, starred: false },
  ],
  coaching_education: [
    { id: "t1", name: "Discovery Call Confirmation", category: "reminder", subject: "Your discovery call is booked!", preview: "Hi {{firstName}}! Your discovery call is confirmed for {{date}} at {{time}}. Here's how to prepare...", uses: 56, openRate: 82, clickRate: 22, starred: true },
    { id: "t2", name: "Session Reminder", category: "reminder", subject: "Coaching session tomorrow — agenda inside", preview: "Hi {{firstName}}, your coaching session is tomorrow at {{time}}. Here's what we'll cover and your pre-work...", uses: 89, openRate: 78, clickRate: 15, starred: false },
    { id: "t3", name: "Stuck Intervention", category: "nurture", subject: "Checking in — how are you progressing?", preview: "Hi {{firstName}}, I noticed you haven't submitted your assignments recently. I want you to know it's totally normal to hit a wall...", uses: 18, openRate: 55, clickRate: 32, starred: true },
    { id: "t4", name: "Program Completion", category: "follow_up", subject: "Congratulations on completing {{programName}}! 🎓", preview: "Hi {{firstName}}, WOW. You did it! You've completed {{programName}} and I couldn't be prouder of your growth...", uses: 12, openRate: 92, clickRate: 48, starred: true },
  ],
  restaurant_food: [
    { id: "t1", name: "Reservation Confirmation", category: "reminder", subject: "Your reservation at {{restaurantName}} is confirmed", preview: "Hi {{firstName}}, your table for {{partySize}} is confirmed for {{date}} at {{time}}. We look forward to welcoming you!", uses: 234, openRate: 78, clickRate: 5, starred: true },
    { id: "t2", name: "Post-Dining Feedback", category: "review", subject: "How was your experience at {{restaurantName}}?", preview: "Hi {{firstName}}, thank you for dining with us! We'd love to hear about your experience...", uses: 89, openRate: 42, clickRate: 22, starred: false },
    { id: "t3", name: "Catering Proposal", category: "follow_up", subject: "Your custom catering menu for {{eventDate}}", preview: "Hi {{firstName}}, attached is your custom catering menu for {{partySize}} guests on {{eventDate}}...", uses: 18, openRate: 72, clickRate: 45, starred: true },
  ],
  automotive: [
    { id: "t1", name: "Service Appointment Confirmation", category: "reminder", subject: "Your service appointment is confirmed", preview: "Hi {{firstName}}, your appointment for {{service}} on your {{vehicle}} is confirmed for {{date}} at {{time}}...", uses: 156, openRate: 75, clickRate: 8, starred: true },
    { id: "t2", name: "Vehicle Ready for Pickup", category: "follow_up", subject: "Your {{vehicle}} is ready!", preview: "Hi {{firstName}}, great news! Your {{vehicle}} is ready for pickup. Here's a summary of the work completed...", uses: 134, openRate: 82, clickRate: 12, starred: true },
    { id: "t3", name: "Maintenance Due Reminder", category: "reminder", subject: "Your {{vehicle}} is due for {{service}}", preview: "Hi {{firstName}}, based on your mileage, your {{vehicle}} is due for {{service}}. Schedule now to avoid issues...", uses: 89, openRate: 48, clickRate: 28, starred: false },
    { id: "t4", name: "Declined Service Follow-Up", category: "win_back", subject: "About the {{service}} we discussed", preview: "Hi {{firstName}}, during your last visit we recommended {{service}} for your {{vehicle}}. Here's a 10% discount...", uses: 28, openRate: 35, clickRate: 22, starred: false },
  ],
  nonprofit: [
    { id: "t1", name: "Donation Thank You + Receipt", category: "follow_up", subject: "Thank you for your generous donation!", preview: "Dear {{firstName}}, thank you so much for your {{amount}} donation to {{orgName}}. Your contribution helps us...", uses: 234, openRate: 72, clickRate: 15, starred: true },
    { id: "t2", name: "Monthly Donor Welcome", category: "welcome", subject: "Welcome to the {{orgName}} family!", preview: "Dear {{firstName}}, thank you for becoming a monthly donor! Your recurring gift of {{amount}} makes a huge impact...", uses: 34, openRate: 85, clickRate: 28, starred: true },
    { id: "t3", name: "Event Invitation", category: "reminder", subject: "You're invited: {{eventName}} on {{date}}", preview: "Dear {{firstName}}, we'd love for you to join us at {{eventName}} on {{date}}. It's going to be a wonderful evening...", uses: 112, openRate: 55, clickRate: 38, starred: false },
    { id: "t4", name: "Lapsed Donor Re-engagement", category: "win_back", subject: "We miss your support, {{firstName}}", preview: "Dear {{firstName}}, it's been a while since your last contribution and we wanted to share what we've accomplished recently...", uses: 45, openRate: 32, clickRate: 12, starred: false },
  ],
};

const DEFAULT_TEMPLATES: Template[] = [
  { id: "t1", name: "Welcome Email", category: "welcome", subject: "Welcome to {{companyName}}", preview: "Hi {{firstName}}, welcome! We're excited to have you...", uses: 24, openRate: 65, clickRate: 20, starred: true },
  { id: "t2", name: "Follow-Up", category: "follow_up", subject: "Following up on our conversation", preview: "Hi {{firstName}}, I wanted to follow up on our recent conversation...", uses: 18, openRate: 52, clickRate: 15, starred: false },
  { id: "t3", name: "Meeting Reminder", category: "reminder", subject: "Reminder: Meeting tomorrow", preview: "Hi {{firstName}}, this is a reminder about your meeting...", uses: 45, openRate: 78, clickRate: 8, starred: false },
];

export default function EmailTemplatesPage() {
  const ic = useIndustry();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState<Template | null>(null);

  useEffect(() => {
    const di = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = di || "ecommerce";
    setTemplates(INDUSTRY_TEMPLATES[key] || DEFAULT_TEMPLATES);
  }, []);

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const filtered = templates.filter(t => {
    if (search) { const q = search.toLowerCase(); if (!t.name.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q)) return false; }
    if (filter !== "all" && t.category !== filter) return false;
    return true;
  });

  return (
    <>
      <Header title="Email Templates" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-400">Templates</span></div>
            <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Send className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-400">Total Sends</span></div>
            <p className="text-2xl font-bold text-gray-900">{templates.reduce((s, t) => s + t.uses, 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Eye className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-400">Avg Open Rate</span></div>
            <p className="text-2xl font-bold text-emerald-600">{(templates.reduce((s, t) => s + t.openRate, 0) / templates.length).toFixed(0)}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-400">Avg Click Rate</span></div>
            <p className="text-2xl font-bold text-amber-600">{(templates.reduce((s, t) => s + t.clickRate, 0) / templates.length).toFixed(0)}%</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setFilter("all")} className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition ${filter === "all" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>All</button>
              {categories.map(c => {
                const cfg = categoryConfig[c];
                return cfg ? (
                  <button key={c} onClick={() => setFilter(c)} className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition ${filter === c ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>{cfg.label}</button>
                ) : null;
              })}
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
            <Plus className="w-4 h-4" /> New Template
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => {
            const cfg = categoryConfig[t.category] || categoryConfig.nurture;
            return (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition group cursor-pointer"
                onClick={() => setPreview(t)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {t.starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h3>
                    </div>
                    <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Subject: {t.subject.slice(0, 50)}...</p>
                <p className="text-[11px] text-gray-400 line-clamp-2 mb-3">{t.preview}</p>
                <div className="flex items-center gap-4 text-[10px] text-gray-400 pt-3 border-t border-gray-50">
                  <span>{t.uses} sends</span>
                  <span className="text-emerald-500 font-medium">{t.openRate}% open</span>
                  <span className="text-indigo-500 font-medium">{t.clickRate}% click</span>
                </div>
                <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"><Send className="w-3 h-3" /> Use</button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"><Copy className="w-3 h-3" /> Duplicate</button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"><Edit3 className="w-3 h-3" /> Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{preview.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Subject: {preview.subject}</p>
              </div>
              <button onClick={() => setPreview(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">✕</button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {preview.preview}
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-400 flex-1">
                  <span>{preview.uses} sends</span>
                  <span className="text-emerald-500 font-medium">{preview.openRate}% open rate</span>
                  <span className="text-indigo-500 font-medium">{preview.clickRate}% click rate</span>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"><Send className="w-4 h-4" /> Use Template</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
