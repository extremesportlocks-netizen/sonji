"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, DollarSign, Clock, Zap, TrendingDown, Calculator } from "lucide-react";

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(n >= 1e4 ? 0 : 1)}K` : `$${n.toFixed(0)}`; }

export default function ROIPage() {
  const [crm, setCrm] = useState(297); // GHL $297/mo
  const [email, setEmail] = useState(79); // Mailchimp
  const [sms, setSms] = useState(150); // Twilio markup
  const [pm, setPm] = useState(42); // Monday.com
  const [scheduling, setScheduling] = useState(15); // Calendly
  const [analytics, setAnalytics] = useState(49); // Databox
  const [teamSize, setTeamSize] = useState(5);
  const [plan, setPlan] = useState<"starter" | "growth" | "scale">("growth");

  const sonjiPrice = plan === "starter" ? 99 : plan === "growth" ? 199 : 349;
  const currentTotal = crm + email + sms + pm + scheduling + analytics;
  const annualSavings = (currentTotal - sonjiPrice) * 12;
  const hoursSaved = teamSize * 8; // 8 hrs/week per person saved by automations
  const monthlyHoursSaved = hoursSaved * 4;
  const hourValue = 50; // conservative
  const productivityValue = monthlyHoursSaved * hourValue;
  const totalROI = annualSavings + (productivityValue * 12);

  const tools = [
    { label: "CRM (GoHighLevel, HubSpot, etc.)", value: crm, set: setCrm, placeholder: "297" },
    { label: "Email marketing (Mailchimp, etc.)", value: email, set: setEmail, placeholder: "79" },
    { label: "SMS / Twilio markup", value: sms, set: setSms, placeholder: "150" },
    { label: "Project management (Monday, Asana)", value: pm, set: setPm, placeholder: "42" },
    { label: "Scheduling (Calendly, etc.)", value: scheduling, set: setScheduling, placeholder: "15" },
    { label: "Analytics / reporting tools", value: analytics, set: setAnalytics, placeholder: "49" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="text-xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></Link>
          <div className="flex items-center gap-4">
            <Link href="/compare" className="text-sm text-gray-600 hover:text-gray-900 transition">Compare</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">ROI Calculator</span>
            <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-4">How much will you save?</h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Enter what you're currently paying. We'll show you the math.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT — Inputs */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Your current monthly costs</h2>
                <div className="space-y-3">
                  {tools.map(t => (
                    <div key={t.label} className="flex items-center justify-between gap-4">
                      <label className="text-sm text-gray-600 flex-1">{t.label}</label>
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input type="number" value={t.value} onChange={(e) => t.set(Number(e.target.value) || 0)}
                          className="w-full pl-7 pr-3 py-2 text-sm text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Current monthly total</span>
                    <span className="text-lg font-bold text-red-600">${currentTotal}/mo</span>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm text-gray-600 block mb-2">Team size</label>
                  <input type="range" min="1" max="50" value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full accent-indigo-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span><span>{teamSize} members</span><span>50</span>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm text-gray-600 block mb-2">Sonji plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([["starter", "$99"], ["growth", "$199"], ["scale", "$349"]] as const).map(([p, price]) => (
                      <button key={p} onClick={() => setPlan(p)}
                        className={`py-2.5 text-sm font-medium rounded-lg border-2 transition ${plan === p ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        {price}
                        <span className="block text-[10px] text-gray-400 capitalize">{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Results */}
            <div className="space-y-4">
              {/* Savings Card */}
              <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white">
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Your savings with Sonji</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-3xl font-bold">{fmt(annualSavings > 0 ? annualSavings : 0)}</p>
                    <p className="text-sm text-white/60">Annual tool savings</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{monthlyHoursSaved}h</p>
                    <p className="text-sm text-white/60">Hours saved / month</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/80">Total annual ROI</span>
                    <span className="text-2xl font-bold text-white">{fmt(totalROI > 0 ? totalROI : 0)}</span>
                  </div>
                  <p className="text-xs text-white/50">Tool savings + productivity gains ({monthlyHoursSaved}h × ${hourValue}/hr × 12)</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly comparison</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">Current stack (6 tools)</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">${currentTotal}/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-gray-600">Sonji ({plan})</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">${sonjiPrice}/mo</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Monthly savings</span>
                    <span className="text-lg font-bold text-indigo-600">{fmt(currentTotal - sonjiPrice > 0 ? currentTotal - sonjiPrice : 0)}/mo</span>
                  </div>
                </div>
              </div>

              {/* What you replace */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tools Sonji replaces</h3>
                <div className="flex flex-wrap gap-2">
                  {["GoHighLevel", "HubSpot", "Mailchimp", "Twilio", "Monday.com", "Asana", "Calendly", "Databox", "Salesforce"].map(t => (
                    <span key={t} className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full line-through decoration-red-400">{t}</span>
                  ))}
                </div>
              </div>

              <Link href="/signup" className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition">
                Start saving today <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
