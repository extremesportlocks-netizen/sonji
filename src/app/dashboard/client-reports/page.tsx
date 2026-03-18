"use client";

import { getActiveIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  FileText, Plus, Download, Send, Eye, Clock, CheckCircle,
  TrendingUp, DollarSign, Users, BarChart3, Calendar,
  ChevronRight, Star, Zap,
} from "lucide-react";

interface ClientReport {
  id: string;
  client: string;
  period: string;
  status: "draft" | "sent" | "viewed";
  sentDate: string | null;
  metrics: {
    revenue: number;
    leads: number;
    conversions: number;
    sessions: number;
    roas: number;
  };
}

const DEMO_REPORTS: Record<string, ClientReport[]> = {
  agency_consulting: [
    { id: "r1", client: "Brightview Hotels", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 34200, leads: 89, conversions: 12, sessions: 4500, roas: 4.2 } },
    { id: "r2", client: "Sterling Partners", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 28500, leads: 45, conversions: 8, sessions: 2800, roas: 3.1 } },
    { id: "r3", client: "Meridian Law Group", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 0, leads: 67, conversions: 0, sessions: 1200, roas: 0 } },
    { id: "r4", client: "Brightview Hotels", period: "February 2026", status: "viewed", sentDate: "Mar 2", metrics: { revenue: 31800, leads: 76, conversions: 10, sessions: 4100, roas: 3.8 } },
    { id: "r5", client: "Sterling Partners", period: "February 2026", status: "sent", sentDate: "Mar 1", metrics: { revenue: 25200, leads: 38, conversions: 6, sessions: 2500, roas: 2.9 } },
    { id: "r6", client: "Harbor Dental", period: "February 2026", status: "viewed", sentDate: "Mar 3", metrics: { revenue: 12400, leads: 34, conversions: 5, sessions: 1800, roas: 2.5 } },
    { id: "r7", client: "Coastal Real Estate", period: "February 2026", status: "viewed", sentDate: "Mar 1", metrics: { revenue: 18900, leads: 52, conversions: 7, sessions: 3200, roas: 3.2 } },
  ],
  health_wellness: [
    { id: "r1", client: "Monthly Practice Report", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 48200, leads: 34, conversions: 28, sessions: 0, roas: 0 } },
    { id: "r2", client: "Monthly Practice Report", period: "February 2026", status: "viewed", sentDate: "Mar 2", metrics: { revenue: 42800, leads: 29, conversions: 24, sessions: 0, roas: 0 } },
  ],
  ecommerce: [
    { id: "r1", client: "ESL Sports Monthly", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 14985, leads: 23, conversions: 18, sessions: 0, roas: 0 } },
    { id: "r2", client: "ESL Sports Monthly", period: "February 2026", status: "viewed", sentDate: "Mar 1", metrics: { revenue: 13200, leads: 19, conversions: 14, sessions: 0, roas: 0 } },
  ],
  home_services: [
    { id: "r1", client: "Monthly Business Report", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 33500, leads: 12, conversions: 8, sessions: 0, roas: 0 } },
    { id: "r2", client: "Monthly Business Report", period: "February 2026", status: "viewed", sentDate: "Mar 2", metrics: { revenue: 28900, leads: 9, conversions: 6, sessions: 0, roas: 0 } },
  ],
  fitness_gym: [
    { id: "r1", client: "Monthly Membership Report", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 42000, leads: 34, conversions: 18, sessions: 0, roas: 0 } },
    { id: "r2", client: "Monthly Membership Report", period: "February 2026", status: "viewed", sentDate: "Mar 1", metrics: { revenue: 38500, leads: 28, conversions: 15, sessions: 0, roas: 0 } },
  ],
  beauty_salon: [
    { id: "r1", client: "Monthly Salon Report", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 28400, leads: 45, conversions: 38, sessions: 0, roas: 0 } },
    { id: "r2", client: "Monthly Salon Report", period: "February 2026", status: "viewed", sentDate: "Mar 2", metrics: { revenue: 25200, leads: 40, conversions: 34, sessions: 0, roas: 0 } },
  ],
  real_estate: [
    { id: "r1", client: "Quarterly Market Report", period: "Q1 2026", status: "draft", sentDate: null, metrics: { revenue: 71000, leads: 67, conversions: 4, sessions: 0, roas: 0 } },
    { id: "r2", client: "Quarterly Market Report", period: "Q4 2025", status: "viewed", sentDate: "Jan 5", metrics: { revenue: 58000, leads: 52, conversions: 3, sessions: 0, roas: 0 } },
  ],
  legal: [
    { id: "r1", client: "Monthly Practice Report", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 16750, leads: 12, conversions: 6, sessions: 0, roas: 0 } },
    { id: "r2", client: "Monthly Practice Report", period: "February 2026", status: "viewed", sentDate: "Mar 1", metrics: { revenue: 14200, leads: 10, conversions: 5, sessions: 0, roas: 0 } },
  ],
  coaching_education: [
    { id: "r1", client: "Monthly Coaching Report", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 56833, leads: 8, conversions: 4, sessions: 0, roas: 0 } },
    { id: "r2", client: "Monthly Coaching Report", period: "February 2026", status: "viewed", sentDate: "Mar 1", metrics: { revenue: 48000, leads: 6, conversions: 3, sessions: 0, roas: 0 } },
  ],
  restaurant_food: [
    { id: "r1", client: "Monthly Revenue Report", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 82000, leads: 234, conversions: 198, sessions: 0, roas: 0 } },
    { id: "r2", client: "Monthly Revenue Report", period: "February 2026", status: "viewed", sentDate: "Mar 1", metrics: { revenue: 74500, leads: 198, conversions: 172, sessions: 0, roas: 0 } },
  ],
  automotive: [
    { id: "r1", client: "Monthly Service Report", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 24500, leads: 67, conversions: 52, sessions: 0, roas: 0 } },
    { id: "r2", client: "Monthly Service Report", period: "February 2026", status: "viewed", sentDate: "Mar 1", metrics: { revenue: 21800, leads: 58, conversions: 45, sessions: 0, roas: 0 } },
  ],
  nonprofit: [
    { id: "r1", client: "Monthly Impact Report", period: "March 2026", status: "draft", sentDate: null, metrics: { revenue: 26500, leads: 34, conversions: 28, sessions: 0, roas: 0 } },
    { id: "r2", client: "Monthly Impact Report", period: "February 2026", status: "viewed", sentDate: "Mar 1", metrics: { revenue: 22000, leads: 28, conversions: 22, sessions: 0, roas: 0 } },
  ],
};

function fmt(n: number) { return n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n}`; }

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: FileText },
  sent: { label: "Sent", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Send },
  viewed: { label: "Viewed", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: Eye },
};

export default function ClientReportsPage() {
  const ic = useIndustry();
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ClientReport | null>(null);

  useEffect(() => {
    const demoIndustry = getActiveIndustry();
    const key = demoIndustry; if (!key) return;
    const data = DEMO_REPORTS[key] || DEMO_REPORTS.ecommerce;
    setReports(data);
  }, []);

  const drafts = reports.filter(r => r.status === "draft");
  const sent = reports.filter(r => r.status !== "draft");

  return (
    <>
      <Header title="Client Reports" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><FileText className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-400">Drafts</span></div>
            <p className="text-2xl font-bold text-gray-900">{drafts.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Send className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-400">Sent This Month</span></div>
            <p className="text-2xl font-bold text-gray-900">{sent.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Eye className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-400">Viewed</span></div>
            <p className="text-2xl font-bold text-emerald-600">{reports.filter(r => r.status === "viewed").length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-400">Auto-Generated</span></div>
            <p className="text-2xl font-bold text-amber-600">{drafts.length}</p>
          </div>
        </div>

        {/* Pending Drafts Banner */}
        {drafts.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{drafts.length} reports auto-generated for March 2026</h3>
                  <p className="text-xs text-gray-500">Review and send to your clients with one click</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Send className="w-4 h-4" /> Send All Drafts
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">All Reports</h2>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">
                  <Plus className="w-3.5 h-3.5" /> Generate Report
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {reports.map(r => {
                  const sc = statusConfig[r.status];
                  const Icon = sc.icon;
                  return (
                    <button key={r.id} onClick={() => setSelectedReport(r)}
                      className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition text-left ${selectedReport?.id === r.id ? "bg-indigo-50/50" : ""}`}>
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{r.client}</p>
                        <p className="text-xs text-gray-400">{r.period}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                        <Icon className="w-3 h-3" /> {sc.label}
                      </span>
                      {r.metrics.revenue > 0 && (
                        <span className="text-sm font-bold text-gray-700">{fmt(r.metrics.revenue)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div>
            {selectedReport ? (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-20">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">{selectedReport.client}</h3>
                  <p className="text-xs text-gray-400">{selectedReport.period}</p>
                </div>
                <div className="p-5 space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedReport.metrics.revenue > 0 && (
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1"><DollarSign className="w-3 h-3 text-emerald-600" /><span className="text-[10px] text-emerald-600 font-medium">Revenue</span></div>
                        <p className="text-lg font-bold text-emerald-700">{fmt(selectedReport.metrics.revenue)}</p>
                      </div>
                    )}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1"><Users className="w-3 h-3 text-blue-600" /><span className="text-[10px] text-blue-600 font-medium">Leads</span></div>
                      <p className="text-lg font-bold text-blue-700">{selectedReport.metrics.leads}</p>
                    </div>
                    <div className="bg-violet-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1"><TrendingUp className="w-3 h-3 text-violet-600" /><span className="text-[10px] text-violet-600 font-medium">Conversions</span></div>
                      <p className="text-lg font-bold text-violet-700">{selectedReport.metrics.conversions}</p>
                    </div>
                    {selectedReport.metrics.roas > 0 && (
                      <div className="bg-amber-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1"><BarChart3 className="w-3 h-3 text-amber-600" /><span className="text-[10px] text-amber-600 font-medium">ROAS</span></div>
                        <p className="text-lg font-bold text-amber-700">{selectedReport.metrics.roas}x</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    {selectedReport.status === "draft" && (
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                        <Send className="w-4 h-4" /> Send to Client
                      </button>
                    )}
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition">
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition">
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                  </div>

                  {selectedReport.sentDate && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400">Sent on {selectedReport.sentDate}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select a report to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
