"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/dashboard/header";
import {
  Send, Users, Mail, Plus, ChevronRight, Loader2, Eye, X, MessageSquare,
  Crown, UserX, UserCheck, Zap, ShoppingCart, ArrowRight, Check, Search,
  ClipboardPaste, UserPlus, Bookmark, Trash2, Sparkles,
} from "lucide-react";
import AICampaigns from "@/components/dashboard/ai-campaigns";
import { useIndustry } from "@/lib/use-industry";

// ─── TYPES ───

interface Segment {
  key: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  params: Record<string, string>;
  custom?: boolean;
}

const defaultSegments: Segment[] = [
  { key: "all", label: "All Contacts", desc: "Everyone in your CRM", icon: Users, color: "bg-gray-500", params: {} },
  { key: "active_sub", label: "Active Subscribers", desc: "Currently paying customers", icon: UserCheck, color: "bg-emerald-500", params: { subStatus: "active" } },
  { key: "whales", label: "High Value ($500+)", desc: "Your highest value customers", icon: Crown, color: "bg-violet-500", params: { minLtv: "500" } },
  { key: "lapsed", label: "Lapsed Customers", desc: "Had a subscription, now canceled", icon: UserX, color: "bg-red-400", params: { tag: "Lapsed" } },
  { key: "winback", label: "Win-Back", desc: "Inactive 90+ days with purchase history", icon: Zap, color: "bg-amber-500", params: { tag: "Win-Back" } },
  { key: "high_freq", label: "High Frequency", desc: "10+ purchases", icon: ShoppingCart, color: "bg-blue-500", params: { tag: "High Frequency" } },
  { key: "inactive", label: "Inactive", desc: "No recent activity", icon: UserX, color: "bg-gray-400", params: { status: "inactive" } },
];

const emailTemplates = [
  { name: "Re-engagement", subject: "We miss you, {{firstName}}!", body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a1a2e;">Hey {{firstName}},</h2><p style="color:#555;line-height:1.6;">It's been a while since we've seen you around. We've been making some exciting updates and would love to have you back.</p><a href="#" style="display:inline-block;background:#6d28d9;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Come Back & Save</a><p style="color:#999;font-size:13px;">Reply to this email with any questions.</p></div>` },
  { name: "VIP Exclusive", subject: "Exclusive offer for our VIP, {{firstName}}", body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a1a2e;">{{firstName}}, you're a VIP 👑</h2><p style="color:#555;line-height:1.6;">As one of our top customers, we've put together something special just for you.</p><a href="#" style="display:inline-block;background:#6d28d9;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Claim Your VIP Offer</a><p style="color:#999;font-size:13px;">Thank you for being amazing.</p></div>` },
  { name: "Newsletter", subject: "What's new this month", body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a1a2e;">Hey {{firstName}},</h2><p style="color:#555;line-height:1.6;">Here's a quick update on what's been happening.</p><h3 style="color:#1a1a2e;margin-top:24px;">🚀 What's New</h3><p style="color:#555;line-height:1.6;">We've been working hard on improvements you'll love.</p><h3 style="color:#1a1a2e;margin-top:24px;">📅 Coming Soon</h3><p style="color:#555;line-height:1.6;">Stay tuned for exciting announcements.</p></div>` },
  { name: "Blank", subject: "", body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><p>Write your email here...</p></div>` },
];

type Step = "audience" | "template" | "compose" | "preview" | "sent";
type AudienceMode = "segment" | "search" | "paste";

// ─── HELPERS ───

function loadSavedSegments(): Segment[] {
  if (typeof window === "undefined") return [];
  try { const s = localStorage.getItem("sonji-segments"); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveSavedSegments(segs: Segment[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("sonji-segments", JSON.stringify(segs)); } catch {}
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export default function CampaignsPage() {
  const [step, setStep] = useState<Step>("audience");
  const [campaignMode, setCampaignMode] = useState<"ai" | "manual">("ai");
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("segment");
  const ic = useIndustry();

  // Dynamic segments with industry labels
  const segments: Segment[] = defaultSegments.map(s => {
    if (s.key === "all") return { ...s, label: `All ${ic?.contactLabelPlural || "Contacts"}`, desc: `Everyone in your CRM` };
    if (s.key === "active_sub") return { ...s, label: ic ? `Active ${ic.contactLabelPlural}` : "Active Subscribers", desc: ic ? `Currently active ${ic.contactLabelPlural.toLowerCase()}` : s.desc };
    if (s.key === "whales") return { ...s, label: `${ic?.highValueLabel || "High Value"} ($500+)`, desc: ic ? `Your highest value ${ic.contactLabelPlural.toLowerCase()}` : s.desc };
    if (s.key === "lapsed") return { ...s, label: ic ? `Lapsed ${ic.contactLabelPlural}` : "Lapsed Customers" };
    return s;
  });

  // Segment selection
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [segmentCount, setSegmentCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [savedSegments, setSavedSegments] = useState<Segment[]>([]);

  // Contact search/select
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

  // Paste emails
  const [pastedEmails, setPastedEmails] = useState("");
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);

  // Compose
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Quick send
  const [testEmail, setTestEmail] = useState("");
  const [testSubject, setTestSubject] = useState("Test from Sonji");
  const [testPhone, setTestPhone] = useState("");
  const [testSmsBody, setTestSmsBody] = useState("Test SMS from Sonji CRM");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [quickMode, setQuickMode] = useState<"email" | "sms">("email");

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setSavedSegments(loadSavedSegments()); }, []);

  // ─── SEGMENT HELPERS ───

  const fetchSegmentCount = async (seg: Segment) => {
    setLoadingCount(true);
    try {
      const params = new URLSearchParams({ pageSize: "1", ...seg.params });
      const res = await fetch(`/api/contacts?${params}`);
      const data = await res.json();
      setSegmentCount(data.meta?.total || 0);
    } catch { setSegmentCount(0); }
    finally { setLoadingCount(false); }
  };

  const handleSelectSegment = (seg: Segment) => {
    setSelectedSegment(seg);
    fetchSegmentCount(seg);
  };

  const saveCurrentSegment = () => {
    if (!selectedSegment || selectedSegment.custom) return;
    const custom: Segment = { ...selectedSegment, key: `custom_${Date.now()}`, custom: true };
    const next = [...savedSegments, custom];
    setSavedSegments(next);
    saveSavedSegments(next);
  };

  const deleteSavedSegment = (key: string) => {
    const next = savedSegments.filter((s) => s.key !== key);
    setSavedSegments(next);
    saveSavedSegments(next);
  };

  // ─── CONTACT SEARCH ───

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/contacts?search=${encodeURIComponent(q)}&pageSize=20`);
        const data = await res.json();
        setSearchResults(data.data || []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
  };

  const addContact = (contact: any) => {
    if (selectedContacts.find((c) => c.id === contact.id)) return;
    setSelectedContacts([...selectedContacts, contact]);
  };

  const removeContact = (id: string) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== id));
  };

  // ─── PASTE EMAILS ───

  const handleParseEmails = () => {
    const emails = pastedEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@") && e.includes("."));
    const unique = Array.from(new Set(emails));
    setParsedEmails(unique);
  };

  // ─── GET RECIPIENTS ───

  const getRecipients = async (): Promise<any[]> => {
    if (audienceMode === "search") {
      return selectedContacts.map((c) => ({ email: c.email, firstName: c.firstName, lastName: c.lastName, company: c.company })).filter((r) => r.email);
    }
    if (audienceMode === "paste") {
      return parsedEmails.map((email) => ({ email, firstName: "", lastName: "", company: "" }));
    }
    // Segment mode — fetch all
    if (!selectedSegment) return [];
    const params = new URLSearchParams({ pageSize: "500", ...selectedSegment.params });
    const res = await fetch(`/api/contacts?${params}`);
    const data = await res.json();
    return (data.data || []).map((c: any) => ({ email: c.email, firstName: c.firstName, lastName: c.lastName, company: c.company })).filter((r: any) => r.email);
  };

  const getAudienceCount = () => {
    if (audienceMode === "search") return selectedContacts.length;
    if (audienceMode === "paste") return parsedEmails.length;
    return segmentCount || 0;
  };

  const getAudienceLabel = () => {
    if (audienceMode === "search") return `${selectedContacts.length} selected contacts`;
    if (audienceMode === "paste") return `${parsedEmails.length} email addresses`;
    return selectedSegment?.label || "No segment";
  };

  const canProceed = () => {
    if (audienceMode === "search") return selectedContacts.length > 0;
    if (audienceMode === "paste") return parsedEmails.length > 0;
    return selectedSegment && segmentCount && segmentCount > 0;
  };

  // ─── SEND ───

  const handleSend = async () => {
    if (!subject || !body) return;
    setSending(true); setError(""); setSendResult(null);
    try {
      const recipients = await getRecipients();
      if (recipients.length === 0) { setError("No valid email addresses found."); setSending(false); return; }

      const sendRes = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-batch", recipients, subject, html: body }),
      });
      const result = await sendRes.json();
      if (result.sent > 0) { setSendResult(result); setStep("sent"); }
      else { setError(result.errors?.[0] || "Failed to send. Check email config in Settings → Integrations."); }
    } catch { setError("Send failed."); }
    finally { setSending(false); }
  };

  const resetCampaign = () => {
    setStep("audience"); setAudienceMode("segment"); setSelectedSegment(null);
    setSegmentCount(null); setSelectedContacts([]); setPastedEmails(""); setParsedEmails([]);
    setSubject(""); setBody(""); setSendResult(null); setError("");
  };

  // ─── QUICK SEND ───

  const handleTestEmail = async () => {
    if (!testEmail.includes("@")) { setTestResult("Enter a valid email"); return; }
    setTestSending(true); setTestResult(null);
    try {
      const res = await fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", to: testEmail, subject: testSubject,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;"><h2 style="color:#1a1a2e;">Hey there 👋</h2><p style="color:#555;line-height:1.6;">Test email from <strong>Sonji CRM</strong>. Your email pipeline is working.</p><div style="margin:24px 0;padding:16px;background:#f3f0ff;border-radius:12px;"><p style="color:#6d28d9;font-weight:600;margin:0;">✓ Email delivery confirmed</p></div><p style="color:#999;font-size:13px;">Sent from sonji.io</p></div>` }) });
      const data = await res.json();
      if (data.success) setTestResult("✓ Email sent! Check your inbox.");
      else setTestResult(`Failed: ${data.error || "Unknown"}`);
    } catch { setTestResult("Failed. Check Resend config."); } finally { setTestSending(false); }
  };

  const handleTestSms = async () => {
    const cleaned = testPhone.replace(/\D/g, "");
    if (cleaned.length < 10) { setTestResult("Enter a valid phone number"); return; }
    const formatted = cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`;
    setTestSending(true); setTestResult(null);
    try {
      const res = await fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", to: formatted, body: testSmsBody }) });
      const data = await res.json();
      if (data.success) setTestResult("✓ SMS sent! Check your phone.");
      else setTestResult(`Failed: ${data.error || "Unknown"}`);
    } catch { setTestResult("Failed. Check Twilio config."); } finally { setTestSending(false); }
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  const steps: Step[] = ["audience", "template", "compose", "preview"];
  const stepLabels: Record<string, string> = { audience: "Audience", template: "Template", compose: "Compose", preview: "Review" };

  return (
    <>
      <Header title="Campaigns" />
      <div className="p-6">

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          <button onClick={() => setCampaignMode("ai")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              campaignMode === "ai" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <Sparkles className={`w-4 h-4 ${campaignMode === "ai" ? "text-violet-500" : ""}`} />
            AI Smart Campaigns
          </button>
          <button onClick={() => setCampaignMode("manual")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              campaignMode === "manual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <Send className={`w-4 h-4 ${campaignMode === "manual" ? "text-indigo-500" : ""}`} />
            Manual Campaign
          </button>
        </div>

        {/* AI MODE */}
        {campaignMode === "ai" && <AICampaigns />}

        {/* MANUAL MODE */}
        {campaignMode === "manual" && (<>

        {/* Quick Send */}
        {step === "audience" && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Quick Send</h3>
                <p className="text-xs text-gray-400">Send a test or one-off message to anyone</p>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => { setQuickMode("email"); setTestResult(null); }}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${quickMode === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>Email</button>
                <button onClick={() => { setQuickMode("sms"); setTestResult(null); }}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${quickMode === "sms" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>SMS</button>
              </div>
            </div>
            {quickMode === "email" ? (
              <div className="flex items-center gap-2">
                <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Email address"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <input value={testSubject} onChange={(e) => setTestSubject(e.target.value)} placeholder="Subject"
                  className="w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <button onClick={handleTestEmail} disabled={testSending}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg transition whitespace-nowrap">
                  {testSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} {testSending ? "Sending..." : "Send Email"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="Phone (239-555-1234)"
                  className="w-56 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <input value={testSmsBody} onChange={(e) => setTestSmsBody(e.target.value)} placeholder="Message"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <button onClick={handleTestSms} disabled={testSending}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition whitespace-nowrap">
                  {testSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />} {testSending ? "Sending..." : "Send SMS"}
                </button>
              </div>
            )}
            {testResult && <p className={`text-xs mt-2 ${testResult.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{testResult}</p>}
          </div>
        )}

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step === s ? "bg-indigo-600 text-white" : steps.indexOf(step) > i || step === "sent" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>{steps.indexOf(step) > i || step === "sent" ? <Check className="w-4 h-4" /> : i + 1}</div>
              <span className={`text-xs font-medium ${step === s ? "text-gray-900" : "text-gray-400"}`}>{stepLabels[s]}</span>
              {i < 3 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* ═══ STEP 1: AUDIENCE ═══ */}
        {step === "audience" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose Your Audience</h2>
            <p className="text-sm text-gray-500 mb-4">Select who will receive this campaign</p>

            {/* Audience mode tabs */}
            <div className="flex gap-2 mb-6">
              {([
                { mode: "segment" as AudienceMode, icon: Users, label: "Smart Segments" },
                { mode: "search" as AudienceMode, icon: UserPlus, label: "Pick Contacts" },
                { mode: "paste" as AudienceMode, icon: ClipboardPaste, label: "Paste Emails" },
              ]).map((m) => (
                <button key={m.mode} onClick={() => setAudienceMode(m.mode)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border-2 transition ${
                    audienceMode === m.mode ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-600 hover:border-gray-200"
                  }`}>
                  <m.icon className="w-4 h-4" /> {m.label}
                </button>
              ))}
            </div>

            {/* SEGMENTS */}
            {audienceMode === "segment" && (
              <>
                {savedSegments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Saved Segments</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {savedSegments.map((seg) => (
                        <div key={seg.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition cursor-pointer ${
                          selectedSegment?.key === seg.key ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                        }`} onClick={() => handleSelectSegment(seg)}>
                          <Bookmark className="w-4 h-4 text-amber-500" fill="currentColor" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{seg.label}</p>
                            <p className="text-xs text-gray-400">{seg.desc}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); deleteSavedSegment(seg.key); }}
                            className="text-gray-300 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Smart Segments</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {segments.map((seg) => {
                    const Icon = seg.icon;
                    const isSelected = selectedSegment?.key === seg.key;
                    return (
                      <button key={seg.key} onClick={() => handleSelectSegment(seg)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition text-left ${
                          isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                        }`}>
                        <div className={`w-10 h-10 rounded-xl ${seg.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{seg.label}</p>
                          <p className="text-xs text-gray-400">{seg.desc}</p>
                        </div>
                        {isSelected && segmentCount !== null && <span className="text-sm font-bold text-indigo-600">{segmentCount.toLocaleString()}</span>}
                        {isSelected && loadingCount && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* SEARCH + SELECT CONTACTS */}
            {audienceMode === "search" && (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search contacts by name, email, or company..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-4">
                    {searchResults.map((c) => {
                      const alreadyAdded = selectedContacts.find((sc) => sc.id === c.id);
                      return (
                        <button key={c.id} onClick={() => addContact(c)} disabled={!!alreadyAdded}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 ${alreadyAdded ? "opacity-40" : ""}`}>
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(c.firstName?.[0] || c.email?.[0] || "?").toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{c.firstName} {c.lastName}</p>
                            <p className="text-xs text-gray-400 truncate">{c.email}</p>
                          </div>
                          {alreadyAdded ? <Check className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4 text-gray-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected contacts */}
                {selectedContacts.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Selected ({selectedContacts.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContacts.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5">
                          <span className="text-xs font-medium text-indigo-700">{c.firstName || c.email}</span>
                          <button onClick={() => removeContact(c.id)} className="text-indigo-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASTE EMAILS */}
            {audienceMode === "paste" && (
              <div>
                <textarea value={pastedEmails} onChange={(e) => setPastedEmails(e.target.value)}
                  placeholder="Paste email addresses here — one per line, or separated by commas..."
                  rows={6}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mb-3" />
                <div className="flex items-center gap-3">
                  <button onClick={handleParseEmails}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                    Parse Emails
                  </button>
                  {parsedEmails.length > 0 && (
                    <p className="text-sm text-emerald-600 font-medium">✓ {parsedEmails.length} valid email{parsedEmails.length !== 1 ? "s" : ""} found</p>
                  )}
                </div>
                {parsedEmails.length > 0 && (
                  <div className="mt-3 max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
                    {parsedEmails.map((e, i) => (
                      <div key={i} className="flex items-center justify-between py-0.5">
                        <span className="text-xs font-mono text-gray-600">{e}</span>
                        <button onClick={() => setParsedEmails(parsedEmails.filter((_, j) => j !== i))}
                          className="text-gray-300 hover:text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Next button */}
            {canProceed() && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{getAudienceCount().toLocaleString()}</span> recipients — {getAudienceLabel()}
                </p>
                <button onClick={() => setStep("template")}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                  Next: Choose Template <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 2: TEMPLATE ═══ */}
        {step === "template" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Choose a Template</h2>
                <p className="text-sm text-gray-500 mt-0.5">Start from a template or write from scratch</p>
              </div>
              <button onClick={() => setStep("audience")} className="text-xs text-gray-500 hover:text-gray-700">← Back</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emailTemplates.map((tmpl) => (
                <button key={tmpl.name} onClick={() => { setSubject(tmpl.subject); setBody(tmpl.body); setStep("compose"); }}
                  className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition text-left">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{tmpl.name}</p>
                  <p className="text-xs text-gray-400 truncate">{tmpl.subject || "Empty — you'll write it"}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 3: COMPOSE ═══ */}
        {step === "compose" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Compose Email</h2>
                <p className="text-sm text-gray-500 mt-0.5">Sending to <span className="font-semibold text-gray-700">{getAudienceCount().toLocaleString()}</span> — {getAudienceLabel()}</p>
              </div>
              <button onClick={() => setStep("template")} className="text-xs text-gray-500 hover:text-gray-700">← Back</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Subject Line</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your email subject..."
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
                <p className="text-[10px] text-gray-400 mt-1">Use {"{{firstName}}"}, {"{{lastName}}"}, {"{{company}}"} for personalization</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email Body (HTML)</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setStep("preview")}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                  <Eye className="w-4 h-4" /> Preview & Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: PREVIEW ═══ */}
        {step === "preview" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Review & Send</h2>
                <p className="text-sm text-gray-500 mt-0.5">Double-check everything</p>
              </div>
              <button onClick={() => setStep("compose")} className="text-xs text-gray-500 hover:text-gray-700">← Edit</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Audience</p>
                  <p className="text-sm font-semibold text-gray-900">{getAudienceLabel()}</p>
                  <p className="text-xs text-gray-400">{getAudienceCount().toLocaleString()} recipients</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Subject</p>
                  <p className="text-sm font-semibold text-gray-900">{subject}</p>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <p className="text-xs text-gray-500">Email Preview</p>
                </div>
                <div className="p-6 bg-white" dangerouslySetInnerHTML={{ __html: body }} />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400">Sent via Resend. Configure in Settings → Integrations.</p>
                <button onClick={handleSend} disabled={sending}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? `Sending...` : `Send to ${getAudienceCount().toLocaleString()} contacts`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 5: SENT ═══ */}
        {step === "sent" && sendResult && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Campaign Sent!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Sent to <span className="font-semibold text-gray-900">{sendResult.sent}</span> contacts
              {sendResult.failed > 0 && <span className="text-red-500"> ({sendResult.failed} failed)</span>}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={resetCampaign}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Plus className="w-4 h-4" /> New Campaign
              </button>
              <a href="/dashboard/contacts"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                View Contacts
              </a>
            </div>
          </div>
        )}

        </>)}
      </div>
    </>
  );
}
