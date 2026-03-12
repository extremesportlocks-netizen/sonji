"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX,
  LayoutDashboard, Users, Handshake, MessageSquare, FileText,
  DollarSign, Zap, BarChart3, Sparkles, ArrowRight, Check,
  Calendar, CheckSquare, Bot, Globe, Shield,
} from "lucide-react";

// ────────────────────────────────────
// SLIDE DATA
// ────────────────────────────────────

interface Slide {
  id: string;
  section: string;
  title: string;
  subtitle: string;
  bullets?: string[];
  icon: React.ElementType;
  iconColor: string;
  gradient: string;
  mockup: "dashboard" | "contacts" | "deals" | "messages" | "forms" | "invoices" | "workflows" | "analytics" | "industries" | "onboarding" | "pricing" | "hero";
}

const slides: Slide[] = [
  {
    id: "hero",
    section: "INTRODUCING",
    title: "The CRM that just works.",
    subtitle: "One tool. One price. Contacts, pipeline, email, scheduling, invoicing, and AI — all included.",
    icon: Sparkles,
    iconColor: "text-violet-400",
    gradient: "from-indigo-950 via-slate-950 to-violet-950",
    mockup: "hero",
  },
  {
    id: "dashboard",
    section: "COMMAND CENTER",
    title: "Your entire business at a glance.",
    subtitle: "Revenue, pipeline, team activity, and tasks — updated in real-time.",
    bullets: ["Live revenue and deal metrics", "Pipeline value tracking", "Team activity feed", "Task completion rates"],
    icon: LayoutDashboard,
    iconColor: "text-indigo-400",
    gradient: "from-indigo-950 via-slate-950 to-blue-950",
    mockup: "dashboard",
  },
  {
    id: "contacts",
    section: "CRM",
    title: "Every relationship, organized.",
    subtitle: "Manage contacts with custom fields, tags, activity timelines, and full search.",
    bullets: ["Import from CSV in seconds", "Custom fields per industry", "Full activity timeline per contact", "Search across 25,000+ contacts"],
    icon: Users,
    iconColor: "text-blue-400",
    gradient: "from-blue-950 via-slate-950 to-indigo-950",
    mockup: "contacts",
  },
  {
    id: "deals",
    section: "PIPELINE",
    title: "Drag. Drop. Close.",
    subtitle: "Visual Kanban board with drag-and-drop deal management and revenue forecasting.",
    bullets: ["Drag deals between stages", "Custom pipelines per business", "Deal values and close dates", "Win/loss analytics"],
    icon: Handshake,
    iconColor: "text-emerald-400",
    gradient: "from-emerald-950 via-slate-950 to-teal-950",
    mockup: "deals",
  },
  {
    id: "messages",
    section: "UNIFIED INBOX",
    title: "Email. SMS. Forms. One place.",
    subtitle: "Every conversation with every contact in a single timeline. Reply via email or SMS.",
    bullets: ["Threaded conversations", "Channel switching (Email ↔ SMS)", "Contact sidebar with deal info", "Delivery + read receipts"],
    icon: MessageSquare,
    iconColor: "text-cyan-400",
    gradient: "from-cyan-950 via-slate-950 to-blue-950",
    mockup: "messages",
  },
  {
    id: "forms",
    section: "INTAKE FORMS",
    title: "Build forms. Capture leads. Automatically.",
    subtitle: "Drag-and-drop form builder with 10 field types, conditional logic, and auto-contact creation.",
    bullets: ["10 field types", "Live preview mode", "Embeddable on any website", "Auto-creates CRM contacts"],
    icon: FileText,
    iconColor: "text-violet-400",
    gradient: "from-violet-950 via-slate-950 to-purple-950",
    mockup: "forms",
  },
  {
    id: "invoices",
    section: "INVOICING",
    title: "Get paid. Without the spreadsheet.",
    subtitle: "Create, send, and track invoices. Accept payments via Stripe. Recurring billing built in.",
    bullets: ["Professional invoice templates", "Line items with auto-calculation", "Stripe payment links", "Paid/Sent/Overdue tracking"],
    icon: DollarSign,
    iconColor: "text-green-400",
    gradient: "from-green-950 via-slate-950 to-emerald-950",
    mockup: "invoices",
  },
  {
    id: "workflows",
    section: "AUTOMATIONS",
    title: "Set it. Forget it. Grow.",
    subtitle: "Visual workflow builder with triggers, conditions, and actions. Zero manual work.",
    bullets: ["17 trigger types", "11 action types", "Conditional branching", "Time delays and sequences"],
    icon: Zap,
    iconColor: "text-amber-400",
    gradient: "from-amber-950 via-slate-950 to-orange-950",
    mockup: "workflows",
  },
  {
    id: "ai",
    section: "AI ASSISTANT",
    title: "Your smartest team member.",
    subtitle: "Draft emails, score leads, summarize contacts, and analyze pipeline data — powered by AI.",
    bullets: ["One-click email drafting", "Lead scoring (0-100)", "Contact insights", "Pipeline recommendations"],
    icon: Bot,
    iconColor: "text-purple-400",
    gradient: "from-purple-950 via-slate-950 to-fuchsia-950",
    mockup: "analytics",
  },
  {
    id: "industries",
    section: "12 INDUSTRIES",
    title: "Pre-configured for your business.",
    subtitle: "Custom pipelines, forms, email templates, and automations — tailored to your vertical.",
    bullets: ["Health & Wellness", "Real Estate", "Home Services", "Agencies", "Legal", "E-Commerce", "And 6 more..."],
    icon: Globe,
    iconColor: "text-teal-400",
    gradient: "from-teal-950 via-slate-950 to-cyan-950",
    mockup: "industries",
  },
  {
    id: "onboarding",
    section: "5-MINUTE SETUP",
    title: "Live in 5 minutes. Not 5 months.",
    subtitle: "Sign up, brand your CRM, pick your industry, and you're operational. No consultants needed.",
    bullets: ["5-step onboarding wizard", "Brand colors and logo", "Industry-specific templates auto-loaded", "Interactive product tour"],
    icon: Sparkles,
    iconColor: "text-rose-400",
    gradient: "from-rose-950 via-slate-950 to-pink-950",
    mockup: "onboarding",
  },
  {
    id: "pricing",
    section: "PRICING",
    title: "Simple. Honest. All-inclusive.",
    subtitle: "No per-SMS charges. No AI usage fees. No surprise overages. The price you see is the price you pay.",
    icon: Shield,
    iconColor: "text-indigo-400",
    gradient: "from-indigo-950 via-slate-950 to-violet-950",
    mockup: "pricing",
  },
  {
    id: "cta",
    section: "READY?",
    title: "Replace $700/month with one tool.",
    subtitle: "Start your 14-day free trial. No credit card required.",
    icon: ArrowRight,
    iconColor: "text-white",
    gradient: "from-indigo-600 via-violet-600 to-purple-600",
    mockup: "hero",
  },
];

const SLIDE_DURATION = 6000; // 6 seconds per slide

// ────────────────────────────────────
// MOCKUP COMPONENTS
// ────────────────────────────────────

function BrowserChrome({ url, children }: { url?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-2xl shadow-black/20 border border-white/10 overflow-hidden w-full max-w-[500px]">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        {url && <span className="text-[10px] text-gray-400 font-mono ml-auto">{url}</span>}
      </div>
      {children}
    </div>
  );
}

function MockDashboard() {
  return (
    <BrowserChrome url="app.sonji.io">
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Revenue", value: "$48,200", color: "text-indigo-600" },
            { label: "Clients", value: "247", color: "text-emerald-600" },
            { label: "Win Rate", value: "68%", color: "text-violet-600" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-2">Monthly Revenue</p>
          <div className="flex items-end gap-1 h-16">
            {[35, 42, 38, 55, 48, 62, 58, 72, 68, 78, 85, 95].map((h, i) => (
              <div key={i} className={`flex-1 rounded-sm ${i >= 10 ? "bg-indigo-600" : i % 2 === 0 ? "bg-indigo-500" : "bg-indigo-300"}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
}

function MockContacts() {
  return (
    <BrowserChrome url="app.sonji.io/contacts">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-7 bg-gray-100 rounded-lg flex items-center px-2.5">
            <span className="text-[10px] text-gray-400">Search 247 contacts...</span>
          </div>
          <div className="px-2.5 py-1 bg-indigo-600 rounded-md text-[9px] text-white font-semibold">+ Add</div>
        </div>
        {[
          { name: "Mason Thompson", company: "Vertex Partners", tag: "Hot Lead", tagColor: "bg-red-50 text-red-600", score: 92 },
          { name: "Sarah Chen", company: "DataFlow Solutions", tag: "Demo Set", tagColor: "bg-blue-50 text-blue-600", score: 78 },
          { name: "Lucas Anderson", company: "TechVentures Inc", tag: "Enterprise", tagColor: "bg-indigo-50 text-indigo-600", score: 65 },
          { name: "Emily Rodriguez", company: "Pulse Media", tag: "Active", tagColor: "bg-emerald-50 text-emerald-600", score: 54 },
        ].map((c) => (
          <div key={c.name} className="flex items-center gap-3 py-2.5 border-b border-gray-50">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] font-bold text-white">{c.name.split(" ").map(n => n[0]).join("")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-900">{c.name}</p>
              <p className="text-[9px] text-gray-400">{c.company}</p>
            </div>
            <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${c.tagColor}`}>{c.tag}</span>
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-[8px] font-bold text-gray-600">{c.score}</span>
            </div>
          </div>
        ))}
      </div>
    </BrowserChrome>
  );
}

function MockKanban() {
  return (
    <BrowserChrome url="app.sonji.io/deals">
      <div className="flex gap-2 p-3 overflow-hidden">
        {[
          { stage: "Lead", color: "bg-indigo-500", cards: [{ name: "Vertex Partners", val: "$24K" }, { name: "DataFlow", val: "$8.5K" }] },
          { stage: "Proposal", color: "bg-amber-500", cards: [{ name: "CloudPeak", val: "$15K" }] },
          { stage: "Won", color: "bg-emerald-500", cards: [{ name: "Halo Collar", val: "$31K" }, { name: "Fusion Labs", val: "$12K" }] },
        ].map((col) => (
          <div key={col.stage} className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-2">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-[10px] font-semibold text-gray-600">{col.stage}</span>
              <span className="text-[9px] text-gray-400 ml-auto">{col.cards.length}</span>
            </div>
            <div className="space-y-1.5">
              {col.cards.map((c) => (
                <div key={c.name} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                  <p className="text-[10px] font-medium text-gray-700">{c.name}</p>
                  <p className="text-[9px] font-mono text-gray-500">{c.val}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BrowserChrome>
  );
}

function MockInbox() {
  return (
    <BrowserChrome url="app.sonji.io/messages">
      <div className="flex h-[220px]">
        <div className="w-[45%] border-r border-gray-100 p-2 space-y-1">
          {[
            { name: "Mason T.", msg: "Thanks for the proposal!", ch: "✉️", unread: true },
            { name: "Sarah C.", msg: "Thursday at 2pm works", ch: "💬", unread: true },
            { name: "Daniel K.", msg: "Interested in switching from GHL", ch: "📋", unread: false },
          ].map((m) => (
            <div key={m.name} className={`flex items-center gap-2 p-2 rounded-lg ${m.unread ? "bg-indigo-50/60" : ""}`}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[7px] font-bold text-white">{m.name.split(" ").map(n => n[0]).join("")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-semibold text-gray-900 truncate">{m.name} {m.ch}</p>
                <p className="text-[8px] text-gray-400 truncate">{m.msg}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 p-3 flex flex-col">
          <div className="space-y-2 flex-1">
            <div className="bg-gray-100 rounded-xl rounded-bl-sm px-3 py-2 max-w-[85%]">
              <p className="text-[9px] text-gray-700">Thanks for the proposal! We're reviewing internally and should have feedback by Thursday.</p>
            </div>
            <div className="bg-indigo-600 rounded-xl rounded-br-sm px-3 py-2 max-w-[85%] ml-auto">
              <p className="text-[9px] text-white">Sounds great — let me know if you have any questions!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-7 bg-gray-100 rounded-lg flex items-center px-2.5"><span className="text-[9px] text-gray-400">Reply via email...</span></div>
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center"><span className="text-[9px] text-white">→</span></div>
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
}

function MockFormBuilder() {
  return (
    <BrowserChrome url="app.sonji.io/forms/builder">
      <div className="flex h-[220px]">
        <div className="w-[30%] border-r border-gray-100 p-2 space-y-1">
          <p className="text-[8px] text-gray-400 uppercase tracking-wider font-semibold px-1 mb-1">Fields</p>
          {["Aa Text", "✉ Email", "☎ Phone", "▾ Dropdown", "☐ Checkbox", "📅 Date"].map((f) => (
            <div key={f} className="text-[9px] text-gray-600 px-2 py-1.5 bg-gray-50 rounded-md hover:bg-indigo-50 cursor-pointer">{f}</div>
          ))}
        </div>
        <div className="flex-1 p-3 bg-gray-50/50 space-y-2">
          <p className="text-[10px] font-semibold text-gray-800 mb-2">New Patient Intake</p>
          {[
            { label: "Full Name", type: "text" },
            { label: "Email Address", type: "email" },
            { label: "Service Interest", type: "dropdown" },
          ].map((f) => (
            <div key={f.label} className="bg-white rounded-lg p-2 border border-gray-200">
              <p className="text-[8px] font-medium text-gray-700 mb-1">{f.label} <span className="text-red-400">*</span></p>
              <div className="h-6 bg-gray-50 rounded border border-gray-100" />
            </div>
          ))}
          <div className="w-full h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-[9px] font-semibold text-white">Submit</span>
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
}

function MockInvoice() {
  return (
    <BrowserChrome url="app.sonji.io/invoices/new">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[11px] font-bold text-gray-900">sonji<span className="text-violet-500">.</span></p>
            <p className="text-[8px] text-gray-400">hello@sonji.io</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-gray-400 uppercase tracking-wider">Invoice</p>
            <p className="text-[11px] font-bold text-gray-900">INV-007</p>
          </div>
        </div>
        <table className="w-full text-[9px] mb-3">
          <thead><tr className="border-b border-gray-200">
            <th className="text-left py-1 text-gray-500 font-semibold">Item</th>
            <th className="text-center py-1 text-gray-500 font-semibold w-8">Qty</th>
            <th className="text-right py-1 text-gray-500 font-semibold">Amount</th>
          </tr></thead>
          <tbody>
            {[{ item: "Growth Plan (Monthly)", qty: 1, amt: "$199" }, { item: "Custom Onboarding", qty: 1, amt: "$500" }, { item: "Data Migration", qty: 1, amt: "$250" }].map((r) => (
              <tr key={r.item} className="border-b border-gray-50">
                <td className="py-1.5 text-gray-700">{r.item}</td>
                <td className="text-center text-gray-500">{r.qty}</td>
                <td className="text-right font-mono text-gray-900">{r.amt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end border-t border-gray-200 pt-2">
          <div className="text-right">
            <p className="text-[9px] text-gray-400">Total</p>
            <p className="text-base font-bold text-gray-900 font-mono">$949</p>
          </div>
        </div>
        <div className="mt-3 w-full h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-[10px] font-semibold text-white">Pay Now →</span>
        </div>
      </div>
    </BrowserChrome>
  );
}

function MockWorkflows() {
  return (
    <div className="w-full max-w-[460px]">
      <div className="flex flex-col items-center gap-2">
        {/* Trigger */}
        <div className="bg-violet-500/20 backdrop-blur border border-violet-400/30 rounded-xl px-5 py-3 text-center">
          <p className="text-[8px] text-violet-300 uppercase tracking-wider mb-0.5">Trigger</p>
          <p className="text-[11px] font-semibold text-white">Form Submitted</p>
        </div>
        <div className="w-px h-4 bg-white/20" />
        {/* Condition */}
        <div className="bg-amber-500/20 backdrop-blur border border-amber-400/30 rounded-xl px-5 py-3 text-center">
          <p className="text-[8px] text-amber-300 uppercase tracking-wider mb-0.5">Condition</p>
          <p className="text-[11px] font-semibold text-white">Lead Score &gt; 70?</p>
        </div>
        <div className="flex items-start gap-8">
          {/* Yes branch */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1"><div className="w-px h-4 bg-white/20" /></div>
            <span className="text-[8px] text-emerald-400 font-semibold">YES</span>
            <div className="bg-emerald-500/20 backdrop-blur border border-emerald-400/30 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[8px] text-emerald-300 uppercase tracking-wider mb-0.5">Action</p>
              <p className="text-[10px] font-semibold text-white">Assign to Sales</p>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="bg-blue-500/20 backdrop-blur border border-blue-400/30 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[8px] text-blue-300 uppercase tracking-wider mb-0.5">Action</p>
              <p className="text-[10px] font-semibold text-white">Send Welcome Email</p>
            </div>
          </div>
          {/* No branch */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1"><div className="w-px h-4 bg-white/20" /></div>
            <span className="text-[8px] text-red-400 font-semibold">NO</span>
            <div className="bg-cyan-500/20 backdrop-blur border border-cyan-400/30 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[8px] text-cyan-300 uppercase tracking-wider mb-0.5">Action</p>
              <p className="text-[10px] font-semibold text-white">Add to Nurture</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockAI() {
  return (
    <BrowserChrome url="app.sonji.io">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center"><span className="text-[10px]">🤖</span></div>
          <span className="text-[10px] font-semibold text-gray-700">AI Assistant</span>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
          <p className="text-[9px] text-purple-900 font-medium mb-2">Lead Scoring — Mason Thompson</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden"><div className="h-full bg-purple-600 rounded-full" style={{ width: "92%" }} /></div>
            <span className="text-[10px] font-bold text-purple-700">92</span>
          </div>
          <div className="space-y-1">
            {["✅ Submitted intake form (+15)", "✅ Opened 3 emails (+10)", "✅ Referral source (+10)", "🔥 Hot lead — follow up now"].map((l) => (
              <p key={l} className="text-[8px] text-purple-700">{l}</p>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-[9px] text-gray-500 mb-1">✨ AI-drafted email:</p>
          <p className="text-[9px] text-gray-700 italic">"Hi Mason, thanks for submitting your intake form. I'd love to schedule a quick call to discuss next steps..."</p>
        </div>
      </div>
    </BrowserChrome>
  );
}

function MockOnboarding() {
  return (
    <div className="w-full max-w-[460px]">
      <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/10 p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-white/80">Getting Started</span>
          <span className="text-[9px] text-white/40">3 of 5</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full" style={{ width: "60%" }} />
        </div>
        {[
          { label: "Create account", done: true },
          { label: "Choose plan", done: true },
          { label: "Brand your CRM", done: true },
          { label: "Pick industry", done: false, active: true },
          { label: "You're ready!", done: false },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${s.active ? "bg-white/10" : ""}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${s.done ? "bg-indigo-500" : "border border-white/20"}`}>
              {s.done && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-[10px] ${s.done ? "text-white/40 line-through" : "text-white/80"} ${s.active ? "font-semibold text-white" : ""}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockPricing() {
  return (
    <div className="flex gap-3 w-full max-w-[500px]">
      {[
        { name: "Starter", price: "$99" },
        { name: "Growth", price: "$199", popular: true },
        { name: "Scale", price: "$349" },
      ].map((p) => (
        <div key={p.name} className={`flex-1 bg-white/10 backdrop-blur rounded-xl p-4 border ${p.popular ? "border-indigo-400/50 bg-white/15" : "border-white/10"}`}>
          {p.popular && <p className="text-[8px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Most Popular</p>}
          <p className="text-[10px] text-white/60 uppercase tracking-wider">{p.name}</p>
          <p className="text-2xl font-bold text-white font-mono">{p.price}<span className="text-xs font-normal text-white/40">/mo</span></p>
          <div className="mt-3 space-y-1">
            {["Everything included", "No hidden fees", "Cancel anytime"].map((f) => (
              <div key={f} className="flex items-center gap-1">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-[9px] text-white/70">{f}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MockIndustries() {
  const items = ["❤️ Health", "💪 Fitness", "✂️ Beauty", "💼 Agency", "🏠 Real Estate", "🔨 Contractors", "⚖️ Legal", "🎯 Coaching", "🍽️ Restaurant", "🚗 Auto", "🤝 Nonprofit", "🛒 E-Com"];
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-[440px]">
      {items.map((item) => (
        <div key={item} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/10 hover:border-white/20 transition">
          <p className="text-sm mb-0.5">{item.split(" ")[0]}</p>
          <p className="text-[9px] text-white/70">{item.split(" ").slice(1).join(" ")}</p>
        </div>
      ))}
    </div>
  );
}

function getMockup(type: string) {
  switch (type) {
    case "dashboard": return <MockDashboard />;
    case "contacts": return <MockContacts />;
    case "deals": return <MockKanban />;
    case "messages": return <MockInbox />;
    case "forms": return <MockFormBuilder />;
    case "invoices": return <MockInvoice />;
    case "workflows": return <MockWorkflows />;
    case "analytics": return <MockAI />;
    case "pricing": return <MockPricing />;
    case "industries": return <MockIndustries />;
    case "onboarding": return <MockOnboarding />;
    default: return null;
  }
}

// ────────────────────────────────────
// DEMO PAGE
// ────────────────────────────────────

export default function DemoPage() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const slide = slides[current];
  const total = slides.length;

  const goTo = useCallback((idx: number) => {
    setTransitioning(true);
    setProgress(0);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 400);
  }, []);

  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);
  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);

  // Auto-advance
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    if (playing) {
      setProgress(0);
      progressRef.current = setInterval(() => {
        setProgress((p) => Math.min(p + 100 / (SLIDE_DURATION / 50), 100));
      }, 50);
      intervalRef.current = setInterval(next, SLIDE_DURATION);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [playing, current, next]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "p") setPlaying((p) => !p);
      if (e.key === "Escape") setPlaying(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const Icon = slide.icon;
  const mockup = getMockup(slide.mockup);
  const isHero = slide.id === "hero" || slide.id === "cta";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${slide.gradient} transition-all duration-700 relative overflow-hidden select-none`}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Slide progress */}
        <div className="h-1 bg-white/10">
          <div className="h-full bg-white/40 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between px-8 py-4">
          <div className="text-lg font-bold text-white/90">
            sonji<span className="text-violet-400">.</span>
            <span className="text-xs font-normal text-white/30 ml-3">Product Demo</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Slide dots */}
            <div className="hidden md:flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"}`} />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button onClick={prev} className="p-2 text-white/40 hover:text-white/80 transition"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setPlaying(!playing)}
                className="p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={next} className="p-2 text-white/40 hover:text-white/80 transition"><ChevronRight className="w-5 h-5" /></button>
            </div>

            <span className="text-xs text-white/30 font-mono">{current + 1}/{total}</span>
          </div>
        </div>
      </div>

      {/* Slide content */}
      <div className={`min-h-screen flex items-center justify-center px-8 py-24 transition-all duration-400 ${transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
        <div className={`max-w-6xl w-full ${isHero ? "text-center" : "grid md:grid-cols-2 gap-16 items-center"}`}>
          {/* Text side */}
          <div className={`${isHero ? "max-w-2xl mx-auto" : ""}`}>
            {/* Section label */}
            <div className="flex items-center gap-3 mb-6" style={{ justifyContent: isHero ? "center" : "flex-start" }}>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Icon className={`w-5 h-5 ${slide.iconColor}`} />
              </div>
              <span className="text-xs font-bold uppercase tracking-[3px] text-white/40">{slide.section}</span>
            </div>

            {/* Title */}
            <h1 className={`font-bold text-white mb-4 leading-[1.1] tracking-tight ${isHero ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"}`}>
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className={`text-white/50 leading-relaxed mb-8 ${isHero ? "text-lg" : "text-base"}`}>
              {slide.subtitle}
            </p>

            {/* Bullets */}
            {slide.bullets && (
              <div className={`space-y-3 ${isHero ? "inline-block text-left" : ""}`}>
                {slide.bullets.map((b, i) => (
                  <div key={b} className="flex items-center gap-3 slide-bullet" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-sm text-white/70">{b}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA for hero/cta slides */}
            {isHero && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <a href="/signup" className="px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 transition text-sm">
                  Start Free Trial
                </a>
                <a href="/" className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition text-sm">
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Mockup side */}
          {!isHero && mockup && (
            <div className="flex justify-center mockup-float">
              {mockup}
            </div>
          )}
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[10px] text-white/20">
        <span>← → Navigate</span>
        <span>Space — Next</span>
        <span>P — Play/Pause</span>
        <span>ESC — Pause</span>
      </div>

      <style jsx global>{`
        .slide-bullet {
          opacity: 0;
          transform: translateX(-10px);
          animation: bulletIn 0.4s ease-out forwards;
        }
        @keyframes bulletIn {
          to { opacity: 1; transform: translateX(0); }
        }
        .mockup-float {
          animation: mockupFloat 4s ease-in-out infinite;
        }
        @keyframes mockupFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
