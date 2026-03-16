"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useModal } from "@/components/modals/modal-provider";
import { useIndustry } from "@/lib/use-industry";
import {
  Search, Plus, Mail, MessageSquare, Phone, Star, Archive,
  Trash2, Reply, Forward, MoreHorizontal, X, Clock, Send,
  ChevronRight, Inbox, CheckCheck, AlertCircle, User,
} from "lucide-react";

// ─── TYPES ───

interface Message {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  channel: "email" | "sms" | "form";
  starred: boolean;
  read: boolean;
  time: string;
  date: string;
}

// ─── DEMO DATA ───

const INDUSTRY_MESSAGES: Record<string, Message[]> = {
  agency_consulting: [
    { id: "m1", from: "Brightview Hotels", fromEmail: "john@brightviewhotels.com", subject: "Re: March PPC Report", preview: "Thanks for sending over the report. The ROAS numbers look great this month, especially on the branded campaigns...", body: "Thanks for sending over the report. The ROAS numbers look great this month, especially on the branded campaigns. Can we schedule a call to discuss scaling the budget for Q2? We're thinking about adding Google Discovery ads.\n\nAlso, the landing page conversion rate jumped to 4.2% — whatever changes you made last week are working.", channel: "email", starred: true, read: false, time: "10:34 AM", date: "Today" },
    { id: "m2", from: "Summit Athletics", fromEmail: "mark@summitathletics.com", subject: "Brand guidelines feedback", preview: "Love the color palette direction. Two notes: can we try a darker navy for the primary instead of the current blue?", body: "Love the color palette direction. Two notes:\n\n1. Can we try a darker navy for the primary instead of the current blue?\n2. The serif font for headings feels a bit formal — can we see a modern sans-serif option?\n\nOtherwise, the mood board is exactly what we envisioned.", channel: "email", starred: false, read: false, time: "9:15 AM", date: "Today" },
    { id: "m3", from: "Meridian Law Group", fromEmail: "amanda@meridianlaw.com", subject: "Website review — a few changes", preview: "The homepage looks fantastic! Just a few tweaks we'd like before we sign off on the final design...", body: "The homepage looks fantastic! Just a few tweaks:\n\n- Attorney bio photos need to be larger on desktop\n- Practice area icons should link to their respective pages\n- Footer needs to include our bar registration numbers\n\nTimeline still looking good for April 1 launch?", channel: "email", starred: false, read: true, time: "Yesterday", date: "Yesterday" },
    { id: "m4", from: "New Lead: Apex Construction", fromEmail: "form@sonji.io", subject: "Contact form submission", preview: "Name: Jake Morrison | Company: Apex Construction | Interest: Social media management for commercial projects", body: "New contact form submission:\n\nName: Jake Morrison\nCompany: Apex Construction\nEmail: jake@apexconstruction.com\nPhone: (239) 555-0198\nInterest: Social media management for commercial projects\nBudget: $2,500-5,000/mo\nNote: 'Referred by Harbor Dental'", channel: "form", starred: false, read: false, time: "Yesterday", date: "Yesterday" },
    { id: "m5", from: "Harbor Dental", fromEmail: "lisa@harbordental.com", subject: "Re: Content calendar for April", preview: "Approved! Please go ahead and schedule all posts. The before/after photos are ready in the shared drive.", body: "Approved! Please go ahead and schedule all posts. The before/after photos are ready in the shared drive.\n\nOne addition — can we add a post about our new teeth whitening special ($199) launching April 15?", channel: "email", starred: false, read: true, time: "2 days ago", date: "Mar 14" },
    { id: "m6", from: "Rocco", fromEmail: "rocco@powermarketing.com", subject: "Sterling Partners — renewal strategy", preview: "Hey, just got off the phone with Sterling. They're happy but hinting at possibly reducing scope. Let's hop on a call...", body: "Hey, just got off the phone with Sterling. They're happy but hinting at possibly reducing scope to save budget. Let's hop on a call before their renewal on April 15 to discuss our counter-strategy.\n\nI'm thinking we show them the attribution report — their organic traffic is up 340% since we started. Hard to argue with that.", channel: "email", starred: true, read: true, time: "2 days ago", date: "Mar 14" },
  ],
  health_wellness: [
    { id: "m1", from: "Sarah Thompson", fromEmail: "sarah.t@gmail.com", subject: "Question about my weight loss program", preview: "Hi! I'm on week 4 and wanted to ask about adjusting my dosage. I've been feeling great but the weight loss has slowed...", body: "Hi! I'm on week 4 of the Semaglutide program and wanted to ask about adjusting my dosage. I've been feeling great but the weight loss has slowed down this week.\n\nAlso, is it normal to feel more hungry in the evenings? Should I be concerned?\n\nThanks!", channel: "email", starred: false, read: false, time: "11:20 AM", date: "Today" },
    { id: "m2", from: "Maria Santos", fromEmail: "(305) 555-0142", subject: "SMS", preview: "Hi, can I reschedule my Botox appointment from Thursday to Friday? Same time works for me.", body: "Hi, can I reschedule my Botox appointment from Thursday to Friday? Same time works for me.", channel: "sms", starred: false, read: false, time: "10:05 AM", date: "Today" },
    { id: "m3", from: "New Patient Inquiry", fromEmail: "form@sonji.io", subject: "Intake form submission", preview: "Name: Emily Rodriguez | Interest: Botox consultation | How did you hear about us: Google search", body: "New patient intake:\n\nName: Emily Rodriguez\nEmail: emily.r@gmail.com\nPhone: (239) 555-0234\nInterest: Botox consultation\nDate of Birth: 1988-06-15\nHow did you hear about us: Google search", channel: "form", starred: false, read: false, time: "9:30 AM", date: "Today" },
    { id: "m4", from: "David Kim", fromEmail: "david.kim@outlook.com", subject: "Re: IV Therapy follow-up", preview: "Feeling much better after the session! Definitely want to book the 4-pack. What's the best way to pay?", body: "Feeling much better after the session! Energy levels are way up.\n\nDefinitely want to book the 4-pack. What's the best way to pay? Do you take HSA cards?", channel: "email", starred: true, read: true, time: "Yesterday", date: "Yesterday" },
    { id: "m5", from: "Google Review Alert", fromEmail: "noreply@google.com", subject: "New review from Michael Brown", preview: "⭐⭐⭐⭐⭐ 'Amazing results, so professional. Dr. Kim is incredible. Already booked my next appointment!'", body: "New Google Review (5 stars):\n\n'Amazing results, so professional. Dr. Kim is incredible. The entire staff made me feel comfortable from the moment I walked in. Already booked my next appointment!'\n\n— Michael Brown", channel: "email", starred: true, read: true, time: "Yesterday", date: "Yesterday" },
  ],
  ecommerce: [
    { id: "m1", from: "Wayne Barry", fromEmail: "wayne.b@gmail.com", subject: "How do I upgrade to yearly?", preview: "Hey, I've been on monthly for 3 months now and want to switch to the yearly VIP plan. How do I do that?", body: "Hey, I've been on monthly for 3 months now and want to switch to the yearly VIP plan. How do I do that? Also, do I get credit for the months I already paid?", channel: "email", starred: false, read: false, time: "2:15 PM", date: "Today" },
    { id: "m2", from: "Chris Persaud", fromEmail: "(305) 555-0198", subject: "SMS", preview: "Picks were fire today 🔥🔥🔥 4-0 on NCAAB. Thanks bro", body: "Picks were fire today 🔥🔥🔥 4-0 on NCAAB. Thanks bro", channel: "sms", starred: true, read: true, time: "11:30 AM", date: "Today" },
    { id: "m3", from: "Stripe", fromEmail: "notifications@stripe.com", subject: "Payment failed — Andrew Krieman", preview: "The recurring payment of $165.00 for Andrew Krieman (VIP Monthly) failed. Reason: card_declined.", body: "Payment Failed\n\nCustomer: Andrew Krieman\nAmount: $165.00\nPlan: VIP Monthly\nReason: card_declined\nRetry: Scheduled for Mar 18\n\nAction: Update payment method or contact customer.", channel: "email", starred: false, read: false, time: "8:00 AM", date: "Today" },
    { id: "m4", from: "Tyler McLaughlin", fromEmail: "tyler.m@yahoo.com", subject: "Feature request", preview: "Any chance you could add NFL player props to the picks? Would love to see that as a VIP feature.", body: "Any chance you could add NFL player props to the picks? I know it's offseason now but would love to see that as a VIP feature when the season starts.\n\nAlso, the Telegram channel is clutch. Keep it up!", channel: "email", starred: false, read: true, time: "Yesterday", date: "Yesterday" },
  ],
};

const DEFAULT_MESSAGES: Message[] = [
  { id: "m1", from: "New Contact", fromEmail: "form@sonji.io", subject: "Contact form submission", preview: "New contact submitted through your website form.", body: "New contact form submission received.", channel: "form", starred: false, read: false, time: "2 hours ago", date: "Today" },
];

// ─── MAIN COMPONENT ───

export default function MessagesPage() {
  const { openModal } = useModal();
  const ic = useIndustry();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = demoIndustry || "ecommerce";
    const msgs = INDUSTRY_MESSAGES[key] || DEFAULT_MESSAGES;
    setMessages(msgs);
    if (msgs.length > 0) setSelected(msgs[0]);
  }, []);

  const filtered = messages.filter(m => {
    if (search) { const q = search.toLowerCase(); if (!m.from.toLowerCase().includes(q) && !m.subject.toLowerCase().includes(q) && !m.preview.toLowerCase().includes(q)) return false; }
    if (filter === "unread" && m.read) return false;
    if (filter === "starred" && !m.starred) return false;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  const markRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const toggleStar = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
  };

  const channelIcon = (ch: string) => ch === "sms" ? <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> : ch === "form" ? <Inbox className="w-3.5 h-3.5 text-violet-500" /> : <Mail className="w-3.5 h-3.5 text-blue-500" />;

  return (
    <>
      <Header title="Messages" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
          <div className="flex h-full">

            {/* LEFT — Message List */}
            <div className="w-[380px] border-r border-gray-100 flex flex-col">
              {/* Toolbar */}
              <div className="p-3 border-b border-gray-100 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <button onClick={() => openModal("email")} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {[{ key: "all" as const, label: `All (${messages.length})` }, { key: "unread" as const, label: `Unread (${unreadCount})` }, { key: "starred" as const, label: "Starred" }].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${filter === f.key ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto">
                {filtered.map(m => (
                  <button key={m.id} onClick={() => { setSelected(m); markRead(m.id); }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                      selected?.id === m.id ? "bg-indigo-50/50 border-l-2 border-l-indigo-500" : ""
                    } ${!m.read ? "bg-blue-50/30" : ""}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        {channelIcon(m.channel)}
                        <span className={`text-sm ${!m.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{m.from}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {m.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                        {!m.read && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                        <span className="text-[10px] text-gray-400">{m.time}</span>
                      </div>
                    </div>
                    <p className={`text-xs ${!m.read ? "font-medium text-gray-800" : "text-gray-600"} truncate`}>{m.subject}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{m.preview}</p>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="p-8 text-center"><p className="text-sm text-gray-400">No messages</p></div>
                )}
              </div>
            </div>

            {/* RIGHT — Message Detail */}
            <div className="flex-1 flex flex-col">
              {selected ? (
                <>
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">{selected.from[0]}</span>
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-gray-900">{selected.from}</h2>
                          <p className="text-xs text-gray-400">{selected.fromEmail} · {selected.date} at {selected.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleStar(selected.id)} className={`p-2 rounded-lg transition ${selected.starred ? "text-amber-400 bg-amber-50" : "text-gray-400 hover:bg-gray-100"}`}>
                          <Star className={`w-4 h-4 ${selected.starred ? "fill-amber-400" : ""}`} />
                        </button>
                        <button onClick={() => openModal("email", { prefillTo: selected.fromEmail, prefillSubject: `Re: ${selected.subject}` })} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                          <Reply className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{selected.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {channelIcon(selected.channel)}
                      <span className="text-xs text-gray-400 capitalize">{selected.channel === "form" ? "Form Submission" : selected.channel}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {selected.body}
                    </div>
                  </div>

                  {/* Quick Reply */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Type a quick reply..."
                        className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                        <Send className="w-4 h-4" /> Reply
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Select a message to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
