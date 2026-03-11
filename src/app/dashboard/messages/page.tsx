"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Search,
  Send,
  Paperclip,
  MoreHorizontal,
  Phone,
  Video,
  Mail,
  MessageSquare,
  FileText,
  Star,
  Archive,
  Trash2,
  ChevronDown,
  Circle,
  Check,
  CheckCheck,
  Clock,
  X,
  Plus,
  Filter,
  Inbox,
  Users,
  Building2,
  Tag,
  ExternalLink,
  Smile,
  Image,
  AtSign,
} from "lucide-react";

// ────────────────────────────────────
// TYPES
// ────────────────────────────────────

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  channel: "email" | "sms" | "form";
  body: string;
  subject?: string;
  timestamp: string;
  status: "sent" | "delivered" | "read" | "failed";
}

interface Conversation {
  id: string;
  contactName: string;
  contactAvatar: string;
  contactEmail: string;
  contactPhone: string;
  company: string;
  lastMessage: string;
  lastChannel: "email" | "sms" | "form";
  lastTime: string;
  unread: boolean;
  starred: boolean;
  tags: string[];
  messages: Message[];
}

// ────────────────────────────────────
// MOCK DATA
// ────────────────────────────────────

const mockConversations: Conversation[] = [
  {
    id: "c1", contactName: "Mason Thompson", contactAvatar: "MT", contactEmail: "mason@vertexpartners.com", contactPhone: "(305) 555-0142", company: "Vertex Partners",
    lastMessage: "Thanks for the proposal! We're reviewing internally and should have feedback by Thursday.", lastChannel: "email", lastTime: "2 min ago", unread: true, starred: true, tags: ["Hot Lead", "Enterprise"],
    messages: [
      { id: "m1", direction: "outbound", channel: "email", subject: "Re: Q2 Partnership Proposal", body: "Hi Mason,\n\nAttached is the updated proposal with the revised pricing tiers we discussed. The implementation timeline starts at 2 weeks for Phase 1.\n\nLet me know if you have any questions — happy to jump on a call.", timestamp: "Today at 10:15 AM", status: "delivered" },
      { id: "m2", direction: "inbound", channel: "email", subject: "Re: Q2 Partnership Proposal", body: "Thanks for the proposal! We're reviewing internally and should have feedback by Thursday. The pricing looks competitive — our main question is around the onboarding timeline.\n\nCan we schedule a 30-min call for Wednesday to walk through the implementation steps?", timestamp: "Today at 10:32 AM", status: "read" },
    ],
  },
  {
    id: "c2", contactName: "Sarah Chen", contactAvatar: "SC", contactEmail: "sarah@dataflowsolutions.com", contactPhone: "(415) 555-0198", company: "DataFlow Solutions",
    lastMessage: "Just confirmed — we're good for the Thursday demo at 2pm EST.", lastChannel: "sms", lastTime: "28 min ago", unread: true, starred: false, tags: ["Demo Scheduled"],
    messages: [
      { id: "m3", direction: "outbound", channel: "sms", body: "Hi Sarah! Just following up on the demo we discussed. Are you still available Thursday at 2pm EST?", timestamp: "Today at 9:45 AM", status: "delivered" },
      { id: "m4", direction: "inbound", channel: "sms", body: "Just confirmed — we're good for the Thursday demo at 2pm EST.", timestamp: "Today at 10:04 AM", status: "read" },
      { id: "m5", direction: "outbound", channel: "sms", body: "Perfect! I'll send over the calendar invite and demo link shortly. Looking forward to it 🙌", timestamp: "Today at 10:05 AM", status: "delivered" },
    ],
  },
  {
    id: "c3", contactName: "Lucas Anderson", contactAvatar: "LA", contactEmail: "lucas@techventures.io", contactPhone: "(212) 555-0167", company: "TechVentures Inc",
    lastMessage: "We need the SOC 2 compliance documentation before our CFO will approve. Can you send that over?", lastChannel: "email", lastTime: "1 hour ago", unread: false, starred: true, tags: ["Compliance"],
    messages: [
      { id: "m6", direction: "inbound", channel: "email", subject: "SOC 2 Documentation Request", body: "Hi there,\n\nWe need the SOC 2 compliance documentation before our CFO will approve. Can you send that over? We're also going to need a data processing agreement.\n\nTimeline is tight — board meeting is next Friday.", timestamp: "Today at 9:15 AM", status: "read" },
      { id: "m7", direction: "outbound", channel: "email", subject: "Re: SOC 2 Documentation Request", body: "Hi Lucas,\n\nAbsolutely — I'm pulling the SOC 2 report and DPA together now. You'll have both by end of day tomorrow.\n\nAnything else the CFO will need for the board meeting?", timestamp: "Today at 9:30 AM", status: "delivered" },
    ],
  },
  {
    id: "c4", contactName: "Aiden Parker", contactAvatar: "AP", contactEmail: "aiden@brightdynamics.com", contactPhone: "(678) 555-0134", company: "Bright Dynamics",
    lastMessage: "Got it, thanks! The revised SOW looks great. I'll get this signed and back to you by Monday.", lastChannel: "email", lastTime: "3 hours ago", unread: false, starred: false, tags: ["Closing"],
    messages: [
      { id: "m8", direction: "outbound", channel: "email", subject: "Updated SOW — Bright Dynamics", body: "Hi Aiden,\n\nHere's the revised Statement of Work with the changes we discussed:\n- Implementation timeline extended to 6 weeks\n- Added the custom reporting module\n- Adjusted pricing to reflect the annual commitment\n\nPlease review and let me know if everything looks good.", timestamp: "Today at 7:00 AM", status: "delivered" },
      { id: "m9", direction: "inbound", channel: "email", subject: "Re: Updated SOW — Bright Dynamics", body: "Got it, thanks! The revised SOW looks great. I'll get this signed and back to you by Monday.", timestamp: "Today at 7:22 AM", status: "read" },
    ],
  },
  {
    id: "c5", contactName: "Daniel Kim", contactAvatar: "DK", contactEmail: "daniel@fusionlabs.co", contactPhone: "(510) 555-0189", company: "Fusion Labs",
    lastMessage: "Interested in learning more about your CRM platform. We're currently on GoHighLevel but looking to switch.", lastChannel: "form", lastTime: "5 hours ago", unread: true, starred: false, tags: ["Inbound", "GHL Switch"],
    messages: [
      { id: "m10", direction: "inbound", channel: "form", body: "Interested in learning more about your CRM platform. We're currently on GoHighLevel but looking to switch. Main pain points are email deliverability and hidden fees. Team of 8 people, ~3,000 contacts.\n\nBest time to reach me is afternoons EST.", timestamp: "Today at 5:30 AM", status: "read" },
    ],
  },
  {
    id: "c6", contactName: "Emily Rodriguez", contactAvatar: "ER", contactEmail: "emily@pulsemedia.co", contactPhone: "(323) 555-0156", company: "Pulse Media",
    lastMessage: "Can you resend the invoice? It looks like the link expired.", lastChannel: "sms", lastTime: "Yesterday", unread: false, starred: false, tags: ["Billing"],
    messages: [
      { id: "m11", direction: "inbound", channel: "sms", body: "Can you resend the invoice? It looks like the link expired.", timestamp: "Yesterday at 4:15 PM", status: "read" },
      { id: "m12", direction: "outbound", channel: "sms", body: "Just resent it! Check your email — should be there now. Let me know if you have any issues.", timestamp: "Yesterday at 4:20 PM", status: "delivered" },
      { id: "m13", direction: "inbound", channel: "sms", body: "Got it, paid! Thanks for the quick turnaround 👍", timestamp: "Yesterday at 4:45 PM", status: "read" },
    ],
  },
  {
    id: "c7", contactName: "Jackson Brooks", contactAvatar: "JB", contactEmail: "jackson@halocollar.com", contactPhone: "(904) 555-0123", company: "Halo Collar",
    lastMessage: "The demo was impressive. Our team wants to move forward with a pilot program.", lastChannel: "email", lastTime: "Yesterday", unread: false, starred: true, tags: ["Pilot", "Won"],
    messages: [
      { id: "m14", direction: "inbound", channel: "email", subject: "Moving Forward — Pilot Program", body: "Hi,\n\nThe demo was impressive. Our team wants to move forward with a pilot program. Can you send over the pilot agreement and pricing?\n\nWe'd like to start with 5 users and evaluate over 30 days.", timestamp: "Yesterday at 2:00 PM", status: "read" },
    ],
  },
];

const channelIcons: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  email: { icon: Mail, color: "text-blue-600", bg: "bg-blue-50", label: "Email" },
  sms: { icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50", label: "SMS" },
  form: { icon: FileText, color: "text-violet-600", bg: "bg-violet-50", label: "Form" },
};

const tagColors: Record<string, string> = {
  "Hot Lead": "bg-red-50 text-red-600 border-red-200",
  "Enterprise": "bg-indigo-50 text-indigo-600 border-indigo-200",
  "Demo Scheduled": "bg-blue-50 text-blue-600 border-blue-200",
  "Compliance": "bg-amber-50 text-amber-600 border-amber-200",
  "Closing": "bg-emerald-50 text-emerald-600 border-emerald-200",
  "Inbound": "bg-violet-50 text-violet-600 border-violet-200",
  "GHL Switch": "bg-orange-50 text-orange-600 border-orange-200",
  "Billing": "bg-gray-50 text-gray-600 border-gray-200",
  "Pilot": "bg-cyan-50 text-cyan-600 border-cyan-200",
  "Won": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ────────────────────────────────────
// PAGE
// ────────────────────────────────────

export default function MessagesPage() {
  const [activeConvo, setActiveConvo] = useState<Conversation>(mockConversations[0]);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [composing, setComposing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyChannel, setReplyChannel] = useState<"email" | "sms">("email");

  const filtered = mockConversations.filter((c) => {
    const matchSearch = search === "" || `${c.contactName} ${c.company} ${c.lastMessage}`.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channelFilter === "all" || c.lastChannel === channelFilter;
    return matchSearch && matchChannel;
  });

  const unreadCount = mockConversations.filter((c) => c.unread).length;

  return (
    <>
      <Header title="Messages" subtitle={`${unreadCount} unread`} />

      <div className="flex h-[calc(100vh-130px)]">
        {/* ═══ LEFT: Conversation List ═══ */}
        <div className="w-[360px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
          {/* Search + Filter Bar */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <div className="flex items-center gap-1">
              {[
                { key: "all", label: "All", count: mockConversations.length },
                { key: "email", label: "Email" },
                { key: "sms", label: "SMS" },
                { key: "form", label: "Forms" },
              ].map((f) => (
                <button key={f.key} onClick={() => setChannelFilter(f.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                    channelFilter === f.key ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {f.label}
                </button>
              ))}
              <div className="flex-1" />
              <button onClick={() => setComposing(true)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="New message">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((convo) => {
              const ch = channelIcons[convo.lastChannel];
              const ChIcon = ch.icon;
              const isActive = activeConvo.id === convo.id;

              return (
                <button key={convo.id} onClick={() => setActiveConvo(convo)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 transition ${
                    isActive ? "bg-indigo-50/60" : "hover:bg-gray-50/70"
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{convo.contactAvatar}</span>
                      </div>
                      {convo.unread && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm truncate ${convo.unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                          {convo.contactName}
                        </span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{convo.lastTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-gray-400">{convo.company}</span>
                        <ChIcon className={`w-3 h-3 ${ch.color}`} />
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${convo.unread ? "text-gray-700" : "text-gray-400"}`}>
                        {convo.lastMessage}
                      </p>
                    </div>
                  </div>
                  {convo.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 ml-[52px]">
                      {convo.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${tagColors[tag] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                          {tag}
                        </span>
                      ))}
                      {convo.tags.length > 2 && <span className="text-[9px] text-gray-400">+{convo.tags.length - 2}</span>}
                    </div>
                  )}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-4 py-12 text-center">
                <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ CENTER: Message Thread ═══ */}
        <div className="flex-1 flex flex-col bg-[#FAFAFA]">
          {/* Thread Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{activeConvo.contactAvatar}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{activeConvo.contactName}</p>
                <p className="text-xs text-gray-400">{activeConvo.company} · {activeConvo.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><Phone className="w-4 h-4" /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><Video className="w-4 h-4" /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><Star className={`w-4 h-4 ${activeConvo.starred ? "fill-amber-400 text-amber-400" : ""}`} /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><Archive className="w-4 h-4" /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {activeConvo.messages.map((msg) => {
              const ch = channelIcons[msg.channel];
              const ChIcon = ch.icon;
              const isOutbound = msg.direction === "outbound";

              return (
                <div key={msg.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[520px] ${isOutbound ? "items-end" : "items-start"}`}>
                    {/* Channel + Time */}
                    <div className={`flex items-center gap-1.5 mb-1 ${isOutbound ? "justify-end" : "justify-start"}`}>
                      <ChIcon className={`w-3 h-3 ${ch.color}`} />
                      <span className="text-[10px] text-gray-400">{ch.label}</span>
                      <span className="text-[10px] text-gray-300">·</span>
                      <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                      {isOutbound && (
                        <span className="text-[10px] text-gray-400">
                          {msg.status === "delivered" ? <CheckCheck className="w-3 h-3 text-blue-500 inline" /> :
                           msg.status === "read" ? <CheckCheck className="w-3 h-3 text-emerald-500 inline" /> :
                           msg.status === "sent" ? <Check className="w-3 h-3 inline" /> :
                           <Clock className="w-3 h-3 text-amber-500 inline" />}
                        </span>
                      )}
                    </div>

                    {/* Subject line (email only) */}
                    {msg.subject && (
                      <p className={`text-xs font-semibold mb-1 ${isOutbound ? "text-right text-indigo-700" : "text-gray-700"}`}>
                        {msg.subject}
                      </p>
                    )}

                    {/* Message bubble */}
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      isOutbound
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-700 rounded-bl-md"
                    }`}>
                      {msg.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compose / Reply */}
          <div className="bg-white border-t border-gray-100 px-6 py-4">
            {/* Channel Selector */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-400">Reply via:</span>
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setReplyChannel("email")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition ${replyChannel === "email" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}>
                  <Mail className="w-3 h-3" /> Email
                </button>
                <button onClick={() => setReplyChannel("sms")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition border-l border-gray-200 ${replyChannel === "sms" ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:bg-gray-50"}`}>
                  <MessageSquare className="w-3 h-3" /> SMS
                </button>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"><Paperclip className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"><Image className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"><Smile className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"><AtSign className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Text area */}
            <div className="flex items-end gap-3">
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${activeConvo.contactName} via ${replyChannel}...`}
                className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition resize-none"
              />
              <button className={`flex items-center justify-center w-10 h-10 rounded-xl transition flex-shrink-0 ${
                replyText.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" : "bg-gray-100 text-gray-400"
              }`}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Contact Sidebar ═══ */}
        <div className="w-[280px] flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto hidden xl:block">
          <div className="p-5">
            {/* Contact Card */}
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-white">{activeConvo.contactAvatar}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{activeConvo.contactName}</p>
              <p className="text-xs text-gray-400">{activeConvo.company}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                <ExternalLink className="w-3 h-3" /> View Profile
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <Phone className="w-3 h-3" /> Call
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Contact Info</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600 truncate">{activeConvo.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">{activeConvo.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">{activeConvo.company}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {activeConvo.tags.map((tag) => (
                    <span key={tag} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tagColors[tag] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      {tag}
                    </span>
                  ))}
                  <button className="text-[10px] text-gray-400 hover:text-indigo-600 px-2 py-0.5 border border-dashed border-gray-200 rounded-full hover:border-indigo-300 transition">
                    + Add
                  </button>
                </div>
              </div>

              {/* Deals */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Active Deals</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 mb-0.5">Enterprise Migration</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">Proposal Sent</span>
                    <span className="text-xs font-semibold text-gray-700">$24,000</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Recent Activity</p>
                <div className="space-y-2.5">
                  {[
                    { icon: Mail, text: "Email sent: proposal", time: "2h ago", color: "text-blue-500" },
                    { icon: Phone, text: "Call: 15 min", time: "Yesterday", color: "text-emerald-500" },
                    { icon: FileText, text: "Note added", time: "2 days ago", color: "text-amber-500" },
                  ].map((act, i) => {
                    const AIcon = act.icon;
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <AIcon className={`w-3.5 h-3.5 mt-0.5 ${act.color}`} />
                        <div>
                          <p className="text-xs text-gray-600">{act.text}</p>
                          <p className="text-[10px] text-gray-400">{act.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conversation Stats */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Conversation Stats</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
                    <p className="text-lg font-bold text-gray-900">{activeConvo.messages.length}</p>
                    <p className="text-[10px] text-gray-400">Messages</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
                    <p className="text-lg font-bold text-gray-900">&lt;5m</p>
                    <p className="text-[10px] text-gray-400">Avg Response</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
