"use client";
import Header from "@/components/dashboard/header";
import Link from "next/link";
import { Receipt, Plus, Zap } from "lucide-react";
import { useModal } from "@/components/modals/modal-provider";
export default function InvoicesPage() {
  const { openModal } = useModal();
  return (<><Header title="Invoices" /><div className="p-6"><div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4"><Receipt className="w-8 h-8 text-emerald-500" /></div>
    <h2 className="text-lg font-semibold text-gray-900 mb-2">Invoicing</h2>
    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Create and send professional invoices, track payments, and manage billing. Powered by your connected Stripe account.</p>
    <div className="flex items-center justify-center gap-3">
      <button onClick={() => openModal("invoice")} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"><Plus className="w-4 h-4" /> Create Invoice</button>
      <Link href="/dashboard/settings" className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"><Zap className="w-4 h-4" /> Connect Stripe</Link>
    </div></div></div></>);
}
