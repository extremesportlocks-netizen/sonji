"use client";

import { getDemoIndustry } from "@/lib/tenant-utils";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/dashboard/header";
import { useModal } from "@/components/modals/modal-provider";
import { useIndustry } from "@/lib/use-industry";
import {
  Plus, ChevronLeft, ChevronRight, Clock, User, MapPin, Video,
  Phone, Calendar as CalendarIcon, List, LayoutGrid,
} from "lucide-react";

// ─── TYPES ───

interface Meeting {
  id: string;
  title: string;
  contact: string;
  time: string;
  endTime: string;
  type: "video" | "phone" | "in_person";
  location: string;
  color: string;
  day: number; // 0-based offset from week start
}

// ─── DEMO MEETINGS ───

const INDUSTRY_MEETINGS: Record<string, Meeting[]> = {
  agency_consulting: [
    { id: "m1", title: "Weekly Check-in", contact: "Brightview Hotels", time: "9:00 AM", endTime: "9:30 AM", type: "video", location: "Google Meet", color: "bg-blue-100 border-blue-300 text-blue-800", day: 0 },
    { id: "m2", title: "Brand Review", contact: "Summit Athletics", time: "11:00 AM", endTime: "12:00 PM", type: "video", location: "Zoom", color: "bg-violet-100 border-violet-300 text-violet-800", day: 0 },
    { id: "m3", title: "SEO Strategy", contact: "Harbor Dental", time: "2:00 PM", endTime: "2:45 PM", type: "phone", location: "Call", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 1 },
    { id: "m4", title: "Website Walkthrough", contact: "Meridian Law Group", time: "10:00 AM", endTime: "11:00 AM", type: "video", location: "Google Meet", color: "bg-amber-100 border-amber-300 text-amber-800", day: 2 },
    { id: "m5", title: "New Lead Discovery", contact: "Apex Construction", time: "3:00 PM", endTime: "3:30 PM", type: "phone", location: "Call", color: "bg-rose-100 border-rose-300 text-rose-800", day: 2 },
    { id: "m6", title: "Monthly Report Review", contact: "Sterling Partners", time: "9:00 AM", endTime: "10:00 AM", type: "video", location: "Zoom", color: "bg-indigo-100 border-indigo-300 text-indigo-800", day: 3 },
    { id: "m7", title: "Renewal Discussion", contact: "Coastal Real Estate", time: "1:00 PM", endTime: "1:30 PM", type: "video", location: "Google Meet", color: "bg-teal-100 border-teal-300 text-teal-800", day: 4 },
    { id: "m8", title: "Team Standup", contact: "Internal — Colton & Rocco", time: "8:30 AM", endTime: "8:45 AM", type: "video", location: "Slack Huddle", color: "bg-gray-100 border-gray-300 text-gray-700", day: 0 },
    { id: "m9", title: "Team Standup", contact: "Internal — Colton & Rocco", time: "8:30 AM", endTime: "8:45 AM", type: "video", location: "Slack Huddle", color: "bg-gray-100 border-gray-300 text-gray-700", day: 2 },
    { id: "m10", title: "Team Standup", contact: "Internal — Colton & Rocco", time: "8:30 AM", endTime: "8:45 AM", type: "video", location: "Slack Huddle", color: "bg-gray-100 border-gray-300 text-gray-700", day: 4 },
  ],
  health_wellness: [
    { id: "m1", title: "New Patient Review — Sarah Mitchell", contact: "Sarah Mitchell", time: "9:00 AM", endTime: "9:15 AM", type: "video", location: "Telehealth", color: "bg-blue-100 border-blue-300 text-blue-800", day: 0 },
    { id: "m2", title: "Dosing Check-In — Jessica Brown", contact: "Jessica Brown", time: "10:30 AM", endTime: "10:45 AM", type: "video", location: "Telehealth", color: "bg-teal-100 border-teal-300 text-teal-800", day: 0 },
    { id: "m3", title: "Refill Consultation — David Park", contact: "David Park", time: "2:00 PM", endTime: "2:15 PM", type: "video", location: "Telehealth", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 1 },
    { id: "m4", title: "Side Effect Review — Michael Torres", contact: "Michael Torres", time: "11:00 AM", endTime: "11:15 AM", type: "video", location: "Telehealth", color: "bg-violet-100 border-violet-300 text-violet-800", day: 2 },
    { id: "m5", title: "Treatment Adjustment — Emily Chen", contact: "Emily Chen", time: "3:00 PM", endTime: "3:15 PM", type: "video", location: "Telehealth", color: "bg-amber-100 border-amber-300 text-amber-800", day: 3 },
    { id: "m6", title: "Team Ops Standup", contact: "CLYR Team", time: "8:30 AM", endTime: "9:00 AM", type: "video", location: "Google Meet", color: "bg-gray-100 border-gray-300 text-gray-700", day: 1 },
  ],
  ecommerce: [
    { id: "m1", title: "Content Planning", contact: "Internal", time: "10:00 AM", endTime: "10:30 AM", type: "video", location: "Google Meet", color: "bg-blue-100 border-blue-300 text-blue-800", day: 0 },
    { id: "m2", title: "VIP Customer Check-in", contact: "Andrew Krieman", time: "2:00 PM", endTime: "2:30 PM", type: "phone", location: "Call", color: "bg-violet-100 border-violet-300 text-violet-800", day: 1 },
    { id: "m3", title: "Picks Review", contact: "Internal", time: "7:00 AM", endTime: "7:30 AM", type: "video", location: "Zoom", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 2 },
  ],
  home_services: [
    { id: "m1", title: "Site Visit — Garcia Roof", contact: "Linda Garcia", time: "8:00 AM", endTime: "9:00 AM", type: "in_person", location: "1234 Palm Beach Blvd", color: "bg-amber-100 border-amber-300 text-amber-800", day: 0 },
    { id: "m2", title: "Estimate Follow-Up", contact: "Richard Wilson", time: "10:00 AM", endTime: "10:15 AM", type: "phone", location: "Call", color: "bg-blue-100 border-blue-300 text-blue-800", day: 0 },
    { id: "m3", title: "HVAC Install Walkthrough", contact: "Thomas Brown", time: "9:00 AM", endTime: "10:00 AM", type: "in_person", location: "4567 Cypress Dr", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 2 },
    { id: "m4", title: "Crew Schedule Meeting", contact: "Internal — All Crews", time: "7:00 AM", endTime: "7:30 AM", type: "in_person", location: "Office", color: "bg-gray-100 border-gray-300 text-gray-700", day: 0 },
    { id: "m5", title: "Crew Schedule Meeting", contact: "Internal — All Crews", time: "7:00 AM", endTime: "7:30 AM", type: "in_person", location: "Office", color: "bg-gray-100 border-gray-300 text-gray-700", day: 3 },
    { id: "m6", title: "Emergency Leak Assessment", contact: "Susan Taylor", time: "11:00 AM", endTime: "12:00 PM", type: "in_person", location: "1847 Palm Beach Blvd", color: "bg-red-100 border-red-300 text-red-800", day: 0 },
  ],
  legal: [
    { id: "m1", title: "Client Meeting — Johnson PI", contact: "Marcus Johnson", time: "10:00 AM", endTime: "11:00 AM", type: "in_person", location: "Conference Room A", color: "bg-blue-100 border-blue-300 text-blue-800", day: 0 },
    { id: "m2", title: "Mediation Prep", contact: "Harbor Construction", time: "2:00 PM", endTime: "3:30 PM", type: "in_person", location: "Conference Room B", color: "bg-violet-100 border-violet-300 text-violet-800", day: 1 },
    { id: "m3", title: "Phone Consult — Williams Estate", contact: "Patricia Williams", time: "3:00 PM", endTime: "3:45 PM", type: "phone", location: "Call", color: "bg-amber-100 border-amber-300 text-amber-800", day: 2 },
    { id: "m4", title: "Deposition — Mitchell", contact: "Opposing Counsel", time: "9:00 AM", endTime: "12:00 PM", type: "in_person", location: "Court Reporter Office", color: "bg-red-100 border-red-300 text-red-800", day: 3 },
    { id: "m5", title: "Partner Meeting", contact: "Internal — Sterling & Hayes", time: "8:30 AM", endTime: "9:00 AM", type: "in_person", location: "Partner Office", color: "bg-gray-100 border-gray-300 text-gray-700", day: 1 },
  ],
  fitness_gym: [
    { id: "m1", title: "PT Session — Stephanie Clark", contact: "Stephanie Clark", time: "6:00 AM", endTime: "7:00 AM", type: "in_person", location: "Gym Floor", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 0 },
    { id: "m2", title: "New Member Tour", contact: "Brandon Lewis", time: "10:00 AM", endTime: "10:30 AM", type: "in_person", location: "Front Desk", color: "bg-blue-100 border-blue-300 text-blue-800", day: 0 },
    { id: "m3", title: "PT Session — Stephanie Clark", contact: "Stephanie Clark", time: "6:00 AM", endTime: "7:00 AM", type: "in_person", location: "Gym Floor", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 2 },
    { id: "m4", title: "HIIT Class", contact: "Group — 25 members", time: "6:00 PM", endTime: "6:45 PM", type: "in_person", location: "Studio A", color: "bg-amber-100 border-amber-300 text-amber-800", day: 0 },
    { id: "m5", title: "HIIT Class", contact: "Group — 25 members", time: "6:00 PM", endTime: "6:45 PM", type: "in_person", location: "Studio A", color: "bg-amber-100 border-amber-300 text-amber-800", day: 2 },
    { id: "m6", title: "Member Retention Review", contact: "Internal", time: "9:00 AM", endTime: "9:30 AM", type: "video", location: "Zoom", color: "bg-gray-100 border-gray-300 text-gray-700", day: 4 },
  ],
  beauty_salon: [
    { id: "m1", title: "Bridal Trial — Charlotte Davis", contact: "Charlotte Davis", time: "10:00 AM", endTime: "12:00 PM", type: "in_person", location: "Station 1", color: "bg-rose-100 border-rose-300 text-rose-800", day: 0 },
    { id: "m2", title: "Keratin Treatment", contact: "Amelia Wilson", time: "2:00 PM", endTime: "4:00 PM", type: "in_person", location: "Station 2", color: "bg-violet-100 border-violet-300 text-violet-800", day: 1 },
    { id: "m3", title: "Blowout + Style", contact: "Harper Garcia", time: "3:00 PM", endTime: "3:45 PM", type: "in_person", location: "Station 1", color: "bg-blue-100 border-blue-300 text-blue-800", day: 3 },
    { id: "m4", title: "Color Correction Consult", contact: "New Client", time: "11:00 AM", endTime: "11:30 AM", type: "in_person", location: "Consultation Area", color: "bg-amber-100 border-amber-300 text-amber-800", day: 2 },
    { id: "m5", title: "Team Scheduling", contact: "Internal — All Stylists", time: "9:00 AM", endTime: "9:30 AM", type: "in_person", location: "Break Room", color: "bg-gray-100 border-gray-300 text-gray-700", day: 0 },
  ],
  real_estate: [
    { id: "m1", title: "Showing — 4521 Bayshore Dr", contact: "Amanda Hill", time: "10:00 AM", endTime: "10:30 AM", type: "in_person", location: "4521 Bayshore Dr", color: "bg-blue-100 border-blue-300 text-blue-800", day: 0 },
    { id: "m2", title: "Listing Presentation", contact: "Robert Chen", time: "2:00 PM", endTime: "3:00 PM", type: "in_person", location: "Seller's Home", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 0 },
    { id: "m3", title: "Closing — Williams Estate", contact: "Patricia Williams", time: "2:00 PM", endTime: "3:30 PM", type: "in_person", location: "First National Title", color: "bg-violet-100 border-violet-300 text-violet-800", day: 2 },
    { id: "m4", title: "Open House", contact: "Public — 1234 Gulf Blvd", time: "1:00 PM", endTime: "4:00 PM", type: "in_person", location: "1234 Gulf Blvd", color: "bg-amber-100 border-amber-300 text-amber-800", day: 4 },
    { id: "m5", title: "Team Meeting", contact: "Internal — All Agents", time: "9:00 AM", endTime: "9:30 AM", type: "in_person", location: "Office", color: "bg-gray-100 border-gray-300 text-gray-700", day: 1 },
  ],
  coaching_education: [
    { id: "m1", title: "1:1 Session — Jason Wright", contact: "Jason Wright", time: "9:00 AM", endTime: "10:00 AM", type: "video", location: "Zoom", color: "bg-blue-100 border-blue-300 text-blue-800", day: 0 },
    { id: "m2", title: "Mastermind Cohort Call", contact: "6 Participants", time: "11:00 AM", endTime: "12:30 PM", type: "video", location: "Zoom", color: "bg-violet-100 border-violet-300 text-violet-800", day: 1 },
    { id: "m3", title: "VIP Day — Nathan Harris", contact: "Nathan Harris", time: "9:00 AM", endTime: "5:00 PM", type: "in_person", location: "Office", color: "bg-amber-100 border-amber-300 text-amber-800", day: 3 },
    { id: "m4", title: "Discovery Call", contact: "New Lead", time: "3:00 PM", endTime: "3:30 PM", type: "video", location: "Zoom", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 2 },
  ],
  restaurant_food: [
    { id: "m1", title: "Catering Tasting", contact: "Apex Financial", time: "11:00 AM", endTime: "12:00 PM", type: "in_person", location: "Private Dining Room", color: "bg-amber-100 border-amber-300 text-amber-800", day: 1 },
    { id: "m2", title: "Wedding Menu Finalization", contact: "Emily & David", time: "2:00 PM", endTime: "3:00 PM", type: "in_person", location: "Chef's Office", color: "bg-rose-100 border-rose-300 text-rose-800", day: 2 },
    { id: "m3", title: "Staff Pre-Service Meeting", contact: "All Staff", time: "4:00 PM", endTime: "4:30 PM", type: "in_person", location: "Dining Room", color: "bg-gray-100 border-gray-300 text-gray-700", day: 4 },
    { id: "m4", title: "Wine Rep Tasting", contact: "Southern Wine & Spirits", time: "10:00 AM", endTime: "11:00 AM", type: "in_person", location: "Bar Area", color: "bg-violet-100 border-violet-300 text-violet-800", day: 3 },
  ],
  automotive: [
    { id: "m1", title: "Fleet Service Block", contact: "Enterprise Fleet (5 vehicles)", time: "7:00 AM", endTime: "5:00 PM", type: "in_person", location: "All Bays", color: "bg-blue-100 border-blue-300 text-blue-800", day: 1 },
    { id: "m2", title: "Follow-Up — Brake Decline", contact: "James Peterson", time: "10:00 AM", endTime: "10:15 AM", type: "phone", location: "Call", color: "bg-amber-100 border-amber-300 text-amber-800", day: 0 },
    { id: "m3", title: "Parts Order Review", contact: "Internal — AutoZone Rep", time: "9:00 AM", endTime: "9:30 AM", type: "phone", location: "Call", color: "bg-gray-100 border-gray-300 text-gray-700", day: 2 },
    { id: "m4", title: "Customer Pickup", contact: "Thomas Brown", time: "3:00 PM", endTime: "3:15 PM", type: "in_person", location: "Front Desk", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 0 },
  ],
  nonprofit: [
    { id: "m1", title: "Gala Planning Committee", contact: "Events Team + Board", time: "10:00 AM", endTime: "11:30 AM", type: "in_person", location: "Conference Room", color: "bg-violet-100 border-violet-300 text-violet-800", day: 0 },
    { id: "m2", title: "Major Donor Meeting", contact: "Robert Chen", time: "12:00 PM", endTime: "1:00 PM", type: "in_person", location: "Lunch — The Copper Table", color: "bg-amber-100 border-amber-300 text-amber-800", day: 1 },
    { id: "m3", title: "Sponsorship Call", contact: "Community Bank of FL", time: "2:00 PM", endTime: "2:30 PM", type: "phone", location: "Call", color: "bg-blue-100 border-blue-300 text-blue-800", day: 2 },
    { id: "m4", title: "Volunteer Orientation", contact: "5 New Volunteers", time: "9:00 AM", endTime: "10:00 AM", type: "in_person", location: "Community Center", color: "bg-emerald-100 border-emerald-300 text-emerald-800", day: 4 },
    { id: "m5", title: "Board Meeting", contact: "Board of Directors", time: "6:00 PM", endTime: "8:00 PM", type: "in_person", location: "Board Room", color: "bg-rose-100 border-rose-300 text-rose-800", day: 3 },
  ],
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// ─── MAIN COMPONENT ───

export default function MeetingsPage() {
  const { openModal } = useModal();
  const ic = useIndustry();
  const [view, setView] = useState<"week" | "list">("week");
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const demoIndustry = getDemoIndustry();
    if (demoIndustry && INDUSTRY_MEETINGS[demoIndustry]) {
      setMeetings(INDUSTRY_MEETINGS[demoIndustry]);
      return;
    }
    fetch("/api/meetings").then(r => r.json()).then(data => {
      if (data?.data?.length) {
        setMeetings(data.data.map((m: any) => ({
          id: m.id, title: m.title || "Meeting", contactName: m.contactName || "",
          date: m.startsAt ? new Date(m.startsAt).toISOString().split("T")[0] : "",
          day: m.startsAt ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(m.startsAt).getDay()] : "",
          startTime: m.startsAt ? new Date(m.startsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "",
          endTime: m.endsAt ? new Date(m.endsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "",
          type: m.type || "call", location: m.location || "", color: "bg-indigo-500",
        })));
      } else {
        setMeetings([]);
      }
    }).catch(() => {});
  }, []);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.getDate();
  });

  const typeIcon = (t: string) => t === "video" ? <Video className="w-3 h-3" /> : t === "phone" ? <Phone className="w-3 h-3" /> : <MapPin className="w-3 h-3" />;

  const todayIdx = today.getDay() - 1; // 0=Mon

  return (
    <>
      <Header title="Meetings" />
      <div className="p-6 space-y-4">

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Week of {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </h2>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg">Today</button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setView("week")} className={`p-2 transition ${view === "week" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setView("list")} className={`p-2 transition border-l border-gray-200 ${view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}><List className="w-4 h-4" /></button>
            </div>
            <button onClick={() => openModal("meeting")} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              <Plus className="w-4 h-4" /> Schedule Meeting
            </button>
          </div>
        </div>

        {/* Week View */}
        {view === "week" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-5 border-b border-gray-100">
              {DAYS.map((day, i) => (
                <div key={day} className={`text-center py-3 border-r border-gray-50 last:border-r-0 ${i === todayIdx ? "bg-indigo-50" : ""}`}>
                  <p className={`text-xs font-medium ${i === todayIdx ? "text-indigo-600" : "text-gray-400"}`}>{day}</p>
                  <p className={`text-lg font-bold ${i === todayIdx ? "text-indigo-600" : "text-gray-900"}`}>{weekDates[i]}</p>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            <div className="grid grid-cols-5 min-h-[500px]">
              {DAYS.map((_, dayIdx) => {
                const dayMeetings = meetings.filter(m => m.day === dayIdx);
                return (
                  <div key={dayIdx} className={`border-r border-gray-50 last:border-r-0 p-2 space-y-2 ${dayIdx === todayIdx ? "bg-indigo-50/30" : ""}`}>
                    {dayMeetings.map(m => (
                      <div key={m.id} className={`rounded-lg border p-2.5 text-xs cursor-pointer hover:shadow-md transition ${m.color}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3 opacity-60" />
                          <span className="font-medium">{m.time}</span>
                        </div>
                        <p className="font-semibold text-xs leading-tight mb-1">{m.title}</p>
                        <div className="flex items-center gap-1 opacity-70">
                          <User className="w-2.5 h-2.5" />
                          <span className="text-[10px] truncate">{m.contact}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 opacity-60">
                          {typeIcon(m.type)}
                          <span className="text-[10px]">{m.location}</span>
                        </div>
                      </div>
                    ))}
                    {dayMeetings.length === 0 && (
                      <div className="h-full flex items-center justify-center opacity-30">
                        <p className="text-[10px] text-gray-400">No meetings</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="space-y-4">
            {FULL_DAYS.map((dayName, dayIdx) => {
              const dayMeetings = meetings.filter(m => m.day === dayIdx);
              if (dayMeetings.length === 0) return null;
              return (
                <div key={dayName}>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${dayIdx === todayIdx ? "text-indigo-600" : "text-gray-400"}`}>
                    {dayName} {dayIdx === todayIdx && "— Today"}
                  </h3>
                  <div className="space-y-2">
                    {dayMeetings.map(m => (
                      <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:border-indigo-200 transition">
                        <div className={`w-1.5 h-12 rounded-full ${m.color.replace("bg-", "bg-").replace("-100", "-400")}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                          <p className="text-xs text-gray-500">{m.contact}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {m.time} – {m.endTime}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          {typeIcon(m.type)}
                          {m.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
            <p className="text-xs text-gray-400">This Week</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{meetings.filter(m => m.type === "video").length}</p>
            <p className="text-xs text-gray-400">Video Calls</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{meetings.filter(m => m.day === todayIdx).length}</p>
            <p className="text-xs text-gray-400">Today</p>
          </div>
        </div>
      </div>
    </>
  );
}
