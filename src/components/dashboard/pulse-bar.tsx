"use client";

import { useState, useEffect } from "react";

/**
 * PULSE BAR
 * 
 * A thin animated bar under the header that reflects business health.
 * Green = healthy. Amber = attention needed. Red = urgent.
 * 
 * The bar pulses — slower when healthy, faster when something needs attention.
 * Business owners don't read it. They feel it.
 */

interface HealthData {
  score: number; // 0-100
  factors: { label: string; impact: "positive" | "warning" | "critical" }[];
}

function computeHealth(stats: any): HealthData {
  if (!stats) return { score: 50, factors: [] };

  let score = 50; // Start neutral
  const factors: HealthData["factors"] = [];

  const revenue = stats.revenue?.total || 0;
  const contacts = stats.totalContacts || 0;
  const activeDeals = stats.activeDeals || 0;
  const openTasks = stats.openTasks || 0;
  const activeSubs = stats.subscriptionBreakdown?.active || 0;
  const canceledSubs = stats.subscriptionBreakdown?.canceled || 0;
  const whales = stats.ltvBuckets?.whale || 0;

  // Revenue signals
  if (revenue > 100000) { score += 15; factors.push({ label: "Strong revenue", impact: "positive" }); }
  else if (revenue > 10000) { score += 8; }
  else if (revenue === 0) { score -= 5; }

  // Contact growth
  if (contacts > 1000) { score += 10; factors.push({ label: "Large contact base", impact: "positive" }); }
  else if (contacts > 100) { score += 5; }
  else if (contacts < 10) { score -= 10; factors.push({ label: "Low contacts", impact: "warning" }); }

  // Active deals
  if (activeDeals > 5) { score += 8; factors.push({ label: "Active pipeline", impact: "positive" }); }
  else if (activeDeals === 0 && contacts > 50) { score -= 8; factors.push({ label: "No active deals", impact: "warning" }); }

  // Subscription health
  if (activeSubs > 0 && canceledSubs > activeSubs * 2) {
    score -= 15; factors.push({ label: "High churn rate", impact: "critical" });
  } else if (activeSubs > canceledSubs) {
    score += 10; factors.push({ label: "Healthy retention", impact: "positive" });
  }

  // Whales
  if (whales > 20) { score += 8; factors.push({ label: "Strong whale segment", impact: "positive" }); }

  // Open tasks
  if (openTasks > 20) { score -= 5; factors.push({ label: "Task backlog growing", impact: "warning" }); }

  return { score: Math.max(0, Math.min(100, score)), factors };
}

function getHealthColor(score: number): { from: string; to: string; glow: string } {
  if (score >= 70) return { from: "#10b981", to: "#34d399", glow: "rgba(16,185,129,0.3)" };
  if (score >= 45) return { from: "#f59e0b", to: "#fbbf24", glow: "rgba(245,158,11,0.3)" };
  return { from: "#ef4444", to: "#f87171", glow: "rgba(239,68,68,0.3)" };
}

function getPulseSpeed(score: number): number {
  if (score >= 70) return 4; // Slow, calm
  if (score >= 45) return 2.5; // Medium, attention
  return 1.5; // Fast, urgent
}

export default function PulseBar({ stats }: { stats: any }) {
  const [health, setHealth] = useState<HealthData>({ score: 50, factors: [] });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (stats) setHealth(computeHealth(stats));
  }, [stats]);

  const colors = getHealthColor(health.score);
  const speed = getPulseSpeed(health.score);

  return (
    <div className="relative">
      {/* The bar */}
      <div
        className="h-[3px] w-full relative overflow-hidden cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ background: `linear-gradient(90deg, ${colors.from}22, ${colors.from}44, ${colors.from}22)` }}
      >
        {/* Animated pulse wave */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.from} 30%, ${colors.to} 50%, ${colors.from} 70%, transparent 100%)`,
            animation: `pulseSlide ${speed}s ease-in-out infinite`,
            boxShadow: `0 0 8px ${colors.glow}`,
          }}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
          <div className="bg-gray-900 text-white rounded-xl px-4 py-3 shadow-lg min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/60">Business Health</span>
              <span className={`text-sm font-bold ${health.score >= 70 ? "text-emerald-400" : health.score >= 45 ? "text-amber-400" : "text-red-400"}`}>
                {health.score}/100
              </span>
            </div>
            {health.factors.length > 0 && (
              <div className="space-y-1">
                {health.factors.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      f.impact === "positive" ? "bg-emerald-400" :
                      f.impact === "warning" ? "bg-amber-400" : "bg-red-400"
                    }`} />
                    <span className="text-[11px] text-white/70">{f.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45" />
          </div>
        </div>
      )}

      {/* CSS animation */}
      <style jsx>{`
        @keyframes pulseSlide {
          0% { transform: translateX(-100%); opacity: 0.4; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
