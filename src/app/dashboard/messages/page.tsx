"use client";
import Header from "@/components/dashboard/header";
import Link from "next/link";
import { MessageSquare, Plus, Zap } from "lucide-react";
export default function MessagesPage() {
  return (<><Header title="Messages" /><div className="p-6"><div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4"><MessageSquare className="w-8 h-8 text-blue-500" /></div>
    <h2 className="text-lg font-semibold text-gray-900 mb-2">Unified Inbox</h2>
    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">All your email, SMS, and form submission conversations in one place. Connect Resend for email and Twilio for SMS to start messaging.</p>
    <div className="flex items-center justify-center gap-3">
      <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"><Plus className="w-4 h-4" /> Compose Message</button>
      <Link href="/dashboard/settings" className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"><Zap className="w-4 h-4" /> Connect Email & SMS</Link>
    </div></div></div></>);
}
