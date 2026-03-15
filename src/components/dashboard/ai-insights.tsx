"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

/**
 * AI CONTACT INSIGHTS
 * 
 * Analyzes a contact's data and generates 2-3 actionable insights.
 * No CRM shows you what to DO with the data. Sonji does.
 */

interface Insight {
  emoji: string;
  text: string;
  action?: string;
}

function generateInsights(contact: any): Insight[] {
  const cf = contact?.customFields || {};
  const insights: Insight[] = [];

  const ltv = parseFloat(cf.ltv || "0");
  const purchases = parseInt(cf.purchaseCount || "0");
  const daysSince = parseInt(cf.daysSinceLastPurchase || "0");
  const avgOrder = parseFloat(cf.avgOrderValue || "0");
  const highestCharge = parseFloat(cf.highestCharge || "0");
  const subStatus = cf.subscriptionStatus || "never";
  const tags = Array.isArray(contact?.tags) ? contact.tags : [];

  // Seasonal buyer detection
  if (purchases >= 3 && daysSince > 60 && daysSince < 400) {
    insights.push({
      emoji: "📅",
      text: `Purchased ${purchases}x then went quiet ${daysSince} days ago. Could be seasonal — check if their buying pattern repeats annually.`,
      action: "Send a re-engagement email timed to their usual buying cycle",
    });
  }

  // Whale going cold
  if (ltv >= 500 && daysSince > 90 && subStatus !== "active") {
    insights.push({
      emoji: "🐋",
      text: `Top-tier customer with $${ltv.toLocaleString()} lifetime value, but inactive for ${daysSince} days. This is your highest ROI win-back target.`,
      action: "Personal outreach — phone call or personalized email, not a mass campaign",
    });
  }

  // LTV trending up
  if (purchases >= 3 && avgOrder > 0 && highestCharge > avgOrder * 1.3) {
    insights.push({
      emoji: "📈",
      text: `Their highest single purchase ($${highestCharge.toFixed(0)}) was ${((highestCharge / avgOrder - 1) * 100).toFixed(0)}% above their average. Spending is trending up — upsell candidate.`,
      action: "Offer a premium tier or annual plan while they're in growth mode",
    });
  }

  // Active subscriber — nurture
  if (subStatus === "active") {
    insights.push({
      emoji: "💚",
      text: `Active subscriber generating steady recurring revenue. Focus on retention, not acquisition.`,
      action: "Send a VIP thank-you or exclusive early access to new features",
    });
  }

  // Recently lapsed — urgency window
  if (subStatus === "canceled" && daysSince < 30) {
    insights.push({
      emoji: "⚡",
      text: `Canceled just ${daysSince} days ago — still in the win-back window. The first 30 days after cancellation have the highest recovery rate.`,
      action: "Reach out NOW — offer a comeback discount or ask what went wrong",
    });
  }

  // Long-term lapsed
  if (subStatus === "canceled" && daysSince > 180) {
    insights.push({
      emoji: "💤",
      text: `Gone for ${daysSince} days. Traditional re-engagement emails won't work. They've moved on mentally.`,
      action: "Try a completely different channel — SMS with a bold offer, or a handwritten note",
    });
  }

  // One-time buyer
  if (purchases === 1 && ltv > 0) {
    insights.push({
      emoji: "1️⃣",
      text: `Single purchase of $${ltv.toFixed(0)}. Hasn't come back. The gap between 1st and 2nd purchase is where most businesses lose customers.`,
      action: "Automated follow-up sequence: Day 3 thank-you, Day 7 tips, Day 14 second offer",
    });
  }

  // High frequency buyer
  if (purchases >= 10) {
    insights.push({
      emoji: "🔥",
      text: `${purchases} purchases — this is a power user. They trust your brand. Stop treating them like everyone else.`,
      action: "Create a VIP tier, give them early access, or ask them to refer friends",
    });
  }

  // No email
  if (!contact?.email) {
    insights.push({
      emoji: "📧",
      text: "No email on file. You can't run campaigns to this contact until you capture their email.",
      action: "Reach out via phone or SMS to collect their email address",
    });
  }

  // No phone
  if (!contact?.phone && contact?.email && purchases > 3) {
    insights.push({
      emoji: "📱",
      text: "High-value customer with no phone number. SMS has 98% open rate vs 20% for email.",
      action: "Ask for their phone number in your next email or at next interaction",
    });
  }

  return insights.slice(0, 3); // Max 3 insights
}

export default function AIInsights({ contact }: { contact: any }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate brief "thinking" delay for UX
    const timer = setTimeout(() => {
      setInsights(generateInsights(contact));
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [contact]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setInsights(generateInsights(contact));
      setLoading(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-semibold text-violet-700">AI Insights</span>
        </div>
        <div className="flex items-center gap-2 py-3">
          <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
          <span className="text-xs text-violet-500">Analyzing contact data...</span>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-100 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-semibold text-violet-700">AI Insights</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Not enough data yet to generate insights. More purchase history will unlock recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-semibold text-violet-700">AI Insights</span>
        </div>
        <button onClick={refresh} className="text-violet-400 hover:text-violet-600 transition">
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div key={i} className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-sm text-gray-800 leading-relaxed">
              <span className="mr-1.5">{ins.emoji}</span>
              {ins.text}
            </p>
            {ins.action && (
              <p className="text-xs text-violet-600 font-medium mt-1.5 pl-6">→ {ins.action}</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-[9px] text-violet-400 mt-2 flex items-center gap-1">
        <Sparkles className="w-2.5 h-2.5" /> Powered by Sonji AI
      </p>
    </div>
  );
}
