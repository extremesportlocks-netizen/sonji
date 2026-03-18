"use client";

import { useState, useEffect } from "react";
import { Users, Clock, TrendingUp, DollarSign, ChevronRight, Star } from "lucide-react";
import Link from "next/link";

/**
 * TEAM PERFORMANCE
 * 
 * Shows per-member stats: hours logged, tasks completed, revenue generated,
 * utilization %. Helps managers make staffing and pricing decisions.
 */

interface TeamMember {
  name: string;
  role: string;
  hoursLogged: number;
  capacity: number; // weekly hours
  tasksCompleted: number;
  tasksTotal: number;
  revenueManaged: number;
  efficiency: number; // revenue per hour
}

const INDUSTRY_TEAMS: Record<string, TeamMember[]> = {
  agency_consulting: [
    { name: "Colton", role: "PM / Strategy", hoursLogged: 38, capacity: 40, tasksCompleted: 12, tasksTotal: 16, revenueManaged: 42000, efficiency: 1105 },
    { name: "Rocco", role: "SEO / PPC", hoursLogged: 42, capacity: 40, tasksCompleted: 15, tasksTotal: 18, revenueManaged: 24500, efficiency: 583 },
    { name: "Mike", role: "Developer", hoursLogged: 36, capacity: 40, tasksCompleted: 8, tasksTotal: 12, revenueManaged: 15000, efficiency: 417 },
    { name: "Sarah", role: "Designer", hoursLogged: 32, capacity: 40, tasksCompleted: 10, tasksTotal: 14, revenueManaged: 12000, efficiency: 375 },
  ],
  health_wellness: [
    { name: "Dr. Patel", role: "Lead Provider", hoursLogged: 35, capacity: 40, tasksCompleted: 18, tasksTotal: 22, revenueManaged: 28000, efficiency: 800 },
    { name: "Dr. Kim", role: "Provider", hoursLogged: 30, capacity: 40, tasksCompleted: 14, tasksTotal: 16, revenueManaged: 18500, efficiency: 617 },
    { name: "Front Desk", role: "Admin", hoursLogged: 40, capacity: 40, tasksCompleted: 24, tasksTotal: 28, revenueManaged: 0, efficiency: 0 },
  ],
  ecommerce: [
    { name: "Orlando", role: "Owner / Analyst", hoursLogged: 28, capacity: 40, tasksCompleted: 18, tasksTotal: 22, revenueManaged: 14985, efficiency: 535 },
  ],
  home_services: [
    { name: "Mike", role: "Owner / Estimator", hoursLogged: 45, capacity: 40, tasksCompleted: 12, tasksTotal: 15, revenueManaged: 33500, efficiency: 744 },
    { name: "Steve", role: "Foreman", hoursLogged: 40, capacity: 40, tasksCompleted: 8, tasksTotal: 10, revenueManaged: 8200, efficiency: 205 },
    { name: "Crew A", role: "Installation", hoursLogged: 80, capacity: 80, tasksCompleted: 5, tasksTotal: 6, revenueManaged: 0, efficiency: 0 },
  ],
  legal: [
    { name: "Atty. Sterling", role: "Senior Partner", hoursLogged: 32, capacity: 40, tasksCompleted: 8, tasksTotal: 12, revenueManaged: 60000, efficiency: 1875 },
    { name: "Atty. Hayes", role: "Associate", hoursLogged: 38, capacity: 40, tasksCompleted: 10, tasksTotal: 14, revenueManaged: 9500, efficiency: 250 },
    { name: "Paralegal", role: "Support", hoursLogged: 40, capacity: 40, tasksCompleted: 14, tasksTotal: 16, revenueManaged: 0, efficiency: 0 },
  ],
  fitness_gym: [
    { name: "Jake", role: "Owner / Head Coach", hoursLogged: 42, capacity: 40, tasksCompleted: 18, tasksTotal: 22, revenueManaged: 42000, efficiency: 1000 },
    { name: "Coach Sarah", role: "Personal Trainer", hoursLogged: 35, capacity: 40, tasksCompleted: 12, tasksTotal: 14, revenueManaged: 14400, efficiency: 411 },
    { name: "Coach Mike", role: "Group Fitness", hoursLogged: 28, capacity: 40, tasksCompleted: 8, tasksTotal: 10, revenueManaged: 8000, efficiency: 286 },
  ],
  beauty_salon: [
    { name: "Emma", role: "Owner / Senior Stylist", hoursLogged: 38, capacity: 40, tasksCompleted: 16, tasksTotal: 20, revenueManaged: 28400, efficiency: 747 },
    { name: "Alex", role: "Stylist", hoursLogged: 36, capacity: 40, tasksCompleted: 14, tasksTotal: 16, revenueManaged: 12000, efficiency: 333 },
    { name: "Nina", role: "Junior Stylist", hoursLogged: 32, capacity: 40, tasksCompleted: 10, tasksTotal: 12, revenueManaged: 6800, efficiency: 213 },
  ],
  real_estate: [
    { name: "Sarah", role: "Lead Agent", hoursLogged: 45, capacity: 40, tasksCompleted: 12, tasksTotal: 15, revenueManaged: 71000, efficiency: 1578 },
    { name: "Agent Mike", role: "Agent", hoursLogged: 38, capacity: 40, tasksCompleted: 8, tasksTotal: 12, revenueManaged: 26700, efficiency: 703 },
  ],
  coaching_education: [
    { name: "Coach", role: "Head Coach", hoursLogged: 30, capacity: 40, tasksCompleted: 14, tasksTotal: 18, revenueManaged: 56833, efficiency: 1894 },
    { name: "VA Jordan", role: "Virtual Assistant", hoursLogged: 20, capacity: 20, tasksCompleted: 18, tasksTotal: 20, revenueManaged: 0, efficiency: 0 },
  ],
  restaurant_food: [
    { name: "Chef Marco", role: "Executive Chef", hoursLogged: 50, capacity: 50, tasksCompleted: 8, tasksTotal: 10, revenueManaged: 82000, efficiency: 1640 },
    { name: "Sophia", role: "Front of House", hoursLogged: 45, capacity: 45, tasksCompleted: 22, tasksTotal: 25, revenueManaged: 0, efficiency: 0 },
    { name: "David", role: "Host / Events", hoursLogged: 40, capacity: 40, tasksCompleted: 15, tasksTotal: 18, revenueManaged: 7750, efficiency: 194 },
  ],
  automotive: [
    { name: "Tom", role: "Owner / Estimator", hoursLogged: 44, capacity: 40, tasksCompleted: 12, tasksTotal: 15, revenueManaged: 24500, efficiency: 557 },
    { name: "Service Mgr", role: "Service Manager", hoursLogged: 40, capacity: 40, tasksCompleted: 18, tasksTotal: 22, revenueManaged: 0, efficiency: 0 },
    { name: "Tech A", role: "Lead Tech", hoursLogged: 42, capacity: 40, tasksCompleted: 8, tasksTotal: 10, revenueManaged: 0, efficiency: 0 },
  ],
  nonprofit: [
    { name: "Amy", role: "Executive Director", hoursLogged: 42, capacity: 40, tasksCompleted: 14, tasksTotal: 18, revenueManaged: 26500, efficiency: 631 },
    { name: "Events Lead", role: "Event Coordinator", hoursLogged: 38, capacity: 40, tasksCompleted: 12, tasksTotal: 15, revenueManaged: 15000, efficiency: 395 },
    { name: "Outreach", role: "Donor Relations", hoursLogged: 35, capacity: 40, tasksCompleted: 16, tasksTotal: 20, revenueManaged: 6500, efficiency: 186 },
  ],
};

function fmt(n: number) { return n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`; }

export default function TeamPerformance() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = demoIndustry; if (!key) return;
    setTeam(INDUSTRY_TEAMS[key] || INDUSTRY_TEAMS.ecommerce);
  }, []);

  if (team.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Team Performance</h3>
        <Link href="/dashboard/projects" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
          Projects <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {team.map(m => {
          const utilization = (m.hoursLogged / m.capacity) * 100;
          const taskRate = m.tasksTotal > 0 ? (m.tasksCompleted / m.tasksTotal) * 100 : 0;
          const utilColor = utilization > 100 ? "bg-red-400" : utilization > 85 ? "bg-amber-400" : "bg-emerald-400";
          const utilTextColor = utilization > 100 ? "text-red-600" : utilization > 85 ? "text-amber-600" : "text-emerald-600";

          return (
            <div key={m.name} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-700">{m.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900">{m.name}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{m.role}</span>
                  </div>
                  <span className={`text-xs font-bold ${utilTextColor}`}>{utilization.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className={`h-full rounded-full ${utilColor}`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{m.hoursLogged}/{m.capacity}h</span>
                  <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5" />{m.tasksCompleted}/{m.tasksTotal} tasks</span>
                  {m.revenueManaged > 0 && <span className="flex items-center gap-0.5"><DollarSign className="w-2.5 h-2.5" />{fmt(m.revenueManaged)}</span>}
                  {m.efficiency > 0 && <span className="flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{fmt(m.efficiency)}/hr</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
