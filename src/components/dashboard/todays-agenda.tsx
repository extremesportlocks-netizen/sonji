"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Phone, Mail, CheckCircle, AlertTriangle, DollarSign, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AgendaItem {
  id: string;
  time: string;
  type: "meeting" | "task" | "call" | "payment" | "automation" | "deadline";
  title: string;
  subtitle: string;
  urgent?: boolean;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  meeting: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
  task: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  call: { icon: Phone, color: "text-violet-600", bg: "bg-violet-50" },
  payment: { icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  automation: { icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  deadline: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
};

const INDUSTRY_AGENDAS: Record<string, AgendaItem[]> = {
  agency_consulting: [
    { id: "a1", time: "9:00 AM", type: "meeting", title: "Team standup", subtitle: "Weekly priorities with Colton, Rocco, Mike, Sarah" },
    { id: "a2", time: "10:00 AM", type: "meeting", title: "Meridian website walkthrough", subtitle: "Amanda Chen — QA review of redesign" },
    { id: "a3", time: "10:30 AM", type: "call", title: "Call Coastal Real Estate", subtitle: "12 days ghosting — $72K at risk", urgent: true },
    { id: "a4", time: "11:00 AM", type: "task", title: "Review Sterling renewal strategy", subtitle: "Rocco prepared attribution report" },
    { id: "a5", time: "1:00 PM", type: "meeting", title: "Apex Construction discovery debrief", subtitle: "Discuss $3K/mo social media proposal" },
    { id: "a6", time: "2:00 PM", type: "task", title: "Send March reports", subtitle: "Brightview + Harbor auto-generated, ready to send" },
    { id: "a7", time: "3:00 PM", type: "deadline", title: "Summit Athletics mockups due", subtitle: "Brand refresh — Colton presenting to client" },
    { id: "a8", time: "4:00 PM", type: "automation", title: "3 automations fired today", subtitle: "2 lead responses + 1 renewal alert" },
  ],
  health_wellness: [
    { id: "a1", time: "8:30 AM", type: "task", title: "Prepare Emily Rodriguez chart", subtitle: "New patient consultation at 9 AM" },
    { id: "a2", time: "9:00 AM", type: "meeting", title: "Consultation — Emily Rodriguez", subtitle: "Botox consultation, first visit" },
    { id: "a3", time: "10:00 AM", type: "call", title: "Call Patricia Lee", subtitle: "2 missed appointments — check in", urgent: true },
    { id: "a4", time: "11:00 AM", type: "meeting", title: "Sarah Thompson follow-up", subtitle: "Week 4 dosage review — telehealth" },
    { id: "a5", time: "1:00 PM", type: "payment", title: "Process Maria Santos payment", subtitle: "Botox treatment — $800" },
    { id: "a6", time: "3:00 PM", type: "automation", title: "5 automations fired today", subtitle: "2 reminders, 1 review request, 2 check-ins" },
  ],
  ecommerce: [
    { id: "a1", time: "9:00 AM", type: "task", title: "Contact Andrew Krieman", subtitle: "VIP payment failed — card declined", urgent: true },
    { id: "a2", time: "10:00 AM", type: "task", title: "Reply to Wayne Barry", subtitle: "Wants to upgrade monthly → VIP yearly" },
    { id: "a3", time: "12:00 PM", type: "task", title: "Write Thursday picks", subtitle: "4 NCAAB games, need by 5 PM" },
    { id: "a4", time: "2:00 PM", type: "automation", title: "Win-back campaign results", subtitle: "Check open rates from yesterday's send" },
    { id: "a5", time: "5:00 PM", type: "deadline", title: "Picks publish deadline", subtitle: "Thursday slate goes live at 5 PM" },
  ],
  home_services: [
    { id: "a1", time: "7:00 AM", type: "task", title: "EMERGENCY: Susan Taylor", subtitle: "Active roof leak — same-day response needed", urgent: true },
    { id: "a2", time: "8:00 AM", type: "meeting", title: "Crew dispatch — Garcia roof", subtitle: "Materials delivery + crew assignment" },
    { id: "a3", time: "10:00 AM", type: "call", title: "Follow up Richard Wilson", subtitle: "Gutter estimate 14 days — no response" },
    { id: "a4", time: "1:00 PM", type: "meeting", title: "HVAC install walkthrough", subtitle: "Thomas Brown — confirm Thursday crew" },
    { id: "a5", time: "3:00 PM", type: "payment", title: "Linda Garcia deposit", subtitle: "50% deposit — $18,500 for roof job" },
  ],
};

export default function TodaysAgenda() {
  const [items, setItems] = useState<AgendaItem[]>([]);

  useEffect(() => {
    const di = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = di || "ecommerce";
    setItems(INDUSTRY_AGENDAS[key] || INDUSTRY_AGENDAS.ecommerce);
  }, []);

  if (items.length === 0) return null;

  const urgentCount = items.filter(i => i.urgent).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Today's Agenda</h3>
          {urgentCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" /> {urgentCount} urgent
            </span>
          )}
        </div>
        <Link href="/dashboard/meetings" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
          Calendar <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-1.5">
        {items.map(item => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div key={item.id} className={`flex items-center gap-3 py-2 px-3 rounded-lg transition ${item.urgent ? "bg-red-50/50 border border-red-100" : "hover:bg-gray-50"}`}>
              <span className="text-[10px] text-gray-400 w-14 flex-shrink-0 font-mono">{item.time}</span>
              <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${item.urgent ? "text-red-700" : "text-gray-900"}`}>{item.title}</p>
                <p className="text-[10px] text-gray-400 truncate">{item.subtitle}</p>
              </div>
              {item.urgent && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
