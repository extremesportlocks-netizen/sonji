"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, Users, Handshake, Building2, CheckSquare, Calendar, Send,
  MessageSquare, BarChart3, FileText, Settings, Workflow, Activity,
  ClipboardList, DollarSign, Puzzle, Plus, Zap, ArrowRight, Loader2,
  Sparkles, LayoutDashboard, Crown, Mail, Phone, ExternalLink,
} from "lucide-react";

// ─── TYPES ───

interface SearchResult {
  id: string;
  type: "contact" | "deal" | "company" | "task";
  title: string;
  subtitle: string;
  url: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  keywords: string;
}

interface ActionItem {
  label: string;
  desc: string;
  icon: React.ElementType;
  action: () => void;
  keywords: string;
}

// ─── DATA ───

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: "home overview stats" },
  { label: "Contacts", href: "/dashboard/contacts", icon: Users, keywords: "people customers leads" },
  { label: "Companies", href: "/dashboard/companies", icon: Building2, keywords: "organizations businesses" },
  { label: "Deals", href: "/dashboard/deals", icon: Handshake, keywords: "pipeline opportunities sales" },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, keywords: "todo checklist" },
  { label: "Meetings", href: "/dashboard/meetings", icon: Calendar, keywords: "appointments schedule" },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, keywords: "inbox email sms" },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: Send, keywords: "email blast marketing" },
  { label: "Forms", href: "/dashboard/forms", icon: ClipboardList, keywords: "intake builder" },
  { label: "Invoices", href: "/dashboard/invoices", icon: DollarSign, keywords: "billing payments" },
  { label: "Activities", href: "/dashboard/activities", icon: Activity, keywords: "feed log history" },
  { label: "Reports", href: "/dashboard/reports", icon: FileText, keywords: "revenue analytics data" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, keywords: "charts metrics" },
  { label: "Workflows", href: "/dashboard/workflows", icon: Workflow, keywords: "automation triggers" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, keywords: "account preferences" },
  { label: "Integrations", href: "/dashboard/settings?tab=integrations", icon: Puzzle, keywords: "stripe resend twilio slack connect" },
];

type Mode = "search" | "ai";

// ─── COMPONENT ───

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("search");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") { setOpen(false); setQuery(""); setMode("search"); setResults([]); setActiveIdx(0); }
    };
    const openHandler = () => setOpen(true);
    window.addEventListener("keydown", handler);
    document.addEventListener("sonji:open-command-palette", openHandler);
    return () => { window.removeEventListener("keydown", handler); document.removeEventListener("sonji:open-command-palette", openHandler); };
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  // ── Search logic ──
  const handleQueryChange = (q: string) => {
    setQuery(q);
    setActiveIdx(0);

    if (q.startsWith("/ai ") || q.startsWith("/ask ")) {
      setMode("ai");
      return;
    }
    setMode("search");

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setResults([]); return; }

    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
        const data = await res.json();
        setResults(data.data || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 200);
  };

  // ── AI handler ──
  const handleAiSubmit = async () => {
    const aiQuery = query.replace(/^\/(ai|ask)\s+/, "").trim();
    if (!aiQuery) return;

    const newMessages = [...aiMessages, { role: "user", content: aiQuery }];
    setAiMessages(newMessages);
    setQuery("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: aiQuery, history: newMessages.slice(-10) }),
      });
      const data = await res.json();
      setAiMessages([...newMessages, { role: "assistant", content: data.response || data.error || "No response" }]);
    } catch {
      setAiMessages([...newMessages, { role: "assistant", content: "AI is not configured yet. Add ANTHROPIC_API_KEY to Vercel env vars." }]);
    } finally { setAiLoading(false); }
  };

  // ── Filter nav + actions ──
  const filteredNav = query.length > 0 ? navItems.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase()) ||
    n.keywords.toLowerCase().includes(query.toLowerCase())
  ) : [];

  const actions: ActionItem[] = [
    { label: "Create Contact", desc: "Add a new contact", icon: Plus, keywords: "new add person", action: () => { setOpen(false); document.dispatchEvent(new CustomEvent("sonji:modal", { detail: "contact" })); } },
    { label: "Create Deal", desc: "Start a new deal", icon: Plus, keywords: "new pipeline opportunity", action: () => { setOpen(false); document.dispatchEvent(new CustomEvent("sonji:modal", { detail: "deal" })); } },
    { label: "Send Campaign", desc: "Create an email campaign", icon: Send, keywords: "email blast marketing", action: () => { setOpen(false); router.push("/dashboard/campaigns"); } },
    { label: "Sync Stripe", desc: "Import customers from Stripe", icon: Zap, keywords: "import stripe data sync", action: () => { setOpen(false); router.push("/dashboard/settings?tab=integrations"); } },
  ];

  const filteredActions = query.length > 0 ? actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.keywords.toLowerCase().includes(query.toLowerCase())
  ) : actions;

  // ── Navigate ──
  const allItems = [
    ...results.map((r) => ({ category: "result" as const, ...r })),
    ...filteredNav.map((n) => ({ category: "nav" as const, ...n })),
    ...filteredActions.map((a) => ({ category: "action" as const, ...a })),
  ];

  const handleSelect = (idx: number) => {
    const item = allItems[idx];
    if (!item) return;
    if (item.category === "result") { router.push((item as any).url); setOpen(false); setQuery(""); }
    else if (item.category === "nav") { router.push((item as any).href); setOpen(false); setQuery(""); }
    else if (item.category === "action") { (item as any).action(); setQuery(""); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mode === "ai" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiSubmit(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, allItems.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && mode === "search") { e.preventDefault(); handleSelect(activeIdx); }
    else if (e.key === "Tab") { e.preventDefault(); setMode(mode === "search" ? "ai" : "search"); setQuery(mode === "search" ? "/ai " : ""); }
  };

  const typeIcons: Record<string, React.ElementType> = { contact: Users, deal: Handshake, company: Building2, task: CheckSquare };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => { setOpen(false); setQuery(""); setMode("search"); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative max-w-2xl mx-auto mt-[15vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

          {/* Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            {mode === "ai" ? (
              <Sparkles className="w-5 h-5 text-violet-500 flex-shrink-0" />
            ) : (
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === "ai" ? "Ask AI anything about your CRM data..." : "Search contacts, navigate, or type /ai to ask AI..."}
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
              autoComplete="off"
            />
            {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => { setMode(mode === "ai" ? "search" : "ai"); setQuery(mode === "search" ? "/ai " : ""); }}
                className={`px-2 py-1 text-[10px] font-semibold rounded-md transition ${mode === "ai" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500 hover:bg-violet-50 hover:text-violet-600"}`}>
                <Sparkles className="w-3 h-3 inline mr-1" />AI
              </button>
              <kbd className="text-[10px] font-mono bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">esc</kbd>
            </div>
          </div>

          {/* Results / AI Chat */}
          <div className="max-h-[50vh] overflow-y-auto">

            {/* AI MODE */}
            {mode === "ai" && (
              <div className="p-4">
                {aiMessages.length === 0 && !aiLoading && (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-violet-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-900">Ask AI about your CRM</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      "Who are my top 5 lapsed whales?" · "Draft a re-engagement email" · "How many active subscribers do I have?"
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  {aiMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                        m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-3 py-2 rounded-xl"><Loader2 className="w-4 h-4 text-gray-400 animate-spin" /></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEARCH MODE */}
            {mode === "search" && (
              <>
                {/* CRM Results */}
                {results.length > 0 && (
                  <div className="px-2 py-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Results</p>
                    {results.map((r, i) => {
                      const Icon = typeIcons[r.type] || Users;
                      const globalIdx = i;
                      return (
                        <button key={r.id} onClick={() => { router.push(r.url); setOpen(false); setQuery(""); }}
                          onMouseEnter={() => setActiveIdx(globalIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                            activeIdx === globalIdx ? "bg-indigo-50" : "hover:bg-gray-50"
                          }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            r.type === "contact" ? "bg-indigo-100 text-indigo-600" :
                            r.type === "deal" ? "bg-blue-100 text-blue-600" :
                            "bg-gray-100 text-gray-500"
                          }`}><Icon className="w-4 h-4" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                            <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">{r.type}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Navigation */}
                {filteredNav.length > 0 && (
                  <div className="px-2 py-2 border-t border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Pages</p>
                    {filteredNav.slice(0, 5).map((n, i) => {
                      const globalIdx = results.length + i;
                      return (
                        <button key={n.href} onClick={() => { router.push(n.href); setOpen(false); setQuery(""); }}
                          onMouseEnter={() => setActiveIdx(globalIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition ${
                            activeIdx === globalIdx ? "bg-indigo-50" : "hover:bg-gray-50"
                          }`}>
                          <n.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{n.label}</span>
                          <ArrowRight className="w-3 h-3 text-gray-300 ml-auto flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                {filteredActions.length > 0 && (
                  <div className="px-2 py-2 border-t border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Actions</p>
                    {filteredActions.map((a, i) => {
                      const globalIdx = results.length + filteredNav.length + i;
                      return (
                        <button key={a.label} onClick={() => a.action()}
                          onMouseEnter={() => setActiveIdx(globalIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition ${
                            activeIdx === globalIdx ? "bg-indigo-50" : "hover:bg-gray-50"
                          }`}>
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <a.icon className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700">{a.label}</p>
                            <p className="text-xs text-gray-400">{a.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Empty state */}
                {query.length >= 2 && results.length === 0 && filteredNav.length === 0 && !loading && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500">No results for "{query}"</p>
                    <p className="text-xs text-gray-400 mt-1">Try searching for a contact name, email, or page</p>
                  </div>
                )}

                {/* Default state — no query */}
                {query.length === 0 && (
                  <div className="px-2 py-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Quick Actions</p>
                    {actions.map((a, i) => (
                      <button key={a.label} onClick={() => a.action()}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition ${
                          activeIdx === i ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}>
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <a.icon className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{a.label}</p>
                          <p className="text-xs text-gray-400">{a.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span><kbd className="font-mono bg-white border border-gray-200 rounded px-1 py-0.5">↑↓</kbd> navigate</span>
              <span><kbd className="font-mono bg-white border border-gray-200 rounded px-1 py-0.5">↵</kbd> select</span>
              <span><kbd className="font-mono bg-white border border-gray-200 rounded px-1 py-0.5">tab</kbd> toggle AI</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Powered by Claude</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
