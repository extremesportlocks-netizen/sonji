"use client";

import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";

const competitors = [
  { name: "Sonji", highlight: true },
  { name: "GoHighLevel", highlight: false },
  { name: "HubSpot", highlight: false },
  { name: "Salesforce", highlight: false },
];

const features: { category: string; items: { name: string; values: (boolean | string)[] }[] }[] = [
  {
    category: "Core CRM",
    items: [
      { name: "Contacts with custom fields", values: [true, true, true, true] },
      { name: "Pipeline / Kanban deals", values: [true, true, true, true] },
      { name: "Task management", values: [true, true, true, true] },
      { name: "Activity timeline", values: [true, true, true, true] },
    ],
  },
  {
    category: "Project Management",
    items: [
      { name: "Time tracking with live timer", values: [true, false, false, false] },
      { name: "Budget vs. actual tracking", values: [true, false, false, false] },
      { name: "Profit margin per project", values: [true, false, false, false] },
      { name: "Team resource loading", values: [true, false, false, false] },
      { name: "Deal → Project handoff", values: [true, false, false, false] },
    ],
  },
  {
    category: "Communication",
    items: [
      { name: "Email campaigns", values: [true, true, true, true] },
      { name: "SMS messaging", values: [true, true, "Add-on", "Add-on"] },
      { name: "Unified 3-panel inbox", values: [true, true, true, true] },
      { name: "Bring your own Twilio (no markup)", values: [true, true, false, false] },
    ],
  },
  {
    category: "AI & Intelligence",
    items: [
      { name: "AI contact insights", values: [true, false, "Add-on", "Add-on"] },
      { name: "AI smart campaigns", values: [true, false, false, "Add-on"] },
      { name: "Predictive ghosting alerts", values: [true, false, false, false] },
      { name: "Revenue forecast (3-month)", values: [true, false, false, true] },
      { name: "Client health scores", values: [true, false, false, false] },
      { name: "Deal velocity monitoring", values: [true, false, false, false] },
    ],
  },
  {
    category: "Automations",
    items: [
      { name: "Pre-built industry automations", values: ["64", "~20", "0", "0"] },
      { name: "Custom workflow builder", values: [true, true, true, true] },
      { name: "Scope creep detection", values: [true, false, false, false] },
      { name: "Consumable rebooking (Botox etc.)", values: [true, false, false, false] },
    ],
  },
  {
    category: "Analytics & Data",
    items: [
      { name: "Real Stripe data (not estimated)", values: [true, false, true, true] },
      { name: "Customizable dashboard", values: ["19 widgets", "Limited", true, true] },
      { name: "Accurate open/click tracking", values: [true, false, true, true] },
      { name: "LTV + subscription tracking", values: [true, false, true, "Add-on"] },
    ],
  },
  {
    category: "Setup & Industry",
    items: [
      { name: "Industry-specific templates", values: ["12 verticals", "Generic", "Generic", "Generic"] },
      { name: "Time to go live", values: ["5 minutes", "2-4 weeks", "1-3 weeks", "3-6 months"] },
      { name: "White-label", values: [true, true, false, false] },
      { name: "Custom domain", values: [true, true, false, true] },
    ],
  },
  {
    category: "Pricing",
    items: [
      { name: "Starting price", values: ["$99/mo", "$97/mo", "$800/mo", "$25/user/mo"] },
      { name: "All-inclusive (no usage fees)", values: [true, false, false, false] },
      { name: "No per-user pricing", values: [true, true, false, false] },
      { name: "Hidden overage charges", values: [false, true, true, true] },
    ],
  },
];

function renderValue(val: boolean | string, isHighlight: boolean) {
  if (val === true) return <Check className={`w-4.5 h-4.5 mx-auto ${isHighlight ? "text-emerald-500" : "text-gray-400"}`} />;
  if (val === false) return <X className="w-4.5 h-4.5 mx-auto text-red-300" />;
  return <span className={`text-xs font-semibold ${isHighlight ? "text-indigo-600" : "text-gray-600"}`}>{val}</span>;
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="text-xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</Link>
            <Link href="/demo" className="text-sm text-gray-600 hover:text-gray-900 transition">Demo</Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Comparison</span>
            <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-4">How Sonji compares</h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Side-by-side with the platforms you're probably paying too much for.</p>
          </div>

          {/* Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-emerald-600">$99</p>
              <p className="text-sm text-gray-500 mt-1">vs $800+/mo for HubSpot</p>
              <p className="text-xs text-gray-400 mt-0.5">Same features, honest pricing</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-indigo-600">5 min</p>
              <p className="text-sm text-gray-500 mt-1">vs 3-6 months for Salesforce</p>
              <p className="text-xs text-gray-400 mt-0.5">Pick your industry, you're live</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-violet-600">19</p>
              <p className="text-sm text-gray-500 mt-1">dashboard widgets vs GHL's fixed layout</p>
              <p className="text-xs text-gray-400 mt-0.5">Drag, drop, customize everything</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="grid grid-cols-5 border-b border-gray-100 sticky top-16 bg-white z-10">
              <div className="p-4" />
              {competitors.map(c => (
                <div key={c.name} className={`p-4 text-center ${c.highlight ? "bg-indigo-50 border-b-2 border-indigo-500" : ""}`}>
                  <p className={`text-sm font-bold ${c.highlight ? "text-indigo-600" : "text-gray-600"}`}>{c.name}</p>
                </div>
              ))}
            </div>

            {features.map(group => (
              <div key={group.category}>
                <div className="px-5 py-3 bg-gray-50/80 border-y border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group.category}</h3>
                </div>
                {group.items.map(item => (
                  <div key={item.name} className="grid grid-cols-5 border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <div className="px-5 py-3.5"><span className="text-sm text-gray-700">{item.name}</span></div>
                    {item.values.map((val, i) => (
                      <div key={i} className={`px-4 py-3.5 flex items-center justify-center ${competitors[i].highlight ? "bg-indigo-50/20" : ""}`}>
                        {renderValue(val, competitors[i].highlight)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to switch?</h2>
            <p className="text-gray-500 mb-6">14-day free trial. Import your data in minutes. No credit card.</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/signup" className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/demo" className="px-6 py-3 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition">
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
