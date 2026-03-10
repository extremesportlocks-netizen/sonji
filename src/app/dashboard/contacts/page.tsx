"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Search,
  SlidersHorizontal,
  Download,
  Upload,
  Plus,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  Mail,
  Phone,
  Users,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  companyLogo: string;
  status: "Active" | "Lead" | "Lost" | "Inactive";
  lastContacted: string;
  tags: string[];
}

const mockContacts: Contact[] = [
  { id: "1", firstName: "Mason", lastName: "Thompson", email: "mason@vertexpartners.com", phone: "+1 (555) 234-5678", company: "Vertex Partners", companyLogo: "VP", status: "Active", lastContacted: "Dec 28, 2025", tags: ["Enterprise", "Q1"] },
  { id: "2", firstName: "Logan", lastName: "Mitchell", email: "logan@dataflow.io", phone: "+1 (555) 345-6789", company: "DataFlow Solutions", companyLogo: "DF", status: "Active", lastContacted: "Dec 30, 2025", tags: ["Startup"] },
  { id: "3", firstName: "Lucas", lastName: "Anderson", email: "lucas@techventures.com", phone: "+1 (555) 456-7890", company: "TechVentures Inc", companyLogo: "TV", status: "Lead", lastContacted: "Dec 15, 2025", tags: ["Inbound"] },
  { id: "4", firstName: "Jackson", lastName: "Brooks", email: "jackson@halocollar.com", phone: "+1 (555) 456-7890", company: "Halo Collar", companyLogo: "HC", status: "Lost", lastContacted: "Dec 29, 2025", tags: ["Pet Tech"] },
  { id: "5", firstName: "Aiden", lastName: "Parker", email: "aiden@brightdynamics.com", phone: "+1 (555) 678-9012", company: "Bright Dynamics", companyLogo: "BD", status: "Lost", lastContacted: "Nov 20, 2025", tags: [] },
  { id: "6", firstName: "Caleb", lastName: "Reed", email: "caleb@nexgenai.com", phone: "+1 (555) 789-0123", company: "NexGen AI", companyLogo: "NA", status: "Lead", lastContacted: "Dec 25, 2025", tags: ["AI", "Series A"] },
  { id: "7", firstName: "Elijah", lastName: "Harris", email: "elijah@cloudpeak.io", phone: "+1 (555) 890-1234", company: "CloudPeak", companyLogo: "CP", status: "Active", lastContacted: "Dec 25, 2025", tags: ["Enterprise"] },
  { id: "8", firstName: "Benjamin", lastName: "Scott", email: "benjamin@pulsemedia.co", phone: "+1 (555) 456-7890", company: "Pulse Media", companyLogo: "PM", status: "Active", lastContacted: "Dec 31, 2025", tags: ["Media"] },
  { id: "9", firstName: "William", lastName: "Young", email: "william@ironforgedev.com", phone: "+1 (555) 890-1234", company: "IronForge Dev", companyLogo: "IF", status: "Lead", lastContacted: "Dec 31, 2025", tags: ["Agency"] },
  { id: "10", firstName: "Joshua", lastName: "Murphy", email: "joshua@skylinegroup.com", phone: "+1 (555) 234-5678", company: "Skyline Group", companyLogo: "SG", status: "Active", lastContacted: "Dec 18, 2025", tags: ["Real Estate"] },
  { id: "11", firstName: "Sarah", lastName: "Chen", email: "sarah@quantumleap.io", phone: "+1 (555) 901-2345", company: "Quantum Leap", companyLogo: "QL", status: "Active", lastContacted: "Dec 18, 2025", tags: ["SaaS"] },
  { id: "12", firstName: "Emily", lastName: "Rodriguez", email: "emily@swiftcommerce.co", phone: "+1 (555) 345-6789", company: "Swift Commerce", companyLogo: "SC", status: "Lead", lastContacted: "Dec 22, 2025", tags: ["E-commerce"] },
  { id: "13", firstName: "Nathan", lastName: "Phillips", email: "nathan@apexstrategy.com", phone: "+1 (555) 456-7890", company: "Apex Strategy", companyLogo: "AS", status: "Active", lastContacted: "Dec 18, 2025", tags: ["Consulting"] },
  { id: "14", firstName: "Olivia", lastName: "Martinez", email: "olivia@greenwave.eco", phone: "+1 (555) 567-8901", company: "GreenWave", companyLogo: "GW", status: "Inactive", lastContacted: "Oct 12, 2025", tags: ["CleanTech"] },
  { id: "15", firstName: "Daniel", lastName: "Kim", email: "daniel@fusionlabs.dev", phone: "+1 (555) 678-9012", company: "Fusion Labs", companyLogo: "FL", status: "Active", lastContacted: "Jan 2, 2026", tags: ["DevTools", "Seed"] },
];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lead: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Lost: "bg-red-50 text-red-600 border-red-200",
  Inactive: "bg-gray-100 text-gray-500 border-gray-200",
};

const logoColors = [
  "bg-indigo-100 text-indigo-700", "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function getLogoColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return logoColors[Math.abs(h) % logoColors.length];
}

export default function ContactsPage() {
  const [contacts] = useState<Contact[]>(mockContacts);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("lastName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const per = 10;

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const match = q === "" || `${c.firstName} ${c.lastName} ${c.email} ${c.company}`.toLowerCase().includes(q);
    const stat = statusFilter === "All" || c.status === statusFilter;
    return match && stat;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = (a as any)[sortField] || "";
    const bv = (b as any)[sortField] || "";
    return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.ceil(sorted.length / per);
  const rows = sorted.slice((page - 1) * per, page * per);

  const toggleSort = (f: string) => {
    if (sortField === f) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  };

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((c) => c.id)));
  };

  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const SI = ({ f }: { f: string }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp className={`w-3 h-3 -mb-1 ${sortField === f && sortDir === "asc" ? "text-indigo-600" : "text-gray-300"}`} />
      <ChevronDown className={`w-3 h-3 ${sortField === f && sortDir === "desc" ? "text-indigo-600" : "text-gray-300"}`} />
    </span>
  );

  return (
    <>
      <Header title="Contacts" subtitle={`${filtered.length} total contacts`} />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition">
                <SlidersHorizontal className="w-4 h-4" /> Show Filters
              </button>
              <div className="hidden md:flex items-center gap-1 ml-2">
                {["All", "Active", "Lead", "Lost", "Inactive"].map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${statusFilter === s ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-48 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Download className="w-4 h-4" /><span className="hidden sm:inline">Export</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Upload className="w-4 h-4" /><span className="hidden sm:inline">Import</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Contact</span>
              </button>
            </div>
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50 border-b border-indigo-100">
              <span className="text-sm font-medium text-indigo-700">{selected.size} selected</span>
              <button className="px-3 py-1 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md hover:bg-indigo-100 transition">
                <Mail className="w-3 h-3 inline mr-1" />Email
              </button>
              <button className="px-3 py-1 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md hover:bg-indigo-100 transition">Tag</button>
              <button className="px-3 py-1 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 transition">
                <Trash2 className="w-3 h-3 inline mr-1" />Delete
              </button>
              <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-indigo-500 hover:text-indigo-700">Clear</button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-12 px-5 py-3">
                    <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20" />
                  </th>
                  <th className="text-left px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort("lastName")}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Name <SI f="lastName" /></span>
                  </th>
                  <th className="text-left px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort("company")}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Company <SI f="company" /></span>
                  </th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span></th>
                  <th className="text-left px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</span></th>
                  <th className="text-left px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort("status")}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Status <SI f="status" /></span>
                  </th>
                  <th className="text-left px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort("lastContacted")}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Last Contacted <SI f="lastContacted" /></span>
                  </th>
                  <th className="w-24 px-3 py-3"><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((c) => (
                  <tr key={c.id} className={`group transition ${selected.has(c.id) ? "bg-indigo-50/50" : "hover:bg-gray-50/70"}`}>
                    <td className="px-5 py-3">
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-gray-600">{c.firstName[0]}{c.lastName[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition cursor-pointer">{c.firstName} {c.lastName}</p>
                          {c.tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {c.tags.slice(0, 2).map((t) => (
                                <span key={t} className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{t}</span>
                              ))}
                              {c.tags.length > 2 && <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">+{c.tags.length - 2}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${getLogoColor(c.company)}`}>
                          <span className="text-[10px] font-bold">{c.companyLogo}</span>
                        </div>
                        <span className="text-sm text-gray-700">{c.company}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-500">{c.email}</span></td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-500">{c.phone}</span></td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-500">{c.lastContacted}</span></td>
                    <td className="px-3 py-3">
                      <div className="relative flex items-center gap-0.5">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition opacity-0 group-hover:opacity-100"><Pencil className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition opacity-0 group-hover:opacity-100"><Eye className="w-3.5 h-3.5" /></button>
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setMenuId(menuId === c.id ? null : c.id); }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                          {menuId === c.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setMenuId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="w-3.5 h-3.5 text-gray-400" /> View</button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Pencil className="w-3.5 h-3.5 text-gray-400" /> Edit</button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Mail className="w-3.5 h-3.5 text-gray-400" /> Send Email</button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Phone className="w-3.5 h-3.5 text-gray-400" /> Call</button>
                                <div className="border-t border-gray-100 my-1" />
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">No contacts found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * per + 1}–{Math.min(page * per, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition ${page === p ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
