"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/dashboard/header";
import Link from "next/link";
import { useModal } from "@/components/modals/modal-provider";
import { useIndustry } from "@/lib/use-industry";
import {
  Plus, MoreHorizontal, Search, X, Columns3, List, LayoutGrid,
  Clock, DollarSign, Users, Calendar, TrendingUp, AlertTriangle,
  CheckCircle, Pause, ChevronRight, ArrowUpRight, Briefcase,
  Timer, PieChart, Target, Rocket,
} from "lucide-react";

// ─── TYPES ───

interface Project {
  id: string;
  name: string;
  client: string;
  status: "planning" | "active" | "on_hold" | "completed" | "canceled";
  priority: "high" | "medium" | "low";
  budgetAmount: number;
  budgetType: "fixed" | "hourly" | "retainer";
  hourlyRate: number;
  retainerHours: number;
  hoursLogged: number;
  hoursEstimated: number;
  costIncurred: number;
  revenue: number;
  margin: number;
  startDate: string;
  dueDate: string;
  manager: string;
  teamSize: number;
  tasksTotal: number;
  tasksDone: number;
  tags: string[];
}

// ─── DEMO DATA ───

const DEMO_PROJECTS: Record<string, Project[]> = {
  agency_consulting: [
    { id: "p1", name: "Website Redesign", client: "Meridian Law Group", status: "active", priority: "high", budgetAmount: 15000, budgetType: "fixed", hourlyRate: 150, retainerHours: 0, hoursLogged: 62, hoursEstimated: 100, costIncurred: 4340, revenue: 15000, margin: 71.1, startDate: "2026-02-15", dueDate: "2026-04-01", manager: "Colton", teamSize: 3, tasksTotal: 24, tasksDone: 15, tags: ["Web Design", "Priority"] },
    { id: "p2", name: "SEO + PPC Management", client: "Brightview Hotels", status: "active", priority: "high", budgetAmount: 8500, budgetType: "retainer", hourlyRate: 125, retainerHours: 68, hoursLogged: 52, hoursEstimated: 68, costIncurred: 3640, revenue: 8500, margin: 57.2, startDate: "2026-01-01", dueDate: "2026-12-31", manager: "Rocco", teamSize: 2, tasksTotal: 18, tasksDone: 12, tags: ["SEO", "PPC", "Retainer"] },
    { id: "p3", name: "Brand Identity Refresh", client: "Summit Athletics", status: "active", priority: "medium", budgetAmount: 12000, budgetType: "fixed", hourlyRate: 140, retainerHours: 0, hoursLogged: 28, hoursEstimated: 80, costIncurred: 1960, revenue: 12000, margin: 83.7, startDate: "2026-03-01", dueDate: "2026-05-15", manager: "Colton", teamSize: 2, tasksTotal: 16, tasksDone: 5, tags: ["Branding", "Design"] },
    { id: "p4", name: "Social Media Management", client: "Apex Construction", status: "planning", priority: "medium", budgetAmount: 3000, budgetType: "retainer", hourlyRate: 100, retainerHours: 30, hoursLogged: 0, hoursEstimated: 30, costIncurred: 0, revenue: 3000, margin: 100, startDate: "2026-04-01", dueDate: "2026-06-30", manager: "Rocco", teamSize: 1, tasksTotal: 8, tasksDone: 0, tags: ["Social Media"] },
    { id: "p5", name: "Content Strategy", client: "Harbor Dental", status: "active", priority: "low", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 120, retainerHours: 0, hoursLogged: 18, hoursEstimated: 40, costIncurred: 1260, revenue: 5000, margin: 74.8, startDate: "2026-02-20", dueDate: "2026-04-15", manager: "Colton", teamSize: 2, tasksTotal: 12, tasksDone: 6, tags: ["Content", "Strategy"] },
    { id: "p6", name: "Full Stack Marketing", client: "Sterling Partners", status: "active", priority: "high", budgetAmount: 10000, budgetType: "retainer", hourlyRate: 150, retainerHours: 67, hoursLogged: 58, hoursEstimated: 67, costIncurred: 4060, revenue: 10000, margin: 59.4, startDate: "2026-01-15", dueDate: "2026-12-31", manager: "Rocco", teamSize: 3, tasksTotal: 22, tasksDone: 18, tags: ["Full Stack", "Priority", "Retainer"] },
    { id: "p7", name: "PPC Management", client: "Coastal Real Estate", status: "on_hold", priority: "medium", budgetAmount: 6000, budgetType: "retainer", hourlyRate: 110, retainerHours: 55, hoursLogged: 42, hoursEstimated: 55, costIncurred: 2940, revenue: 6000, margin: 51.0, startDate: "2026-01-01", dueDate: "2026-12-31", manager: "Rocco", teamSize: 1, tasksTotal: 14, tasksDone: 10, tags: ["PPC", "On Hold"] },
    { id: "p8", name: "Email Automation Setup", client: "Nova Fitness", status: "completed", priority: "medium", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 130, retainerHours: 0, hoursLogged: 35, hoursEstimated: 38, costIncurred: 2450, revenue: 5000, margin: 51.0, startDate: "2026-01-20", dueDate: "2026-03-01", manager: "Colton", teamSize: 2, tasksTotal: 10, tasksDone: 10, tags: ["Email", "Automation", "Completed"] },
  ],
  health_wellness: [
    { id: "p1", name: "Tirzepatide — 6 Month Program", client: "Jessica Brown", status: "active", priority: "high", budgetAmount: 1350, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 0, hoursEstimated: 1, costIncurred: 340, revenue: 1350, margin: 74.8, startDate: "2026-02-15", dueDate: "2026-08-15", manager: "Provider", teamSize: 1, tasksTotal: 6, tasksDone: 3, tags: ["Tirzepatide", "6-Month", "Active"] },
    { id: "p2", name: "Semaglutide Monthly — Ongoing", client: "Michael Torres", status: "active", priority: "medium", budgetAmount: 225, budgetType: "retainer", hourlyRate: 0, retainerHours: 0, hoursLogged: 0, hoursEstimated: 1, costIncurred: 65, revenue: 225, margin: 71.1, startDate: "2026-03-01", dueDate: "2026-12-31", manager: "Provider", teamSize: 1, tasksTotal: 12, tasksDone: 1, tags: ["Semaglutide", "Monthly", "Recurring"] },
    { id: "p3", name: "Tirzepatide — 3 Month Starter", client: "David Park", status: "active", priority: "high", budgetAmount: 777, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 0, hoursEstimated: 1, costIncurred: 195, revenue: 777, margin: 74.9, startDate: "2026-03-05", dueDate: "2026-06-05", manager: "Provider", teamSize: 1, tasksTotal: 3, tasksDone: 1, tags: ["Tirzepatide", "3-Month"] },
    { id: "p4", name: "Semaglutide 3-Month — Refill #2", client: "Jennifer Adams", status: "active", priority: "medium", budgetAmount: 537, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 0, hoursEstimated: 1, costIncurred: 135, revenue: 537, margin: 74.9, startDate: "2026-01-10", dueDate: "2026-04-10", manager: "Provider", teamSize: 1, tasksTotal: 3, tasksDone: 2, tags: ["Semaglutide", "Refill"] },
    { id: "p5", name: "Tirzepatide Monthly — New Patient", client: "Sarah Mitchell", status: "planning", priority: "high", budgetAmount: 320, budgetType: "retainer", hourlyRate: 0, retainerHours: 0, hoursLogged: 0, hoursEstimated: 1, costIncurred: 0, revenue: 320, margin: 100, startDate: "2026-03-18", dueDate: "2026-12-31", manager: "Provider", teamSize: 1, tasksTotal: 1, tasksDone: 0, tags: ["Tirzepatide", "New Patient"] },
  ],
  home_services: [
    { id: "p1", name: "Full Roof Replacement", client: "Linda Garcia", status: "active", priority: "high", budgetAmount: 18500, budgetType: "fixed", hourlyRate: 85, retainerHours: 0, hoursLogged: 48, hoursEstimated: 120, costIncurred: 6200, revenue: 18500, margin: 66.5, startDate: "2026-03-05", dueDate: "2026-03-25", manager: "Mike", teamSize: 4, tasksTotal: 8, tasksDone: 3, tags: ["Roofing", "Priority"] },
    { id: "p2", name: "HVAC System Install", client: "Thomas Brown", status: "active", priority: "high", budgetAmount: 8200, budgetType: "fixed", hourlyRate: 75, retainerHours: 0, hoursLogged: 16, hoursEstimated: 40, costIncurred: 2800, revenue: 8200, margin: 65.9, startDate: "2026-03-10", dueDate: "2026-03-30", manager: "Steve", teamSize: 2, tasksTotal: 6, tasksDone: 2, tags: ["HVAC", "Install"] },
    { id: "p3", name: "Gutter Replacement", client: "Barbara Martinez", status: "planning", priority: "medium", budgetAmount: 4200, budgetType: "fixed", hourlyRate: 70, retainerHours: 0, hoursLogged: 0, hoursEstimated: 24, costIncurred: 0, revenue: 4200, margin: 100, startDate: "2026-03-28", dueDate: "2026-04-05", manager: "Mike", teamSize: 2, tasksTotal: 5, tasksDone: 0, tags: ["Gutters"] },
    { id: "p4", name: "Emergency Leak Repair", client: "Susan Taylor", status: "completed", priority: "high", budgetAmount: 2800, budgetType: "fixed", hourlyRate: 95, retainerHours: 0, hoursLogged: 8, hoursEstimated: 8, costIncurred: 1200, revenue: 2800, margin: 57.1, startDate: "2026-03-10", dueDate: "2026-03-12", manager: "Mike", teamSize: 2, tasksTotal: 4, tasksDone: 4, tags: ["Emergency", "Completed"] },
  ],
  legal: [
    { id: "p1", name: "Personal Injury — Johnson", client: "Marcus Johnson", status: "active", priority: "high", budgetAmount: 45000, budgetType: "hourly", hourlyRate: 350, retainerHours: 0, hoursLogged: 24, hoursEstimated: 80, costIncurred: 4800, revenue: 8400, margin: 42.9, startDate: "2026-02-15", dueDate: "2026-08-01", manager: "Atty. Sterling", teamSize: 2, tasksTotal: 16, tasksDone: 5, tags: ["PI", "Active"] },
    { id: "p2", name: "Divorce — Mitchell", client: "Sarah Mitchell", status: "active", priority: "medium", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 300, retainerHours: 0, hoursLogged: 8, hoursEstimated: 20, costIncurred: 1600, revenue: 5000, margin: 68.0, startDate: "2026-03-01", dueDate: "2026-05-15", manager: "Atty. Hayes", teamSize: 1, tasksTotal: 10, tasksDone: 3, tags: ["Family", "Active"] },
    { id: "p3", name: "Contract Dispute — Harbor", client: "Harbor Construction", status: "active", priority: "high", budgetAmount: 15000, budgetType: "hourly", hourlyRate: 375, retainerHours: 0, hoursLogged: 12, hoursEstimated: 40, costIncurred: 2400, revenue: 4500, margin: 46.7, startDate: "2026-03-05", dueDate: "2026-06-01", manager: "Atty. Sterling", teamSize: 2, tasksTotal: 12, tasksDone: 3, tags: ["Business", "Litigation"] },
    { id: "p4", name: "Estate Planning — Williams", client: "Patricia Williams", status: "planning", priority: "medium", budgetAmount: 4500, budgetType: "fixed", hourlyRate: 300, retainerHours: 0, hoursLogged: 2, hoursEstimated: 15, costIncurred: 400, revenue: 4500, margin: 91.1, startDate: "2026-03-20", dueDate: "2026-04-30", manager: "Atty. Hayes", teamSize: 1, tasksTotal: 8, tasksDone: 0, tags: ["Estate", "Planning"] },
  ],
  automotive: [
    { id: "p1", name: "Timing Belt Replacement", client: "Thomas Brown", status: "active", priority: "high", budgetAmount: 1200, budgetType: "fixed", hourlyRate: 95, retainerHours: 0, hoursLogged: 3, hoursEstimated: 5, costIncurred: 550, revenue: 1200, margin: 54.2, startDate: "2026-03-15", dueDate: "2026-03-16", manager: "Steve", teamSize: 1, tasksTotal: 4, tasksDone: 2, tags: ["Repair", "Active"] },
    { id: "p2", name: "Full Brake Job", client: "James Peterson", status: "active", priority: "medium", budgetAmount: 850, budgetType: "fixed", hourlyRate: 85, retainerHours: 0, hoursLogged: 2, hoursEstimated: 3, costIncurred: 380, revenue: 850, margin: 55.3, startDate: "2026-03-16", dueDate: "2026-03-17", manager: "Mike", teamSize: 1, tasksTotal: 3, tasksDone: 1, tags: ["Brakes"] },
    { id: "p3", name: "30K Mile Service", client: "Nancy Davis", status: "completed", priority: "low", budgetAmount: 450, budgetType: "fixed", hourlyRate: 75, retainerHours: 0, hoursLogged: 2, hoursEstimated: 2, costIncurred: 180, revenue: 450, margin: 60.0, startDate: "2026-03-13", dueDate: "2026-03-14", manager: "Tech A", teamSize: 1, tasksTotal: 5, tasksDone: 5, tags: ["Maintenance", "Completed"] },
  ],
  fitness_gym: [
    { id: "p1", name: "New Member Onboarding", client: "Brandon Lewis", status: "active", priority: "high", budgetAmount: 720, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 2, hoursEstimated: 4, costIncurred: 100, revenue: 720, margin: 86.1, startDate: "2026-03-15", dueDate: "2026-03-22", manager: "Coach Jake", teamSize: 1, tasksTotal: 6, tasksDone: 2, tags: ["Onboarding"] },
    { id: "p2", name: "PT Sessions (12-Pack)", client: "Stephanie Clark", status: "active", priority: "medium", budgetAmount: 960, budgetType: "fixed", hourlyRate: 80, retainerHours: 0, hoursLogged: 4, hoursEstimated: 12, costIncurred: 240, revenue: 960, margin: 75.0, startDate: "2026-03-01", dueDate: "2026-05-01", manager: "Coach Sarah", teamSize: 1, tasksTotal: 12, tasksDone: 4, tags: ["Personal Training"] },
    { id: "p3", name: "At-Risk Member Save", client: "Daniel Wright", status: "active", priority: "high", budgetAmount: 79, budgetType: "retainer", hourlyRate: 0, retainerHours: 0, hoursLogged: 1, hoursEstimated: 2, costIncurred: 30, revenue: 79, margin: 62.0, startDate: "2026-03-10", dueDate: "2026-03-20", manager: "Coach Jake", teamSize: 1, tasksTotal: 3, tasksDone: 1, tags: ["Retention", "At Risk"] },
  ],
  beauty_salon: [
    { id: "p1", name: "Bridal Package — Charlotte Davis", client: "Charlotte Davis", status: "active", priority: "high", budgetAmount: 1200, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 3, hoursEstimated: 8, costIncurred: 280, revenue: 1200, margin: 76.7, startDate: "2026-03-01", dueDate: "2026-04-12", manager: "Stylist Emma", teamSize: 2, tasksTotal: 6, tasksDone: 2, tags: ["Bridal", "Event"] },
    { id: "p2", name: "Keratin Treatment Series", client: "Amelia Wilson", status: "active", priority: "medium", budgetAmount: 700, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 2, hoursEstimated: 4, costIncurred: 180, revenue: 700, margin: 74.3, startDate: "2026-03-05", dueDate: "2026-04-05", manager: "Stylist Emma", teamSize: 1, tasksTotal: 3, tasksDone: 1, tags: ["Keratin"] },
    { id: "p3", name: "Monthly Blowout Membership", client: "Harper Garcia", status: "active", priority: "low", budgetAmount: 120, budgetType: "retainer", hourlyRate: 0, retainerHours: 0, hoursLogged: 1, hoursEstimated: 1, costIncurred: 40, revenue: 120, margin: 66.7, startDate: "2026-03-01", dueDate: "2026-03-31", manager: "Stylist Alex", teamSize: 1, tasksTotal: 4, tasksDone: 3, tags: ["Membership", "Recurring"] },
  ],
  real_estate: [
    { id: "p1", name: "Waterfront Listing — Chen", client: "Robert Chen", status: "active", priority: "high", budgetAmount: 36000, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 12, hoursEstimated: 30, costIncurred: 2400, revenue: 36000, margin: 93.3, startDate: "2026-02-20", dueDate: "2026-04-15", manager: "Agent Sarah", teamSize: 1, tasksTotal: 10, tasksDone: 4, tags: ["Luxury", "Listing"] },
    { id: "p2", name: "First-Time Buyer — Hill", client: "Amanda Hill", status: "active", priority: "medium", budgetAmount: 8250, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 8, hoursEstimated: 15, costIncurred: 800, revenue: 8250, margin: 90.3, startDate: "2026-03-01", dueDate: "2026-04-10", manager: "Agent Mike", teamSize: 1, tasksTotal: 8, tasksDone: 5, tags: ["Buyer", "Under Contract"] },
    { id: "p3", name: "Estate Sale — Williams", client: "Patricia Williams", status: "active", priority: "high", budgetAmount: 26700, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 15, hoursEstimated: 25, costIncurred: 1800, revenue: 26700, margin: 93.3, startDate: "2026-02-15", dueDate: "2026-04-03", manager: "Agent Sarah", teamSize: 1, tasksTotal: 12, tasksDone: 8, tags: ["Luxury", "Under Contract"] },
  ],
  coaching_education: [
    { id: "p1", name: "1:1 Coaching — Jason Wright", client: "Jason Wright", status: "active", priority: "high", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 250, retainerHours: 0, hoursLogged: 8, hoursEstimated: 20, costIncurred: 800, revenue: 5000, margin: 84.0, startDate: "2026-03-01", dueDate: "2026-05-30", manager: "Coach", teamSize: 1, tasksTotal: 10, tasksDone: 3, tags: ["1:1", "Premium"] },
    { id: "p2", name: "Mastermind Cohort — Spring 2026", client: "6 Participants", status: "active", priority: "high", budgetAmount: 48000, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 12, hoursEstimated: 36, costIncurred: 2400, revenue: 48000, margin: 95.0, startDate: "2026-03-01", dueDate: "2026-06-01", manager: "Coach", teamSize: 1, tasksTotal: 12, tasksDone: 4, tags: ["Mastermind", "Group"] },
    { id: "p3", name: "VIP Day — Nathan Harris", client: "Nathan Harris", status: "planning", priority: "medium", budgetAmount: 3000, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 0, hoursEstimated: 8, costIncurred: 0, revenue: 3000, margin: 100, startDate: "2026-03-25", dueDate: "2026-03-25", manager: "Coach", teamSize: 1, tasksTotal: 5, tasksDone: 0, tags: ["VIP Day"] },
  ],
  restaurant_food: [
    { id: "p1", name: "Wedding Reception — Emily & David", client: "Emily & David", status: "active", priority: "high", budgetAmount: 8500, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 8, hoursEstimated: 24, costIncurred: 3400, revenue: 8500, margin: 60.0, startDate: "2026-03-01", dueDate: "2026-05-20", manager: "Chef", teamSize: 4, tasksTotal: 12, tasksDone: 4, tags: ["Event", "Wedding"] },
    { id: "p2", name: "Corporate Lunch — Apex Financial", client: "Apex Financial", status: "planning", priority: "medium", budgetAmount: 3500, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 1, hoursEstimated: 6, costIncurred: 200, revenue: 3500, margin: 94.3, startDate: "2026-04-05", dueDate: "2026-04-12", manager: "Manager", teamSize: 3, tasksTotal: 8, tasksDone: 1, tags: ["Catering", "Corporate"] },
    { id: "p3", name: "Weekly Meal Prep Service", client: "Marcus Rivera", status: "active", priority: "low", budgetAmount: 480, budgetType: "retainer", hourlyRate: 0, retainerHours: 0, hoursLogged: 4, hoursEstimated: 4, costIncurred: 240, revenue: 480, margin: 50.0, startDate: "2026-03-01", dueDate: "2026-03-31", manager: "Chef", teamSize: 1, tasksTotal: 4, tasksDone: 3, tags: ["Recurring", "Meal Prep"] },
  ],
  nonprofit: [
    { id: "p1", name: "Annual Gala — Spring 2026", client: "Harbor Community", status: "active", priority: "high", budgetAmount: 50000, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 45, hoursEstimated: 120, costIncurred: 18000, revenue: 50000, margin: 64.0, startDate: "2026-02-01", dueDate: "2026-04-20", manager: "Events", teamSize: 4, tasksTotal: 20, tasksDone: 10, tags: ["Gala", "Fundraiser"] },
    { id: "p2", name: "Year-End Campaign", client: "Harbor Community", status: "completed", priority: "high", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 30, hoursEstimated: 30, costIncurred: 2000, revenue: 28500, margin: 93.0, startDate: "2025-11-01", dueDate: "2025-12-31", manager: "Outreach", teamSize: 2, tasksTotal: 10, tasksDone: 10, tags: ["Campaign", "Completed"] },
    { id: "p3", name: "Corporate Partnership — Apex", client: "Apex Financial Group", status: "planning", priority: "medium", budgetAmount: 0, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 4, hoursEstimated: 15, costIncurred: 400, revenue: 25000, margin: 98.4, startDate: "2026-03-15", dueDate: "2026-05-01", manager: "Director", teamSize: 1, tasksTotal: 8, tasksDone: 1, tags: ["Corporate", "Partnership"] },
  ],
  ecommerce: [
    { id: "p1", name: "VIP Yearly Retention Campaign", client: "ESL Sports", status: "active", priority: "high", budgetAmount: 500, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 8, hoursEstimated: 12, costIncurred: 200, revenue: 14985, margin: 98.7, startDate: "2026-03-01", dueDate: "2026-03-31", manager: "Orlando", teamSize: 1, tasksTotal: 6, tasksDone: 4, tags: ["Retention", "VIP"] },
    { id: "p2", name: "Win-Back Campaign — Q1", client: "ESL Sports", status: "active", priority: "medium", budgetAmount: 200, budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 4, hoursEstimated: 6, costIncurred: 80, revenue: 2970, margin: 97.3, startDate: "2026-03-10", dueDate: "2026-03-25", manager: "Orlando", teamSize: 1, tasksTotal: 4, tasksDone: 2, tags: ["Win-Back", "Campaign"] },
  ],
};

// Fallback for non-agency industries
const DEFAULT_PROJECTS: Project[] = [
  { id: "p1", name: "Sample Project", client: "Demo Client", status: "active", priority: "medium", budgetAmount: 5000, budgetType: "fixed", hourlyRate: 100, retainerHours: 0, hoursLogged: 20, hoursEstimated: 50, costIncurred: 1400, revenue: 5000, margin: 72.0, startDate: "2026-03-01", dueDate: "2026-04-30", manager: "Team Lead", teamSize: 2, tasksTotal: 10, tasksDone: 4, tags: ["Demo"] },
];

// ─── HELPERS ───

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`; }

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  planning: { label: "Planning", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Target },
  active: { label: "Active", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: TrendingUp },
  on_hold: { label: "On Hold", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Pause },
  completed: { label: "Completed", color: "text-violet-600", bg: "bg-violet-50 border-violet-200", icon: CheckCircle },
  canceled: { label: "Canceled", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: X },
};

const priorityStyles: Record<string, string> = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-gray-100 text-gray-500 border-gray-200",
};

// ─── MAIN COMPONENT ───

export default function ProjectsPage() {
  const ic = useIndustry();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dealConversion, setDealConversion] = useState<{ name: string; client: string; budget: number } | null>(null);

  // Load projects
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = demoIndustry; if (!key) return;
    setProjects(DEMO_PROJECTS[key] || DEFAULT_PROJECTS);

    // Check for deal → project conversion
    try {
      const raw = sessionStorage.getItem("sonji-new-project");
      if (raw) {
        setDealConversion(JSON.parse(raw));
        sessionStorage.removeItem("sonji-new-project");
      }
    } catch {}
  }, []);

  const filtered = projects.filter(p => {
    if (search) { const q = search.toLowerCase(); if (!p.name.toLowerCase().includes(q) && !p.client.toLowerCase().includes(q)) return false; }
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  // Summary stats
  const activeProjects = projects.filter(p => p.status === "active").length;
  const totalRevenue = projects.filter(p => p.status !== "canceled").reduce((s, p) => s + p.revenue, 0);
  const totalHours = projects.reduce((s, p) => s + p.hoursLogged, 0);
  const avgMargin = projects.filter(p => p.hoursLogged > 0).reduce((s, p, _, arr) => s + p.margin / arr.length, 0);
  const totalBudget = projects.filter(p => p.status !== "canceled").reduce((s, p) => s + p.budgetAmount, 0);
  const totalCost = projects.reduce((s, p) => s + p.costIncurred, 0);

  return (
    <>
      <Header title="Projects" />
      <div className="p-6 space-y-4">

        {/* Deal → Project Conversion Banner */}
        {dealConversion && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Create project from won deal</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700">{dealConversion.name}</span> for {dealConversion.client} — ${dealConversion.budget?.toLocaleString() || "0"} budget
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const newProject: Project = {
                    id: `p${Date.now()}`, name: dealConversion.name, client: dealConversion.client,
                    status: "planning", priority: "high", budgetAmount: dealConversion.budget || 0,
                    budgetType: "fixed", hourlyRate: 0, retainerHours: 0, hoursLogged: 0,
                    hoursEstimated: 0, costIncurred: 0, revenue: dealConversion.budget || 0,
                    margin: 100, startDate: new Date().toISOString().split("T")[0],
                    dueDate: "", manager: "", teamSize: 0, tasksTotal: 0, tasksDone: 0, tags: ["From Deal"],
                  };
                  setProjects(prev => [newProject, ...prev]);
                  setDealConversion(null);
                }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition">
                  <Plus className="w-4 h-4" /> Create Project
                </button>
                <button onClick={() => setDealConversion(null)} className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Projects", value: String(activeProjects), icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total Revenue", value: fmt(totalRevenue), icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Hours Logged", value: `${totalHours.toFixed(0)}h`, icon: Timer, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Avg Margin", value: `${avgMargin.toFixed(1)}%`, icon: PieChart, color: "text-amber-600", bg: "bg-amber-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              {[{ key: "all", label: "All" }, { key: "active", label: "Active" }, { key: "planning", label: "Planning" }, { key: "on_hold", label: "On Hold" }, { key: "completed", label: "Completed" }].map(f => (
                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${statusFilter === f.key ? "bg-indigo-50 text-indigo-600 border border-indigo-200" : "text-gray-500 hover:bg-gray-50"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView("grid")} className={`p-2 transition ${view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setView("list")} className={`p-2 transition border-l border-gray-200 ${view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}><List className="w-4 h-4" /></button>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const sc = statusConfig[p.status];
              const Icon = sc.icon;
              const budgetPct = p.budgetType === "hourly" || p.budgetType === "retainer"
                ? (p.hoursLogged / (p.hoursEstimated || 1)) * 100
                : (p.costIncurred / (p.budgetAmount || 1)) * 100;
              const taskPct = p.tasksTotal > 0 ? (p.tasksDone / p.tasksTotal) * 100 : 0;
              const isOverBudget = budgetPct > 90;
              const marginColor = p.margin >= 60 ? "text-emerald-600" : p.margin >= 40 ? "text-amber-600" : "text-red-600";

              return (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition truncate">{p.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{p.client}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                      <Icon className="w-3 h-3" /> {sc.label}
                    </span>
                  </div>

                  {/* Budget + Hours */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Budget</p>
                      <p className="text-sm font-bold text-gray-900">{fmt(p.budgetAmount)}</p>
                      <p className="text-[10px] text-gray-400">{p.budgetType === "retainer" ? `${p.retainerHours}h/mo` : p.budgetType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Margin</p>
                      <p className={`text-sm font-bold ${marginColor}`}>{p.margin.toFixed(1)}%</p>
                      <p className="text-[10px] text-gray-400">{fmt(p.revenue - p.costIncurred)} profit</p>
                    </div>
                  </div>

                  {/* Hours Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400">{p.hoursLogged}h / {p.hoursEstimated}h</span>
                      {isOverBudget && <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> Over budget</span>}
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${budgetPct > 90 ? "bg-red-400" : budgetPct > 70 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                    </div>
                  </div>

                  {/* Tasks Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400">{p.tasksDone}/{p.tasksTotal} tasks</span>
                      <span className="text-[10px] text-gray-400 font-medium">{taskPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${taskPct}%` }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{p.teamSize} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">Due {p.dueDate}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-gray-400">No projects match your filters</div>
            )}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Budget</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Hours</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Margin</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tasks</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const sc = statusConfig[p.status];
                  const marginColor = p.margin >= 60 ? "text-emerald-600" : p.margin >= 40 ? "text-amber-600" : "text-red-600";
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => window.location.href = `/dashboard/projects/${p.id}`}>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{p.name}</span>
                        <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityStyles[p.priority]}`}>{p.priority}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-gray-600">{p.client}</span></td>
                      <td className="px-4 py-3"><span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-sm font-bold text-gray-900">{fmt(p.budgetAmount)}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-sm text-gray-600">{p.hoursLogged}h / {p.hoursEstimated}h</span></td>
                      <td className="px-4 py-3 text-right"><span className={`text-sm font-bold ${marginColor}`}>{p.margin.toFixed(1)}%</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-sm text-gray-600">{p.tasksDone}/{p.tasksTotal}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-xs text-gray-400">{p.dueDate}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Resource Loading Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Resource Loading</h2>
          <div className="space-y-3">
            {(() => {
              const managers = Array.from(new Set(projects.map(p => p.manager).filter(Boolean)));
              return managers.map(m => {
                const mProjects = projects.filter(p => p.manager === m && p.status === "active");
                const mHours = mProjects.reduce((s, p) => s + p.hoursLogged, 0);
                const mCapacity = mProjects.length * 40; // Rough: 40 hrs/week capacity
                const utilization = mCapacity > 0 ? (mHours / mCapacity) * 100 : 0;
                return (
                  <div key={m} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-indigo-700">{m[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{m}</span>
                        <span className="text-xs text-gray-400">{mProjects.length} active projects · {mHours}h logged</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${utilization > 85 ? "bg-red-400" : utilization > 60 ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${Math.min(utilization, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">{fmt(totalRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">Across {projects.filter(p => p.status !== "canceled").length} projects</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Cost</h3>
            <p className="text-2xl font-bold text-gray-900">{fmt(totalCost)}</p>
            <p className="text-xs text-gray-400 mt-1">{totalHours.toFixed(0)} hours × blended rate</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Net Profit</h3>
            <p className={`text-2xl font-bold ${totalRevenue - totalCost > 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(totalRevenue - totalCost)}</p>
            <p className="text-xs text-gray-400 mt-1">{((1 - totalCost / totalRevenue) * 100).toFixed(1)}% overall margin</p>
          </div>
        </div>
      </div>
    </>
  );
}
