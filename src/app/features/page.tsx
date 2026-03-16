"use client";

import Link from "next/link";
import {
  Users, BarChart3, DollarSign, Mail, Zap, Calendar, MessageSquare,
  Bot, FolderKanban, Shield, TrendingUp, FileText, ArrowRight,
  CheckCircle, Star, Ghost, Heart, Clock, Send,
} from "lucide-react";

const sections = [
  {
    id: "crm",
    badge: "Core CRM",
    title: "Everything starts with relationships.",
    desc: "Manage every contact, deal, and company with custom fields, tags, activity timelines, and full-text search. Import from Stripe or CSV in seconds.",
    features: [
      "Custom fields and tags",
      "Contact health scores (0-100)",
      "Full activity timeline per contact",
      "Segments with smart filters",
      "CSV import/export",
      "Customer journey visualization",
    ],
    icon: Users,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "pipeline",
    badge: "Pipeline & Deals",
    title: "Visual deal management that actually works.",
    desc: "Drag-and-drop Kanban boards with industry-specific stages. Track value, forecast revenue, and monitor deal velocity — deals that stall turn amber, then red.",
    features: [
      "Kanban drag-and-drop",
      "List + grid views",
      "Deal velocity monitoring",
      "Revenue forecasting",
      "Deal → Project handoff",
      "Industry-specific stages",
    ],
    icon: BarChart3,
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    id: "projects",
    badge: "Project Management",
    title: "From close to delivery.",
    desc: "Track time, budgets, margins, and team allocation. When a deal closes, one click converts it to a project with all the context. Replace Monday.com.",
    features: [
      "Live time tracker (start/stop)",
      "Budget vs. actual tracking",
      "Profit margin per project",
      "Team resource loading",
      "Deal → Project conversion",
      "4-tab detail view (Tasks, Time, Budget, Team)",
    ],
    icon: FolderKanban,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "ai",
    badge: "AI & Intelligence",
    title: "The insights your competitors miss.",
    desc: "Predictive ghosting alerts detect when contacts go cold. Health scores combine 5 signals into one number. Revenue forecasts project 3 months out. All automatic.",
    features: [
      "Ghosting Alerts — 27 predictive signals",
      "Client Health Scores (0-100)",
      "Revenue Forecast (3-month)",
      "Team Performance analytics",
      "AI Smart Campaigns (auto-generated)",
      "AI Contact Insights (10 patterns)",
      "Sonji AI Chat (⌘J) — ask anything",
    ],
    icon: Bot,
    gradient: "from-purple-500 to-fuchsia-600",
  },
  {
    id: "automations",
    badge: "Automations",
    title: "64 workflows. Zero manual work.",
    desc: "Pre-built industry automations for follow-ups, reminders, win-backs, and more. Toggle on/off instantly. Each shows trigger → action chains with run counts.",
    features: [
      "64 pre-built automations",
      "12 industry templates",
      "Toggle on/off instantly",
      "Trigger → action visualization",
      "Scope creep detection (agency)",
      "Botox rebooking reminders (healthcare)",
      "Weather-triggered nurture (home services)",
    ],
    icon: Zap,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "communication",
    badge: "Communication",
    title: "Email. SMS. Forms. One inbox.",
    desc: "Every conversation in a unified 3-panel inbox. Bring your own Twilio for zero markup SMS. Email templates with open/click tracking. Forms with conversion analytics.",
    features: [
      "3-panel unified inbox",
      "Email campaigns + templates",
      "BYOK Twilio (no SMS markup)",
      "Form builder with analytics",
      "Industry email template library",
      "SMS with delivery tracking",
    ],
    icon: MessageSquare,
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    id: "analytics",
    badge: "Analytics & Reporting",
    title: "Real data. Not estimated numbers.",
    desc: "20 customizable dashboard widgets. Real Stripe data — not the fake numbers GHL reports. Client reports auto-generated monthly and sent with one click.",
    features: [
      "20 drag-and-drop widgets",
      "Real Stripe revenue data",
      "Client reports (auto-generated)",
      "Today's Agenda timeline",
      "Revenue, pipeline, and segment reports",
      "Open/click rate tracking",
    ],
    icon: TrendingUp,
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: "industries",
    badge: "12 Industries",
    title: "Pre-configured for your business.",
    desc: "Every page adapts — terminology, pipelines, automations, and demo data tailored to your vertical. Not a generic CRM you spend weeks configuring.",
    features: [
      "Health & Wellness",
      "Agencies & Consulting",
      "Real Estate",
      "Fitness & Gym",
      "Beauty & Salon",
      "Home Services",
      "Legal",
      "Coaching & Education",
      "Restaurants",
      "Automotive",
      "Nonprofits",
      "E-Commerce",
    ],
    icon: Star,
    gradient: "from-rose-500 to-pink-600",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="text-xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></Link>
          <div className="flex items-center gap-4">
            <Link href="/compare" className="text-sm text-gray-600 hover:text-gray-900 transition">Compare</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Platform</span>
            <h1 className="text-5xl font-bold text-gray-900 mt-3 mb-5">Everything you need.<br />Nothing you don't.</h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">CRM, project management, automations, AI insights, communication, and analytics — in one platform for one price.</p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Link href="/signup" className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/demo" className="px-6 py-3 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition">
                Watch Demo
              </Link>
            </div>
          </div>

          {/* Feature Sections */}
          <div className="space-y-24">
            {sections.map((section, i) => {
              const Icon = section.icon;
              const isEven = i % 2 === 0;
              return (
                <div key={section.id} id={section.id} className="scroll-mt-24">
                  <div className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 items-center`}>
                    {/* Text */}
                    <div className="flex-1">
                      <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${section.gradient} text-white mb-4`}>
                        <Icon className="w-3.5 h-3.5" /> {section.badge}
                      </span>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
                      <p className="text-gray-500 leading-relaxed mb-6">{section.desc}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {section.features.map(f => (
                          <div key={f} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Visual */}
                    <div className="flex-1 max-w-md">
                      <div className={`bg-gradient-to-br ${section.gradient} rounded-2xl p-8 aspect-[4/3] flex items-center justify-center`}>
                        <Icon className="w-20 h-20 text-white/30" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-24 pt-12 border-t border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to try it?</h2>
            <p className="text-gray-500 mb-8">14-day free trial. No credit card. Set up in 5 minutes.</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/signup" className="flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-lg shadow-indigo-500/25">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/roi" className="px-6 py-3.5 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition">
                Calculate ROI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
