"use client";

import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, Handshake, MessageSquare, BarChart3, Zap,
  Search, Bell, Plus, ArrowUpRight, Check, CheckCheck, Mail,
  Phone, Star, ChevronDown, FileText,
} from "lucide-react";

// ────────────────────────────────────
// COUNTER (animated number)
// ────────────────────────────────────

function Counter({ target, prefix = "" }: { target: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = `${prefix}${Math.round(target * ease).toLocaleString()}`;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, prefix]);
  return <span ref={ref}>{prefix}0</span>;
}

// ────────────────────────────────────
// TAB DEFINITIONS
// ────────────────────────────────────

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "deals", label: "Deals", icon: Handshake },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "automations", label: "Automations", icon: Zap },
];

// ────────────────────────────────────
// PANEL: DASHBOARD
// ────────────────────────────────────

function DashboardPanel() {
  const barHeights = [35, 42, 38, 55, 48, 62, 58, 72, 68, 78, 85, 95];
  return (
    <div className="p-5 bg-[#FAFAFA] h-full overflow-y-auto">
      <p className="text-[20px] font-bold tracking-tight mb-4 text-left text-gray-900">Good morning, Orlando</p>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { label: "Revenue", val: 48200, prefix: "$", color: "text-indigo-600", change: "↑ 24%" },
          { label: "Active Clients", val: 247, prefix: "", color: "text-emerald-600", change: "↑ 12" },
          { label: "Automations", val: 1840, prefix: "", color: "text-violet-600", change: "↑ 340" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-3.5 text-left hover:border-indigo-200 hover:shadow-sm transition cursor-default">
            <p className="text-[10px] uppercase tracking-[1px] text-gray-400 font-semibold mb-1">{s.label}</p>
            <p className={`text-[22px] font-extrabold font-mono tracking-tight ${s.color}`}><Counter target={s.val} prefix={s.prefix} /></p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{s.change}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-4 text-left">
        <p className="text-[11px] font-semibold text-gray-500 mb-2.5">Monthly Revenue</p>
        <div className="flex items-end gap-1.5 h-[90px]">
          {barHeights.map((h, i) => (
            <div key={i} className={`flex-1 rounded-t animate-bar-grow ${i % 2 === 0 ? "bg-indigo-500" : "bg-indigo-500/30"}`}
              style={{ height: `${h}%`, animationDelay: `${0.2 + i * 0.06}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────
// PANEL: CONTACTS
// ────────────────────────────────────

function ContactsPanel() {
  const [selected, setSelected] = useState<string | null>(null);
  const contacts = [
    { id: "1", name: "Mason Thompson", company: "Vertex Partners", email: "mason@vertexpartners.com", tag: "Hot Lead", tagColor: "bg-red-50 text-red-600", score: 92, status: "active" },
    { id: "2", name: "Sarah Chen", company: "DataFlow Solutions", email: "sarah@dataflow.com", tag: "Demo Set", tagColor: "bg-blue-50 text-blue-600", score: 78, status: "active" },
    { id: "3", name: "Lucas Anderson", company: "TechVentures Inc", email: "lucas@techventures.io", tag: "Enterprise", tagColor: "bg-indigo-50 text-indigo-600", score: 65, status: "active" },
    { id: "4", name: "Emily Rodriguez", company: "Pulse Media", email: "emily@pulsemedia.co", tag: "Nurture", tagColor: "bg-amber-50 text-amber-600", score: 41, status: "lead" },
    { id: "5", name: "Daniel Kim", company: "Fusion Labs", email: "daniel@fusionlabs.co", tag: "New", tagColor: "bg-emerald-50 text-emerald-600", score: 33, status: "lead" },
  ];

  return (
    <div className="p-4 bg-[#FAFAFA] h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Search 247 contacts..." className="w-full pl-8 pr-3 py-2 text-[11px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <button className="px-2.5 py-2 bg-indigo-600 text-white text-[10px] font-semibold rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {contacts.map((c) => (
          <div key={c.id} onClick={() => setSelected(selected === c.id ? null : c.id)}
            className={`flex items-center gap-3 px-3 py-2.5 border-b border-gray-50 cursor-pointer transition ${selected === c.id ? "bg-indigo-50/50" : "hover:bg-gray-50/70"}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-white">{c.name.split(" ").map(n => n[0]).join("")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-gray-900">{c.name}</p>
              <p className="text-[10px] text-gray-400">{c.company}</p>
            </div>
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${c.tagColor}`}>{c.tag}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${c.score >= 70 ? "bg-red-50 text-red-600" : c.score >= 40 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}>{c.score}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="mt-2 bg-white border border-indigo-100 rounded-xl p-3 animate-slideDown">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-3 h-3 text-gray-400" /><span className="text-[10px] text-gray-600">{contacts.find(c => c.id === selected)?.email}</span>
          </div>
          <div className="flex gap-1.5">
            <button className="flex-1 px-2 py-1.5 text-[9px] font-medium bg-indigo-50 text-indigo-600 rounded-md">Send Email</button>
            <button className="flex-1 px-2 py-1.5 text-[9px] font-medium bg-gray-100 text-gray-600 rounded-md">View Profile</button>
            <button className="flex-1 px-2 py-1.5 text-[9px] font-medium bg-gray-100 text-gray-600 rounded-md">Add Deal</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────
// PANEL: DEALS (Kanban)
// ────────────────────────────────────

function DealsPanel() {
  type Card = { id: string; name: string; val: string };
  type Column = { stage: string; color: string; cards: Card[] };

  const [columns, setColumns] = useState<Column[]>([
    { stage: "Lead", color: "bg-indigo-500", cards: [{ id: "d1", name: "Vertex Partners", val: "$24,000" }, { id: "d2", name: "DataFlow", val: "$8,500" }] },
    { stage: "Proposal", color: "bg-amber-500", cards: [{ id: "d3", name: "CloudPeak", val: "$15,750" }] },
    { stage: "Negotiation", color: "bg-violet-500", cards: [{ id: "d4", name: "TechVentures", val: "$42,000" }] },
    { stage: "Won", color: "bg-emerald-500", cards: [{ id: "d5", name: "Halo Collar", val: "$31,500" }, { id: "d6", name: "Fusion Labs", val: "$12,800" }] },
  ]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [lastMoved, setLastMoved] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  const totalValue = columns.reduce((s, col) => s + col.cards.reduce((cs, c) => cs + parseInt(c.val.replace(/[$,]/g, "")), 0), 0);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, cardId: string) => {
    setDragging(cardId);
    setShowHint(false);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
    const el = e.currentTarget;
    setTimeout(() => { el.style.opacity = "0.4"; }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDragging(null);
    setDragOverCol(null);
    e.currentTarget.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(stage);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    setDragOverCol(null);
    setDragging(null);

    setColumns((prev) => {
      // Find which column has this card
      let card: Card | null = null;
      let sourceStage = "";
      for (const col of prev) {
        const found = col.cards.find((c) => c.id === cardId);
        if (found) { card = found; sourceStage = col.stage; break; }
      }
      if (!card || sourceStage === targetStage) return prev;

      setLastMoved(cardId);
      setTimeout(() => setLastMoved(null), 1000);

      return prev.map((col) => {
        if (col.stage === sourceStage) return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        if (col.stage === targetStage) return { ...col, cards: [...col.cards, card!] };
        return col;
      });
    });
  };

  return (
    <div className="p-3 bg-[#FAFAFA] h-full flex flex-col">
      {/* Hint banner */}
      {showHint && (
        <div className="flex items-center justify-center gap-2 mb-2 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg animate-pulse">
          <span className="text-[10px]">👆</span>
          <span className="text-[10px] font-medium text-indigo-600">Try it — drag a deal to a new stage</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] font-semibold text-gray-700">Pipeline — <span className="text-indigo-600">${totalValue.toLocaleString()}</span></p>
        <button className="px-2 py-1 text-[9px] font-medium bg-indigo-600 text-white rounded-md flex items-center gap-1"><Plus className="w-2.5 h-2.5" /> Deal</button>
      </div>
      <div className="flex gap-2 flex-1 overflow-x-auto pb-1">
        {columns.map((col) => (
          <div key={col.stage} className="flex-1 min-w-[120px] flex flex-col"
            onDragOver={(e) => handleDragOver(e, col.stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.stage)}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-[10px] font-semibold text-gray-600">{col.stage}</span>
              <span className="text-[9px] text-gray-400 ml-auto">{col.cards.length}</span>
            </div>
            <div className={`space-y-1.5 flex-1 rounded-lg p-1.5 transition-all duration-200 ${
              dragOverCol === col.stage && dragging
                ? "bg-indigo-100/70 border-2 border-dashed border-indigo-300"
                : "bg-gray-100/50"
            }`}>
              {col.cards.map((c) => (
                <div key={c.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, c.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg p-2.5 border cursor-grab active:cursor-grabbing transition-all duration-200 ${
                    dragging === c.id
                      ? "opacity-40 scale-95 border-indigo-300"
                      : lastMoved === c.id
                        ? "border-emerald-300 shadow-md shadow-emerald-100 ring-2 ring-emerald-200"
                        : "border-gray-100 hover:shadow-md hover:-translate-y-0.5 hover:border-gray-200"
                  }`}>
                  <p className="text-[10px] font-semibold text-gray-800">{c.name}</p>
                  <p className="text-[10px] font-mono text-gray-500">{c.val}</p>
                  {lastMoved === c.id && (
                    <p className="text-[8px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Moved to {col.stage}
                    </p>
                  )}
                </div>
              ))}
              {col.cards.length === 0 && (
                <div className={`flex items-center justify-center h-16 rounded-lg border-2 border-dashed text-[9px] ${
                  dragOverCol === col.stage ? "border-indigo-300 text-indigo-400" : "border-gray-200 text-gray-300"
                }`}>
                  Drop here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────
// PANEL: MESSAGES
// ────────────────────────────────────

function MessagesPanel() {
  const [activeThread, setActiveThread] = useState(0);
  const threads = [
    { name: "Mason T.", msg: "Thanks for the proposal!", ch: "email", time: "2m", unread: true, messages: [
      { dir: "out", text: "Hi Mason — attached is the updated proposal with the revised pricing we discussed." },
      { dir: "in", text: "Thanks for the proposal! We're reviewing internally and should have feedback by Thursday." },
      { dir: "out", text: "Sounds great — let me know if you have any questions in the meantime!" },
      { dir: "in", text: "Quick question — can we schedule a 30 min call Wednesday to walk through implementation?" },
      { dir: "out", text: "Absolutely! I'll send over a calendar link shortly." },
    ]},
    { name: "Sarah C.", msg: "Thursday at 2pm works", ch: "sms", time: "28m", unread: true, messages: [
      { dir: "out", text: "Hi Sarah! Still good for the demo Thursday at 2pm EST?" },
      { dir: "in", text: "Thursday at 2pm works. Looking forward to it!" },
      { dir: "out", text: "Perfect, sending the invite now 🙌" },
      { dir: "in", text: "Got it! Can I bring our CTO along? He has some technical questions." },
      { dir: "out", text: "Of course — the more the merrier. See you both Thursday!" },
    ]},
    { name: "Daniel K.", msg: "Interested in switching from GHL", ch: "form", time: "5h", unread: false, messages: [
      { dir: "in", text: "Interested in your CRM. Currently on GoHighLevel but the hidden fees are killing us. Team of 8, ~3K contacts." },
      { dir: "out", text: "Hi Daniel! We hear that a lot from GHL users. Would love to show you how we handle that differently. Free this week for a quick demo?" },
    ]},
  ];

  const active = threads[activeThread];

  return (
    <div className="flex h-full bg-[#FAFAFA]">
      <div className="w-[40%] border-r border-gray-100 bg-white overflow-y-auto">
        {threads.map((t, i) => (
          <div key={t.name} onClick={() => setActiveThread(i)}
            className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition border-b border-gray-50 ${activeThread === i ? "bg-indigo-50/60" : "hover:bg-gray-50"}`}>
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">{t.name.split(" ").map(n => n[0]).join("")}</span>
              </div>
              {t.unread && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-600 rounded-full border-[1.5px] border-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] ${t.unread ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>{t.name}</span>
                <span className="text-[8px] text-gray-400">{t.time}</span>
              </div>
              <p className="text-[9px] text-gray-400 truncate">{t.msg}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col p-3">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {active.messages.map((m, i) => (
            <div key={i} className={`flex ${m.dir === "out" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-[10px] leading-relaxed ${
                m.dir === "out" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
          <input type="text" placeholder={`Reply to ${active.name}...`} className="flex-1 px-3 py-1.5 text-[10px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          <button className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><ArrowUpRight className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────
// PANEL: ANALYTICS
// ────────────────────────────────────

function AnalyticsPanel() {
  return (
    <div className="p-4 bg-[#FAFAFA] h-full overflow-y-auto">
      <p className="text-[12px] font-semibold text-gray-700 mb-3">Pipeline Analytics</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "Win Rate", value: "68%", color: "text-emerald-600" },
          { label: "Avg Deal Size", value: "$18,400", color: "text-indigo-600" },
          { label: "Sales Cycle", value: "23 days", color: "text-violet-600" },
          { label: "Pipeline Velocity", value: "$4,200/day", color: "text-blue-600" },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-indigo-200 transition cursor-default">
            <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">{m.label}</p>
            <p className={`text-[18px] font-bold font-mono ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-3">
        <p className="text-[10px] font-semibold text-gray-500 mb-2">Conversion Funnel</p>
        {[
          { stage: "Leads", count: 247, pct: 100, color: "bg-indigo-500" },
          { stage: "Qualified", count: 156, pct: 63, color: "bg-blue-500" },
          { stage: "Proposal", count: 89, pct: 36, color: "bg-violet-500" },
          { stage: "Won", count: 52, pct: 21, color: "bg-emerald-500" },
        ].map((s) => (
          <div key={s.stage} className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] text-gray-500 w-14">{s.stage}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${s.pct}%` }} />
            </div>
            <span className="text-[9px] font-mono text-gray-600 w-7 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────
// PANEL: AUTOMATIONS
// ────────────────────────────────────

function AutomationsPanel() {
  const [activeFlow, setActiveFlow] = useState(0);
  const flows = [
    { name: "New Lead Welcome", trigger: "Form Submitted", status: "Active", runs: 347, steps: ["Send welcome email", "Add 'New Lead' tag", "Create follow-up task", "Notify sales team"] },
    { name: "Deal Won", trigger: "Deal Stage → Won", status: "Active", runs: 52, steps: ["Send congrats email", "Create onboarding task", "Notify team"] },
    { name: "Re-engagement", trigger: "Manual / 30-day inactive", status: "Active", runs: 89, steps: ["Send nurture email", "Wait 3 days", "Check email opened?", "SMS if no open"] },
  ];

  return (
    <div className="p-4 bg-[#FAFAFA] h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold text-gray-700">Workflows</p>
        <button className="px-2 py-1 text-[9px] font-medium bg-indigo-600 text-white rounded-md flex items-center gap-1"><Plus className="w-2.5 h-2.5" /> New</button>
      </div>
      <div className="space-y-2">
        {flows.map((f, i) => (
          <div key={f.name} onClick={() => setActiveFlow(i)}
            className={`bg-white border rounded-xl p-3 cursor-pointer transition ${activeFlow === i ? "border-indigo-200 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-gray-900">{f.name}</span>
              <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{f.status}</span>
            </div>
            <p className="text-[9px] text-gray-400 mb-2">Trigger: {f.trigger} · {f.runs} runs</p>
            {activeFlow === i && (
              <div className="pt-2 border-t border-gray-100 space-y-1.5 animate-slideDown">
                {f.steps.map((step, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600">{j + 1}</div>
                    <span className="text-[10px] text-gray-600">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────
// MAIN INTERACTIVE DEMO
// ────────────────────────────────────

export default function InteractiveHeroDemo() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const panels: Record<string, React.ReactNode> = {
    dashboard: <DashboardPanel />,
    contacts: <ContactsPanel />,
    deals: <DealsPanel />,
    messages: <MessagesPanel />,
    analytics: <AnalyticsPanel />,
    automations: <AutomationsPanel />,
  };

  return (
    <div className="max-w-[1100px] mx-auto mt-16" style={{ perspective: "1200px" }}>
      <div className="bg-white border border-gray-200 rounded-[28px] shadow-xl overflow-hidden transition-transform duration-500" style={{ transform: "rotateX(2deg)" }}>
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6057]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex-1 text-center text-xs text-gray-400 font-mono">app.sonji.io</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] min-h-[420px]">
          {/* Sidebar */}
          <div className="bg-[#FAFBFC] border-r border-gray-100 py-4 hidden md:block">
            <div className="flex items-center gap-2 px-4 pb-3 mb-2 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">sonji<span className="text-violet-500">.</span></span>
            </div>
            <div className="space-y-0.5 px-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-[12px] font-medium rounded-lg transition relative ${
                      isActive ? "text-indigo-600 bg-indigo-50/70" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                    }`}>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-indigo-600 rounded-r" />}
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === "messages" && <span className="ml-auto w-4 h-4 bg-indigo-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">3</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="relative overflow-hidden h-[420px]">
            {/* Mobile tab bar */}
            <div className="flex md:hidden border-b border-gray-100 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 transition ${
                      activeTab === tab.id ? "text-indigo-600 border-indigo-600" : "text-gray-400 border-transparent"
                    }`}>
                    <Icon className="w-3.5 h-3.5" />{tab.label}
                  </button>
                );
              })}
            </div>

            {/* Panel with transition */}
            <div key={activeTab} className="animate-panelIn h-full">
              {panels[activeTab]}
            </div>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-[11px] text-gray-400 mt-4">Click the sidebar to explore each section</p>

      <style jsx global>{`
        @keyframes panelIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-panelIn { animation: panelIn 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 200px; } }
        .animate-slideDown { animation: slideDown 0.25s ease-out; }
        @keyframes barGrow { from { height: 0; } }
        .animate-bar-grow { animation: barGrow 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>
    </div>
  );
}
