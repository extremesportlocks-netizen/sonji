"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import {
  ArrowLeft, Mail, Phone, Building2, Crown, Tag, Send, MessageSquare,
  Calendar, DollarSign, ShoppingCart, Clock, CreditCard, ChevronRight,
  Loader2, ExternalLink, TrendingUp, User, Edit3, Save, X,
} from "lucide-react";
import AIInsights from "@/components/dashboard/ai-insights";
import ContactJourney from "@/components/dashboard/contact-journey";
import { useIndustry } from "@/lib/use-industry";

export default function ContactDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const ic = useIndustry();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [quickMsg, setQuickMsg] = useState("");
  const [quickSubject, setQuickSubject] = useState("");
  const [quickResult, setQuickResult] = useState<string | null>(null);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", status: "" });

  // Subscription editing
  const [editingSub, setEditingSub] = useState(false);
  const [savingSub, setSavingSub] = useState(false);
  const [subSaveMsg, setSubSaveMsg] = useState("");
  const [subEditPlan, setSubEditPlan] = useState("");
  const [subEditAmount, setSubEditAmount] = useState("");
  const [subEditStatus, setSubEditStatus] = useState("");
  const [subEditActiveUntil, setSubEditActiveUntil] = useState("");

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const isDemoId = String(id).startsWith("demo-");

    if (demoIndustry && isDemoId) {
      // Demo contact — fetch from demo API
      fetch(`/api/demo/contacts?industry=${demoIndustry}&pageSize=200`)
        .then((r) => r.json())
        .then((data) => {
          const c = (data.data || []).find((c: any) => c.id === id);
          if (c) {
            setContact(c);
            const cf = c.customFields || {};
            setSubEditPlan(cf.subscriptionPlan || "");
            setSubEditAmount(cf.subscriptionAmount ? String(cf.subscriptionAmount) : "");
            setSubEditStatus(cf.subscriptionStatus || "never");
            setSubEditActiveUntil(cf.manualActiveUntil ? cf.manualActiveUntil.split("T")[0] : "");
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      // Real contact
      fetch(`/api/contacts/${id}`)
        .then((r) => r.json())
        .then((data) => {
          const c = data.data || data;
          setContact(c);
          const cf = c?.customFields || {};
          setSubEditPlan(cf.subscriptionPlan || "");
          setSubEditAmount(cf.subscriptionAmount ? String(cf.subscriptionAmount) : "");
          setSubEditStatus(cf.subscriptionStatus || "never");
          setSubEditActiveUntil(cf.manualActiveUntil ? cf.manualActiveUntil.split("T")[0] : "");
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const startEditProfile = () => {
    setProfileForm({
      firstName: contact?.firstName || "",
      lastName: contact?.lastName || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      company: contact?.company || "",
      status: contact?.status || "active",
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const data = await res.json();
        setContact((prev: any) => ({ ...prev, ...profileForm }));
        setEditingProfile(false);
      }
    } catch {} finally { setSavingProfile(false); }
  };

  const handleSaveSub = async () => {
    setSavingSub(true); setSubSaveMsg("");
    try {
      const updates: any = {
        subscriptionPlan: subEditPlan || undefined,
        subscriptionAmount: subEditAmount ? parseFloat(subEditAmount) : undefined,
        subscriptionStatus: subEditStatus,
      };
      if (subEditActiveUntil) {
        updates.manualActiveUntil = new Date(subEditActiveUntil + "T23:59:59").toISOString();
      } else {
        updates.manualActiveUntil = null; // Clear manual override
      }

      // Update contact status based on subscription
      const contactStatus = subEditStatus === "active" ? "active" : "inactive";

      const res = await fetch(`/api/contacts/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customFields: updates, status: contactStatus }),
      });
      if (res.ok) {
        setSubSaveMsg("✓ Saved");
        // Refresh contact
        const r = await fetch(`/api/contacts/${id}`);
        const d = await r.json();
        setContact(d.data || d);
        setEditingSub(false);
        setTimeout(() => setSubSaveMsg(""), 2000);
      } else { setSubSaveMsg("Failed to save"); }
    } catch { setSubSaveMsg("Failed"); }
    finally { setSavingSub(false); }
  };

  const cf = contact?.customFields || {};
  const ltv = parseFloat(cf.ltv || "0");
  const tier = ltv >= 500 ? "whale" : ltv >= 200 ? "mid" : ltv > 0 ? "low" : "none";
  const tierColors = { whale: "bg-violet-100 text-violet-700", mid: "bg-blue-100 text-blue-700", low: "bg-gray-100 text-gray-600", none: "bg-gray-50 text-gray-400" };
  const tierLabels = { whale: `${ic?.highValueLabel || "High Value"} ($500+)`, mid: `${ic?.midTierLabel || "Mid-Tier"}`, low: `${ic?.lowTierLabel || "Low-Tier"}`, none: "No Purchases" };
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
      <div className="p-6 text-center text-gray-500">{ic?.contactLabel || "Contact"} not found. <button onClick={() => router.push("/dashboard/contacts")} className="text-indigo-600 hover:underline">Back to {(ic?.contactLabelPlural || "contacts").toLowerCase()}</button></div>
    </>
  );

  return (
    <>
      <Header title={ic?.contactLabel ? `${ic.contactLabel} Detail` : "Contact Detail"} />
      <div className="p-6">

        {/* Back button */}
        <button onClick={() => router.push("/dashboard/contacts")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to {ic?.contactLabelPlural || "Contacts"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN — Contact Info */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {(contact.firstName?.[0] || contact.email?.[0] || "?").toUpperCase()}
                  </div>
                  <div>
                    {editingProfile ? (
                      <div className="flex gap-2">
                        <input value={profileForm.firstName} onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                          className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="First" />
                        <input value={profileForm.lastName} onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                          className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Last" />
                      </div>
                    ) : (
                      <h1 className="text-lg font-bold text-gray-900">{contact.firstName} {contact.lastName}</h1>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tierColors[tier]}`}>
                        {tier === "whale" && <Crown className="w-3 h-3" />} {tierLabels[tier]}
                      </p>
                      {(() => {
                        const cf = contact.customFields || {};
                        const ltv = cf.ltv || 0;
                        const subStatus = cf.subscriptionStatus || "never";
                        const daysSince = cf.daysSinceLastPurchase || 999;
                        let score = 50;
                        if (subStatus === "active") score += 25;
                        if (subStatus === "canceled") score -= 20;
                        if (ltv > 500) score += 15;
                        if (ltv > 1000) score += 10;
                        if (daysSince < 30) score += 10;
                        if (daysSince > 90) score -= 15;
                        if (daysSince > 180) score -= 15;
                        score = Math.max(0, Math.min(100, score));
                        const color = score >= 80 ? "text-emerald-600 bg-emerald-50" : score >= 50 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
                        return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>Health: {score}</span>;
                      })()}
                    </div>
                  </div>
                </div>
                {!editingProfile ? (
                  <button onClick={startEditProfile} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit profile">
                    <Edit3 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={handleSaveProfile} disabled={savingProfile} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingProfile(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {editingProfile ? (
                    <input value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Email" />
                  ) : contact.email ? (
                    <a href={`mailto:${contact.email}`} className="text-sm text-indigo-600 hover:underline truncate">{contact.email}</a>
                  ) : <span className="text-xs text-gray-400">No email</span>}
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {editingProfile ? (
                    <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Phone" />
                  ) : contact.phone ? (
                    <span className="text-sm text-gray-700">{contact.phone}</span>
                  ) : <span className="text-xs text-gray-400">No phone</span>}
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {editingProfile ? (
                    <input value={profileForm.company} onChange={e => setProfileForm(p => ({ ...p, company: e.target.value }))}
                      className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Company" />
                  ) : contact.company ? (
                    <span className="text-sm text-gray-700">{contact.company}</span>
                  ) : <span className="text-xs text-gray-400">No company</span>}
                </div>
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

            {/* AI Insights */}
            <AIInsights contact={contact} />

            {/* Customer Journey Timeline */}
            <ContactJourney contact={contact} />

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
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Subscription</h3>
                {!editingSub ? (
                  <button onClick={() => setEditingSub(true)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Edit</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSaveSub} disabled={savingSub} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      {savingSub ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => setEditingSub(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>
                )}
              </div>

              {/* Days Left — the hero number */}
              {(() => {
                const endDate = cf.manualActiveUntil || cf.subscriptionEnd;
                const daysLeft = endDate ? Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000) : null;
                const isActive = cf.subscriptionStatus === "active" || (daysLeft !== null && daysLeft > 0);
                return (
                  <div className={`rounded-xl p-4 mb-3 ${isActive ? "bg-emerald-50 border border-emerald-200" : daysLeft !== null && daysLeft <= 0 ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-3xl font-black ${isActive ? "text-emerald-700" : daysLeft !== null && daysLeft <= 0 ? "text-red-600" : "text-gray-400"}`}>
                          {daysLeft !== null ? (daysLeft > 0 ? daysLeft : "Expired") : "—"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {daysLeft !== null && daysLeft > 0 ? "days remaining" : daysLeft !== null && daysLeft <= 0 ? `expired ${Math.abs(daysLeft)} days ago` : "no subscription data"}
                        </p>
                      </div>
                      {endDate && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{daysLeft !== null && daysLeft > 0 ? "Expires" : "Expired"}</p>
                          <p className="text-sm font-medium text-gray-700">{new Date(endDate).toLocaleDateString()}</p>
                          {cf.manualActiveUntil && <p className="text-[10px] text-amber-600 font-medium">Manual override</p>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Edit mode */}
              {editingSub ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Plan Name</label>
                      <input value={subEditPlan} onChange={(e) => setSubEditPlan(e.target.value)} placeholder="VIP Yearly Package"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Amount</label>
                      <input type="number" value={subEditAmount} onChange={(e) => setSubEditAmount(e.target.value)} placeholder="99.00"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Status</label>
                      <select value={subEditStatus} onChange={(e) => setSubEditStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="active">Active</option>
                        <option value="canceled">Canceled</option>
                        <option value="expired">Expired</option>
                        <option value="one-time">One-Time</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Active Until (Manual Override)</label>
                      <input type="date" value={subEditActiveUntil} onChange={(e) => setSubEditActiveUntil(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Manual "Active Until" overrides Stripe subscription end date. Leave blank to use Stripe data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Status</p>
                    <p className={`text-sm font-semibold capitalize ${cf.subscriptionStatus === "active" ? "text-emerald-600" : cf.subscriptionStatus === "canceled" ? "text-red-500" : "text-gray-600"}`}>
                      {cf.subscriptionStatus || "None"}
                    </p>
                  </div>
                  {cf.subscriptionPlan && <div><p className="text-[10px] text-gray-400 uppercase">Plan</p><p className="text-sm font-medium text-gray-900">{cf.subscriptionPlan}</p></div>}
                  {cf.subscriptionAmount && <div><p className="text-[10px] text-gray-400 uppercase">Amount</p><p className="text-sm font-medium text-gray-900">${parseFloat(cf.subscriptionAmount).toFixed(2)}/{cf.subscriptionInterval || "mo"}</p></div>}
                  {cf.subscriptionStart && <div><p className="text-[10px] text-gray-400 uppercase">Since</p><p className="text-sm font-medium text-gray-900">{new Date(cf.subscriptionStart).toLocaleDateString()}</p></div>}
                </div>
              )}

              {subSaveMsg && <p className={`text-xs mt-2 ${subSaveMsg.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{subSaveMsg}</p>}
            </div>

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
