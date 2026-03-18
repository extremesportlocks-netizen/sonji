"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useModal } from "@/components/modals/modal-provider";
import {
  Plus, DollarSign, Clock, CheckCircle, AlertTriangle, Send,
  FileText, MoreHorizontal, Download, Eye, Receipt,
} from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: "paid" | "sent" | "overdue" | "draft";
  issueDate: string;
  dueDate: string;
  items: number;
}

const INDUSTRY_INVOICES: Record<string, Invoice[]> = {
  agency_consulting: [
    { id: "i1", number: "INV-2026-001", client: "Brightview Hotels", amount: 8500, status: "paid", issueDate: "Mar 1", dueDate: "Mar 15", items: 3 },
    { id: "i2", number: "INV-2026-002", client: "Sterling Partners", amount: 10000, status: "paid", issueDate: "Mar 1", dueDate: "Mar 15", items: 4 },
    { id: "i3", number: "INV-2026-003", client: "Meridian Law Group", amount: 7500, status: "sent", issueDate: "Mar 10", dueDate: "Mar 24", items: 2 },
    { id: "i4", number: "INV-2026-004", client: "Summit Athletics", amount: 4000, status: "sent", issueDate: "Mar 12", dueDate: "Mar 26", items: 2 },
    { id: "i5", number: "INV-2026-005", client: "Coastal Real Estate", amount: 6000, status: "overdue", issueDate: "Feb 15", dueDate: "Mar 1", items: 2 },
    { id: "i6", number: "INV-2026-006", client: "Harbor Dental", amount: 5000, status: "draft", issueDate: "Mar 16", dueDate: "Mar 30", items: 3 },
  ],
  health_wellness: [
    { id: "i1", number: "INV-001", client: "Sarah Thompson", amount: 1600, status: "paid", issueDate: "Mar 10", dueDate: "Mar 10", items: 1 },
    { id: "i2", number: "INV-002", client: "Maria Santos", amount: 800, status: "paid", issueDate: "Mar 8", dueDate: "Mar 8", items: 1 },
    { id: "i3", number: "INV-003", client: "David Kim", amount: 1200, status: "sent", issueDate: "Mar 14", dueDate: "Mar 28", items: 1 },
    { id: "i4", number: "INV-004", client: "Patricia Lee", amount: 400, status: "overdue", issueDate: "Feb 20", dueDate: "Mar 6", items: 1 },
  ],
  ecommerce: [
    { id: "i1", number: "INV-001", client: "Affiliate payout — March", amount: 2450, status: "draft", issueDate: "Mar 31", dueDate: "Apr 15", items: 12 },
    { id: "i2", number: "INV-002", client: "Platform fee — Q1 2026", amount: 8500, status: "paid", issueDate: "Jan 1", dueDate: "Jan 15", items: 1 },
  ],
  home_services: [
    { id: "i1", number: "INV-1001", client: "Linda Garcia", amount: 18500, status: "sent", issueDate: "Mar 12", dueDate: "Mar 26", items: 4 },
    { id: "i2", number: "INV-1002", client: "Thomas Brown", amount: 8200, status: "paid", issueDate: "Mar 10", dueDate: "Mar 24", items: 3 },
    { id: "i3", number: "INV-1003", client: "Susan Taylor", amount: 2800, status: "paid", issueDate: "Mar 12", dueDate: "Mar 12", items: 2 },
    { id: "i4", number: "INV-1004", client: "Barbara Martinez", amount: 4200, status: "draft", issueDate: "Mar 16", dueDate: "Mar 30", items: 3 },
    { id: "i5", number: "INV-1005", client: "Richard Wilson", amount: 3500, status: "overdue", issueDate: "Feb 28", dueDate: "Mar 14", items: 2 },
  ],
  legal: [
    { id: "i1", number: "INV-L001", client: "Marcus Johnson — PI Retainer", amount: 5000, status: "paid", issueDate: "Mar 1", dueDate: "Mar 1", items: 1 },
    { id: "i2", number: "INV-L002", client: "Sarah Mitchell — Divorce Filing", amount: 2500, status: "paid", issueDate: "Mar 5", dueDate: "Mar 19", items: 2 },
    { id: "i3", number: "INV-L003", client: "Harbor Construction — Contract Review", amount: 3750, status: "sent", issueDate: "Mar 14", dueDate: "Mar 28", items: 3 },
    { id: "i4", number: "INV-L004", client: "Patricia Williams — Estate Planning", amount: 4500, status: "draft", issueDate: "Mar 16", dueDate: "Mar 30", items: 2 },
  ],
  fitness_gym: [
    { id: "i1", number: "INV-G001", client: "Stephanie Clark — PT 12-Pack", amount: 960, status: "paid", issueDate: "Mar 1", dueDate: "Mar 1", items: 1 },
    { id: "i2", number: "INV-G002", client: "Brandon Lewis — Monthly Membership", amount: 79, status: "paid", issueDate: "Mar 1", dueDate: "Mar 1", items: 1 },
    { id: "i3", number: "INV-G003", client: "Daniel Wright — Monthly Membership", amount: 79, status: "overdue", issueDate: "Mar 1", dueDate: "Mar 5", items: 1 },
  ],
  beauty_salon: [
    { id: "i1", number: "INV-B001", client: "Charlotte Davis — Bridal Package (50%)", amount: 600, status: "paid", issueDate: "Mar 10", dueDate: "Mar 10", items: 1 },
    { id: "i2", number: "INV-B002", client: "Amelia Wilson — Keratin Treatment", amount: 350, status: "paid", issueDate: "Mar 14", dueDate: "Mar 14", items: 1 },
    { id: "i3", number: "INV-B003", client: "Harper Garcia — Blowout Membership", amount: 120, status: "sent", issueDate: "Mar 15", dueDate: "Mar 20", items: 1 },
  ],
  automotive: [
    { id: "i1", number: "INV-A001", client: "Thomas Brown — Timing Belt", amount: 1200, status: "paid", issueDate: "Mar 16", dueDate: "Mar 16", items: 3 },
    { id: "i2", number: "INV-A002", client: "James Peterson — Full Brake Job", amount: 850, status: "sent", issueDate: "Mar 16", dueDate: "Mar 23", items: 4 },
    { id: "i3", number: "INV-A003", client: "Nancy Davis — 30K Service", amount: 450, status: "paid", issueDate: "Mar 14", dueDate: "Mar 14", items: 5 },
  ],
  nonprofit: [
    { id: "i1", number: "DON-001", client: "Robert Chen — Monthly Donation", amount: 500, status: "paid", issueDate: "Mar 1", dueDate: "Mar 1", items: 1 },
    { id: "i2", number: "DON-002", client: "Apex Financial — Corporate Partnership", amount: 25000, status: "sent", issueDate: "Mar 15", dueDate: "Apr 1", items: 1 },
    { id: "i3", number: "DON-003", client: "Spring Gala Sponsorships", amount: 15000, status: "draft", issueDate: "Mar 20", dueDate: "Apr 10", items: 5 },
  ],
  real_estate: [
    { id: "i1", number: "COM-001", client: "Robert Chen — Waterfront Listing (3%)", amount: 36000, status: "sent", issueDate: "Mar 14", dueDate: "At Closing", items: 1 },
    { id: "i2", number: "COM-002", client: "Amanda Hill — Buyer Agent (2.5%)", amount: 8250, status: "sent", issueDate: "Mar 10", dueDate: "At Closing", items: 1 },
    { id: "i3", number: "COM-003", client: "Patricia Williams — Estate Sale (3%)", amount: 26700, status: "paid", issueDate: "Feb 28", dueDate: "Mar 14", items: 1 },
  ],
  coaching_education: [
    { id: "i1", number: "INV-C001", client: "Jason Wright — 1:1 Coaching (Month 1)", amount: 833, status: "paid", issueDate: "Mar 1", dueDate: "Mar 1", items: 1 },
    { id: "i2", number: "INV-C002", client: "Mastermind Cohort — Spring 2026", amount: 48000, status: "paid", issueDate: "Mar 1", dueDate: "Mar 1", items: 6 },
    { id: "i3", number: "INV-C003", client: "Nathan Harris — VIP Day", amount: 3000, status: "draft", issueDate: "Mar 25", dueDate: "Mar 25", items: 1 },
  ],
  restaurant_food: [
    { id: "i1", number: "INV-R001", client: "Emily & David — Wedding Reception (50%)", amount: 4250, status: "paid", issueDate: "Mar 10", dueDate: "Mar 10", items: 1 },
    { id: "i2", number: "INV-R002", client: "Apex Financial — Corporate Lunch", amount: 3500, status: "draft", issueDate: "Apr 5", dueDate: "Apr 19", items: 4 },
    { id: "i3", number: "INV-R003", client: "Marcus Rivera — March Meal Prep", amount: 480, status: "paid", issueDate: "Mar 1", dueDate: "Mar 1", items: 1 },
  ],
};

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`; }

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  paid: { label: "Paid", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
  sent: { label: "Sent", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Send },
  overdue: { label: "Overdue", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: AlertTriangle },
  draft: { label: "Draft", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: FileText },
};

export default function InvoicesPage() {
  const { openModal } = useModal();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    if (demoIndustry && INDUSTRY_INVOICES[demoIndustry]) {
      setInvoices(INDUSTRY_INVOICES[demoIndustry]);
      return;
    }
    fetch("/api/invoices").then(r => r.json()).then(data => {
      if (data?.data?.length) {
        setInvoices(data.data.map((inv: any) => ({
          id: inv.id, number: inv.id.substring(0, 8).toUpperCase(),
          client: inv.contactId || "Client", amount: parseFloat(inv.total) || 0,
          status: inv.status, issueDate: new Date(inv.createdAt).toLocaleDateString(),
          dueDate: inv.dueDate || "", items: (inv.items as any[]) || [],
        })));
      }
    }).catch(() => {});
  }, []);

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "sent").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <Header title="Invoices" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Receipt className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-400 font-medium">Total Invoices</span></div>
            <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-400 font-medium">Paid</span></div>
            <p className="text-2xl font-bold text-emerald-600">{fmt(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-400 font-medium">Pending</span></div>
            <p className="text-2xl font-bold text-blue-600">{fmt(totalPending)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-400 font-medium">Overdue</span></div>
            <p className="text-2xl font-bold text-red-600">{fmt(totalOverdue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">All Invoices</h2>
            <button onClick={() => openModal("invoice")} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"><Plus className="w-4 h-4" /> Create Invoice</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Invoice</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Client</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5">Due Date</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => {
                const sc = statusConfig[inv.status];
                const Icon = sc.icon;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{inv.number}</p>
                      <p className="text-[10px] text-gray-400">{inv.items} line items</p>
                    </td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-700">{inv.client}</span></td>
                    <td className="px-3 py-3 text-right"><span className="text-sm font-bold text-gray-900">${inv.amount.toLocaleString()}</span></td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                        <Icon className="w-3 h-3" /> {sc.label}
                      </span>
                    </td>
                    <td className="px-3 py-3"><span className="text-xs text-gray-500">{inv.dueDate}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"><Download className="w-3.5 h-3.5" /></button>
                        {inv.status === "draft" && <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"><Send className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
