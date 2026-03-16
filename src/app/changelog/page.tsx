"use client";

import Link from "next/link";
import { ArrowRight, Zap, BarChart3, Users, Brain, Shield, Rocket, FolderKanban, Ghost } from "lucide-react";

const entries = [
  {
    date: "March 16, 2026",
    title: "Sonji AI + Client Reports + Deal→Project Handoff",
    tag: "Major",
    tagColor: "bg-violet-100 text-violet-700",
    items: [
      "Sonji AI Chat — floating assistant on every page, answers questions about your CRM data with ⌘J shortcut",
      "Client Reports — auto-generated monthly reports, one-click send, view tracking",
      "Smart Deal → Project conversion — won deals become projects with pre-filled budget and client data",
      "Competitor comparison page at /compare — Sonji vs GoHighLevel vs HubSpot vs Salesforce",
      "ROI Calculator at /roi — interactive savings calculator with real-time math",
      "Revenue Forecast widget — 3-month projections from recurring + pipeline",
      "Team Performance widget — per-member utilization, hours, efficiency",
      "Client Health Score widget — 0-100 composite score per contact",
      "Contact health badge on every contact profile",
      "Industry-specific notifications — bell dropdown adapts per vertical",
    ],
  },
  {
    date: "March 15, 2026",
    title: "TRUE 12/12 Industry Coverage + Project Management",
    tag: "Major",
    tagColor: "bg-indigo-100 text-indigo-700",
    items: [
      "Project Management System — grid + list views, budget tracking, profit margins, live timer",
      "64 industry automations across all 12 verticals (8 healthcare, 8 agency, 6 home services, 5 each for e-commerce/fitness/beauty, 4 each for real estate/legal/coaching/restaurant/automotive/nonprofit)",
      "27 Ghosting Alerts — predictive cooling detection with baseline vs current velocity",
      "Every page now has demo data for ALL 12 industries — contacts, deals, tasks, meetings, messages, forms, invoices, companies, activities",
      "15-slide cinematic demo reel with Projects and Ghosting Alerts mockups",
      "Recovered Revenue Counter dashboard widget",
      "Deal Velocity monitoring with color-coded stall detection",
    ],
  },
  {
    date: "March 14, 2026",
    title: "Full Functional Audit + Industry Personalization",
    tag: "Major",
    tagColor: "bg-emerald-100 text-emerald-700",
    items: [
      "12 industry demos with custom pipelines, terminology, dashboard metrics, and gradient colors",
      "Terminology engine — every label on every page adapts per industry (Patients, Members, Clients, Leads, etc.)",
      "Sonji Box with 5 industry-specific metrics and custom gradient per vertical",
      "AI Smart Campaigns — 6 auto-generated campaigns per industry",
      "Demo bar with instant industry switcher — click to switch between all 12 demos",
      "Full functional audit across all 52+ pages",
    ],
  },
  {
    date: "March 13, 2026",
    title: "Multi-Tenant + Stripe Import + Core CRM",
    tag: "Foundation",
    tagColor: "bg-blue-100 text-blue-700",
    items: [
      "Multi-tenant provisioning — signup → onboarding → provision → dashboard",
      "Stripe import engine with Inngest background sync — 4,075 contacts imported from ESL",
      "Real-time Stripe webhooks for payments, subscriptions, refunds",
      "Contacts with server-side pagination, segments, CSV export/import",
      "Deals kanban with drag-and-drop, list + grid views",
      "Tasks kanban with drag-and-drop between columns",
      "Settings with Stripe Connect, Resend email, Twilio SMS (BYOK)",
      "Command palette (⌘K) for quick navigation",
      "Customizable dashboard with drag-and-drop widget layout",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="text-xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></Link>
          <div className="flex items-center gap-4">
            <Link href="/compare" className="text-sm text-gray-600 hover:text-gray-900 transition">Compare</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Changelog</span>
            <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-4">What's new in Sonji</h1>
            <p className="text-lg text-gray-500">We ship fast. Here's what landed this week.</p>
          </div>

          <div className="space-y-12">
            {entries.map((entry, i) => (
              <div key={i} className="relative">
                {/* Date + Tag */}
                <div className="flex items-center gap-3 mb-4">
                  <time className="text-sm font-semibold text-gray-900">{entry.date}</time>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${entry.tagColor}`}>{entry.tag}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">{entry.title}</h2>

                {/* Items */}
                <div className="space-y-2">
                  {entry.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                {i < entries.length - 1 && <div className="mt-12 border-t border-gray-100" />}
              </div>
            ))}
          </div>

          <div className="text-center mt-16 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-400 mb-4">More updates shipping every week.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
