"use client";

import { getDemoIndustry, getActiveIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  Plus, FileText, Copy, ExternalLink, BarChart3, Eye, MoreHorizontal,
  Users, ClipboardList, Star, Zap, Check, Globe, Code, Link2,
} from "lucide-react";

// ─── TYPES ───

interface Form {
  id: string;
  name: string;
  type: string;
  submissions: number;
  conversionRate: number;
  status: "active" | "draft";
  lastSubmission: string;
  fields: number;
}

// ─── DEMO FORMS ───

const INDUSTRY_FORMS: Record<string, Form[]> = {
  agency_consulting: [
    { id: "f1", name: "Free Marketing Audit", type: "Lead Capture", submissions: 47, conversionRate: 12.3, status: "active", lastSubmission: "2 hours ago", fields: 6 },
    { id: "f2", name: "Contact Us", type: "Contact", submissions: 124, conversionRate: 8.7, status: "active", lastSubmission: "30 min ago", fields: 5 },
    { id: "f3", name: "Client Onboarding", type: "Onboarding", submissions: 12, conversionRate: 100, status: "active", lastSubmission: "3 days ago", fields: 14 },
    { id: "f4", name: "NPS Survey", type: "Survey", submissions: 34, conversionRate: 62, status: "active", lastSubmission: "1 week ago", fields: 4 },
    { id: "f5", name: "Case Study Request", type: "Lead Capture", submissions: 8, conversionRate: 4.2, status: "draft", lastSubmission: "Never", fields: 5 },
  ],
  health_wellness: [
    { id: "f1", name: "Patient Intake Form", type: "Intake", submissions: 89, conversionRate: 34.5, status: "active", lastSubmission: "1 hour ago", fields: 18 },
    { id: "f2", name: "Consultation Request", type: "Lead Capture", submissions: 156, conversionRate: 22.1, status: "active", lastSubmission: "45 min ago", fields: 8 },
    { id: "f3", name: "Medical History", type: "Intake", submissions: 89, conversionRate: 100, status: "active", lastSubmission: "1 hour ago", fields: 24 },
    { id: "f4", name: "Post-Visit Satisfaction", type: "Survey", submissions: 45, conversionRate: 58, status: "active", lastSubmission: "Yesterday", fields: 6 },
    { id: "f5", name: "Referral Form", type: "Lead Capture", submissions: 23, conversionRate: 15.3, status: "active", lastSubmission: "3 days ago", fields: 5 },
  ],
  home_services: [
    { id: "f1", name: "Free Estimate Request", type: "Lead Capture", submissions: 67, conversionRate: 18.4, status: "active", lastSubmission: "3 hours ago", fields: 8 },
    { id: "f2", name: "Emergency Service Request", type: "Urgent", submissions: 12, conversionRate: 85, status: "active", lastSubmission: "Yesterday", fields: 6 },
    { id: "f3", name: "Maintenance Plan Signup", type: "Onboarding", submissions: 28, conversionRate: 42, status: "active", lastSubmission: "2 days ago", fields: 7 },
    { id: "f4", name: "Job Completion Feedback", type: "Survey", submissions: 31, conversionRate: 55, status: "active", lastSubmission: "4 days ago", fields: 5 },
  ],
  ecommerce: [
    { id: "f1", name: "Newsletter Signup", type: "Lead Capture", submissions: 342, conversionRate: 6.8, status: "active", lastSubmission: "10 min ago", fields: 3 },
    { id: "f2", name: "Contact Support", type: "Contact", submissions: 56, conversionRate: 100, status: "active", lastSubmission: "2 hours ago", fields: 5 },
    { id: "f3", name: "Affiliate Application", type: "Onboarding", submissions: 14, conversionRate: 3.1, status: "active", lastSubmission: "1 week ago", fields: 10 },
    { id: "f4", name: "Customer Satisfaction", type: "Survey", submissions: 89, conversionRate: 24, status: "active", lastSubmission: "Yesterday", fields: 6 },
  ],
  fitness_gym: [
    { id: "f1", name: "Free Trial Signup", type: "Lead Capture", submissions: 78, conversionRate: 28.5, status: "active", lastSubmission: "2 hours ago", fields: 6 },
    { id: "f2", name: "PT Intake Form", type: "Intake", submissions: 34, conversionRate: 100, status: "active", lastSubmission: "Yesterday", fields: 12 },
    { id: "f3", name: "Class Feedback", type: "Survey", submissions: 45, conversionRate: 35, status: "active", lastSubmission: "2 days ago", fields: 5 },
  ],
  beauty_salon: [
    { id: "f1", name: "Online Booking Form", type: "Lead Capture", submissions: 156, conversionRate: 42.3, status: "active", lastSubmission: "1 hour ago", fields: 7 },
    { id: "f2", name: "Bridal Inquiry", type: "Lead Capture", submissions: 12, conversionRate: 58, status: "active", lastSubmission: "3 days ago", fields: 10 },
    { id: "f3", name: "Post-Visit Feedback", type: "Survey", submissions: 67, conversionRate: 32, status: "active", lastSubmission: "Yesterday", fields: 4 },
  ],
  legal: [
    { id: "f1", name: "Free Consultation Request", type: "Lead Capture", submissions: 45, conversionRate: 18.7, status: "active", lastSubmission: "3 hours ago", fields: 8 },
    { id: "f2", name: "Client Intake Questionnaire", type: "Intake", submissions: 28, conversionRate: 100, status: "active", lastSubmission: "1 day ago", fields: 22 },
    { id: "f3", name: "Document Upload Portal", type: "Intake", submissions: 18, conversionRate: 100, status: "active", lastSubmission: "Yesterday", fields: 4 },
    { id: "f4", name: "Client Satisfaction", type: "Survey", submissions: 12, conversionRate: 45, status: "active", lastSubmission: "1 week ago", fields: 6 },
  ],
  automotive: [
    { id: "f1", name: "Service Appointment Request", type: "Lead Capture", submissions: 92, conversionRate: 65, status: "active", lastSubmission: "1 hour ago", fields: 7 },
    { id: "f2", name: "Vehicle Check-In Form", type: "Intake", submissions: 88, conversionRate: 100, status: "active", lastSubmission: "2 hours ago", fields: 10 },
    { id: "f3", name: "Service Feedback", type: "Survey", submissions: 34, conversionRate: 48, status: "active", lastSubmission: "2 days ago", fields: 5 },
  ],
  coaching_education: [
    { id: "f1", name: "Program Application", type: "Lead Capture", submissions: 34, conversionRate: 24, status: "active", lastSubmission: "1 day ago", fields: 12 },
    { id: "f2", name: "Discovery Call Booking", type: "Lead Capture", submissions: 56, conversionRate: 32, status: "active", lastSubmission: "4 hours ago", fields: 6 },
    { id: "f3", name: "Session Feedback", type: "Survey", submissions: 22, conversionRate: 78, status: "active", lastSubmission: "2 days ago", fields: 5 },
  ],
  restaurant_food: [
    { id: "f1", name: "Reservation Form", type: "Lead Capture", submissions: 234, conversionRate: 85, status: "active", lastSubmission: "20 min ago", fields: 5 },
    { id: "f2", name: "Catering Inquiry", type: "Lead Capture", submissions: 18, conversionRate: 28, status: "active", lastSubmission: "2 days ago", fields: 8 },
    { id: "f3", name: "Dining Feedback", type: "Survey", submissions: 78, conversionRate: 22, status: "active", lastSubmission: "Yesterday", fields: 4 },
  ],
  nonprofit: [
    { id: "f1", name: "Donation Form", type: "Lead Capture", submissions: 189, conversionRate: 12.5, status: "active", lastSubmission: "1 hour ago", fields: 6 },
    { id: "f2", name: "Volunteer Application", type: "Onboarding", submissions: 34, conversionRate: 68, status: "active", lastSubmission: "3 days ago", fields: 10 },
    { id: "f3", name: "Event RSVP", type: "Lead Capture", submissions: 112, conversionRate: 45, status: "active", lastSubmission: "4 hours ago", fields: 4 },
    { id: "f4", name: "Impact Survey", type: "Survey", submissions: 28, conversionRate: 35, status: "active", lastSubmission: "1 week ago", fields: 8 },
  ],
  real_estate: [
    { id: "f1", name: "Property Inquiry", type: "Lead Capture", submissions: 124, conversionRate: 15.2, status: "active", lastSubmission: "2 hours ago", fields: 7 },
    { id: "f2", name: "Home Valuation Request", type: "Lead Capture", submissions: 45, conversionRate: 22, status: "active", lastSubmission: "Yesterday", fields: 6 },
    { id: "f3", name: "Open House Sign-In", type: "Lead Capture", submissions: 67, conversionRate: 34, status: "active", lastSubmission: "3 days ago", fields: 5 },
    { id: "f4", name: "Buyer Questionnaire", type: "Intake", submissions: 28, conversionRate: 100, status: "active", lastSubmission: "1 day ago", fields: 12 },
  ],
};

const typeStyles: Record<string, string> = {
  "Lead Capture": "bg-blue-50 text-blue-600",
  "Contact": "bg-emerald-50 text-emerald-600",
  "Intake": "bg-violet-50 text-violet-600",
  "Onboarding": "bg-amber-50 text-amber-600",
  "Survey": "bg-rose-50 text-rose-600",
  "Urgent": "bg-red-50 text-red-600",
};

// ─── MAIN COMPONENT ───

export default function FormsPage() {
  const ic = useIndustry();
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    const demoKey = getDemoIndustry();
    if (demoKey && INDUSTRY_FORMS[demoKey]) {
      setForms(INDUSTRY_FORMS[demoKey]);
      return;
    }
    fetch("/api/forms").then(r => r.json()).then(data => {
      if (data?.data?.length) {
        setForms(data.data.map((f: any) => ({
          id: f.id, name: f.name, status: f.status || "active",
          submissions: f.submissionCount || 0, conversionRate: 0,
          fields: ((f.fields as any[]) || []).length,
          lastSubmission: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "Never",
        })));
      }
    }).catch(() => {});
  }, []);

  const totalSubmissions = forms.reduce((s, f) => s + f.submissions, 0);
  const avgConversion = forms.filter(f => f.status === "active").reduce((s, f, _, arr) => s + f.conversionRate / arr.length, 0);

  return (
    <>
      <Header title="Forms" />
      <div className="p-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-gray-400 font-medium">Active Forms</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{forms.filter(f => f.status === "active").length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-gray-400 font-medium">Total Submissions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSubmissions.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-gray-400 font-medium">Avg Conversion</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{avgConversion.toFixed(1)}%</p>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Your Forms</h2>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              <Plus className="w-4 h-4" /> Create Form
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Form</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Type</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Submissions</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Conversion</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Last Submission</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {forms.map(f => (
                <tr key={f.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4.5 h-4.5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{f.name}</p>
                        <p className="text-[10px] text-gray-400">{f.fields} fields</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyles[f.type] || "bg-gray-100 text-gray-600"}`}>{f.type}</span>
                  </td>
                  <td className="px-3 py-3 text-right"><span className="text-sm font-bold text-gray-900">{f.submissions}</span></td>
                  <td className="px-3 py-3 text-right"><span className={`text-sm font-bold ${f.conversionRate >= 20 ? "text-emerald-600" : f.conversionRate >= 10 ? "text-amber-600" : "text-gray-600"}`}>{f.conversionRate}%</span></td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      f.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {f.status === "active" && <Check className="w-3 h-3" />} {f.status}
                    </span>
                  </td>
                  <td className="px-3 py-3"><span className="text-xs text-gray-400">{f.lastSubmission}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition" title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition" title="Copy link"><Link2 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition" title="Embed code"><Code className="w-3.5 h-3.5" /></button>
                    </div>
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
