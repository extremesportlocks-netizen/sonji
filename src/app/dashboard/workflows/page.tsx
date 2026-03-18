"use client";

import { getDemoIndustry, getActiveIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  Workflow, Plus, Zap, Clock, Mail, MessageSquare, UserPlus, AlertTriangle,
  CheckCircle, Play, Pause, MoreHorizontal, ChevronRight, Star, TrendingDown,
  Calendar, DollarSign, Bell, Shield, Target, ArrowRight, Power,
  ToggleLeft, ToggleRight, Filter, Search, X,
} from "lucide-react";

// ─── TYPES ───

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerIcon: React.ElementType;
  actions: string[];
  status: "active" | "paused" | "draft";
  runsLast30: number;
  lastRun: string;
  category: string;
}

// ─── INDUSTRY AUTOMATIONS ───

const INDUSTRY_AUTOMATIONS: Record<string, Automation[]> = {
  agency_consulting: [
    { id: "a1", name: "New Lead Auto-Response", description: "Send welcome email within 60 seconds of form submission", trigger: "Form submitted", triggerIcon: UserPlus, actions: ["Send welcome email", "Create task for account manager", "Add tag: New Lead"], status: "active", runsLast30: 47, lastRun: "2 hours ago", category: "Lead Capture" },
    { id: "a2", name: "Proposal Follow-Up Sequence", description: "3-email drip after proposal is sent — Day 2, Day 5, Day 10", trigger: "Deal moves to 'Proposal Sent'", triggerIcon: Mail, actions: ["Wait 2 days → Send check-in email", "Wait 3 days → Send case study email", "Wait 5 days → Send 'decision time' email"], status: "active", runsLast30: 12, lastRun: "1 day ago", category: "Sales" },
    { id: "a3", name: "Client Onboarding Kickoff", description: "Auto-create project, assign tasks, send welcome packet when deal is won", trigger: "Deal moves to 'Contract Signed'", triggerIcon: CheckCircle, actions: ["Create project from template", "Assign onboarding tasks to team", "Send client welcome email", "Create Slack notification"], status: "active", runsLast30: 4, lastRun: "3 days ago", category: "Onboarding" },
    { id: "a4", name: "Renewal Alert (28 Days)", description: "Notify account manager when retainer is 28 days from renewal", trigger: "28 days before contract end", triggerIcon: AlertTriangle, actions: ["Create task: Schedule renewal call", "Send internal Slack alert", "Send client check-in email"], status: "active", runsLast30: 6, lastRun: "5 days ago", category: "Retention" },
    { id: "a5", name: "Client Going Cold", description: "Alert when client email frequency drops by 50% over 2 weeks", trigger: "Communication velocity drops", triggerIcon: TrendingDown, actions: ["Add tag: Cooling", "Create urgent task for AM", "Send 'checking in' email"], status: "active", runsLast30: 3, lastRun: "1 week ago", category: "Retention" },
    { id: "a6", name: "Monthly Report Delivery", description: "Auto-send performance report to all active retainer clients on the 1st", trigger: "1st of every month", triggerIcon: Calendar, actions: ["Generate analytics report", "Send report email to client", "Create task: Review report in meeting"], status: "active", runsLast30: 15, lastRun: "Mar 1", category: "Reporting" },
    { id: "a7", name: "Scope Creep Detector", description: "Alert when revision count exceeds deliverable limit", trigger: "Revision count > max revisions", triggerIcon: Shield, actions: ["Flag project as over-scope", "Notify project manager", "Draft upsell email for extended support"], status: "draft", runsLast30: 0, lastRun: "Never", category: "Operations" },
    { id: "a8", name: "NPS Survey After 90 Days", description: "Send satisfaction survey 90 days into retainer", trigger: "90 days after deal closed", triggerIcon: Star, actions: ["Send NPS survey email", "If score < 7 → create urgent task", "If score 9-10 → request testimonial"], status: "paused", runsLast30: 0, lastRun: "2 weeks ago", category: "Feedback" },
  ],
  health_wellness: [
    { id: "a1", name: "Treatment Approved Notification", description: "Email patient when provider approves their treatment plan", trigger: "MDI case approved", triggerIcon: UserPlus, actions: ["Send email: 'Your treatment has been approved!'", "Update contact tag: Approved", "Sync status to CRM"], status: "active", runsLast30: 28, lastRun: "2 hours ago", category: "Treatment" },
    { id: "a2", name: "Prescription Sent to Pharmacy", description: "Notify patient when prescription is submitted to pharmacy", trigger: "MDI offering submitted", triggerIcon: Zap, actions: ["Send email: 'Your prescription is being prepared'", "Update contact tag: Prescribed", "Create task: Verify pharmacy processing"], status: "active", runsLast30: 24, lastRun: "3 hours ago", category: "Treatment" },
    { id: "a3", name: "Medication Shipped + Tracking", description: "Send tracking email when pharmacy ships medication", trigger: "Tracking number received", triggerIcon: MessageSquare, actions: ["Send email with tracking link", "Update contact tag: Shipped", "Schedule delivery follow-up in 5 days"], status: "active", runsLast30: 18, lastRun: "Yesterday", category: "Fulfillment" },
    { id: "a4", name: "Dosing Check-In (Week 4)", description: "Follow up with patient 4 weeks after starting treatment", trigger: "28 days after treatment start", triggerIcon: Calendar, actions: ["Send email: 'How are you feeling?'", "Create task: Review patient response", "If side effects reported → alert provider"], status: "active", runsLast30: 12, lastRun: "2 days ago", category: "Follow-up" },
    { id: "a5", name: "Refill Reminder (7 Days Before)", description: "Remind patient to request refill before medication runs out", trigger: "7 days before supply ends", triggerIcon: Clock, actions: ["Send email: 'Time to refill your prescription'", "Include portal link for refill request", "Wait 3 days → Send follow-up if no action"], status: "active", runsLast30: 22, lastRun: "1 day ago", category: "Retention" },
    { id: "a6", name: "Abandoned Checkout Recovery", description: "Re-engage patients who started checkout but didn't complete", trigger: "Checkout expired (30 min)", triggerIcon: AlertTriangle, actions: ["Send recovery email with CTA", "Update contact tag: Abandoned", "Wait 24hr → Send follow-up email", "Create task: Manual outreach if high intent"], status: "active", runsLast30: 8, lastRun: "4 hours ago", category: "Recovery" },
    { id: "a7", name: "Provider Message Alert", description: "Email patient when their provider sends a message through MDI", trigger: "MDI message created", triggerIcon: MessageSquare, actions: ["Send email: 'Your provider sent you a message'", "Include portal link to view message"], status: "active", runsLast30: 6, lastRun: "Yesterday", category: "Communication" },
    { id: "a8", name: "Subscription Renewal Notice", description: "Notify patient 3 days before monthly subscription renews", trigger: "3 days before billing date", triggerIcon: Clock, actions: ["Send email with plan details + amount", "Include link to manage subscription", "If payment fails → trigger failed payment sequence"], status: "active", runsLast30: 15, lastRun: "3 days ago", category: "Billing" },
  ],
  home_services: [
    { id: "a1", name: "Estimate Request Auto-Reply", description: "Instant acknowledgment + next steps when estimate form submitted", trigger: "Form submitted", triggerIcon: UserPlus, actions: ["Send confirmation email", "Create task: Schedule site visit", "SMS: 'Got your request! We'll call within 1 hour'"], status: "active", runsLast30: 28, lastRun: "3 hours ago", category: "Lead Capture" },
    { id: "a2", name: "Estimate Follow-Up (48hr)", description: "Follow up if estimate hasn't been accepted in 48 hours", trigger: "48 hours after estimate sent", triggerIcon: Clock, actions: ["Send 'Any questions?' email", "Wait 3 days → Call task for sales", "Wait 7 days → Final follow-up with urgency"], status: "active", runsLast30: 15, lastRun: "Yesterday", category: "Sales" },
    { id: "a3", name: "Job Completion + Review", description: "Send invoice and review request when job marked complete", trigger: "Job status → Completed", triggerIcon: CheckCircle, actions: ["Send digital invoice", "Wait 24hr → Send review request with Google link", "Add tag: Completed"], status: "active", runsLast30: 12, lastRun: "2 days ago", category: "Follow-up" },
    { id: "a4", name: "Storm Alert Outreach", description: "Mass-text past customers when severe weather hits their area", trigger: "Weather alert (manual trigger)", triggerIcon: AlertTriangle, actions: ["SMS to past roofing customers in ZIP", "'Checking in after the storm — priority scheduling available'"], status: "draft", runsLast30: 0, lastRun: "Never", category: "Proactive" },
    { id: "a5", name: "Seasonal HVAC Reminder", description: "Pre-summer AC check campaign to past HVAC customers", trigger: "April 1st annually", triggerIcon: Calendar, actions: ["Filter: past HVAC customers", "Send 'Beat the heat' email with booking link", "SMS follow-up 3 days later"], status: "active", runsLast30: 0, lastRun: "Last April", category: "Seasonal" },
    { id: "a6", name: "Maintenance Plan Anniversary", description: "Remind customers to renew annual maintenance plan", trigger: "30 days before plan expires", triggerIcon: Bell, actions: ["Send renewal reminder email", "Wait 7 days → Phone call task", "If renewed → Send thank you"], status: "active", runsLast30: 4, lastRun: "1 week ago", category: "Retention" },
  ],
  ecommerce: [
    { id: "a1", name: "Welcome + First Purchase Offer", description: "New subscriber gets welcome email with 10% off first purchase", trigger: "Contact created (subscriber)", triggerIcon: UserPlus, actions: ["Send welcome email with discount code", "Wait 3 days → 'Did you see our picks?'", "Wait 7 days → 'Last chance for 10% off'"], status: "active", runsLast30: 23, lastRun: "4 hours ago", category: "Onboarding" },
    { id: "a2", name: "Win-Back (60 Days Inactive)", description: "Re-engage customers who haven't purchased in 60+ days", trigger: "60 days since last purchase", triggerIcon: TrendingDown, actions: ["Send 'We miss you' email", "Wait 5 days → SMS with special offer", "Add tag: Win-Back"], status: "active", runsLast30: 47, lastRun: "1 day ago", category: "Retention" },
    { id: "a3", name: "VIP Milestone (4th Purchase)", description: "Celebrate and reward on 4th purchase with surprise gift", trigger: "Purchase count = 4", triggerIcon: Star, actions: ["Add tag: VIP", "Send congratulations email", "Create task: Ship surprise gift", "Upgrade tier in CRM"], status: "active", runsLast30: 6, lastRun: "3 days ago", category: "Loyalty" },
    { id: "a4", name: "Subscription Renewal Reminder", description: "Heads-up 7 days before subscription auto-renews", trigger: "7 days before renewal", triggerIcon: Clock, actions: ["Send renewal reminder email", "Include current plan details + upgrade option"], status: "active", runsLast30: 18, lastRun: "Yesterday", category: "Billing" },
    { id: "a5", name: "Cancellation Save Attempt", description: "Trigger win-back sequence when subscription is canceled", trigger: "Subscription canceled", triggerIcon: AlertTriangle, actions: ["Send 'Sorry to see you go' email", "Wait 1 day → Send survey", "Wait 7 days → Send special comeback offer", "Create task: Personal outreach for VIPs"], status: "active", runsLast30: 9, lastRun: "2 days ago", category: "Recovery" },
  ],
  fitness_gym: [
    { id: "a1", name: "Trial Member Welcome", description: "Send welcome email + class schedule when trial member signs up", trigger: "Contact created (trial)", triggerIcon: UserPlus, actions: ["Send welcome email with class schedule", "Create task: Personal intro call", "Schedule Day 3 check-in"], status: "active", runsLast30: 18, lastRun: "3 hours ago", category: "Onboarding" },
    { id: "a2", name: "Trial Expiring (2 Days)", description: "Convert trial members before their trial expires", trigger: "2 days before trial ends", triggerIcon: Clock, actions: ["Send email: 'Your trial ends soon!'", "SMS with membership offer", "Create task: Follow-up call"], status: "active", runsLast30: 8, lastRun: "Yesterday", category: "Conversion" },
    { id: "a3", name: "At-Risk Member Alert", description: "Flag members who haven't checked in for 14+ days", trigger: "No check-in for 14 days", triggerIcon: TrendingDown, actions: ["Add tag: At Risk", "Send 'We miss you!' text", "Create task for trainer outreach", "Wait 7 days → Send re-engagement email"], status: "active", runsLast30: 12, lastRun: "2 days ago", category: "Retention" },
    { id: "a4", name: "Class No-Show Follow-Up", description: "Auto-text members who missed a booked class", trigger: "Class marked no-show", triggerIcon: AlertTriangle, actions: ["Send SMS: 'Missed you today! Rebook?'", "Add tag: No-Show"], status: "active", runsLast30: 22, lastRun: "Today", category: "Engagement" },
    { id: "a5", name: "Birthday Celebration", description: "Send birthday discount on member's birthday", trigger: "Contact birthday", triggerIcon: Star, actions: ["Send birthday email with gift card", "SMS: 'Happy Birthday! Free smoothie on us'"], status: "active", runsLast30: 4, lastRun: "4 days ago", category: "Loyalty" },
  ],
  beauty_salon: [
    { id: "a1", name: "Appointment Confirmation", description: "Confirm appointment 48 hours before with prep instructions", trigger: "48 hours before appointment", triggerIcon: Calendar, actions: ["Send confirmation email with prep tips", "SMS reminder with salon address"], status: "active", runsLast30: 56, lastRun: "1 hour ago", category: "Appointments" },
    { id: "a2", name: "Post-Visit Thank You", description: "Send thank you + aftercare tips based on service", trigger: "Appointment completed", triggerIcon: CheckCircle, actions: ["Send thank you email", "Include aftercare instructions", "Wait 48hr → Send review request"], status: "active", runsLast30: 42, lastRun: "4 hours ago", category: "Follow-up" },
    { id: "a3", name: "Rebooking Reminder (6 Weeks)", description: "Remind regular clients to rebook their usual service", trigger: "6 weeks since last visit", triggerIcon: Clock, actions: ["Send 'Time for your next visit!' email", "Include online booking link", "Wait 5 days → SMS follow-up"], status: "active", runsLast30: 28, lastRun: "Yesterday", category: "Rebooking" },
    { id: "a4", name: "New Client Welcome Series", description: "3-email series for first-time clients over 2 weeks", trigger: "First appointment completed", triggerIcon: UserPlus, actions: ["Send welcome + loyalty program info", "Day 5 → Send product recommendations", "Day 14 → Send referral offer"], status: "active", runsLast30: 15, lastRun: "3 days ago", category: "Onboarding" },
    { id: "a5", name: "Lapsed Client Win-Back", description: "Re-engage clients who haven't visited in 3+ months", trigger: "90 days since last visit", triggerIcon: TrendingDown, actions: ["Send 'We miss you!' email with offer", "Wait 5 days → SMS with booking link"], status: "active", runsLast30: 8, lastRun: "1 week ago", category: "Retention" },
  ],
  real_estate: [
    { id: "a1", name: "New Lead Auto-Response", description: "Instant text + email when new lead comes in from any source", trigger: "Contact created", triggerIcon: UserPlus, actions: ["Send property details email", "SMS: 'Hi! I saw you're interested in...'", "Create task: Call within 5 min"], status: "active", runsLast30: 34, lastRun: "2 hours ago", category: "Lead Capture" },
    { id: "a2", name: "Open House Follow-Up", description: "Auto-email attendees the day after an open house", trigger: "Tag added: Open House Attendee", triggerIcon: Mail, actions: ["Send follow-up email with property details", "Include mortgage calculator link", "Create task: Personal call within 48hr"], status: "active", runsLast30: 12, lastRun: "3 days ago", category: "Follow-up" },
    { id: "a3", name: "Contract Anniversary", description: "Send yearly check-in on home purchase anniversary", trigger: "1 year after close date", triggerIcon: Calendar, actions: ["Send home anniversary email", "Include market value update", "Ask for referrals"], status: "active", runsLast30: 3, lastRun: "2 weeks ago", category: "Retention" },
    { id: "a4", name: "Price Drop Alert", description: "Notify leads when a property they viewed drops in price", trigger: "Listing price reduced", triggerIcon: DollarSign, actions: ["Send email: 'Price just dropped!'", "Include new price + savings", "SMS notification"], status: "draft", runsLast30: 0, lastRun: "Never", category: "Engagement" },
  ],
  legal: [
    { id: "a1", name: "Consultation Follow-Up", description: "Send summary and next steps after initial consultation", trigger: "Consultation completed", triggerIcon: CheckCircle, actions: ["Send consultation summary email", "Include engagement agreement link", "Create task: Follow up in 48hr"], status: "active", runsLast30: 8, lastRun: "2 days ago", category: "Sales" },
    { id: "a2", name: "Document Request Reminder", description: "Remind client to submit outstanding documents", trigger: "7 days after document request", triggerIcon: Clock, actions: ["Send reminder email with document list", "Wait 3 days → SMS reminder", "Wait 7 days → Attorney alert"], status: "active", runsLast30: 14, lastRun: "Yesterday", category: "Operations" },
    { id: "a3", name: "Case Milestone Update", description: "Auto-notify client when case hits key milestones", trigger: "Case status changed", triggerIcon: Target, actions: ["Send status update email", "Include next expected milestone", "Log activity in case file"], status: "active", runsLast30: 6, lastRun: "3 days ago", category: "Communication" },
    { id: "a4", name: "Review Request (Case Closed)", description: "Request Google review 30 days after successful case resolution", trigger: "30 days after case closed (won)", triggerIcon: Star, actions: ["Send email: 'How was your experience?'", "Include Google review link", "If positive → Request referrals"], status: "active", runsLast30: 2, lastRun: "2 weeks ago", category: "Reviews" },
  ],
  coaching_education: [
    { id: "a1", name: "Application Received", description: "Confirm application and send what to expect email", trigger: "Application form submitted", triggerIcon: UserPlus, actions: ["Send confirmation email", "Include program details + FAQ", "Create task: Review application"], status: "active", runsLast30: 12, lastRun: "1 day ago", category: "Onboarding" },
    { id: "a2", name: "Session Reminder (24hr)", description: "Remind student of upcoming coaching session", trigger: "24 hours before session", triggerIcon: Calendar, actions: ["Send reminder email with Zoom link", "SMS: 'Session tomorrow at {time}'"], status: "active", runsLast30: 28, lastRun: "3 hours ago", category: "Engagement" },
    { id: "a3", name: "Stuck Intervention (14 Days)", description: "Re-engage students who haven't checked in for 2 weeks", trigger: "No activity for 14 days", triggerIcon: TrendingDown, actions: ["Send 'How are you doing?' email", "Create task: Coach outreach", "Wait 3 days → SMS check-in"], status: "active", runsLast30: 5, lastRun: "5 days ago", category: "Retention" },
    { id: "a4", name: "Program Completion Celebration", description: "Celebrate and upsell when student completes their program", trigger: "Program marked complete", triggerIcon: Star, actions: ["Send congratulations email", "Include alumni community invite", "Wait 7 days → Send advanced program offer"], status: "active", runsLast30: 3, lastRun: "1 week ago", category: "Graduation" },
  ],
  restaurant_food: [
    { id: "a1", name: "Reservation Confirmation", description: "Confirm reservation with menu and parking info", trigger: "Reservation created", triggerIcon: Calendar, actions: ["Send confirmation email", "SMS: 'Confirmed! See you {date} at {time}'", "Include menu and directions"], status: "active", runsLast30: 45, lastRun: "30 min ago", category: "Reservations" },
    { id: "a2", name: "Post-Dining Feedback", description: "Send feedback request after dining experience", trigger: "24 hours after reservation date", triggerIcon: Star, actions: ["Send feedback email", "Include Google review link", "If negative → Alert manager"], status: "active", runsLast30: 38, lastRun: "2 hours ago", category: "Reviews" },
    { id: "a3", name: "Catering Inquiry Follow-Up", description: "Auto-respond to catering inquiries with menu options", trigger: "Catering form submitted", triggerIcon: Mail, actions: ["Send catering menu PDF", "Create task: Call within 4 hours", "Wait 2 days → Follow-up email"], status: "active", runsLast30: 6, lastRun: "4 days ago", category: "Catering" },
    { id: "a4", name: "Regular Customer Reward", description: "Send reward after 10th visit", trigger: "Visit count = 10", triggerIcon: Star, actions: ["Send email: 'Free dessert on us!'", "Add tag: Regular", "Upgrade to VIP tier"], status: "active", runsLast30: 4, lastRun: "1 week ago", category: "Loyalty" },
  ],
  automotive: [
    { id: "a1", name: "Service Appointment Reminder", description: "Send reminder 24 hours before scheduled service", trigger: "24 hours before appointment", triggerIcon: Calendar, actions: ["Send email with appointment details", "SMS: 'Reminder: Service tomorrow at {time}'", "Include shuttle/loaner info"], status: "active", runsLast30: 32, lastRun: "2 hours ago", category: "Appointments" },
    { id: "a2", name: "Service Complete Notification", description: "Text customer when their vehicle is ready for pickup", trigger: "Job status → Completed", triggerIcon: CheckCircle, actions: ["SMS: 'Your vehicle is ready!'", "Send invoice email", "Include payment link"], status: "active", runsLast30: 28, lastRun: "4 hours ago", category: "Operations" },
    { id: "a3", name: "Maintenance Due Reminder", description: "Alert when vehicle hits maintenance interval", trigger: "Maintenance interval reached", triggerIcon: Clock, actions: ["Send maintenance due email", "Include recommended services", "SMS with booking link"], status: "active", runsLast30: 15, lastRun: "Yesterday", category: "Retention" },
    { id: "a4", name: "Declined Service Follow-Up", description: "Follow up 30 days after customer declined a recommended service", trigger: "30 days after declined service", triggerIcon: TrendingDown, actions: ["Send email: 'Don't forget about...'", "Include 10% discount offer", "Create task: Phone follow-up"], status: "active", runsLast30: 8, lastRun: "3 days ago", category: "Recovery" },
  ],
  nonprofit: [
    { id: "a1", name: "Donation Thank You", description: "Instant thank you email with tax receipt after donation", trigger: "Donation received", triggerIcon: CheckCircle, actions: ["Send thank you email", "Include tax-deductible receipt", "Add to donor newsletter list"], status: "active", runsLast30: 52, lastRun: "1 hour ago", category: "Stewardship" },
    { id: "a2", name: "Monthly Donor Welcome", description: "Welcome sequence for new recurring donors", trigger: "Recurring donation started", triggerIcon: UserPlus, actions: ["Send welcome + impact report", "Day 7 → Send volunteer opportunities", "Day 30 → Send quarterly impact update"], status: "active", runsLast30: 8, lastRun: "4 days ago", category: "Onboarding" },
    { id: "a3", name: "Lapsed Donor Re-engagement", description: "Re-engage donors who haven't given in 12+ months", trigger: "12 months since last donation", triggerIcon: TrendingDown, actions: ["Send 'We miss your support' email", "Include recent impact stories", "Wait 7 days → Personal letter from ED"], status: "active", runsLast30: 11, lastRun: "1 week ago", category: "Retention" },
    { id: "a4", name: "Event Reminder + Follow-Up", description: "Pre-event reminder and post-event thank you", trigger: "3 days before event", triggerIcon: Calendar, actions: ["Send event reminder with details", "Day of → SMS with parking info", "Day after → Send thank you + photos"], status: "active", runsLast30: 15, lastRun: "2 days ago", category: "Events" },
  ],
};

const DEFAULT_AUTOMATIONS: Automation[] = [
  { id: "a1", name: "New Contact Welcome", description: "Send welcome email when contact is created", trigger: "Contact created", triggerIcon: UserPlus, actions: ["Send welcome email", "Create follow-up task"], status: "active", runsLast30: 15, lastRun: "2 hours ago", category: "Onboarding" },
  { id: "a2", name: "Follow-Up Reminder (72hr)", description: "Auto-create task if no activity in 72 hours", trigger: "No activity for 72 hours", triggerIcon: Clock, actions: ["Create follow-up task", "Send internal notification"], status: "active", runsLast30: 8, lastRun: "Yesterday", category: "Follow-up" },
  { id: "a3", name: "Deal Won → Thank You", description: "Send thank you email when deal is marked won", trigger: "Deal stage → Won", triggerIcon: CheckCircle, actions: ["Send thank you email", "Create onboarding task", "Notify team via Slack"], status: "active", runsLast30: 3, lastRun: "3 days ago", category: "Sales" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  paused: { label: "Paused", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  draft: { label: "Draft", color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
};

// ─── MAIN COMPONENT ───

export default function WorkflowsPage() {
  const ic = useIndustry();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const demoIndustry = getActiveIndustry();
    if (demoIndustry && INDUSTRY_AUTOMATIONS[demoIndustry]) {
      setAutomations(INDUSTRY_AUTOMATIONS[demoIndustry]);
      return;
    }
    // Try real API first
    fetch("/api/automations").then(r => r.json()).then(data => {
      if (data?.data?.length) {
        setAutomations(data.data.map((a: any) => ({
          id: a.id, name: a.name, description: (a.trigger as any)?.type || "",
          trigger: (a.trigger as any)?.type || "manual",
          actions: ((a.actions as any[]) || []).map((act: any) => act.type).join(", "),
          status: a.status, category: "custom", lastRun: a.lastRun || "Never", runsTotal: 0,
        })));
      } else {
        setAutomations([]);
      }
    }).catch(() => {});
  }, []);

  const toggleStatus = (id: string) => {
    setAutomations(prev => prev.map(a => {
      if (a.id !== id) return a;
      const newStatus = a.status === "active" ? "paused" : "active";
      // Persist to API (fire and forget)
      fetch(`/api/automations?id=${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});
      return { ...a, status: newStatus };
    }));
  };

  const filtered = automations.filter(a => {
    if (search) { const q = search.toLowerCase(); if (!a.name.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false; }
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    return true;
  });

  const categories = Array.from(new Set(automations.map(a => a.category)));
  const activeCount = automations.filter(a => a.status === "active").length;
  const totalRuns = automations.reduce((s, a) => s + a.runsLast30, 0);

  return (
    <>
      <Header title="Automations" />
      <div className="p-6 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-gray-400 font-medium">Active Automations</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Play className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-gray-400 font-medium">Runs (Last 30 Days)</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalRuns}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Workflow className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-gray-400 font-medium">Total Workflows</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{automations.length}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              {[{ key: "all", label: "All" }, { key: "active", label: "Active" }, { key: "paused", label: "Paused" }, { key: "draft", label: "Draft" }].map(f => (
                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${statusFilter === f.key ? "bg-indigo-50 text-indigo-600 border border-indigo-200" : "text-gray-500 hover:bg-gray-50"}`}>
                  {f.label}
                </button>
              ))}
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search automations..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Plus className="w-4 h-4" /> New Automation
              </button>
            </div>
          </div>
        </div>

        {/* Automation Cards */}
        <div className="space-y-3">
          {filtered.map(a => {
            const sc = statusConfig[a.status];
            const TriggerIcon = a.triggerIcon;
            return (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition">
                <div className="flex items-center gap-4 p-5">
                  {/* Toggle */}
                  <button onClick={() => toggleStatus(a.id)} className="flex-shrink-0">
                    {a.status === "active" ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-300" />
                    )}
                  </button>

                  {/* Trigger Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.status === "active" ? "bg-indigo-50" : "bg-gray-50"}`}>
                    <TriggerIcon className={`w-5 h-5 ${a.status === "active" ? "text-indigo-600" : "text-gray-400"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900">{a.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{a.category}</span>
                    </div>
                    <p className="text-xs text-gray-500">{a.description}</p>

                    {/* Trigger + Actions Flow */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">⚡ {a.trigger}</span>
                      {a.actions.slice(0, 2).map((act, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] text-gray-400">
                          <ArrowRight className="w-2.5 h-2.5" />
                          <span className="bg-gray-50 px-2 py-0.5 rounded text-gray-600">{act.length > 40 ? act.slice(0, 40) + "..." : act}</span>
                        </span>
                      ))}
                      {a.actions.length > 2 && <span className="text-[10px] text-gray-400">+{a.actions.length - 2} more</span>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{a.runsLast30}</p>
                      <p className="text-[10px] text-gray-400">runs / 30d</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{a.lastRun}</p>
                      <p className="text-[10px] text-gray-400">last run</p>
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Workflow className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No automations match your filters</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
