"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useCRM } from "@/lib/crm-store";
import { useModal } from "@/components/modals/modal-provider";
import { getIndustryConfig } from "@/lib/industry-config";
import {
  Search,
  SlidersHorizontal,
  Download,
  Upload,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  List,
  Columns3,
  GripVertical,
  Building2,
  User,
  Calendar,
  DollarSign,
  X,
  ChevronDown,
  Trash2,
  FolderKanban,
  Rocket,
} from "lucide-react";

// ────────────────────────────────────
// PIPELINE STAGES
// ────────────────────────────────────

interface Stage {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const defaultStages: Stage[] = [
  { id: "Lead", name: "Lead", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
  { id: "Sales Qualified", name: "Sales Qualified", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
  { id: "Meeting Booked", name: "Meeting Booked", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
  { id: "Proposal Sent", name: "Proposal Sent", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
  { id: "Negotiation", name: "Negotiation", color: "text-orange-700", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
  { id: "Closed Won", name: "Closed Won", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
  { id: "Closed Lost", name: "Closed Lost", color: "text-red-600", borderColor: "border-red-400", bgColor: "bg-red-50" },
];

const INDUSTRY_STAGES: Record<string, Stage[]> = {
  health_wellness: [
    { id: "Intake", name: "Intake", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Payment Collected", name: "Payment", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Under Review", name: "Under Review", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Approved", name: "Approved", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Prescribed", name: "Prescribed", color: "text-cyan-700", borderColor: "border-cyan-400", bgColor: "bg-cyan-50" },
    { id: "Shipped", name: "Shipped", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
    { id: "Delivered", name: "Delivered", color: "text-teal-700", borderColor: "border-teal-400", bgColor: "bg-teal-50" },
    { id: "Active", name: "Active", color: "text-green-700", borderColor: "border-green-400", bgColor: "bg-green-50" },
  ],
  agency_consulting: [
    { id: "Discovery", name: "Discovery", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Proposal Sent", name: "Proposal Sent", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Negotiation", name: "Negotiation", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Contract Signed", name: "Signed", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Onboarding", name: "Onboarding", color: "text-cyan-700", borderColor: "border-cyan-400", bgColor: "bg-cyan-50" },
    { id: "Active Client", name: "Active", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
    { id: "Renewal", name: "Renewal", color: "text-orange-700", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
  ],
  real_estate: [
    { id: "Lead", name: "Lead", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Contacted", name: "Contacted", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Showing", name: "Showing", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Offer", name: "Offer", color: "text-orange-700", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
    { id: "Under Contract", name: "Under Contract", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Closed", name: "Closed", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
  ],
  ecommerce: [
    { id: "Subscriber", name: "Subscriber", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "First Purchase", name: "1st Purchase", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Repeat", name: "Repeat", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "VIP", name: "VIP", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
    { id: "Win-Back", name: "Win-Back", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Churned", name: "Churned", color: "text-red-600", borderColor: "border-red-400", bgColor: "bg-red-50" },
  ],
  fitness_gym: [
    { id: "Lead", name: "Lead", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Trial Booked", name: "Trial Booked", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Trial Completed", name: "Trial Done", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Membership Offered", name: "Offered", color: "text-orange-700", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
    { id: "Active Member", name: "Active", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "At Risk", name: "At Risk", color: "text-red-600", borderColor: "border-red-400", bgColor: "bg-red-50" },
  ],
  beauty_salon: [
    { id: "New Client", name: "New Client", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Booked", name: "Booked", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Served", name: "Served", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Rebooking", name: "Rebooking", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Loyal", name: "Loyal", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
    { id: "Lapsed", name: "Lapsed", color: "text-red-600", borderColor: "border-red-400", bgColor: "bg-red-50" },
  ],
  home_services: [
    { id: "Estimate Requested", name: "Requested", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Site Visit", name: "Site Visit", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Estimate Sent", name: "Estimate Sent", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Follow-up", name: "Follow-up", color: "text-orange-700", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
    { id: "Job Booked", name: "Booked", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Completed", name: "Completed", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
  ],
  legal: [
    { id: "Inquiry", name: "Inquiry", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Consultation", name: "Consultation", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Evaluation", name: "Evaluation", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Engagement Sent", name: "Engagement", color: "text-orange-700", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
    { id: "Retained", name: "Retained", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Case Closed", name: "Closed", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
  ],
  coaching_education: [
    { id: "Lead", name: "Lead", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Application", name: "Applied", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Discovery Call", name: "Discovery", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Call Completed", name: "Call Done", color: "text-orange-700", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
    { id: "Enrolled", name: "Enrolled", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Alumni", name: "Alumni", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
  ],
  restaurant_food: [
    { id: "New Customer", name: "New", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Return Visitor", name: "Returned", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Regular", name: "Regular", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Catering Lead", name: "Catering", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Catering Booked", name: "Booked", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
    { id: "Lapsed", name: "Lapsed", color: "text-red-600", borderColor: "border-red-400", bgColor: "bg-red-50" },
  ],
  automotive: [
    { id: "Lead", name: "Lead", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Estimate Given", name: "Estimated", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "Scheduled", name: "Scheduled", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "In Service", name: "In Shop", color: "text-orange-700", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
    { id: "Completed", name: "Done", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Maintenance Due", name: "Maint. Due", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
  ],
  nonprofit: [
    { id: "Prospect", name: "Prospect", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
    { id: "Contacted", name: "Contacted", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
    { id: "First Gift", name: "First Gift", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
    { id: "Repeat Donor", name: "Repeat", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
    { id: "Major Donor", name: "Major", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
    { id: "Lapsed", name: "Lapsed", color: "text-red-600", borderColor: "border-red-400", bgColor: "bg-red-50" },
  ],
};

type DemoDeal = { id: string; title: string; value: number; stage: string; pipeline: string; contactName: string; assignedTo: string; closeDate: string; notes: string };

const INDUSTRY_DEALS: Record<string, DemoDeal[]> = {
  health_wellness: [
    { id: "d1", title: "Tirzepatide Monthly", contactName: "Sarah Mitchell", value: 320, stage: "Intake", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Mar 20", notes: "" },
    { id: "d2", title: "Semaglutide 3-Month", contactName: "James Rodriguez", value: 537, stage: "Payment Collected", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Mar 18", notes: "" },
    { id: "d3", title: "Tirzepatide 6-Month", contactName: "Emily Chen", value: 1350, stage: "Under Review", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Mar 19", notes: "" },
    { id: "d4", title: "Semaglutide Monthly", contactName: "Michael Torres", value: 225, stage: "Under Review", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Mar 19", notes: "" },
    { id: "d5", title: "Tirzepatide Monthly", contactName: "Jessica Brown", value: 320, stage: "Approved", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Mar 17", notes: "" },
    { id: "d6", title: "Tirzepatide 3-Month", contactName: "David Park", value: 777, stage: "Prescribed", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Mar 16", notes: "" },
    { id: "d7", title: "Semaglutide Monthly", contactName: "Amanda Williams", value: 225, stage: "Shipped", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Mar 14", notes: "" },
    { id: "d8", title: "Tirzepatide Monthly", contactName: "Robert Garcia", value: 320, stage: "Delivered", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Mar 12", notes: "" },
    { id: "d9", title: "Semaglutide 6-Month", contactName: "Jennifer Adams", value: 894, stage: "Active", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Feb 28", notes: "Refill #2" },
    { id: "d10", title: "Tirzepatide Monthly", contactName: "Carlos Rivera", value: 320, stage: "Active", pipeline: "Patient Pipeline", assignedTo: "Provider", closeDate: "Mar 1", notes: "Refill #3" },
  ],
  agency_consulting: [
    { id: "d1", title: "SEO + PPC Retainer", contactName: "Brightview Hotels", value: 8500, stage: "Discovery", pipeline: "New Business", assignedTo: "Power", closeDate: "Mar 25", notes: "" },
    { id: "d2", title: "Social Media Mgmt", contactName: "Apex Construction", value: 3000, stage: "Discovery", pipeline: "New Business", assignedTo: "Power", closeDate: "Mar 28", notes: "" },
    { id: "d3", title: "Web Redesign", contactName: "Meridian Law Group", value: 15000, stage: "Proposal Sent", pipeline: "Projects", assignedTo: "Power", closeDate: "Apr 1", notes: "" },
    { id: "d4", title: "Content Strategy", contactName: "Harbor Dental", value: 5000, stage: "Proposal Sent", pipeline: "New Business", assignedTo: "Power", closeDate: "Mar 30", notes: "" },
    { id: "d5", title: "Brand Refresh", contactName: "Summit Athletics", value: 12000, stage: "Negotiation", pipeline: "Projects", assignedTo: "Power", closeDate: "Apr 5", notes: "" },
    { id: "d6", title: "Growth Retainer", contactName: "Nova Fitness", value: 5000, stage: "Contract Signed", pipeline: "Retainers", assignedTo: "Power", closeDate: "Mar 15", notes: "" },
    { id: "d7", title: "Onboarding Package", contactName: "Cedar Creek Realty", value: 4000, stage: "Onboarding", pipeline: "Retainers", assignedTo: "Power", closeDate: "Mar 20", notes: "" },
    { id: "d8", title: "Full Stack Marketing", contactName: "Sterling Partners", value: 10000, stage: "Active Client", pipeline: "Retainers", assignedTo: "Power", closeDate: "Ongoing", notes: "" },
    { id: "d9", title: "PPC Management", contactName: "Coastal Real Estate", value: 6000, stage: "Active Client", pipeline: "Retainers", assignedTo: "Power", closeDate: "Ongoing", notes: "" },
    { id: "d10", title: "SEO Retainer", contactName: "Pinnacle Fitness", value: 3500, stage: "Renewal", pipeline: "Retainers", assignedTo: "Power", closeDate: "Apr 15", notes: "" },
    { id: "d11", title: "Website Maintenance", contactName: "Atlas Legal", value: 2000, stage: "Active Client", pipeline: "Retainers", assignedTo: "Power", closeDate: "Ongoing", notes: "" },
  ],
  ecommerce: [
    { id: "d1", title: "VIP Yearly Upgrade", contactName: "Chris Persaud", value: 999, stage: "Repeat", pipeline: "Upgrades", assignedTo: "Orlando", closeDate: "Mar 20", notes: "" },
    { id: "d2", title: "Monthly → 3-Month", contactName: "Tyler McLaughlin", value: 399, stage: "Repeat", pipeline: "Upgrades", assignedTo: "Orlando", closeDate: "Mar 22", notes: "" },
    { id: "d3", title: "Win-Back Campaign", contactName: "Andrew Krieman", value: 999, stage: "Win-Back", pipeline: "Recovery", assignedTo: "Orlando", closeDate: "Mar 25", notes: "" },
    { id: "d4", title: "Reactivation", contactName: "Ramon Garcia", value: 165, stage: "Win-Back", pipeline: "Recovery", assignedTo: "Orlando", closeDate: "Mar 18", notes: "" },
    { id: "d5", title: "New VIP Annual", contactName: "Bruce Grimsley", value: 999, stage: "First Purchase", pipeline: "Sales", assignedTo: "Orlando", closeDate: "Mar 16", notes: "" },
    { id: "d6", title: "Monthly Sub", contactName: "Iyad Al Zein", value: 165, stage: "First Purchase", pipeline: "Sales", assignedTo: "Orlando", closeDate: "Mar 17", notes: "" },
  ],
  fitness_gym: [
    { id: "d1", title: "Free Trial - CrossFit", contactName: "Marcus Rivera", value: 0, stage: "Lead", pipeline: "Memberships", assignedTo: "Coach Jake", closeDate: "Mar 18", notes: "" },
    { id: "d2", title: "Guest Pass Redemption", contactName: "Ashley Torres", value: 0, stage: "Trial Booked", pipeline: "Memberships", assignedTo: "Front Desk", closeDate: "Mar 17", notes: "" },
    { id: "d3", title: "Annual Membership", contactName: "Brandon Lewis", value: 720, stage: "Trial Completed", pipeline: "Memberships", assignedTo: "Coach Jake", closeDate: "Mar 20", notes: "" },
    { id: "d4", title: "PT Sessions (12-pack)", contactName: "Stephanie Clark", value: 960, stage: "Membership Offered", pipeline: "Personal Training", assignedTo: "Coach Sarah", closeDate: "Mar 22", notes: "" },
    { id: "d5", title: "Monthly Unlimited", contactName: "Kevin Young", value: 79, stage: "Active Member", pipeline: "Memberships", assignedTo: "", closeDate: "Ongoing", notes: "" },
    { id: "d6", title: "Family Plan", contactName: "Nicole Allen", value: 149, stage: "Active Member", pipeline: "Memberships", assignedTo: "", closeDate: "Ongoing", notes: "" },
    { id: "d7", title: "Yoga Class Pack", contactName: "Jessica Martinez", value: 150, stage: "Active Member", pipeline: "Class Packs", assignedTo: "Coach Sarah", closeDate: "Ongoing", notes: "" },
    { id: "d8", title: "At-Risk Save", contactName: "Daniel Wright", value: 79, stage: "At Risk", pipeline: "Retention", assignedTo: "Coach Jake", closeDate: "Mar 19", notes: "" },
  ],
  beauty_salon: [
    { id: "d1", title: "Balayage Color", contactName: "Sophia Martinez", value: 280, stage: "New Client", pipeline: "Salon", assignedTo: "Stylist Emma", closeDate: "Mar 18", notes: "" },
    { id: "d2", title: "Lash Extensions Full", contactName: "Olivia Brown", value: 175, stage: "Booked", pipeline: "Lashes", assignedTo: "Tech Lisa", closeDate: "Mar 17", notes: "" },
    { id: "d3", title: "Bridal Package", contactName: "Charlotte Davis", value: 1200, stage: "Booked", pipeline: "Events", assignedTo: "Stylist Emma", closeDate: "Apr 12", notes: "" },
    { id: "d4", title: "Cut & Color", contactName: "Mia Johnson", value: 145, stage: "Served", pipeline: "Salon", assignedTo: "Stylist Alex", closeDate: "Mar 14", notes: "" },
    { id: "d5", title: "Keratin Treatment", contactName: "Amelia Wilson", value: 350, stage: "Served", pipeline: "Salon", assignedTo: "Stylist Emma", closeDate: "Mar 13", notes: "" },
    { id: "d6", title: "Lash Refill", contactName: "Isabella Lee", value: 85, stage: "Rebooking", pipeline: "Lashes", assignedTo: "Tech Lisa", closeDate: "Mar 25", notes: "" },
    { id: "d7", title: "Monthly Blowout Member", contactName: "Harper Garcia", value: 120, stage: "Loyal", pipeline: "Memberships", assignedTo: "Stylist Alex", closeDate: "Ongoing", notes: "" },
    { id: "d8", title: "Re-engagement", contactName: "Evelyn Thomas", value: 95, stage: "Lapsed", pipeline: "Retention", assignedTo: "Stylist Emma", closeDate: "Mar 28", notes: "" },
  ],
  real_estate: [
    { id: "d1", title: "3BR Lakewood Ranch", contactName: "Michael Torres", value: 485000, stage: "Lead", pipeline: "Buyers", assignedTo: "Agent Sarah", closeDate: "Apr 15", notes: "" },
    { id: "d2", title: "Condo Downtown", contactName: "Emily Scott", value: 320000, stage: "Lead", pipeline: "Buyers", assignedTo: "Agent Mike", closeDate: "Apr 20", notes: "" },
    { id: "d3", title: "Investment Duplex", contactName: "David Nguyen", value: 550000, stage: "Contacted", pipeline: "Investors", assignedTo: "Agent Sarah", closeDate: "May 1", notes: "" },
    { id: "d4", title: "4BR Colonial Listing", contactName: "Jennifer Adams", value: 725000, stage: "Showing", pipeline: "Sellers", assignedTo: "Agent Mike", closeDate: "Apr 5", notes: "" },
    { id: "d5", title: "Waterfront Home", contactName: "Robert Chen", value: 1200000, stage: "Offer", pipeline: "Luxury", assignedTo: "Agent Sarah", closeDate: "Mar 28", notes: "" },
    { id: "d6", title: "First-Time Buyer", contactName: "Amanda Hill", value: 275000, stage: "Under Contract", pipeline: "Buyers", assignedTo: "Agent Mike", closeDate: "Apr 10", notes: "" },
    { id: "d7", title: "Estate Sale", contactName: "Patricia Williams", value: 890000, stage: "Under Contract", pipeline: "Luxury", assignedTo: "Agent Sarah", closeDate: "Apr 3", notes: "" },
    { id: "d8", title: "Commercial Lease", contactName: "Atlas Properties LLC", value: 42000, stage: "Closed", pipeline: "Commercial", assignedTo: "Agent Mike", closeDate: "Mar 10", notes: "" },
  ],
  home_services: [
    { id: "d1", title: "Roof Inspection", contactName: "James Peterson", value: 250, stage: "Estimate Requested", pipeline: "Roofing", assignedTo: "Mike", closeDate: "Mar 18", notes: "" },
    { id: "d2", title: "Full Roof Replace", contactName: "Linda Garcia", value: 18500, stage: "Site Visit", pipeline: "Roofing", assignedTo: "Mike", closeDate: "Mar 22", notes: "" },
    { id: "d3", title: "HVAC Install", contactName: "Thomas Brown", value: 8200, stage: "Estimate Sent", pipeline: "HVAC", assignedTo: "Steve", closeDate: "Mar 25", notes: "" },
    { id: "d4", title: "AC Repair", contactName: "Nancy Davis", value: 1200, stage: "Estimate Sent", pipeline: "HVAC", assignedTo: "Steve", closeDate: "Mar 20", notes: "" },
    { id: "d5", title: "Leak Repair", contactName: "Richard Wilson", value: 3500, stage: "Follow-up", pipeline: "Roofing", assignedTo: "Mike", closeDate: "Mar 19", notes: "" },
    { id: "d6", title: "Gutter Replacement", contactName: "Barbara Martinez", value: 4200, stage: "Job Booked", pipeline: "Roofing", assignedTo: "Mike", closeDate: "Mar 28", notes: "" },
    { id: "d7", title: "Annual Tune-Up", contactName: "Charles Anderson", value: 189, stage: "Completed", pipeline: "HVAC", assignedTo: "Steve", closeDate: "Mar 14", notes: "" },
    { id: "d8", title: "Emergency Repair", contactName: "Susan Taylor", value: 2800, stage: "Completed", pipeline: "Emergency", assignedTo: "Mike", closeDate: "Mar 12", notes: "" },
  ],
  legal: [
    { id: "d1", title: "Personal Injury Case", contactName: "Marcus Johnson", value: 45000, stage: "Inquiry", pipeline: "PI", assignedTo: "Atty. Sterling", closeDate: "Apr 1", notes: "" },
    { id: "d2", title: "Divorce Filing", contactName: "Sarah Mitchell", value: 5000, stage: "Consultation", pipeline: "Family", assignedTo: "Atty. Hayes", closeDate: "Mar 22", notes: "" },
    { id: "d3", title: "Business Formation", contactName: "Apex Ventures LLC", value: 3500, stage: "Consultation", pipeline: "Business", assignedTo: "Atty. Sterling", closeDate: "Mar 20", notes: "" },
    { id: "d4", title: "Estate Planning", contactName: "Patricia Williams", value: 4500, stage: "Evaluation", pipeline: "Estate", assignedTo: "Atty. Hayes", closeDate: "Mar 25", notes: "" },
    { id: "d5", title: "Contract Dispute", contactName: "Harbor Construction", value: 15000, stage: "Engagement Sent", pipeline: "Business", assignedTo: "Atty. Sterling", closeDate: "Apr 5", notes: "" },
    { id: "d6", title: "Criminal Defense", contactName: "David Thompson", value: 10000, stage: "Retained", pipeline: "Criminal", assignedTo: "Atty. Sterling", closeDate: "Ongoing", notes: "" },
    { id: "d7", title: "Custody Modification", contactName: "Jennifer Adams", value: 3500, stage: "Retained", pipeline: "Family", assignedTo: "Atty. Hayes", closeDate: "Ongoing", notes: "" },
    { id: "d8", title: "Real Estate Closing", contactName: "Summit Realty", value: 2500, stage: "Case Closed", pipeline: "Real Estate", assignedTo: "Atty. Hayes", closeDate: "Mar 10", notes: "" },
  ],
  coaching_education: [
    { id: "d1", title: "Lead Magnet Download", contactName: "Rachel Green", value: 0, stage: "Lead", pipeline: "Funnel", assignedTo: "Coach", closeDate: "Mar 18", notes: "" },
    { id: "d2", title: "Webinar Attendee", contactName: "Monica Taylor", value: 0, stage: "Lead", pipeline: "Funnel", assignedTo: "Coach", closeDate: "Mar 17", notes: "" },
    { id: "d3", title: "1:1 Coaching App", contactName: "Jason Wright", value: 5000, stage: "Application", pipeline: "1:1", assignedTo: "Coach", closeDate: "Mar 22", notes: "" },
    { id: "d4", title: "Group Program App", contactName: "Amanda King", value: 2500, stage: "Application", pipeline: "Group", assignedTo: "Coach", closeDate: "Mar 20", notes: "" },
    { id: "d5", title: "VIP Day Booking", contactName: "Nathan Harris", value: 3000, stage: "Discovery Call", pipeline: "VIP", assignedTo: "Coach", closeDate: "Mar 25", notes: "" },
    { id: "d6", title: "Mastermind Enrollment", contactName: "Brittany Lopez", value: 8000, stage: "Call Completed", pipeline: "Mastermind", assignedTo: "Coach", closeDate: "Mar 28", notes: "" },
    { id: "d7", title: "Course + Coaching", contactName: "Kevin Martinez", value: 2000, stage: "Enrolled", pipeline: "Course", assignedTo: "Coach", closeDate: "Ongoing", notes: "" },
    { id: "d8", title: "Alumni Upsell", contactName: "Laura Davis", value: 5000, stage: "Alumni", pipeline: "Upsell", assignedTo: "Coach", closeDate: "Apr 1", notes: "" },
  ],
  restaurant_food: [
    { id: "d1", title: "Birthday Party (20 ppl)", contactName: "Sarah Johnson", value: 1800, stage: "Catering Lead", pipeline: "Catering", assignedTo: "Manager", closeDate: "Apr 5", notes: "" },
    { id: "d2", title: "Corporate Lunch (50 ppl)", contactName: "Apex Financial", value: 3500, stage: "Catering Lead", pipeline: "Catering", assignedTo: "Manager", closeDate: "Apr 12", notes: "" },
    { id: "d3", title: "Wedding Reception", contactName: "Emily & David", value: 8500, stage: "Catering Booked", pipeline: "Events", assignedTo: "Chef", closeDate: "May 20", notes: "" },
    { id: "d4", title: "Weekly Meal Prep", contactName: "Marcus Rivera", value: 120, stage: "Regular", pipeline: "Subscriptions", assignedTo: "", closeDate: "Ongoing", notes: "" },
    { id: "d5", title: "Loyalty Member", contactName: "Jessica Clark", value: 45, stage: "Return Visitor", pipeline: "Dine-In", assignedTo: "", closeDate: "Ongoing", notes: "" },
    { id: "d6", title: "First Timer", contactName: "Noah Anderson", value: 38, stage: "New Customer", pipeline: "Dine-In", assignedTo: "", closeDate: "Mar 15", notes: "" },
    { id: "d7", title: "Win-Back Offer", contactName: "Olivia Brown", value: 42, stage: "Lapsed", pipeline: "Retention", assignedTo: "Manager", closeDate: "Mar 20", notes: "" },
  ],
  automotive: [
    { id: "d1", title: "Full Brake Job", contactName: "James Peterson", value: 850, stage: "Lead", pipeline: "Repairs", assignedTo: "Mike", closeDate: "Mar 18", notes: "" },
    { id: "d2", title: "Transmission Service", contactName: "Linda Garcia", value: 2400, stage: "Estimate Given", pipeline: "Repairs", assignedTo: "Steve", closeDate: "Mar 22", notes: "" },
    { id: "d3", title: "AC Recharge + Diag", contactName: "Robert Chen", value: 350, stage: "Estimate Given", pipeline: "Seasonal", assignedTo: "Mike", closeDate: "Mar 20", notes: "" },
    { id: "d4", title: "Oil Change + Rotate", contactName: "Patricia Williams", value: 89, stage: "Scheduled", pipeline: "Maintenance", assignedTo: "Tech A", closeDate: "Mar 17", notes: "" },
    { id: "d5", title: "Timing Belt Replace", contactName: "Thomas Brown", value: 1200, stage: "In Service", pipeline: "Repairs", assignedTo: "Steve", closeDate: "Mar 16", notes: "" },
    { id: "d6", title: "30K Mile Service", contactName: "Nancy Davis", value: 450, stage: "Completed", pipeline: "Maintenance", assignedTo: "Tech A", closeDate: "Mar 14", notes: "" },
    { id: "d7", title: "Oil Change Due", contactName: "Richard Wilson", value: 65, stage: "Maintenance Due", pipeline: "Reminders", assignedTo: "", closeDate: "Apr 1", notes: "" },
    { id: "d8", title: "Tire Rotation Due", contactName: "Barbara Martinez", value: 45, stage: "Maintenance Due", pipeline: "Reminders", assignedTo: "", closeDate: "Apr 5", notes: "" },
  ],
  nonprofit: [
    { id: "d1", title: "Corporate Partnership", contactName: "Apex Financial Group", value: 25000, stage: "Prospect", pipeline: "Corporate", assignedTo: "Director", closeDate: "Apr 15", notes: "" },
    { id: "d2", title: "Grant Application", contactName: "Smith Foundation", value: 50000, stage: "Prospect", pipeline: "Grants", assignedTo: "Director", closeDate: "May 1", notes: "" },
    { id: "d3", title: "Annual Gala Sponsor", contactName: "Harbor Wealth Mgmt", value: 10000, stage: "Contacted", pipeline: "Events", assignedTo: "Events", closeDate: "Apr 20", notes: "" },
    { id: "d4", title: "Monthly Donor Upgrade", contactName: "Sarah Johnson", value: 600, stage: "First Gift", pipeline: "Individual", assignedTo: "Outreach", closeDate: "Mar 20", notes: "" },
    { id: "d5", title: "Matching Gift", contactName: "Microsoft (David Lee)", value: 5000, stage: "Repeat Donor", pipeline: "Corporate", assignedTo: "Director", closeDate: "Mar 25", notes: "" },
    { id: "d6", title: "Legacy Giving Inquiry", contactName: "Patricia Williams", value: 100000, stage: "Major Donor", pipeline: "Planned Giving", assignedTo: "Director", closeDate: "Ongoing", notes: "" },
    { id: "d7", title: "Lapsed Donor Recovery", contactName: "Marcus Rivera", value: 250, stage: "Lapsed", pipeline: "Re-engagement", assignedTo: "Outreach", closeDate: "Mar 28", notes: "" },
  ],
};

// ────────────────────────────────────
// HELPERS
// ────────────────────────────────────

const logoColors = [
  "bg-indigo-100 text-indigo-700", "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function getColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return logoColors[Math.abs(h) % logoColors.length];
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function getCompanyInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ────────────────────────────────────
// DEAL CARD
// ────────────────────────────────────

function DealCard({ deal, onDragStart, onDragEnd, onDelete, onUpdate }: {
  deal: { id: string; title: string; value: number; stage: string; pipeline: string; contactName: string; assignedTo: string; closeDate: string; notes: string };
  onDragStart: (e: React.DragEvent, dealId: string) => void;
  onDragEnd: () => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<typeof deal>) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(deal.title);
  const [editValue, setEditValue] = useState(deal.value.toString());
  const [editContact, setEditContact] = useState(deal.contactName);
  const [editClose, setEditClose] = useState(deal.closeDate);
  const [noteText, setNoteText] = useState(deal.notes || "");

  const handleSave = () => {
    onUpdate?.(deal.id, { title: editTitle, value: parseFloat(editValue) || 0, contactName: editContact, closeDate: editClose });
    setEditing(false);
  };

  const handleSaveNote = () => {
    onUpdate?.(deal.id, { notes: noteText });
    setAddingNote(false);
  };

  return (
    <div
      draggable={!editing && !addingNote}
      onDragStart={(e) => onDragStart(e, deal.id)}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-xl border p-4 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition group ${editing ? "border-indigo-300 shadow-md" : "border-gray-100"} ${!editing && !addingNote ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!editing && <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />}
          {editing ? (
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              className="text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          ) : (
            <h4 className="text-sm font-semibold text-gray-900 leading-snug truncate">{deal.title}</h4>
          )}
        </div>
        <div className="relative flex-shrink-0 ml-2">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <button onClick={() => { setEditing(true); setMenuOpen(false); }} className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">Edit</button>
                <button onClick={() => { setExpanded(!expanded); setMenuOpen(false); }} className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">{expanded ? "Collapse" : "View Details"}</button>
                <button onClick={() => { setAddingNote(true); setMenuOpen(false); }} className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">Add Note</button>
                {(deal.stage === "Closed Won" || deal.stage === "Contract Signed" || deal.stage === "Active Client") && (
                  <button onClick={() => { setMenuOpen(false); window.location.href = "/dashboard/projects"; }} className="w-full px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 text-left flex items-center gap-2"><FolderKanban className="w-3.5 h-3.5" /> Create Project</button>
                )}
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { onDelete(deal.id); setMenuOpen(false); }} className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="flex items-center gap-2 mb-2">
        <User className="w-3.5 h-3.5 text-gray-400" />
        {editing ? (
          <input type="text" value={editContact} onChange={(e) => setEditContact(e.target.value)}
            className="text-xs text-gray-600 border border-gray-200 rounded px-2 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500/20" />
        ) : (
          <span className="text-xs text-gray-600">{deal.contactName}</span>
        )}
      </div>

      {/* Pipeline */}
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500">{deal.pipeline}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
          {editing ? (
            <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
              className="text-sm font-bold text-gray-900 border border-gray-200 rounded px-2 py-0.5 w-24 focus:outline-none focus:ring-1 focus:ring-indigo-500/20" />
          ) : (
            <span className="text-sm font-bold text-gray-900">{formatCurrency(deal.value)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-gray-400" />
          {editing ? (
            <input type="text" value={editClose} onChange={(e) => setEditClose(e.target.value)}
              className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-indigo-500/20" />
          ) : (
            <span className="text-xs text-gray-400">{deal.closeDate}</span>
          )}
        </div>
      </div>

      {/* Edit Actions */}
      {editing && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button onClick={handleSave} className="flex-1 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Save</button>
          <button onClick={() => { setEditing(false); setEditTitle(deal.title); setEditValue(deal.value.toString()); setEditContact(deal.contactName); setEditClose(deal.closeDate); }}
            className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && !editing && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Assigned</span>
            <span className="text-xs text-gray-600">{deal.assignedTo || "Unassigned"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Pipeline</span>
            <span className="text-xs text-gray-600">{deal.pipeline}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Stage</span>
            <span className="text-xs text-gray-600">{deal.stage}</span>
          </div>
          {deal.notes && (
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Notes</span>
              <p className="text-xs text-gray-600 mt-0.5 bg-gray-50 rounded-lg p-2">{deal.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Convert to Project — shows on won deals */}
      {(deal.stage === "Closed Won" || deal.stage === "Contract Signed" || deal.stage === "Active Client") && !editing && !addingNote && (
        <button onClick={() => {
          sessionStorage.setItem("sonji-new-project", JSON.stringify({
            name: deal.title, client: deal.contactName, budget: deal.value, dealId: deal.id,
          }));
          window.location.href = "/dashboard/projects";
        }}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition">
          <Rocket className="w-3.5 h-3.5" /> Convert to Project
        </button>
      )}

      {/* Add Note */}
      {addingNote && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note about this deal..."
            rows={3} className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" />
          <div className="flex items-center gap-2 mt-2">
            <button onClick={handleSaveNote} className="flex-1 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Save Note</button>
            <button onClick={() => setAddingNote(false)} className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────

export default function DealsPage() {
  const { deals: crmDeals, moveDeal, deleteDeal, stats } = useCRM();
  const { openModal } = useModal();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "list" | "grid">("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [filterPipeline, setFilterPipeline] = useState("all");
  const [filterAmount, setFilterAmount] = useState("all");
  const [filterAssigned, setFilterAssigned] = useState("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [demoIndustry, setDemoIndustry] = useState<string | null>(null);
  const [demoDeals, setDemoDeals] = useState<DemoDeal[]>([]);
  const [tenantIndustry, setTenantIndustry] = useState<string | null>(null);

  useEffect(() => {
    const key = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    setDemoIndustry(key || null);
    if (key && INDUSTRY_DEALS[key]) setDemoDeals([...INDUSTRY_DEALS[key]]);

    // For real tenants, get industry from sessionStorage
    if (!key) {
      try {
        const tenant = JSON.parse(sessionStorage.getItem("sonji-tenant") || "{}");
        if (tenant.industry) setTenantIndustry(tenant.industry);
      } catch {}
    }
  }, []);

  // Use industry stages: demo key → demo stages, real tenant → tenant industry stages, fallback → default
  const activeIndustry = demoIndustry || tenantIndustry;
  const stages = activeIndustry && INDUSTRY_STAGES[activeIndustry] ? INDUSTRY_STAGES[activeIndustry] : defaultStages;
  const isDemo = demoIndustry && INDUSTRY_DEALS[demoIndustry];
  const ic = activeIndustry ? getIndustryConfig(activeIndustry) : null;
  const deals = isDemo ? demoDeals : crmDeals;

  const handleUpdateDeal = (id: string, updates: Partial<DemoDeal>) => {
    if (isDemo) {
      setDemoDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    }
  };

  const handleDeleteDeal = (id: string) => {
    if (isDemo) {
      setDemoDeals(prev => prev.filter(d => d.id !== id));
    } else {
      deleteDeal(id);
    }
  };

  const handleMoveDeal = (dealId: string, newStage: string) => {
    if (isDemo) {
      setDemoDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
    } else {
      moveDeal(dealId, newStage);
    }
  };

  const filtered = deals.filter((d) => {
    if (search) { const q = search.toLowerCase(); if (!d.title.toLowerCase().includes(q) && !d.contactName.toLowerCase().includes(q)) return false; }
    if (filterPipeline !== "all" && d.pipeline !== filterPipeline) return false;
    if (filterAmount === "under1k" && d.value >= 1000) return false;
    if (filterAmount === "1k-5k" && (d.value < 1000 || d.value >= 5000)) return false;
    if (filterAmount === "5k-25k" && (d.value < 5000 || d.value >= 25000)) return false;
    if (filterAmount === "25k+" && d.value < 25000) return false;
    if (filterAssigned !== "all" && d.assignedTo !== filterAssigned) return false;
    return true;
  });

  const uniquePipelines = Array.from(new Set(deals.map(d => d.pipeline).filter(Boolean)));
  const uniqueAssigned = Array.from(new Set(deals.map(d => d.assignedTo).filter(Boolean)));

  const dealsByStage = useMemo(() => {
    const grouped: Record<string, typeof filtered> = {};
    stages.forEach((s) => { grouped[s.id] = []; });
    filtered.forEach((d) => {
      if (grouped[d.stage]) grouped[d.stage].push(d);
      else {
        // If stage doesn't match exactly, try to find closest
        const match = stages.find(s => s.id.toLowerCase() === d.stage.toLowerCase());
        if (match) grouped[match.id].push(d);
        else if (grouped["Lead"]) grouped["Lead"].push(d);
      }
    });
    return grouped;
  }, [filtered]);

  const totalValue = filtered.reduce((s, d) => s + d.value, 0);

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggingId(dealId);
    e.dataTransfer.setData("text/plain", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => setDragOverStage(null);

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain");
    if (dealId) {
      handleMoveDeal(dealId, stageId);
    }
    setDragOverStage(null);
    setDraggingId(null);
  };

  return (
    <>
      <Header title={ic?.dealLabelPlural || "Deals"} />
      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{filtered.length} {ic?.dealLabelPlural || "Deals"}</h2>
                <p className="text-xs text-gray-400">{formatCurrency(totalValue)} total pipeline</p>
              </div>
              <div className="w-px h-8 bg-gray-200 mx-2" />
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition ${showFilters ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {(filterPipeline !== "all" || filterAmount !== "all" || filterAssigned !== "all") && (
                  <span className="w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {[filterPipeline !== "all", filterAmount !== "all", filterAssigned !== "all"].filter(Boolean).length}
                  </span>
                )}
              </button>
              <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                <button onClick={() => setView("kanban")} className={`p-2 transition ${view === "kanban" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`} title="Kanban">
                  <Columns3 className="w-4 h-4" />
                </button>
                <button onClick={() => setView("list")} className={`p-2 transition border-l border-gray-200 ${view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`} title="List">
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => setView("grid")} className={`p-2 transition border-l border-gray-200 ${view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`} title="Grid">
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
              <button onClick={() => {
                const csv = ["Title,Contact,Value,Stage,Pipeline,Close Date", ...filtered.map(d => `"${d.title}","${d.contactName}",${d.value},"${d.stage}","${d.pipeline}","${d.closeDate}"`)].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "deals-export.csv"; a.click(); URL.revokeObjectURL(url);
              }} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Download className="w-4 h-4" /><span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => openModal("deal")}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
              >
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Create {ic?.dealLabel || "Deal"}</span>
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Pipeline</label>
                  <select value={filterPipeline} onChange={(e) => setFilterPipeline(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="all">All Pipelines</option>
                    {uniquePipelines.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Deal Amount</label>
                  <select value={filterAmount} onChange={(e) => setFilterAmount(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="all">Any Amount</option>
                    <option value="under1k">Under $1,000</option>
                    <option value="1k-5k">$1,000 - $5,000</option>
                    <option value="5k-25k">$5,000 - $25,000</option>
                    <option value="25k+">$25,000+</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Close Date</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>Any Date</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Assigned To</label>
                  <select value={filterAssigned} onChange={(e) => setFilterAssigned(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="all">Anyone</option>
                    {uniqueAssigned.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = dealsByStage[stage.id] || [];
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);
            const isDragOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-[300px]"
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${stage.bgColor} ${stage.color} ${stage.borderColor}`}>
                      {stage.name}
                      <span className={`ml-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stage.bgColor} ${stage.color}`}>
                        {stageDeals.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openModal("deal")} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stage Total */}
                <div className="text-xs text-gray-400 mb-3 px-1">
                  {formatCurrency(stageTotal)} · {stageDeals.length} {(ic?.dealLabel || "deal").toLowerCase()}{stageDeals.length !== 1 ? "s" : ""}
                </div>

                {/* Cards */}
                <div
                  className={`space-y-3 min-h-[100px] rounded-xl p-2 transition ${
                    isDragOver ? "bg-indigo-50/50 border-2 border-dashed border-indigo-300" : "bg-gray-50/50"
                  }`}
                >
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onDragStart={handleDragStart} onDragEnd={() => { setDragOverStage(null); setDraggingId(null); }} onDelete={handleDeleteDeal} onUpdate={handleUpdateDeal} />
                  ))}

                  {stageDeals.length === 0 && !isDragOver && (
                    <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                      No {(ic?.dealLabelPlural || "deals").toLowerCase()} in this stage
                    </div>
                  )}

                  {isDragOver && stageDeals.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-indigo-500 font-medium">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Deal</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Stage</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Pipeline</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Value</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((d) => {
                  const stg = stages.find(s => s.id === d.stage);
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3"><span className="text-sm font-medium text-gray-900">{d.title}</span></td>
                      <td className="px-4 py-3"><span className="text-sm text-gray-600">{d.contactName}</span></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${stg?.bgColor || "bg-gray-100"} ${stg?.color || "text-gray-600"}`}>{d.stage}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs text-gray-400">{d.pipeline}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-sm font-bold text-gray-900">{formatCurrency(d.value)}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-xs text-gray-400">{d.closeDate}</span></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No {(ic?.dealLabelPlural || "deals").toLowerCase()} match your filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View */}
        {view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d) => {
              const stg = stages.find(s => s.id === d.stage);
              return (
                <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stg?.bgColor || "bg-gray-100"} ${stg?.color || "text-gray-600"}`}>{d.stage}</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(d.value)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{d.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{d.contactName} · {d.pipeline}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400">{d.assignedTo || "Unassigned"}</span>
                    <span className="text-xs text-gray-400">{d.closeDate}</span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-gray-400">No {(ic?.dealLabelPlural || "deals").toLowerCase()} match your filters</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
