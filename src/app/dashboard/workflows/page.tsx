"use client";
import Header from "@/components/dashboard/header";
import { Workflow, Plus, Zap, Clock, Filter } from "lucide-react";
export default function WorkflowsPage() {
  return (<><Header title="Workflows" /><div className="p-6"><div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4"><Workflow className="w-8 h-8 text-amber-500" /></div>
    <h2 className="text-lg font-semibold text-gray-900 mb-2">Automations</h2>
    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Build automated workflows triggered by contact events, deal stage changes, and form submissions. Set up email sequences, task assignments, and notifications — no code required.</p>
    <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition mx-auto"><Plus className="w-4 h-4" /> Create Workflow</button>
    <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto">
      <div className="p-4 bg-gray-50 rounded-xl text-center">
        <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
        <p className="text-xs font-medium text-gray-600">17 Triggers</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Contact, deal, form events</p>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl text-center">
        <Filter className="w-5 h-5 text-amber-400 mx-auto mb-2" />
        <p className="text-xs font-medium text-gray-600">11 Actions</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Email, SMS, tasks, tags</p>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl text-center">
        <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
        <p className="text-xs font-medium text-gray-600">Delays</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Wait hours or days</p>
      </div>
    </div>
  </div></div></>);
}
