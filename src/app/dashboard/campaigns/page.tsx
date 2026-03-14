"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import {
  Send, Users, Mail, Plus, ChevronRight, Loader2, Eye, X,
  Crown, UserX, UserCheck, Zap, ShoppingCart, ArrowRight, Check,
} from "lucide-react";

interface Segment {
  key: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  params: Record<string, string>;
}

const segments: Segment[] = [
  { key: "all", label: "All Contacts", desc: "Everyone in your CRM", icon: Users, color: "bg-gray-500", params: {} },
  { key: "active_sub", label: "Active Subscribers", desc: "Currently paying customers", icon: UserCheck, color: "bg-emerald-500", params: { subStatus: "active" } },
  { key: "whales", label: "Whales ($500+)", desc: "Your highest value customers", icon: Crown, color: "bg-violet-500", params: { minLtv: "500" } },
  { key: "lapsed", label: "Lapsed Customers", desc: "Had a subscription, now canceled", icon: UserX, color: "bg-red-400", params: { tag: "Lapsed" } },
  { key: "winback", label: "Win-Back", desc: "Inactive 90+ days with purchase history", icon: Zap, color: "bg-amber-500", params: { tag: "Win-Back" } },
  { key: "high_freq", label: "High Frequency", desc: "10+ purchases", icon: ShoppingCart, color: "bg-blue-500", params: { tag: "High Frequency" } },
  { key: "inactive", label: "Inactive", desc: "No recent activity", icon: UserX, color: "bg-gray-400", params: { status: "inactive" } },
];

const emailTemplates = [
  {
    name: "Re-engagement",
    subject: "We miss you, {{firstName}}!",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #1a1a2e;">Hey {{firstName}},</h2>
<p style="color: #555; line-height: 1.6;">It's been a while since we've seen you around. We've been making some exciting updates and would love to have you back.</p>
<p style="color: #555; line-height: 1.6;">As a valued customer, we wanted to reach out personally and let you know what you've been missing.</p>
<a href="#" style="display: inline-block; background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">Come Back & Save</a>
<p style="color: #999; font-size: 13px;">If you have any questions, just reply to this email.</p>
</div>`,
  },
  {
    name: "VIP Exclusive",
    subject: "Exclusive offer for our VIP, {{firstName}}",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #1a1a2e;">{{firstName}}, you're a VIP 👑</h2>
<p style="color: #555; line-height: 1.6;">As one of our top customers, we want to make sure you're getting the absolute best experience.</p>
<p style="color: #555; line-height: 1.6;">We've put together something special just for customers like you — our most loyal supporters.</p>
<a href="#" style="display: inline-block; background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">Claim Your VIP Offer</a>
<p style="color: #999; font-size: 13px;">Thank you for being an amazing customer.</p>
</div>`,
  },
  {
    name: "Newsletter",
    subject: "What's new this month",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #1a1a2e;">Hey {{firstName}},</h2>
<p style="color: #555; line-height: 1.6;">Here's a quick update on what's been happening and what's coming next.</p>
<h3 style="color: #1a1a2e; margin-top: 24px;">🚀 What's New</h3>
<p style="color: #555; line-height: 1.6;">We've been working hard on improvements and new features that we think you'll love.</p>
<h3 style="color: #1a1a2e; margin-top: 24px;">📅 Coming Soon</h3>
<p style="color: #555; line-height: 1.6;">Stay tuned for some exciting announcements in the coming weeks.</p>
<p style="color: #999; font-size: 13px; margin-top: 24px;">You're receiving this because you're a valued customer.</p>
</div>`,
  },
  {
    name: "Blank",
    subject: "",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
<p>Write your email here...</p>
</div>`,
  },
];

type Step = "segment" | "template" | "compose" | "preview" | "sent";

export default function CampaignsPage() {
  const [step, setStep] = useState<Step>("segment");
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [segmentCount, setSegmentCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Fetch segment count when selected
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

  const handleSelectTemplate = (tmpl: typeof emailTemplates[0]) => {
    setSubject(tmpl.subject);
    setBody(tmpl.body);
    setStep("compose");
  };

  const handleSend = async () => {
    if (!selectedSegment || !subject || !body) return;
    setSending(true); setError(""); setSendResult(null);

    try {
      // Fetch all recipients in this segment
      const params = new URLSearchParams({ pageSize: "500", ...selectedSegment.params });
      const res = await fetch(`/api/contacts?${params}`);
      const data = await res.json();
      const recipients = (data.data || []).map((c: any) => ({
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        company: c.company,
      })).filter((r: any) => r.email);

      if (recipients.length === 0) {
        setError("No contacts with email addresses in this segment.");
        setSending(false);
        return;
      }

      // Send batch
      const sendRes = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-batch", recipients, subject, html: body }),
      });
      const result = await sendRes.json();

      if (result.sent > 0) {
        setSendResult(result);
        setStep("sent");
      } else {
        setError(result.errors?.[0] || "Failed to send. Check your email configuration in Settings → Integrations.");
      }
    } catch (err) {
      setError("Send failed. Make sure Resend is configured.");
    } finally {
      setSending(false);
    }
  };

  const resetCampaign = () => {
    setStep("segment");
    setSelectedSegment(null);
    setSegmentCount(null);
    setSubject("");
    setBody("");
    setSendResult(null);
    setError("");
  };

  return (
    <>
      <Header title="Campaigns" />
      <div className="p-6">

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-6">
          {(["segment", "template", "compose", "preview"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step === s ? "bg-indigo-600 text-white" :
                (["segment", "template", "compose", "preview"].indexOf(step) > i || step === "sent") ? "bg-emerald-500 text-white" :
                "bg-gray-200 text-gray-500"
              }`}>{(["segment", "template", "compose", "preview"].indexOf(step) > i || step === "sent") ? <Check className="w-4 h-4" /> : i + 1}</div>
              <span className={`text-xs font-medium ${step === s ? "text-gray-900" : "text-gray-400"}`}>
                {s === "segment" ? "Audience" : s === "template" ? "Template" : s === "compose" ? "Compose" : "Review"}
              </span>
              {i < 3 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Select Segment */}
        {step === "segment" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose Your Audience</h2>
            <p className="text-sm text-gray-500 mb-6">Select which contacts will receive this email</p>
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
                    {isSelected && segmentCount !== null && (
                      <span className="text-sm font-bold text-indigo-600">{segmentCount.toLocaleString()}</span>
                    )}
                    {isSelected && loadingCount && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                  </button>
                );
              })}
            </div>
            {selectedSegment && segmentCount !== null && segmentCount > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{segmentCount.toLocaleString()}</span> contacts in "{selectedSegment.label}"
                </p>
                <button onClick={() => setStep("template")}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                  Next: Choose Template <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {selectedSegment && segmentCount === 0 && !loadingCount && (
              <p className="mt-4 text-sm text-amber-600">No contacts match this segment. Try a different audience.</p>
            )}
          </div>
        )}

        {/* STEP 2: Pick Template */}
        {step === "template" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Choose a Template</h2>
                <p className="text-sm text-gray-500 mt-0.5">Start from a template or write from scratch</p>
              </div>
              <button onClick={() => setStep("segment")} className="text-xs text-gray-500 hover:text-gray-700">← Back</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emailTemplates.map((tmpl) => (
                <button key={tmpl.name} onClick={() => handleSelectTemplate(tmpl)}
                  className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition text-left">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{tmpl.name}</p>
                  <p className="text-xs text-gray-400 truncate">{tmpl.subject || "Empty subject — you'll write it"}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Compose */}
        {step === "compose" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Compose Email</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Sending to <span className="font-semibold text-gray-700">{segmentCount?.toLocaleString()}</span> contacts in "{selectedSegment?.label}"
                </p>
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

        {/* STEP 4: Preview */}
        {step === "preview" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Review & Send</h2>
                <p className="text-sm text-gray-500 mt-0.5">Double-check everything before sending</p>
              </div>
              <button onClick={() => setStep("compose")} className="text-xs text-gray-500 hover:text-gray-700">← Back to Edit</button>
            </div>

            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Audience</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedSegment?.label}</p>
                  <p className="text-xs text-gray-400">{segmentCount?.toLocaleString()} recipients</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Subject</p>
                  <p className="text-sm font-semibold text-gray-900">{subject}</p>
                </div>
              </div>

              {/* Email Preview */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <p className="text-xs text-gray-500">Email Preview (template variables shown as-is)</p>
                </div>
                <div className="p-6 bg-white" dangerouslySetInnerHTML={{ __html: body }} />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}

              {/* Send Button */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400">
                  Emails will be sent via Resend. Make sure email is configured in Settings → Integrations.
                </p>
                <button onClick={handleSend} disabled={sending}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? `Sending to ${segmentCount?.toLocaleString()}...` : `Send to ${segmentCount?.toLocaleString()} contacts`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Sent */}
        {step === "sent" && sendResult && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Campaign Sent!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Successfully sent to <span className="font-semibold text-gray-900">{sendResult.sent}</span> contacts
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
      </div>
    </>
  );
}
