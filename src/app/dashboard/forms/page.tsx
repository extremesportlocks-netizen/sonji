"use client";
import Header from "@/components/dashboard/header";
import { FileText, Plus } from "lucide-react";
export default function FormsPage() {
  return (<><Header title="Forms" /><div className="p-6"><div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-violet-500" /></div>
    <h2 className="text-lg font-semibold text-gray-900 mb-2">Form Builder</h2>
    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Build intake forms, lead capture forms, and surveys with drag-and-drop. Embed them on your website or share a direct link. Submissions automatically create contacts.</p>
    <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition mx-auto"><Plus className="w-4 h-4" /> Create Form</button>
  </div></div></>);
}
