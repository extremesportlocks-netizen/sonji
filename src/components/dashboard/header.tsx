"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Bell, Plus, ChevronDown, Phone, Mail, Video,
  Users, Handshake, CheckSquare, Calendar, DollarSign,
  X, Send, Loader2, ExternalLink,
} from "lucide-react";
import { useModal } from "@/components/modals/modal-provider";

const createOptions = [
  { label: "Contact", icon: "👤", modal: "contact" },
  { label: "Deal", icon: "🤝", modal: "deal" },
  { label: "Task", icon: "✅", modal: "task" },
  { label: "Meeting", icon: "📅", modal: "meeting" },
  { label: "Company", icon: "🏢", modal: "company" },
  { label: "Invoice", icon: "💰", modal: "invoice" },
];

interface Props { title: string; subtitle?: string; }

export default function Header({ title, subtitle }: Props) {
  const { openModal } = useModal();
  const router = useRouter();
  const [userName, setUserName] = useState("Orlando");
  const [userEmail, setUserEmail] = useState("hello@sonji.io");
  const [userInitial, setUserInitial] = useState("O");

  useEffect(() => {
    // Try to get user info from Clerk or session
    try {
      const cached = sessionStorage.getItem("sonji-user");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.name) { setUserName(u.name.split(" ")[0]); setUserInitial(u.name[0].toUpperCase()); }
        if (u.email) setUserEmail(u.email);
      }
    } catch {}
  }, []);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPhonePanel, setShowPhonePanel] = useState(false);
  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState("");

  // Email state
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<string | null>(null);

  // Video state
  const [meetingUrl, setMeetingUrl] = useState("");

  // Load saved meeting URL
  useEffect(() => {
    try { const saved = localStorage.getItem("sonji-meeting-url"); if (saved) setMeetingUrl(saved); } catch {}
  }, []);

  const closeAllPanels = () => {
    setShowPhonePanel(false);
    setShowEmailPanel(false);
    setShowVideoPanel(false);
    setShowNotifs(false);
  };

  const handleCall = () => {
    if (!phoneNumber) return;
    const cleaned = phoneNumber.replace(/\D/g, "");
    const formatted = cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`;
    window.open(`tel:${formatted}`, "_self");
    setShowPhonePanel(false);
  };

  const handleSendEmail = async () => {
    if (!emailTo.includes("@") || !emailSubject) return;
    setEmailSending(true); setEmailResult(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send", to: emailTo, subject: emailSubject,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><p style="color:#555;line-height:1.6;">${emailBody.replace(/\n/g, "<br/>")}</p></div>`,
        }),
      });
      const data = await res.json();
      if (data.success) { setEmailResult("✓ Sent"); setEmailTo(""); setEmailSubject(""); setEmailBody(""); setTimeout(() => { setShowEmailPanel(false); setEmailResult(null); }, 1500); }
      else setEmailResult(`Failed: ${data.error}`);
    } catch { setEmailResult("Failed"); }
    finally { setEmailSending(false); }
  };

  const handleStartMeeting = () => {
    if (meetingUrl) {
      try { localStorage.setItem("sonji-meeting-url", meetingUrl); } catch {}
      window.open(meetingUrl, "_blank");
    }
    setShowVideoPanel(false);
  };

  const handleSignOut = async () => {
    // Clear all cached session data
    sessionStorage.removeItem("sonji-tenant-verified");
    sessionStorage.removeItem("sonji-tenant");
    sessionStorage.removeItem("sonji-user");
    document.cookie = "site_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Redirect to login (Clerk handles the actual sign-out via its middleware)
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Title */}
        <div className="flex items-center gap-4" data-tour="header-title">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-none">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8" data-tour="search">
          <button
            onClick={() => document.dispatchEvent(new CustomEvent("sonji:open-command-palette"))}
            className="relative w-full flex items-center pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg 
                       text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition cursor-pointer text-left"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <span>Search contacts, deals, or type /ai...</span>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">

          {/* ── PHONE ── */}
          <div className="relative hidden sm:block">
            <button onClick={() => { closeAllPanels(); setShowPhonePanel(!showPhonePanel); }}
              className={`p-2 rounded-lg transition ${showPhonePanel ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
              <Phone className="w-4 h-4" />
            </button>
            {showPhonePanel && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPhonePanel(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">Quick Call</p>
                    <button onClick={() => setShowPhonePanel(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone number..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    onKeyDown={(e) => e.key === "Enter" && handleCall()} />
                  <button onClick={handleCall} disabled={!phoneNumber}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-lg transition">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </button>
                  <p className="text-[10px] text-gray-400 mt-2">Opens your phone's dialer. Twilio Voice coming soon.</p>
                </div>
              </>
            )}
          </div>

          {/* ── EMAIL ── */}
          <div className="relative hidden sm:block">
            <button onClick={() => { closeAllPanels(); setShowEmailPanel(!showEmailPanel); }}
              className={`p-2 rounded-lg transition ${showEmailPanel ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
              <Mail className="w-4 h-4" />
            </button>
            {showEmailPanel && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowEmailPanel(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">Quick Email</p>
                    <button onClick={() => setShowEmailPanel(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="space-y-2">
                    <input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="To: email@example.com"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Subject"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Message..." rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    <button onClick={handleSendEmail} disabled={emailSending || !emailTo || !emailSubject}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-lg transition">
                      {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {emailSending ? "Sending..." : "Send Email"}
                    </button>
                    {emailResult && <p className={`text-xs ${emailResult.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{emailResult}</p>}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── VIDEO ── */}
          <div className="relative hidden sm:block">
            <button onClick={() => { closeAllPanels(); setShowVideoPanel(!showVideoPanel); }}
              className={`p-2 rounded-lg transition ${showVideoPanel ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
              <Video className="w-4 h-4" />
            </button>
            {showVideoPanel && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowVideoPanel(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">Start Meeting</p>
                    <button onClick={() => setShowVideoPanel(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your Meeting Room URL</label>
                      <input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      <p className="text-[10px] text-gray-400 mt-1">Google Meet, Zoom, or any video link. Saved for next time.</p>
                    </div>
                    <button onClick={handleStartMeeting} disabled={!meetingUrl}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition">
                      <Video className="w-3.5 h-3.5" /> Start Meeting
                    </button>
                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={() => { setMeetingUrl("https://meet.google.com/new"); }}
                        className="flex-1 text-xs text-center py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600">
                        Google Meet
                      </button>
                      <button onClick={() => { setMeetingUrl("https://zoom.us/start/videomeeting"); }}
                        className="flex-1 text-xs text-center py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600">
                        Zoom
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block" />

          {/* Notifications */}
          <div className="relative">
            <button data-tour="notifications" onClick={() => setShowNotifs(!showNotifs)}
              className={`relative p-2 rounded-lg transition ${showNotifs ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
              <Bell className="w-[18px] h-[18px]" />
              {!showNotifs && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />}
            </button>
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <button onClick={() => setShowNotifs(false)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Mark all read</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {(() => {
                      const di = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
                      if (!di) {
                        // Real tenant — no demo notifications
                        return (
                          <div className="px-4 py-8 text-center">
                            <p className="text-sm text-gray-400">No new notifications</p>
                          </div>
                        );
                      }
                      const n: { icon: string; text: string; time: string; unread: boolean }[] = {
                        agency_consulting: [
                          { icon: "🤝", text: "Deal won — Sterling Partners $10K/mo retainer", time: "1 hr ago", unread: true },
                          { icon: "👻", text: "Ghosting Alert: Coastal RE email frequency dropped 80%", time: "2 hr ago", unread: true },
                          { icon: "⚡", text: "Automation: Renewal alert triggered for 3 clients", time: "3 hr ago", unread: false },
                          { icon: "📧", text: "Brightview Hotels opened March PPC report", time: "4 hr ago", unread: false },
                          { icon: "📋", text: "New lead: Apex Construction submitted contact form", time: "5 hr ago", unread: false },
                        ],
                        health_wellness: [
                          { icon: "📝", text: "New patient intake: Emily Rodriguez — Botox consultation", time: "30 min ago", unread: true },
                          { icon: "💳", text: "Payment received: Sarah Thompson $1,600", time: "1 hr ago", unread: true },
                          { icon: "⚡", text: "Automation: Botox rebooking reminder sent to Maria Santos", time: "2 hr ago", unread: false },
                          { icon: "⭐", text: "New 5-star review from Michael Brown", time: "Yesterday", unread: false },
                          { icon: "👻", text: "Ghosting: Patricia Lee missed 2 consecutive appointments", time: "Yesterday", unread: false },
                        ],
                        home_services: [
                          { icon: "🚨", text: "EMERGENCY: Susan Taylor — active roof leak", time: "45 min ago", unread: true },
                          { icon: "💳", text: "Payment received: Linda Garcia $18,500 deposit", time: "4 hr ago", unread: true },
                          { icon: "👻", text: "Ghosting: Richard Wilson — estimate 14 days, no response", time: "5 hr ago", unread: false },
                          { icon: "⭐", text: "New 5-star review from Barbara Martinez", time: "2 days ago", unread: false },
                          { icon: "⚡", text: "Automation: Maintenance reminders sent to 12 customers", time: "Yesterday", unread: false },
                        ],
                        legal: [
                          { icon: "📎", text: "Marcus Johnson uploaded medical records for PI case", time: "1 hr ago", unread: true },
                          { icon: "📝", text: "New consultation request: Patricia Williams — estate planning", time: "2 hr ago", unread: true },
                          { icon: "📅", text: "Deposition scheduled: Mitchell v. Mitchell — Thursday", time: "3 hr ago", unread: false },
                          { icon: "⚡", text: "Automation: Document reminder sent to Sarah Mitchell", time: "Yesterday", unread: false },
                          { icon: "💳", text: "Payment received: Harbor Construction $3,750 retainer", time: "Yesterday", unread: false },
                        ],
                      }[di] || [];
                      return n.map((n, i) => (
                      <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer ${n.unread ? "bg-indigo-50/30" : ""}`}>
                        <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${n.unread ? "text-gray-900 font-medium" : "text-gray-600"}`}>{n.text}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                        {n.unread && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    ));
                    })()}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                    <button onClick={() => { setShowNotifs(false); router.push("/dashboard/notifications"); }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium w-full text-center">View all notifications</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Create Button */}
          <div className="relative" data-tour="create">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="flex items-center gap-1.5 ml-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </button>
            {showCreateMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCreateMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {createOptions.map((opt) => (
                    <button key={opt.label}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => { setShowCreateMenu(false); openModal(opt.modal as "contact" | "deal" | "task" | "meeting" | "company" | "invoice"); }}>
                      <span className="text-base">{opt.icon}</span>
                      <span>{opt.label}</span>
                      <Plus className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          {/* User Menu */}
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{userInitial}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-400">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setShowUserMenu(false); router.push("/dashboard/settings"); }}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left transition">
                      Account Settings
                    </button>
                    <button onClick={() => { setShowUserMenu(false); router.push("/dashboard/settings?tab=billing"); }}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left transition">
                      Billing
                    </button>
                    <button onClick={() => { setShowUserMenu(false); window.open("mailto:hello@sonji.io?subject=Support Request", "_blank"); }}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left transition">
                      Help & Support
                    </button>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button onClick={handleSignOut}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition">
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
