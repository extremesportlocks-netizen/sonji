"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Plus, Search, DollarSign, Send, Download, MoreHorizontal, Eye,
  FileText, Clock, Check, AlertTriangle, X, Trash2, Copy,
} from "lucide-react";

interface LineItem { id: string; description: string; qty: number; rate: number; }
interface Invoice {
  id: string; number: string; contact: string; company: string; status: "draft" | "sent" | "paid" | "overdue";
  total: number; dueDate: string; issuedDate: string;
}

const mockInvoices: Invoice[] = [
  { id: "i1", number: "INV-001", contact: "Mason Thompson", company: "Vertex Partners", status: "paid", total: 24000, dueDate: "Mar 1, 2026", issuedDate: "Feb 15, 2026" },
  { id: "i2", number: "INV-002", contact: "Sarah Chen", company: "DataFlow Solutions", status: "sent", total: 8500, dueDate: "Mar 15, 2026", issuedDate: "Mar 1, 2026" },
  { id: "i3", number: "INV-003", contact: "Lucas Anderson", company: "TechVentures Inc", status: "overdue", total: 15750, dueDate: "Feb 28, 2026", issuedDate: "Feb 14, 2026" },
  { id: "i4", number: "INV-004", contact: "Aiden Parker", company: "Bright Dynamics", status: "draft", total: 6200, dueDate: "Mar 20, 2026", issuedDate: "Mar 10, 2026" },
  { id: "i5", number: "INV-005", contact: "Jackson Brooks", company: "Halo Collar", status: "paid", total: 31500, dueDate: "Feb 20, 2026", issuedDate: "Feb 5, 2026" },
  { id: "i6", number: "INV-006", contact: "Emily Rodriguez", company: "Pulse Media", status: "sent", total: 4800, dueDate: "Mar 18, 2026", issuedDate: "Mar 4, 2026" },
];

const statusConfig: Record<string, { badge: string; icon: React.ElementType }> = {
  draft: { badge: "bg-gray-50 text-gray-600 border-gray-200", icon: FileText },
  sent: { badge: "bg-blue-50 text-blue-600 border-blue-200", icon: Send },
  paid: { badge: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: Check },
  overdue: { badge: "bg-red-50 text-red-600 border-red-200", icon: AlertTriangle },
};

export default function InvoicesPage() {
  const [view, setView] = useState<"list" | "create">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "CRM Platform — Growth Plan (Monthly)", qty: 1, rate: 199 },
    { id: "2", description: "Custom Onboarding & Setup", qty: 1, rate: 500 },
    { id: "3", description: "Data Migration (2,500 contacts)", qty: 1, rate: 250 },
  ]);
  const [invoiceContact, setInvoiceContact] = useState("Mason Thompson");
  const [invoiceDue, setInvoiceDue] = useState("2026-03-30");
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const filtered = mockInvoices.filter((inv) => {
    const matchSearch = search === "" || `${inv.contact} ${inv.company} ${inv.number}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const addLineItem = () => setLineItems([...lineItems, { id: Date.now().toString(), description: "", qty: 1, rate: 0 }]);
  const removeLineItem = (id: string) => setLineItems(lineItems.filter((l) => l.id !== id));
  const updateLineItem = (id: string, field: string, value: string | number) =>
    setLineItems(lineItems.map((l) => l.id === id ? { ...l, [field]: value } : l));

  const subtotal = lineItems.reduce((sum, l) => sum + l.qty * l.rate, 0);
  const tax = subtotal * 0;
  const total = subtotal + tax;

  const totalPaid = mockInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalOutstanding = mockInvoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const totalOverdue = mockInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0);

  // ═══ LIST VIEW ═══
  if (view === "list") {
    return (
      <>
        <Header title="Invoices" subtitle={`${mockInvoices.length} invoices`} />
        <div className="p-6">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Paid", value: `$${totalPaid.toLocaleString()}`, color: "border-l-emerald-500" },
              { label: "Outstanding", value: `$${totalOutstanding.toLocaleString()}`, color: "border-l-blue-500" },
              { label: "Overdue", value: `$${totalOverdue.toLocaleString()}`, color: "border-l-red-500" },
            ].map((s) => (
              <div key={s.label} className={`bg-white rounded-xl border border-gray-100 border-l-4 ${s.color} p-5`}>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-100 mb-4">
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                {["all", "draft", "sent", "paid", "overdue"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition capitalize ${
                      statusFilter === s ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"
                    }`}>{s}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-48 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition" />
                </div>
                <button onClick={() => setView("create")}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
                  <Plus className="w-4 h-4" /> New Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Invoice", "Client", "Status", "Amount", "Due Date", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => {
                  const cfg = statusConfig[inv.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/70 transition cursor-pointer">
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-gray-900">{inv.number}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-900">{inv.contact}</p>
                        <p className="text-xs text-gray-400">{inv.company}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${cfg.badge}`}>
                          <StatusIcon className="w-3 h-3" /> {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-900">${inv.total.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-500">{inv.dueDate}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Eye className="w-4 h-4" /></button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Download className="w-4 h-4" /></button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><MoreHorizontal className="w-4 h-4" /></button>
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

  // ═══ CREATE INVOICE VIEW ═══
  return (
    <>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="text-sm text-gray-500 hover:text-gray-700 transition">← Back</button>
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-sm font-semibold text-gray-900">New Invoice</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
            <Send className="w-3.5 h-3.5" /> Send Invoice
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Invoice Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></h2>
                <p className="text-xs text-gray-400 mt-1">hello@sonji.io · sonji.io</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Invoice</p>
                <p className="text-lg font-bold text-gray-900">INV-007</p>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-6 p-8 border-b border-gray-100">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Bill To</p>
              <select value={invoiceContact} onChange={(e) => setInvoiceContact(e.target.value)}
                className="text-sm font-medium text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent p-0 cursor-pointer">
                {["Mason Thompson", "Sarah Chen", "Lucas Anderson", "Aiden Parker", "Jackson Brooks"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-0.5">Vertex Partners</p>
            </div>
            <div className="text-right">
              <div className="space-y-1.5">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-xs text-gray-400">Issue Date:</span>
                  <span className="text-xs font-medium text-gray-700">Mar 11, 2026</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-xs text-gray-400">Due Date:</span>
                  <input type="date" value={invoiceDue} onChange={(e) => setInvoiceDue(e.target.value)}
                    className="text-xs font-medium text-gray-700 border-none focus:outline-none focus:ring-0 bg-transparent p-0 text-right" />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-8">
            <table className="w-full mb-4">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-center pb-3 w-20 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="text-right pb-3 w-28 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="text-right pb-3 w-28 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lineItems.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-3 pr-3">
                      <input type="text" value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                        placeholder="Item description..."
                        className="w-full text-sm text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent placeholder:text-gray-400" />
                    </td>
                    <td className="py-3 px-2">
                      <input type="number" value={item.qty} onChange={(e) => updateLineItem(item.id, "qty", parseInt(e.target.value) || 0)}
                        className="w-full text-sm text-gray-900 text-center border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                        <input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                          className="w-full text-sm text-gray-900 text-right border border-gray-200 rounded-lg py-1.5 pl-5 pr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <span className="text-sm font-medium text-gray-900">${(item.qty * item.rate).toLocaleString()}</span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => removeLineItem(item.id)}
                        className="p-1 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addLineItem}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 mb-6">
              <Plus className="w-3.5 h-3.5" /> Add Line Item
            </button>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-end gap-12">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-medium text-gray-900 w-28 text-right">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-12">
                <span className="text-sm text-gray-500">Tax (0%)</span>
                <span className="text-sm text-gray-500 w-28 text-right">$0.00</span>
              </div>
              <div className="flex justify-end gap-12 pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900 w-28 text-right">${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Notes</label>
              <textarea rows={2} value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Payment is due within 30 days. Thank you for your business!"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
