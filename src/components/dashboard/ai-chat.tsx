"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, Loader2 } from "lucide-react";

/**
 * SONJI AI CHAT — Floating sidebar assistant
 * 
 * Demo mode: responds with pre-built contextual answers
 * Production: would hit Claude API with CRM context
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DEMO_RESPONSES: Record<string, string> = {
  // Agency
  "brightview": "**Brightview Hotels** — Health Score: 92 ↑\n\nThey're your strongest client right now. March retainer payment of $8,500 processed on time. ROAS is up to 4.2x on branded campaigns. Last activity was 2 hours ago (opened your PPC report). No concerns — consider upselling Google Discovery ads based on their interest.",
  "sterling": "**Sterling Partners** — Health Score: 78 ↓\n\n⚠️ Renewal risk detected. Rocco flagged they're hinting at reducing scope. Retainer renewal is April 15 — 28 days away. Recommendation: Send the attribution report showing 340% organic traffic growth since engagement started. Schedule a strategy call this week.",
  "coastal": "**Coastal Real Estate** — Health Score: 38 ↓\n\n🚨 Critical ghosting alert. Email frequency dropped 80% (was 5/week, now 1/week). Account has been on hold for 12 days. LTV at risk: $72K. Recommended action: Personal call from account manager ASAP.",
  "revenue": "**March Revenue Summary**\n\nTotal MRR: $27,500\n- Brightview Hotels: $8,500/mo (active)\n- Sterling Partners: $10,000/mo (renewal risk)\n- Coastal Real Estate: $6,000/mo (on hold)\n- Harbor Dental: $5,000 project\n\nPipeline: $18,400 weighted\n3-Month Forecast: $33.5K → $36.7K → $33.7K\nOverall margin: 66.4%",
  "projects": "**Active Projects**\n\n1. Website Redesign — Meridian Law ($15K, 71% margin, 62/100h)\n2. SEO + PPC — Brightview Hotels ($8.5K/mo retainer, 57% margin)\n3. Brand Refresh — Summit Athletics ($12K, 84% margin, early stage)\n4. Full Stack — Sterling Partners ($10K/mo, 59% margin)\n\nResource loading: Colton at 95%, Rocco at 105% (overloaded). Consider redistributing Rocco's Coastal RE work.",
  "team": "**Team Performance**\n\n- Colton (PM/Strategy): 38/40h, $42K managed, $1,105/hr efficiency\n- Rocco (SEO/PPC): 42/40h ⚠️ overloaded, $24.5K managed\n- Mike (Developer): 36/40h, on track with Meridian website\n- Sarah (Designer): 32/40h, capacity available\n\nRecommendation: Rocco is over capacity. Assign Sarah to support the Coastal RE account if it reactivates.",
  "automations": "**Automation Performance (Last 30 Days)**\n\n🔥 Top performers:\n1. New Lead Auto-Response — 47 runs, <60 second response time\n2. Monthly Report Delivery — 15 reports auto-sent to clients\n3. Proposal Follow-Up Sequence — 12 drip sequences running\n\n⚠️ Triggered alerts:\n- Renewal Alert fired for 3 clients approaching contract end\n- Client Going Cold detected Coastal RE velocity drop\n- Scope Creep Detector flagged Meridian (draft — needs configuration)",
  "help": "I can help you with:\n\n📊 **Data queries**: \"How's Brightview doing?\" \"Show me revenue\" \"What's our pipeline?\"\n👥 **Team insights**: \"Who's overloaded?\" \"Team performance\" \"Resource loading\"\n🤖 **Automations**: \"Which automations fired?\" \"What alerts are active?\"\n📋 **Projects**: \"Active projects\" \"Meridian status\" \"Budget tracking\"\n💡 **Recommendations**: \"What should I focus on?\" \"Any concerns?\"\n\nJust ask naturally — I have full context on your CRM data.",
  "concerns": "**Top 3 Concerns Right Now**\n\n1. 🚨 **Coastal Real Estate** — Ghosting for 12 days, $72K LTV at risk. Action: Call today.\n\n2. ⚠️ **Sterling Partners** — Renewal in 28 days, hinting at scope reduction. Action: Send attribution report + schedule call.\n\n3. 📊 **Rocco is overloaded** — 42/40 hours, managing 4 active accounts. Action: Redistribute or hire.\n\nEverything else looks healthy. Brightview, Meridian, Summit, and Harbor are all on track.",
  "focus": "**Your Focus for Today**\n\n1. 📞 Call Coastal Real Estate — 12 days of silence, $72K at risk\n2. 📊 Review Sterling renewal strategy with Rocco\n3. ✅ Send March reports to Brightview + Harbor (auto-generated, ready to send)\n4. 👀 Check Meridian website QA progress (Mike is at 62/100h)\n5. 📋 Review Apex Construction discovery call notes\n\nYou have 3 meetings today and 2 unread messages.",
};

function findResponse(input: string): string {
  const q = input.toLowerCase();
  for (const [key, val] of Object.entries(DEMO_RESPONSES)) {
    if (q.includes(key)) return val;
  }
  if (q.includes("how") && q.includes("doing")) return DEMO_RESPONSES.concerns;
  if (q.includes("what should") || q.includes("priority") || q.includes("today")) return DEMO_RESPONSES.focus;
  if (q.includes("pipeline") || q.includes("money") || q.includes("mrr")) return DEMO_RESPONSES.revenue;
  if (q.includes("who") || q.includes("staff") || q.includes("hire")) return DEMO_RESPONSES.team;
  if (q.includes("workflow") || q.includes("trigger")) return DEMO_RESPONSES.automations;
  if (q.includes("project") || q.includes("budget") || q.includes("margin")) return DEMO_RESPONSES.projects;
  return DEMO_RESPONSES.help;
}

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = findResponse(userMsg);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-105 transition group">
          <Bot className="w-6 h-6" />
          <span className="absolute -top-2 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Sonji AI</h3>
                <p className="text-[10px] text-white/60">Ask anything about your business</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">Ask me anything</p>
                <p className="text-xs text-gray-400">Try: "How's Brightview doing?" or "What should I focus on today?"</p>
                <div className="mt-4 space-y-1.5">
                  {["How's revenue looking?", "Any concerns?", "Team performance", "Active projects"].map(q => (
                    <button key={q} onClick={() => { setInput(q); }}
                      className="block w-full text-left px-3 py-2 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-700 rounded-bl-md"
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{
                    __html: m.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                  }} />
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-2xl rounded-bl-md w-fit">
                <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                <span className="text-xs text-gray-400">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask Sonji AI..."
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              <button onClick={send} disabled={!input.trim() || typing}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
