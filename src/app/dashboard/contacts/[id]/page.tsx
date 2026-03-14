"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import {
  ArrowLeft, Mail, Phone, Building2, Crown, Tag, Send, MessageSquare,
  Calendar, DollarSign, ShoppingCart, Clock, CreditCard, ChevronRight,
  Loader2, ExternalLink, TrendingUp, User,
} from "lucide-react";

export default function ContactDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [quickMsg, setQuickMsg] = useState("");
  const [quickSubject, setQuickSubject] = useState("");
  const [quickResult, setQuickResult] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/contacts/${id}`)
      .then((r) => r.json())
      .then((data) => setContact(data.data || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const cf = contact?.customFields || {};
  const ltv = parseFloat(cf.ltv || "0");
  const tier = ltv >= 500 ? "whale" : ltv >= 200 ? "mid" : ltv > 0 ? "low" : "none";
  const tierColors = { whale: "bg-violet-100 text-violet-700", mid: "bg-blue-100 text-blue-700", low: "bg-gray-100 text-gray-600", none: "bg-gray-50 text-gray-400" };
  const tierLabels = { whale: "Whale ($500+)", mid: "Mid-Tier", low: "Low-Tier", none: "No Purchases" };
  const tags = Array.isArray(contact?.tags) ? contact.tags : [];

  const handleQuickEmail = async () => {
    if (!contact?.email || !quickSubject) return;
    setSendingEmail(true); setQuickResult(null);
    try {
      const res = await fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", to: contact.email, subject: quickSubject,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><p style="color:#555;line-height:1.6;">${quickMsg.replace(/\n/g, "<br/>")}</p></div>` }) });
      const data = await res.json();
      setQuickResult(data.success ? "✓ Email sent" : `Failed: ${data.error}`);
    } catch { setQuickResult("Failed"); } finally { setSendingEmail(false); }
  };

  const handleQuickSms = async () => {
    if (!contact?.phone || !quickMsg) return;
    setSendingSms(true); setQuickResult(null);
    const cleaned = contact.phone.replace(/\D/g, "");
    const formatted = cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`;
    try {
      const res = await fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", to: formatted, body: quickMsg }) });
      const data = await res.json();
      setQuickResult(data.success ? "✓ SMS sent" : `Failed: ${data.error}`);
    } catch { setQuickResult("Failed"); } finally { setSendingSms(false); }
  };

  if (loading) return (
    <>
      <Header title="Contact" />
      <div className="p-6 flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
    </>
  );

  if (!contact) return (
    <>
      <Header title="Contact" />
      <div className="p-6 text-center text-gray-500">Contact not found. <button onClick={() => router.push("/dashboard/contacts")} className="text-indigo-600 hover:underline">Back to contacts</button></div>
    </>
  );

  return (
    <>
      <Header title="Contact Detail" />
      <div className="p-6">

        {/* Back button */}
        <button onClick={() => router.push("/dashboard/contacts")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Contacts
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN — Contact Info */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {(contact.firstName?.[0] || contact.email?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{contact.firstName} {contact.lastName}</h1>
                  <p className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tierColors[tier]}`}>
                    {tier === "whale" && <Crown className="w-3 h-3" />} {tierLabels[tier]}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${contact.email}`} className="text-sm text-indigo-600 hover:underline truncate">{contact.email}</a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{contact.phone}</span>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{contact.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {tags.length > 0 ? tags.map((t: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                    )) : <span className="text-xs text-gray-400">No tags</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${contact.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                    {contact.status || "unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <input value={quickSubject} onChange={(e) => setQuickSubject(e.target.value)} placeholder="Email subject..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <textarea value={quickMsg} onChange={(e) => setQuickMsg(e.target.value)} placeholder="Type a message..."
                  rows={3} className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <div className="flex gap-2">
                  <button onClick={handleQuickEmail} disabled={sendingEmail || !contact.email || !quickSubject}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-lg transition">
                    {sendingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />} Email
                  </button>
                  <button onClick={handleQuickSms} disabled={sendingSms || !contact.phone || !quickMsg}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-lg transition">
                    {sendingSms ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />} SMS
                  </button>
                </div>
                {quickResult && <p className={`text-xs ${quickResult.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{quickResult}</p>}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN — Stripe Data */}
          <div className="lg:col-span-2 space-y-4">

            {/* Revenue Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-400">Lifetime Value</span></div>
                <p className="text-xl font-bold text-gray-900">${ltv.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1"><ShoppingCart className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-400">Purchases</span></div>
                <p className="text-xl font-bold text-gray-900">{cf.purchaseCount || 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-violet-500" /><span className="text-xs text-gray-400">Avg Order</span></div>
                <p className="text-xl font-bold text-gray-900">${parseFloat(cf.avgOrderValue || "0").toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1"><CreditCard className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-400">Highest Charge</span></div>
                <p className="text-xl font-bold text-gray-900">${parseFloat(cf.highestCharge || "0").toFixed(0)}</p>
              </div>
            </div>

            {/* Subscription Info */}
            {cf.subscriptionStatus && cf.subscriptionStatus !== "never" && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Subscription</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <p className={`text-sm font-semibold ${cf.subscriptionStatus === "active" ? "text-emerald-600" : cf.subscriptionStatus === "canceled" ? "text-red-500" : "text-gray-600"}`}>
                      {cf.subscriptionStatus}
                    </p>
                  </div>
                  {cf.subscriptionPlan && <div><p className="text-xs text-gray-400">Plan</p><p className="text-sm font-medium text-gray-900">{cf.subscriptionPlan}</p></div>}
                  {cf.subscriptionAmount && <div><p className="text-xs text-gray-400">Amount</p><p className="text-sm font-medium text-gray-900">${parseFloat(cf.subscriptionAmount).toFixed(2)}/{cf.subscriptionInterval || "mo"}</p></div>}
                  {cf.subscriptionStart && <div><p className="text-xs text-gray-400">Since</p><p className="text-sm font-medium text-gray-900">{new Date(cf.subscriptionStart).toLocaleDateString()}</p></div>}
                </div>
              </div>
            )}

            {/* Purchase Timeline */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Purchase History</h3>
              <div className="space-y-3">
                {cf.firstPurchaseDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"><Calendar className="w-4 h-4 text-emerald-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">First Purchase</p>
                      <p className="text-xs text-gray-400">{new Date(cf.firstPurchaseDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {cf.lastPurchaseDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><Clock className="w-4 h-4 text-blue-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Purchase</p>
                      <p className="text-xs text-gray-400">{new Date(cf.lastPurchaseDate).toLocaleDateString()} — {cf.daysSinceLastPurchase} days ago</p>
                    </div>
                  </div>
                )}
                {cf.totalCharges && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0"><DollarSign className="w-4 h-4 text-violet-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Charges</p>
                      <p className="text-xs text-gray-400">{cf.totalCharges} charges across ${ltv.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stripe IDs */}
            {cf.stripeCustomerId && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Stripe Customer</p>
                    <p className="text-xs font-mono text-gray-600">{cf.stripeCustomerId}</p>
                  </div>
                  <a href={`https://dashboard.stripe.com/customers/${cf.stripeCustomerId}`} target="_blank"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                    View in Stripe <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
