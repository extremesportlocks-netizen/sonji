"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  CreditCard, DollarSign, Calendar, CheckCircle, ArrowRight,
  Download, Shield, Zap, TrendingUp, Star, Crown,
} from "lucide-react";

const plans = [
  { id: "starter", name: "Starter", price: 99, features: ["2,500 contacts", "3 team members", "Basic automations", "Email (5K/mo)"] },
  { id: "growth", name: "Growth", price: 199, features: ["25,000 contacts", "15 team members", "AI + Ghosting Alerts", "Email + SMS (BYOK)", "Project management", "Custom domain"], popular: true },
  { id: "scale", name: "Scale", price: 349, features: ["Unlimited contacts", "Unlimited team", "White-label", "API access", "Affiliate system", "Priority support"] },
];

const invoiceHistory = [
  { id: "inv-006", date: "Mar 1, 2026", amount: 199, status: "paid" },
  { id: "inv-005", date: "Feb 1, 2026", amount: 199, status: "paid" },
  { id: "inv-004", date: "Jan 1, 2026", amount: 199, status: "paid" },
  { id: "inv-003", date: "Dec 1, 2025", amount: 99, status: "paid" },
  { id: "inv-002", date: "Nov 1, 2025", amount: 99, status: "paid" },
  { id: "inv-001", date: "Oct 15, 2025", amount: 0, status: "trial" },
];

export default function BillingPage() {
  const [currentPlan] = useState("growth");
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <Header title="Billing" />
      <div className="p-6 space-y-6">
        {/* Current Plan */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">Current Plan</span>
              </div>
              <h2 className="text-3xl font-bold">Growth</h2>
              <p className="text-white/60 text-sm mt-1">$199/month · Renews April 1, 2026</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">$199</p>
              <p className="text-sm text-white/50">/month</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> 25,000 contacts</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> 15 team members</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> AI + automations included</span>
          </div>
        </div>

        {/* Usage */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Contacts Used", value: "4,075", max: "25,000", pct: 16.3, color: "bg-indigo-500" },
            { label: "Team Members", value: "5", max: "15", pct: 33.3, color: "bg-violet-500" },
            { label: "Email Sends", value: "3,247", max: "25,000", pct: 13, color: "bg-blue-500" },
            { label: "SMS Sent", value: "842", max: "5,000", pct: 16.8, color: "bg-teal-500" },
          ].map(u => (
            <div key={u.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">{u.label}</p>
              <p className="text-lg font-bold text-gray-900 mb-2">{u.value} <span className="text-xs text-gray-400 font-normal">/ {u.max}</span></p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${u.color}`} style={{ width: `${u.pct}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{u.pct}% used</p>
            </div>
          ))}
        </div>

        {/* Plan Comparison */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Change Plan</h3>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setAnnual(false)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${!annual ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Monthly</button>
              <button onClick={() => setAnnual(true)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${annual ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Annual <span className="text-emerald-600">(-20%)</span></button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {plans.map(plan => {
              const price = annual ? Math.round(plan.price * 0.8) : plan.price;
              const isCurrent = plan.id === currentPlan;
              return (
                <div key={plan.id} className={`rounded-xl border-2 p-5 transition ${isCurrent ? "border-indigo-500 bg-indigo-50/30" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900">{plan.name}</h4>
                    {plan.popular && <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Popular</span>}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-4">${price}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
                  <div className="space-y-2 mb-4">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{f}</span>
                      </div>
                    ))}
                  </div>
                  {isCurrent ? (
                    <div className="text-center py-2 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-lg">Current Plan</div>
                  ) : (
                    <button className="w-full py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                      {plan.price > 199 ? "Upgrade" : "Switch"} to {plan.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                <p className="text-xs text-gray-400">Expires 12/2028</p>
              </div>
            </div>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Update</button>
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Invoice History</h3>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Invoice</th>
              <th className="text-left text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Date</th>
              <th className="text-left text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Amount</th>
              <th className="text-left text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Status</th>
              <th className="text-right text-[10px] text-gray-400 font-medium uppercase tracking-wider px-5 py-2.5">Download</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {invoiceHistory.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3 text-sm text-gray-900 font-mono">{inv.id}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{inv.date}</td>
                  <td className="px-5 py-3 text-sm text-gray-900 font-medium">{inv.amount > 0 ? `$${inv.amount}` : "Free"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      inv.status === "paid" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                      "bg-gray-50 border-gray-200 text-gray-400"
                    }`}>{inv.status === "paid" ? "Paid" : "Free Trial"}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {inv.amount > 0 && (
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
