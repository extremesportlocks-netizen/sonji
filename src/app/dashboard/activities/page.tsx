"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Search,
  SlidersHorizontal,
  Phone,
  Mail,
  Users,
  StickyNote,
  UserCheck,
  Video,
  FileText,
  ChevronDown,
  X,
} from "lucide-react";

interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "followup" | "video";
  title: string;
  description: string;
  contact: string;
  company: string;
  user: string;
  userAvatar: string;
  time: string;
  duration?: string;
}

const mockActivities: Activity[] = [
  { id: "a1", type: "call", title: "Discovery Call", description: "Discussed pricing and timeline for custom integration project. Key concerns: budget approval pending Q2.", contact: "Mason Thompson", company: "Vertex Partners", user: "Orlando", userAvatar: "O", time: "Today at 2:30 PM", duration: "32 min" },
  { id: "a2", type: "email", title: "Sent Proposal", description: "Sent Q2 proposal deck with updated pricing tiers, implementation timeline, and case studies.", contact: "Logan Mitchell", company: "DataFlow Solutions", user: "Orlando", userAvatar: "O", time: "Today at 11:15 AM" },
  { id: "a3", type: "meeting", title: "Quarterly Business Review", description: "Met with Vertex leadership team. Reviewed Q1 results, discussed renewal terms and expansion.", contact: "Mason Thompson", company: "Vertex Partners", user: "Sarah Chen", userAvatar: "SC", time: "Yesterday at 3:00 PM", duration: "1h 15min" },
  { id: "a4", type: "note", title: "Internal Note", description: "Lucas mentioned they need SOC 2 compliance docs before CFO approval. Flag for legal review.", contact: "Lucas Anderson", company: "TechVentures Inc", user: "Orlando", userAvatar: "O", time: "Yesterday at 10:30 AM" },
  { id: "a5", type: "followup", title: "Follow-up Sent", description: "Follow-up with revised SOW and updated project timeline based on Monday's feedback.", contact: "Aiden Parker", company: "Bright Dynamics", user: "Marcus Rivera", userAvatar: "MR", time: "Mar 8, 2026 at 4:15 PM" },
  { id: "a6", type: "call", title: "Negotiation Call", description: "Discussed contract terms, volume discount structure, and implementation support package.", contact: "Elijah Harris", company: "CloudPeak", user: "Orlando", userAvatar: "O", time: "Mar 8, 2026 at 1:00 PM", duration: "45 min" },
  { id: "a7", type: "video", title: "Product Demo", description: "Live demo of the dashboard for Halo Collar team. They were impressed with the pipeline view.", contact: "Jackson Brooks", company: "Halo Collar", user: "Orlando", userAvatar: "O", time: "Mar 7, 2026 at 10:00 AM", duration: "55 min" },
  { id: "a8", type: "email", title: "Contract Sent", description: "Sent final MSA and SOW for Enterprise Platform Migration project. Awaiting legal review.", contact: "Joshua Murphy", company: "Skyline Group", user: "Sarah Chen", userAvatar: "SC", time: "Mar 7, 2026 at 9:00 AM" },
  { id: "a9", type: "note", title: "Competitive Intel", description: "Fusion Labs currently evaluating GoHighLevel but frustrated with complexity. Strong opening for us.", contact: "Daniel Kim", company: "Fusion Labs", user: "Orlando", userAvatar: "O", time: "Mar 6, 2026 at 3:30 PM" },
  { id: "a10", type: "meeting", title: "Kickoff Meeting", description: "Kicked off onboarding for Quantum Leap. Assigned Sarah as primary account manager.", contact: "Sarah Chen", company: "Quantum Leap", user: "Orlando", userAvatar: "O", time: "Mar 6, 2026 at 11:00 AM", duration: "1h" },
];

const typeConfig: Record<string, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  call: { icon: Phone, bg: "bg-blue-50", color: "text-blue-600", label: "Call" },
  email: { icon: Mail, bg: "bg-emerald-50", color: "text-emerald-600", label: "Email" },
  meeting: { icon: Users, bg: "bg-violet-50", color: "text-violet-600", label: "Meeting" },
  note: { icon: StickyNote, bg: "bg-amber-50", color: "text-amber-600", label: "Note" },
  followup: { icon: UserCheck, bg: "bg-rose-50", color: "text-rose-500", label: "Follow-up" },
  video: { icon: Video, bg: "bg-cyan-50", color: "text-cyan-600", label: "Video" },
};

export default function ActivitiesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const types = ["All", "call", "email", "meeting", "note", "followup", "video"];

  const filtered = mockActivities.filter((a) => {
    const matchSearch = search === "" || `${a.title} ${a.description} ${a.contact} ${a.company}`.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <>
      <Header title="Activities" subtitle={`${filtered.length} activities`} />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="flex items-center gap-1 ml-2">
                {types.map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${typeFilter === t ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                    {t === "All" ? "All" : typeConfig[t]?.label || t}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-56 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
            </div>
          </div>

          {/* Activity List */}
          <div className="divide-y divide-gray-50">
            {filtered.map((a) => {
              const cfg = typeConfig[a.type];
              const Icon = cfg.icon;
              return (
                <div key={a.id} className="flex items-start gap-4 px-5 py-5 hover:bg-gray-50/50 transition cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                      {a.duration && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{a.duration}</span>}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{a.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{a.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">{a.userAvatar}</span>
                        </div>
                        <span className="text-xs text-gray-500">{a.user}</span>
                      </div>
                      <span className="text-xs text-gray-300">&middot;</span>
                      <span className="text-xs text-gray-500">{a.contact}</span>
                      <span className="text-xs text-gray-300">&middot;</span>
                      <span className="text-xs text-gray-400">{a.company}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-1">{a.time}</span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-5 py-16 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No activities found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
