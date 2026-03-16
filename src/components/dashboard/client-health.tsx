"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

/**
 * CLIENT HEALTH SCORE
 * 
 * Combines multiple signals into a 0-100 health score per client:
 * - Communication frequency (are they responsive?)
 * - Payment reliability (on time? overdue?)
 * - Deal stage progression (moving forward or stalled?)
 * - Activity recency (when was last interaction?)
 * 
 * Green 80-100, Amber 50-79, Red 0-49
 */

interface ClientHealth {
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  signal: string;
  lastActivity: string;
}

const INDUSTRY_HEALTH: Record<string, ClientHealth[]> = {
  agency_consulting: [
    { name: "Brightview Hotels", score: 92, trend: "up", signal: "Engaged, on-time payments, growing scope", lastActivity: "2 hours ago" },
    { name: "Sterling Partners", score: 78, trend: "down", signal: "Hinting at scope reduction — renewal at risk", lastActivity: "2 days ago" },
    { name: "Meridian Law Group", score: 88, trend: "up", signal: "Active on website redesign, responsive", lastActivity: "1 day ago" },
    { name: "Harbor Dental", score: 85, trend: "stable", signal: "Content approved, steady engagement", lastActivity: "2 days ago" },
    { name: "Summit Athletics", score: 72, trend: "stable", signal: "Brand project on track, moderate engagement", lastActivity: "3 days ago" },
    { name: "Coastal Real Estate", score: 38, trend: "down", signal: "Email frequency dropped 80%, on hold", lastActivity: "12 days ago" },
    { name: "Apex Construction", score: 65, trend: "up", signal: "New prospect, in discovery — not yet committed", lastActivity: "1 day ago" },
    { name: "Nova Fitness", score: 0, trend: "down", signal: "Churned — project completed, no renewal", lastActivity: "15 days ago" },
  ],
  health_wellness: [
    { name: "Sarah Thompson", score: 90, trend: "up", signal: "Active treatment, engaged, on-time payments", lastActivity: "1 hour ago" },
    { name: "Maria Santos", score: 85, trend: "stable", signal: "Regular Botox patient, consistent schedule", lastActivity: "2 days ago" },
    { name: "David Kim", score: 82, trend: "up", signal: "Upgrading to IV therapy 4-pack", lastActivity: "Yesterday" },
    { name: "Emily Rodriguez", score: 70, trend: "up", signal: "New patient — intake submitted, consultation pending", lastActivity: "30 min ago" },
    { name: "Patricia Lee", score: 32, trend: "down", signal: "Missed 2 appointments — ghosting risk", lastActivity: "18 days ago" },
    { name: "Alex Rivera", score: 48, trend: "down", signal: "Botox rebooking 3 weeks overdue", lastActivity: "15 weeks ago" },
  ],
  ecommerce: [
    { name: "Chris Persaud", score: 95, trend: "up", signal: "VIP milestone, highly engaged, 4-0 today", lastActivity: "4 hours ago" },
    { name: "Wayne Barry", score: 88, trend: "up", signal: "Upgrading monthly → yearly VIP", lastActivity: "Today" },
    { name: "Tyler McLaughlin", score: 62, trend: "down", signal: "Login frequency down 60%", lastActivity: "8 days ago" },
    { name: "Andrew Krieman", score: 35, trend: "down", signal: "VIP payment failed, 34 days inactive", lastActivity: "34 days ago" },
    { name: "Raquel Munoz", score: 28, trend: "down", signal: "Top-5 customer, 45 days since last purchase", lastActivity: "45 days ago" },
  ],
  home_services: [
    { name: "Linda Garcia", score: 88, trend: "stable", signal: "Roof job in progress, deposit paid, engaged", lastActivity: "9 hours ago" },
    { name: "Thomas Brown", score: 82, trend: "up", signal: "HVAC install confirmed, responsive", lastActivity: "Yesterday" },
    { name: "Susan Taylor", score: 90, trend: "up", signal: "Emergency handled quickly — high satisfaction", lastActivity: "3 hours ago" },
    { name: "Richard Wilson", score: 30, trend: "down", signal: "Estimate sent 14 days ago, no response", lastActivity: "14 days ago" },
  ],
  legal: [
    { name: "Marcus Johnson", score: 72, trend: "down", signal: "Documents 21 days overdue — case progress stalled", lastActivity: "21 days ago" },
    { name: "Sarah Mitchell", score: 68, trend: "stable", signal: "Active case, missed check-in but responsive", lastActivity: "2 days ago" },
    { name: "Harbor Construction", score: 85, trend: "up", signal: "Mediation prep underway, fully engaged", lastActivity: "Yesterday" },
    { name: "Patricia Williams", score: 78, trend: "up", signal: "New client — engagement letter pending", lastActivity: "Today" },
  ],
};

export default function ClientHealth() {
  const [clients, setClients] = useState<ClientHealth[]>([]);

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = demoIndustry || "ecommerce";
    setClients(INDUSTRY_HEALTH[key] || []);
  }, []);

  if (clients.length === 0) return null;

  const avgScore = Math.round(clients.reduce((s, c) => s + c.score, 0) / clients.length);
  const atRisk = clients.filter(c => c.score < 50).length;
  const scoreColor = (s: number) => s >= 80 ? "text-emerald-600" : s >= 50 ? "text-amber-600" : "text-red-600";
  const scoreBg = (s: number) => s >= 80 ? "bg-emerald-50" : s >= 50 ? "bg-amber-50" : "bg-red-50";
  const trendIcon = (t: string) => t === "up" ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : t === "down" ? <TrendingDown className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3 text-gray-400" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Client Health</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreBg(avgScore)} ${scoreColor(avgScore)}`}>Avg: {avgScore}</span>
          {atRisk > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" /> {atRisk} at risk
            </span>
          )}
        </div>
        <Link href="/dashboard/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
          All contacts <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {clients.slice(0, 6).map(c => (
          <div key={c.name} className="flex items-center gap-3 py-1.5">
            {/* Score Circle */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${scoreBg(c.score)}`}>
              <span className={`text-xs font-bold ${scoreColor(c.score)}`}>{c.score}</span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-medium text-gray-900 truncate">{c.name}</span>
                {trendIcon(c.trend)}
              </div>
              <p className="text-[10px] text-gray-400 truncate">{c.signal}</p>
            </div>
            {/* Last Activity */}
            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{c.lastActivity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
