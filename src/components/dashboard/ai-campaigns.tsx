"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, Loader2, Send, ChevronDown, ChevronUp, Users, Crown,
  AlertTriangle, Eye, Check, X, ArrowRight, Zap,
} from "lucide-react";

interface SmartCampaign {
  id: string; name: string; emoji: string; reason: string;
  urgency: "high" | "medium" | "low"; contactCount: number;
  contacts: { id: string; firstName: string; lastName: string; email: string; ltv: number; daysSince: number; purchases: number }[];
  subject: string; body: string; estimatedRevenue: string;
}

const urgencyStyles = {
  high: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700", label: "Urgent" },
  medium: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", label: "Recommended" },
  low: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", label: "Opportunity" },
};

function fmt(n: number) { return n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n.toFixed(0)}`; }

export default function AICampaigns() {
  const [campaigns, setCampaigns] = useState<SmartCampaign[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [sendResult, setSendResult] = useState<{ id: string; sent: number; failed: number } | null>(null);

  useEffect(() => {
    fetch("/api/ai-campaigns").then(r => r.json()).then(d => {
      setCampaigns(d.campaigns || []);
      setSummary(d.summary || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSend = async (campaign: SmartCampaign) => {
    if (!confirm(`Send "${campaign.name}" to ${campaign.contactCount} contacts?`)) return;
    setSendingId(campaign.id); setSendResult(null);
    try {
      const recipients = campaign.contacts.map(c => ({
        email: c.email, firstName: c.firstName, lastName: c.lastName, company: "",
      }));
      const res = await fetch("/api/email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-batch", recipients, subject: campaign.subject, html: campaign.body }),
      });
      const data = await res.json();
      setSendResult({ id: campaign.id, sent: data.sent || 0, failed: data.failed || 0 });
      if (data.sent > 0) setSentIds(prev => { const next = new Set(prev); next.add(campaign.id); return next; });
    } catch {}
    finally { setSendingId(null); }
  };

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
      <div className="flex items-center justify-center gap-3">
        <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
        <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
      </div>
      <p className="text-sm text-gray-500 mt-3">Analyzing your {summary?.totalAnalyzed?.toLocaleString() || ""} contacts...</p>
      <p className="text-xs text-gray-400 mt-1">Finding the highest-ROI re-engagement opportunities</p>
    </div>
  );

  if (campaigns.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
      <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-500">No campaign opportunities found</p>
      <p className="text-xs text-gray-400 mt-1">Import contacts from Stripe to generate smart campaigns</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-white/80" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">AI Campaign Generator</span>
        </div>
        <p className="text-2xl font-bold">{campaigns.length} Smart Campaigns Ready</p>
        <p className="text-sm text-white/70 mt-1">
          Analyzed {summary?.totalAnalyzed?.toLocaleString()} contacts → found {summary?.totalReachable?.toLocaleString()} re-engagement opportunities
        </p>
      </div>

      {/* Campaign cards */}
      {campaigns.map((c) => {
        const styles = urgencyStyles[c.urgency];
        const isExpanded = expanded === c.id;
        const isSent = sentIds.has(c.id);
        const isSending = sendingId === c.id;
        const result = sendResult?.id === c.id ? sendResult : null;

        return (
          <div key={c.id} className={`bg-white rounded-xl border ${isSent ? "border-emerald-200" : "border-gray-100"} overflow-hidden transition`}>
            {/* Header */}
            <button onClick={() => setExpanded(isExpanded ? null : c.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>{styles.label}</span>
                    {isSent && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Sent ✓</span>}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{c.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{c.contactCount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">contacts</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-emerald-600">{c.estimatedRevenue}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {/* Reason */}
                <div className={`px-5 py-3 ${styles.bg}`}>
                  <p className="text-sm text-gray-700"><Sparkles className="w-3.5 h-3.5 text-violet-500 inline mr-1.5" />{c.reason}</p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Email preview */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Preview</p>
                      <button onClick={() => setPreviewId(previewId === c.id ? null : c.id)}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                        <Eye className="w-3 h-3" /> {previewId === c.id ? "Hide" : "Preview"}
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Subject: <span className="font-medium text-gray-900">{c.subject}</span></p>
                      {previewId === c.id && (
                        <div className="mt-3 bg-white rounded-lg p-4 border border-gray-100" dangerouslySetInnerHTML={{ __html: c.body }} />
                      )}
                    </div>
                  </div>

                  {/* Contact list preview */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recipients ({c.contactCount})</p>
                    <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200">
                      {c.contacts.slice(0, 10).map((contact) => (
                        <Link key={contact.id} href={`/dashboard/contacts/${contact.id}`}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 transition border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${contact.ltv >= 500 ? "bg-violet-500" : "bg-gray-400"}`}>
                              {contact.ltv >= 500 ? <Crown className="w-3 h-3" /> : contact.firstName[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{contact.firstName} {contact.lastName}</p>
                              <p className="text-[10px] text-gray-400 truncate">{contact.email}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-xs font-bold text-gray-700">{fmt(contact.ltv)}</p>
                            <p className="text-[10px] text-gray-400">{contact.daysSince}d ago</p>
                          </div>
                        </Link>
                      ))}
                      {c.contactCount > 10 && (
                        <p className="text-[10px] text-gray-400 text-center py-2">+ {c.contactCount - 10} more</p>
                      )}
                    </div>
                  </div>

                  {/* Send button */}
                  <div className="flex items-center justify-between pt-2">
                    {result && (
                      <p className={`text-xs font-medium ${result.sent > 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {result.sent > 0 ? `✓ Sent to ${result.sent} contacts` : "Failed to send"}{result.failed > 0 ? ` (${result.failed} failed)` : ""}
                      </p>
                    )}
                    {!result && <div />}
                    {!isSent ? (
                      <button onClick={() => handleSend(c)} disabled={isSending}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg transition">
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {isSending ? "Sending..." : `Send to ${c.contactCount.toLocaleString()} contacts`}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                        <Check className="w-4 h-4" /> Campaign Sent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
