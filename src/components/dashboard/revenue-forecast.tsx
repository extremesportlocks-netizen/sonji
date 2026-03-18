"use client";

import { getActiveIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Calendar, ChevronRight } from "lucide-react";

/**
 * REVENUE FORECAST
 * 
 * Projects future revenue based on:
 * - Recurring retainers/subscriptions (predictable)
 * - Pipeline deals × close probability (weighted)
 * - Historical monthly average
 * 
 * Shows a 3-month rolling forecast with confidence bands.
 */

interface ForecastData {
  months: { name: string; recurring: number; pipeline: number; total: number }[];
  currentMRR: number;
  pipelineWeighted: number;
  confidenceLevel: string;
}

const INDUSTRY_FORECASTS: Record<string, ForecastData> = {
  agency_consulting: {
    currentMRR: 27500, // Brightview $8.5K + Sterling $10K + Coastal $6K + Harbor custom
    pipelineWeighted: 18400, // Apex $3K * 80% + Summit negotiation weighted
    confidenceLevel: "High",
    months: [
      { name: "Apr", recurring: 27500, pipeline: 6000, total: 33500 },
      { name: "May", recurring: 27500, pipeline: 9200, total: 36700 },
      { name: "Jun", recurring: 30500, pipeline: 3200, total: 33700 },
    ],
  },
  health_wellness: {
    currentMRR: 18200,
    pipelineWeighted: 8500,
    confidenceLevel: "Medium",
    months: [
      { name: "Apr", recurring: 18200, pipeline: 4800, total: 23000 },
      { name: "May", recurring: 19500, pipeline: 3700, total: 23200 },
      { name: "Jun", recurring: 20100, pipeline: 2400, total: 22500 },
    ],
  },
  ecommerce: {
    currentMRR: 14985,
    pipelineWeighted: 2970,
    confidenceLevel: "High",
    months: [
      { name: "Apr", recurring: 14985, pipeline: 1200, total: 16185 },
      { name: "May", recurring: 15800, pipeline: 800, total: 16600 },
      { name: "Jun", recurring: 16200, pipeline: 600, total: 16800 },
    ],
  },
  home_services: {
    currentMRR: 4200,
    pipelineWeighted: 28700,
    confidenceLevel: "Medium",
    months: [
      { name: "Apr", recurring: 4200, pipeline: 18500, total: 22700 },
      { name: "May", recurring: 4200, pipeline: 8200, total: 12400 },
      { name: "Jun", recurring: 4200, pipeline: 4200, total: 8400 },
    ],
  },
  legal: {
    currentMRR: 8750,
    pipelineWeighted: 22500,
    confidenceLevel: "Low",
    months: [
      { name: "Apr", recurring: 8750, pipeline: 12000, total: 20750 },
      { name: "May", recurring: 8750, pipeline: 7500, total: 16250 },
      { name: "Jun", recurring: 8750, pipeline: 3000, total: 11750 },
    ],
  },
  fitness_gym: {
    currentMRR: 42000, pipelineWeighted: 4800, confidenceLevel: "High",
    months: [
      { name: "Apr", recurring: 42000, pipeline: 3200, total: 45200 },
      { name: "May", recurring: 43500, pipeline: 1600, total: 45100 },
      { name: "Jun", recurring: 44000, pipeline: 1200, total: 45200 },
    ],
  },
  beauty_salon: {
    currentMRR: 28400, pipelineWeighted: 3600, confidenceLevel: "Medium",
    months: [
      { name: "Apr", recurring: 28400, pipeline: 2400, total: 30800 },
      { name: "May", recurring: 29200, pipeline: 1200, total: 30400 },
      { name: "Jun", recurring: 30000, pipeline: 800, total: 30800 },
    ],
  },
  real_estate: {
    currentMRR: 0, pipelineWeighted: 71000, confidenceLevel: "Low",
    months: [
      { name: "Apr", recurring: 0, pipeline: 36000, total: 36000 },
      { name: "May", recurring: 0, pipeline: 26700, total: 26700 },
      { name: "Jun", recurring: 0, pipeline: 8300, total: 8300 },
    ],
  },
  coaching_education: {
    currentMRR: 56833, pipelineWeighted: 8000, confidenceLevel: "High",
    months: [
      { name: "Apr", recurring: 56833, pipeline: 5000, total: 61833 },
      { name: "May", recurring: 56833, pipeline: 3000, total: 59833 },
      { name: "Jun", recurring: 48000, pipeline: 8000, total: 56000 },
    ],
  },
  restaurant_food: {
    currentMRR: 82000, pipelineWeighted: 7750, confidenceLevel: "High",
    months: [
      { name: "Apr", recurring: 82000, pipeline: 4250, total: 86250 },
      { name: "May", recurring: 84000, pipeline: 3500, total: 87500 },
      { name: "Jun", recurring: 85000, pipeline: 2000, total: 87000 },
    ],
  },
  automotive: {
    currentMRR: 24500, pipelineWeighted: 6800, confidenceLevel: "Medium",
    months: [
      { name: "Apr", recurring: 24500, pipeline: 4800, total: 29300 },
      { name: "May", recurring: 25000, pipeline: 2000, total: 27000 },
      { name: "Jun", recurring: 25500, pipeline: 1500, total: 27000 },
    ],
  },
  nonprofit: {
    currentMRR: 6500, pipelineWeighted: 40000, confidenceLevel: "Medium",
    months: [
      { name: "Apr", recurring: 6500, pipeline: 25000, total: 31500 },
      { name: "May", recurring: 7000, pipeline: 15000, total: 22000 },
      { name: "Jun", recurring: 7000, pipeline: 5000, total: 12000 },
    ],
  },
};

const DEFAULT_FORECAST: ForecastData = {
  currentMRR: 8000, pipelineWeighted: 5000, confidenceLevel: "Medium",
  months: [
    { name: "Apr", recurring: 8000, pipeline: 3000, total: 11000 },
    { name: "May", recurring: 8000, pipeline: 2000, total: 10000 },
    { name: "Jun", recurring: 8000, pipeline: 1000, total: 9000 },
  ],
};

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`; }

export default function RevenueForecast() {
  const [data, setData] = useState<ForecastData | null>(null);

  useEffect(() => {
    const demoIndustry = getActiveIndustry();
    const key = demoIndustry; if (!key) return;
    setData(INDUSTRY_FORECASTS[key] || DEFAULT_FORECAST);
  }, []);

  if (!data) return null;

  const maxVal = Math.max(...data.months.map(m => m.total));
  const total3mo = data.months.reduce((s, m) => s + m.total, 0);
  const confColor = data.confidenceLevel === "High" ? "text-emerald-600 bg-emerald-50" : data.confidenceLevel === "Medium" ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Revenue Forecast</h3>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${confColor}`}>{data.confidenceLevel} confidence</span>
        </div>
        <span className="text-xs text-gray-400">Next 3 months</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-[10px] text-gray-400">Current MRR</p>
          <p className="text-sm font-bold text-gray-900">{fmt(data.currentMRR)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-[10px] text-gray-400">Pipeline (weighted)</p>
          <p className="text-sm font-bold text-gray-900">{fmt(data.pipelineWeighted)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-[10px] text-gray-400">3-Mo Forecast</p>
          <p className="text-sm font-bold text-indigo-600">{fmt(total3mo)}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3">
        {data.months.map(m => (
          <div key={m.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">{m.name} 2026</span>
              <span className="text-xs font-bold text-gray-900">{fmt(m.total)}</span>
            </div>
            <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-indigo-500 rounded-l-full" style={{ width: `${(m.recurring / maxVal) * 100}%` }} title={`Recurring: ${fmt(m.recurring)}`} />
              <div className="h-full bg-indigo-300" style={{ width: `${(m.pipeline / maxVal) * 100}%` }} title={`Pipeline: ${fmt(m.pipeline)}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-500" />
          <span className="text-[10px] text-gray-400">Recurring</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-300" />
          <span className="text-[10px] text-gray-400">Pipeline (weighted)</span>
        </div>
      </div>
    </div>
  );
}
