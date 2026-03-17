"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  Users, Plus, Mail, Shield, Clock, CheckCircle,
  MoreHorizontal, Search, Crown, Edit3, Trash2, Key,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "member";
  status: "active" | "invited" | "disabled";
  joinDate: string;
  lastActive: string;
  avatar: string;
}

const roleConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  owner: { label: "Owner", color: "text-violet-600", bg: "bg-violet-50 border-violet-200", icon: Crown },
  admin: { label: "Admin", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200", icon: Shield },
  manager: { label: "Manager", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Key },
  member: { label: "Member", color: "text-gray-600", bg: "bg-gray-50 border-gray-200", icon: Users },
};

const INDUSTRY_TEAMS: Record<string, TeamMember[]> = {
  agency_consulting: [
    { id: "u1", name: "Orlando", email: "orlando@powermarketing.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "O" },
    { id: "u2", name: "Colton", email: "colton@powermarketing.com", role: "admin", status: "active", joinDate: "Mar 1, 2026", lastActive: "2 hours ago", avatar: "C" },
    { id: "u3", name: "Rocco", email: "rocco@powermarketing.com", role: "manager", status: "active", joinDate: "Mar 1, 2026", lastActive: "5 min ago", avatar: "R" },
    { id: "u4", name: "Mike", email: "mike@powermarketing.com", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "1 hour ago", avatar: "M" },
    { id: "u5", name: "Sarah", email: "sarah@powermarketing.com", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "3 hours ago", avatar: "S" },
    { id: "u6", name: "Alex (Intern)", email: "alex@powermarketing.com", role: "member", status: "invited", joinDate: "Mar 15, 2026", lastActive: "Invite pending", avatar: "A" },
  ],
  health_wellness: [
    { id: "u1", name: "Dr. Patel", email: "patel@glowmedspa.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "P" },
    { id: "u2", name: "Dr. Kim", email: "kim@glowmedspa.com", role: "admin", status: "active", joinDate: "Mar 1, 2026", lastActive: "1 hour ago", avatar: "K" },
    { id: "u3", name: "Front Desk", email: "frontdesk@glowmedspa.com", role: "member", status: "active", joinDate: "Mar 3, 2026", lastActive: "30 min ago", avatar: "F" },
    { id: "u4", name: "Office Manager", email: "manager@glowmedspa.com", role: "manager", status: "active", joinDate: "Mar 2, 2026", lastActive: "2 hours ago", avatar: "M" },
  ],
  ecommerce: [
    { id: "u1", name: "Orlando", email: "orlando@eslsports.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "O" },
  ],
  fitness_gym: [
    { id: "u1", name: "Jake", email: "jake@ironrepublic.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "J" },
    { id: "u2", name: "Coach Sarah", email: "sarah@ironrepublic.com", role: "manager", status: "active", joinDate: "Mar 1, 2026", lastActive: "2 hours ago", avatar: "S" },
    { id: "u3", name: "Coach Mike", email: "mike@ironrepublic.com", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "45 min ago", avatar: "M" },
    { id: "u4", name: "Front Desk", email: "desk@ironrepublic.com", role: "member", status: "active", joinDate: "Mar 3, 2026", lastActive: "10 min ago", avatar: "F" },
  ],
  beauty_salon: [
    { id: "u1", name: "Emma", email: "emma@luxebeauty.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "E" },
    { id: "u2", name: "Alex", email: "alex@luxebeauty.com", role: "manager", status: "active", joinDate: "Mar 1, 2026", lastActive: "1 hour ago", avatar: "A" },
    { id: "u3", name: "Nina", email: "nina@luxebeauty.com", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "30 min ago", avatar: "N" },
    { id: "u4", name: "Receptionist", email: "front@luxebeauty.com", role: "member", status: "active", joinDate: "Mar 3, 2026", lastActive: "15 min ago", avatar: "R" },
    { id: "u5", name: "New Stylist", email: "new@luxebeauty.com", role: "member", status: "invited", joinDate: "Mar 15, 2026", lastActive: "Invite pending", avatar: "N" },
  ],
  real_estate: [
    { id: "u1", name: "Sarah", email: "sarah@summitrealty.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "S" },
    { id: "u2", name: "Agent Mike", email: "mike@summitrealty.com", role: "manager", status: "active", joinDate: "Mar 1, 2026", lastActive: "3 hours ago", avatar: "M" },
    { id: "u3", name: "Admin Lisa", email: "lisa@summitrealty.com", role: "member", status: "active", joinDate: "Mar 3, 2026", lastActive: "1 hour ago", avatar: "L" },
  ],
  home_services: [
    { id: "u1", name: "Mike", email: "mike@apexroofing.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "M" },
    { id: "u2", name: "Steve", email: "steve@apexroofing.com", role: "manager", status: "active", joinDate: "Mar 1, 2026", lastActive: "2 hours ago", avatar: "S" },
    { id: "u3", name: "Crew Lead A", email: "crewa@apexroofing.com", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "4 hours ago", avatar: "A" },
    { id: "u4", name: "Crew Lead B", email: "crewb@apexroofing.com", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "3 hours ago", avatar: "B" },
    { id: "u5", name: "Office Admin", email: "office@apexroofing.com", role: "member", status: "active", joinDate: "Mar 2, 2026", lastActive: "30 min ago", avatar: "O" },
  ],
  legal: [
    { id: "u1", name: "Atty. Sterling", email: "sterling@sterlinglaw.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "S" },
    { id: "u2", name: "Atty. Hayes", email: "hayes@sterlinglaw.com", role: "admin", status: "active", joinDate: "Mar 1, 2026", lastActive: "1 hour ago", avatar: "H" },
    { id: "u3", name: "Paralegal Kim", email: "kim@sterlinglaw.com", role: "member", status: "active", joinDate: "Mar 3, 2026", lastActive: "45 min ago", avatar: "K" },
    { id: "u4", name: "Legal Assistant", email: "assist@sterlinglaw.com", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "2 hours ago", avatar: "L" },
  ],
  coaching_education: [
    { id: "u1", name: "Coach", email: "coach@elevatecoaching.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "C" },
    { id: "u2", name: "VA — Jordan", email: "jordan@elevatecoaching.com", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "3 hours ago", avatar: "J" },
  ],
  restaurant_food: [
    { id: "u1", name: "Chef Marco", email: "marco@coppertable.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "M" },
    { id: "u2", name: "Manager Sophia", email: "sophia@coppertable.com", role: "admin", status: "active", joinDate: "Mar 1, 2026", lastActive: "30 min ago", avatar: "S" },
    { id: "u3", name: "Host David", email: "david@coppertable.com", role: "member", status: "active", joinDate: "Mar 3, 2026", lastActive: "1 hour ago", avatar: "D" },
    { id: "u4", name: "Events Coord.", email: "events@coppertable.com", role: "manager", status: "active", joinDate: "Mar 5, 2026", lastActive: "4 hours ago", avatar: "E" },
  ],
  automotive: [
    { id: "u1", name: "Owner Tom", email: "tom@precisionauto.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "T" },
    { id: "u2", name: "Service Mgr", email: "service@precisionauto.com", role: "manager", status: "active", joinDate: "Mar 1, 2026", lastActive: "1 hour ago", avatar: "S" },
    { id: "u3", name: "Tech A", email: "tech.a@precisionauto.com", role: "member", status: "active", joinDate: "Mar 3, 2026", lastActive: "2 hours ago", avatar: "A" },
    { id: "u4", name: "Parts Dept", email: "parts@precisionauto.com", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "3 hours ago", avatar: "P" },
  ],
  nonprofit: [
    { id: "u1", name: "Director Amy", email: "amy@harborfoundation.org", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "A" },
    { id: "u2", name: "Events Lead", email: "events@harborfoundation.org", role: "manager", status: "active", joinDate: "Mar 1, 2026", lastActive: "2 hours ago", avatar: "E" },
    { id: "u3", name: "Outreach Coord.", email: "outreach@harborfoundation.org", role: "member", status: "active", joinDate: "Mar 3, 2026", lastActive: "1 hour ago", avatar: "O" },
    { id: "u4", name: "Volunteer Mgr", email: "volunteer@harborfoundation.org", role: "member", status: "active", joinDate: "Mar 5, 2026", lastActive: "4 hours ago", avatar: "V" },
    { id: "u5", name: "New Intern", email: "intern@harborfoundation.org", role: "member", status: "invited", joinDate: "Mar 15, 2026", lastActive: "Invite pending", avatar: "I" },
  ],
};

const DEFAULT_TEAM: TeamMember[] = [
  { id: "u1", name: "You", email: "you@company.com", role: "owner", status: "active", joinDate: "Mar 1, 2026", lastActive: "Just now", avatar: "Y" },
];

export default function TeamPage() {
  const ic = useIndustry();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    const di = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = di || "ecommerce";
    setTeam(INDUSTRY_TEAMS[key] || DEFAULT_TEAM);
  }, []);

  const filtered = team.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const active = team.filter(t => t.status === "active").length;
  const invited = team.filter(t => t.status === "invited").length;

  return (
    <>
      <Header title="Team" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-400">Total Members</span></div>
            <p className="text-2xl font-bold text-gray-900">{team.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-400">Active</span></div>
            <p className="text-2xl font-bold text-emerald-600">{active}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-400">Pending Invites</span></div>
            <p className="text-2xl font-bold text-amber-600">{invited}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team members..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
            <Plus className="w-4 h-4" /> Invite Member
          </button>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(member => {
            const rc = roleConfig[member.role];
            const RoleIcon = rc.icon;
            return (
              <div key={member.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${
                      member.role === "owner" ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white" :
                      member.role === "admin" ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-xs text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  {member.role !== "owner" && (
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100 transition">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${rc.bg} ${rc.color}`}>
                    <RoleIcon className="w-3 h-3" /> {rc.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {member.status === "active" && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                    {member.status === "invited" && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />}
                    <span className="text-[10px] text-gray-400">{member.lastActive}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Role Permissions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Role Permissions</h3>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div></div>
            {Object.values(roleConfig).map(r => <div key={r.label} className={`font-medium ${r.color}`}>{r.label}</div>)}
            {[
              { perm: "View contacts & deals", vals: [true, true, true, true] },
              { perm: "Create & edit records", vals: [true, true, true, true] },
              { perm: "Delete records", vals: [true, true, true, false] },
              { perm: "Manage team members", vals: [true, true, false, false] },
              { perm: "Billing & subscriptions", vals: [true, true, false, false] },
              { perm: "Integrations & API keys", vals: [true, true, false, false] },
              { perm: "White-label settings", vals: [true, false, false, false] },
            ].map(row => (
              <>
                <div key={row.perm} className="text-left text-gray-600 py-1.5">{row.perm}</div>
                {row.vals.map((v, i) => (
                  <div key={`${row.perm}-${i}`} className="py-1.5">
                    {v ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[440px] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Invite Team Member</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Email address</label>
                <input type="email" placeholder="name@company.com" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Role</label>
                <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                  <option>Member</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={() => setShowInvite(false)} className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Send Invite</button>
              <button onClick={() => setShowInvite(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
