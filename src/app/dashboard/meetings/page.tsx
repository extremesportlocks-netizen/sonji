"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Search,
  SlidersHorizontal,
  Download,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Columns3,
  List,
  LayoutGrid,
  Clock,
  MapPin,
  User,
  Building2,
  MoreHorizontal,
  Video,
  X,
} from "lucide-react";

// ────────────────────────────────────
// TYPES
// ────────────────────────────────────

interface Meeting {
  id: string;
  title: string;
  date: string; // ISO
  day: number; // 0-6 (column index in week view)
  startHour: number;
  endHour: number;
  startTime: string;
  endTime: string;
  host: string;
  hostAvatar: string;
  company: string;
  type: "virtual" | "in-person" | "phone";
  status: "Upcoming" | "Scheduled" | "Confirmed" | "Cancelled";
  color: string;
  notes?: string;
}

// ────────────────────────────────────
// MOCK DATA
// ────────────────────────────────────

const weekDays = ["Sun 9", "Mon 10", "Tue 11", "Wed 12", "Thu 13", "Fri 14", "Sat 15"];
const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7AM - 6PM

const mockMeetings: Meeting[] = [
  { id: "m1", title: "Product Demo — Halo Collar", date: "2026-03-10", day: 1, startHour: 8, endHour: 9, startTime: "8:00 AM", endTime: "9:00 AM", host: "Orlando", hostAvatar: "O", company: "Halo Collar", type: "virtual", status: "Confirmed", color: "bg-blue-100 border-blue-300 text-blue-800" },
  { id: "m2", title: "Product Roadmap Review", date: "2026-03-10", day: 1, startHour: 10, endHour: 12, startTime: "10:00 AM", endTime: "12:00 PM", host: "Orlando", hostAvatar: "O", company: "Vertex Partners", type: "virtual", status: "Upcoming", color: "bg-violet-100 border-violet-300 text-violet-800" },
  { id: "m3", title: "Quarterly Business Review", date: "2026-03-11", day: 2, startHour: 10, endHour: 11, startTime: "10:00 AM", endTime: "11:00 AM", host: "Sarah Chen", hostAvatar: "SC", company: "DataFlow Solutions", type: "in-person", status: "Scheduled", color: "bg-emerald-100 border-emerald-300 text-emerald-800" },
  { id: "m4", title: "Follow-up Call — Discussion", date: "2026-03-13", day: 4, startHour: 9, endHour: 10, startTime: "9:00 AM", endTime: "10:00 AM", host: "Marcus Rivera", hostAvatar: "MR", company: "NexGen AI", type: "phone", status: "Confirmed", color: "bg-amber-100 border-amber-300 text-amber-800" },
  { id: "m5", title: "Discovery Call — New Lead", date: "2026-03-11", day: 2, startHour: 12, endHour: 13, startTime: "12:00 PM", endTime: "1:00 PM", host: "Orlando", hostAvatar: "O", company: "Skyline Group", type: "virtual", status: "Upcoming", color: "bg-indigo-100 border-indigo-300 text-indigo-800" },
  { id: "m6", title: "Security Audit Discussion", date: "2026-03-12", day: 3, startHour: 14, endHour: 15, startTime: "2:00 PM", endTime: "3:00 PM", host: "Emily Rodriguez", hostAvatar: "ER", company: "Pulse Media", type: "virtual", status: "Scheduled", color: "bg-rose-100 border-rose-300 text-rose-800" },
  { id: "m7", title: "Contract Negotiation", date: "2026-03-10", day: 1, startHour: 16, endHour: 17, startTime: "4:00 PM", endTime: "5:00 PM", host: "Orlando", hostAvatar: "O", company: "CloudPeak", type: "in-person", status: "Confirmed", color: "bg-teal-100 border-teal-300 text-teal-800" },
  { id: "m8", title: "Schedule Business Review", date: "2026-03-14", day: 5, startHour: 15, endHour: 16, startTime: "3:00 PM", endTime: "4:00 PM", host: "Sarah Chen", hostAvatar: "SC", company: "Bright Dynamics", type: "virtual", status: "Cancelled", color: "bg-gray-100 border-gray-300 text-gray-600" },
  { id: "m9", title: "Onboarding Session", date: "2026-03-12", day: 3, startHour: 10, endHour: 11, startTime: "10:00 AM", endTime: "11:00 AM", host: "Orlando", hostAvatar: "O", company: "Fusion Labs", type: "virtual", status: "Upcoming", color: "bg-cyan-100 border-cyan-300 text-cyan-800" },
];

const statusStyles: Record<string, { badge: string; border: string }> = {
  Upcoming: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", border: "border-indigo-400" },
  Scheduled: { badge: "bg-blue-50 text-blue-700 border-blue-200", border: "border-blue-400" },
  Confirmed: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", border: "border-emerald-400" },
  Cancelled: { badge: "bg-red-50 text-red-600 border-red-200", border: "border-red-400" },
};

const typeIcons: Record<string, React.ElementType> = {
  virtual: Video,
  "in-person": MapPin,
  phone: Clock,
};

// ────────────────────────────────────
// MEETINGS PAGE
// ────────────────────────────────────

export default function MeetingsPage() {
  const [view, setView] = useState<"week" | "kanban" | "list">("week");
  const [search, setSearch] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const filtered = mockMeetings.filter((m) => {
    if (search === "") return true;
    return `${m.title} ${m.company} ${m.host}`.toLowerCase().includes(search.toLowerCase());
  });

  // Group by status for kanban
  const byStatus: Record<string, Meeting[]> = { Upcoming: [], Scheduled: [], Confirmed: [], Cancelled: [] };
  filtered.forEach((m) => { if (byStatus[m.status]) byStatus[m.status].push(m); });

  return (
    <>
      <Header title="Meetings" subtitle={`${filtered.length} meetings this week`} />

      <div className="p-6">
        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition">
                <SlidersHorizontal className="w-4 h-4" /> Show Filters
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition">
                All Meetings <ChevronDown className="w-3 h-3" />
              </button>

              {/* View toggles */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-2">
                <button onClick={() => setView("kanban")}
                  className={`p-2 transition ${view === "kanban" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                  <Columns3 className="w-4 h-4" />
                </button>
                <button onClick={() => setView("list")}
                  className={`p-2 transition border-l border-gray-200 ${view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => setView("week")}
                  className={`p-2 transition border-l border-gray-200 ${view === "week" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                  <Calendar className="w-4 h-4" />
                </button>
                <button className="p-2 transition border-l border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50">
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
                {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Upload className="w-4 h-4" /> Import
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
                <Plus className="w-4 h-4" /> Schedule Meeting
              </button>
            </div>
          </div>
        </div>

        {/* ═══ WEEK VIEW ═══ */}
        {view === "week" && (
          <div className="flex gap-4">
            {/* Calendar Grid */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Week header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-900">March 2026</h3>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition">Today</button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition">Day</button>
                  <button className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 transition">Week</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition">Month</button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-8 border-b border-gray-100">
                <div className="px-3 py-2" /> {/* Time column spacer */}
                {weekDays.map((day, i) => (
                  <div key={day} className={`px-3 py-2 text-center border-l border-gray-50 ${i === 1 ? "bg-indigo-50/30" : ""}`}>
                    <p className={`text-xs font-semibold ${i === 1 ? "text-indigo-600" : "text-gray-500"}`}>{day}</p>
                  </div>
                ))}
              </div>

              {/* Time grid */}
              <div className="max-h-[600px] overflow-y-auto">
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-gray-50 min-h-[60px]">
                    {/* Time label */}
                    <div className="px-3 py-1 text-right pr-4">
                      <span className="text-xs text-gray-400">{hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}</span>
                    </div>

                    {/* Day columns */}
                    {weekDays.map((_, dayIdx) => {
                      const meetings = filtered.filter((m) => m.day === dayIdx && m.startHour === hour);
                      return (
                        <div key={dayIdx} className={`border-l border-gray-50 relative px-1 py-0.5 ${dayIdx === 1 ? "bg-indigo-50/10" : ""}`}>
                          {meetings.map((m) => {
                            const span = m.endHour - m.startHour;
                            return (
                              <button
                                key={m.id}
                                onClick={() => setSelectedMeeting(m)}
                                className={`w-full rounded-lg border px-2 py-1.5 text-left transition hover:shadow-md ${m.color}`}
                                style={{ minHeight: `${span * 56}px` }}
                              >
                                <p className="text-xs font-semibold leading-tight truncate">{m.title}</p>
                                <p className="text-[10px] mt-1 opacity-75">Meeting Time</p>
                                <p className="text-[10px] font-medium">{m.startTime} - {m.endTime}</p>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Detail Sidebar */}
            <div className="w-[300px] flex-shrink-0 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  {selectedMeeting ? "Meeting Details" : "Next Upcoming Meeting"}
                </h3>

                {(() => {
                  const m = selectedMeeting || filtered.find((m) => m.status === "Upcoming") || filtered[0];
                  if (!m) return <p className="text-sm text-gray-400">No meetings</p>;

                  const TypeIcon = typeIcons[m.type] || Video;

                  return (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center border`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                          <p className="text-xs text-gray-400">Today, {m.startTime}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Meeting Agenda</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Review Q1-Q2 priorities, discuss timelines and dependencies for upcoming sprint planning.
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 mb-1">Meeting Link</p>
                          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" /> Join Video Call
                          </a>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 mb-1">Meeting Time</p>
                          <p className="text-sm text-gray-700">{m.startTime} - {m.endTime}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 mb-1">Meeting Duration</p>
                          <p className="text-sm text-gray-700">{m.endHour - m.startHour} hour{m.endHour - m.startHour > 1 ? "s" : ""}</p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-gray-400">⋮⋮</span> Meeting information
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Meeting Host</p>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-white">{m.hostAvatar}</span>
                              </div>
                              <span className="text-sm text-gray-700">{m.host}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Related To</p>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-700">{m.company}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Status</p>
                            <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[m.status]?.badge}`}>
                              {m.status}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400 mb-1">Participants</p>
                            <div className="space-y-2">
                              {["Orlando", "Sarah Chen", "Marcus Rivera"].map((p) => (
                                <div key={p} className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-[9px] font-bold text-gray-500">{p.split(" ").map(n => n[0]).join("")}</span>
                                  </div>
                                  <span className="text-sm text-gray-600">{p}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400 mb-1">Notes</p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Finalize roadmap priorities before sprint planning. Share latest mockups & metrics.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ═══ KANBAN VIEW ═══ */}
        {view === "kanban" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Object.entries(byStatus).map(([status, meetings]) => {
              const style = statusStyles[status];
              return (
                <div key={status} className="flex-shrink-0 w-[300px]">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${style.badge}`}>
                      {status}
                      <span className="ml-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/50">
                        {meetings.length}
                      </span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="space-y-3 min-h-[100px] bg-gray-50/50 rounded-xl p-2">
                    {meetings.map((m) => (
                      <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-sm transition cursor-pointer"
                        onClick={() => { setSelectedMeeting(m); setView("week"); }}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900 leading-snug">{m.title}</p>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-1.5 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{m.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>Meeting Host: {m.host}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{m.startTime} - {m.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span>Related To: {m.company}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {meetings.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                        No meetings
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ LIST VIEW ═══ */}
        {view === "list" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Meeting</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Host</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/70 transition cursor-pointer" onClick={() => { setSelectedMeeting(m); setView("week"); }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${m.color} border flex items-center justify-center flex-shrink-0`}>
                          {(() => { const I = typeIcons[m.type] || Video; return <I className="w-4 h-4" />; })()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{m.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-600">{m.date}</span></td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-600">{m.startTime} - {m.endTime}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">{m.hostAvatar}</span>
                        </div>
                        <span className="text-sm text-gray-600">{m.host}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-600">{m.company}</span></td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[m.status]?.badge}`}>{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
