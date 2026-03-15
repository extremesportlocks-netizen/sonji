"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Send, Crown, ChevronRight, Loader2, AlertTriangle } from "lucide-react";

/**
 * MONEY LEFT ON THE TABLE
 * 
 * Shows total historical LTV of lapsed customers as one gut-punch number.
 * Lists top 10 lapsed whales with one-click "Win Back" email trigger.
 * Purpose: make the business owner FEEL the cost of not re-engaging.
 */

interface LapsedCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ltv: number;
  purchases: number;
  daysSince: number;
}

export default function MoneyOnTable() {
  const [lapsed, setLapsed] = useState<LapsedCustomer[]>([]);
  const [totalLapsed, setTotalLapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
        const isDemo = demoIndustry && demoIndustry !== "ecommerce";

        if (isDemo) {
          // Generate demo lapsed customers — fetch more to ensure we get canceled ones
          const res = await fetch(`/api/demo/contacts?industry=${demoIndustry}&pageSize=100`);
          const data = await res.json();
          const contacts = (data.data || [])
            .filter((c: any) => (c.customFields?.subscriptionStatus === "canceled" || c.status === "inactive") && parseFloat(c.customFields?.ltv || "0") > 0)
            .sort((a: any, b: any) => parseFloat(b.customFields?.ltv || "0") - parseFloat(a.customFields?.ltv || "0"))
            .slice(0, 10)
            .map((c: any) => ({
              id: c.id, firstName: c.firstName || "", lastName: c.lastName || "",
              email: c.email || "", ltv: parseFloat(c.customFields?.ltv || "0"),
              purchases: parseInt(c.customFields?.purchaseCount || "0"),
              daysSince: parseInt(c.customFields?.daysSinceLastPurchase || "0"),
            }));
          setLapsed(contacts);
          const sum = contacts.reduce((s: number, c: LapsedCustomer) => s + c.ltv, 0);
          setTotalLapsed(sum * 3.5); // Estimate total from visible sample
        } else {
          // Real data
          const res = await fetch("/api/contacts?tag=Lapsed&sortBy=customFields&sortDir=desc&pageSize=10");
          const data = await res.json();
          const contacts = (data.data || []).map((c: any) => ({
            id: c.id, firstName: c.firstName || "", lastName: c.lastName || "",
            email: c.email || "", ltv: parseFloat(c.customFields?.ltv || "0"),
            purchases: parseInt(c.customFields?.purchaseCount || "0"),
            daysSince: parseInt(c.customFields?.daysSinceLastPurchase || "0"),
          }));
          setLapsed(contacts);

          const allRes = await fetch("/api/contacts?tag=Lapsed&pageSize=1");
          const allData = await allRes.json();
          const total = allData.meta?.total || 0;
          const sumVisible = contacts.reduce((s: number, c: LapsedCustomer) => s + c.ltv, 0);
          const avgLtv = contacts.length > 0 ? sumVisible / contacts.length : 0;
          const estimated = sumVisible + (Math.max(0, total - contacts.length) * avgLtv * 0.4);
          setTotalLapsed(estimated);
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleWinBack = async (customer: LapsedCustomer) => {
    if (!customer.email) return;
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const isDemo = demoIndustry && demoIndustry !== "ecommerce";
    setSendingId(customer.id);
    try {
      if (isDemo) {
        // Simulate send in demo mode — don't send real emails
        await new Promise(r => setTimeout(r, 800));
      } else {
        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send",
            to: customer.email,
            subject: `We miss you, ${customer.firstName}!`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
<h2 style="color:#1a1a2e;">Hey ${customer.firstName},</h2>
<p style="color:#555;line-height:1.6;">It's been ${customer.daysSince} days since we last heard from you, and we wanted to reach out personally.</p>
<p style="color:#555;line-height:1.6;">You've been one of our most valued customers, and we'd love to welcome you back.</p>
<a href="#" style="display:inline-block;background:#6d28d9;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Come Back & Save</a>
<p style="color:#999;font-size:13px;">Reply to this email with any questions. We're here to help.</p>
</div>`,
          }),
        });
      }
      setSentIds(prev => { const next = new Set(prev); next.add(customer.id); return next; });
    } catch {}
    finally { setSendingId(null); }
  };

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>;
  if (lapsed.length === 0) return (
    <div className="text-center py-6">
      <p className="text-sm text-gray-500">No lapsed customers found</p>
      <p className="text-xs text-gray-400 mt-1">Import from Stripe to see lapsed revenue</p>
    </div>
  );

  const fmt = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n.toFixed(0)}`;

  return (
    <div>
      {/* The gut punch */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl p-5 mb-4 border border-red-100">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Money Left on the Table</span>
        </div>
        <p className="text-3xl font-black text-red-700">{fmt(totalLapsed)}</p>
        <p className="text-xs text-red-500/70 mt-1">in lifetime value from lapsed customers who stopped buying</p>
      </div>

      {/* Top lapsed customers with win-back buttons */}
      <div className="space-y-1">
        {lapsed.map((c, i) => (
          <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition group">
            <Link href={`/dashboard/contacts/${c.id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                c.ltv >= 500 ? "bg-red-500" : "bg-amber-400"
              }`}>
                {c.ltv >= 500 ? <Crown className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{c.firstName} {c.lastName}</p>
                <p className="text-[10px] text-gray-400">{c.purchases} purchases · last active {c.daysSince}d ago</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-bold text-red-600">{fmt(c.ltv)}</span>
              {sentIds.has(c.id) ? (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Sent ✓</span>
              ) : (
                <button onClick={() => handleWinBack(c)} disabled={sendingId === c.id || !c.email}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-full transition opacity-0 group-hover:opacity-100">
                  {sendingId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Win Back
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link href="/dashboard/campaigns" className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 mt-3 px-3">
        Run a full re-engagement campaign <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
