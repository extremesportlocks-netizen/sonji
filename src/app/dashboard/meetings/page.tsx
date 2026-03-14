"use client";
import Header from "@/components/dashboard/header";
import Link from "next/link";
import { CalendarDays, Plus, Zap } from "lucide-react";
export default function MeetingsPage() {
  return (<><Header title="Meetings" /><div className="p-6"><div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4"><CalendarDays className="w-8 h-8 text-indigo-500" /></div>
    <h2 className="text-lg font-semibold text-gray-900 mb-2">Calendar & Scheduling</h2>
    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Schedule meetings with contacts, set availability rules, and send automated reminders. Integrates with Google Calendar.</p>
    <div className="flex items-center justify-center gap-3">
      <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"><Plus className="w-4 h-4" /> Schedule Meeting</button>
      <Link href="/dashboard/settings" className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"><Zap className="w-4 h-4" /> Setup Integrations</Link>
    </div></div></div></>);
}
