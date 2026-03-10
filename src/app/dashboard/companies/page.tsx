"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Search,
  SlidersHorizontal,
  Download,
  Upload,
  Plus,
  Pencil,
  Eye,
  Trash2,
  MoreHorizontal,
  Building2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Workflow,
  X,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo: string;
  revenue: string;
  status: "Partner" | "Prospect" | "Customer" | "Churned";
  employees: string;
  industry: string[];
  owner: string;
  website: string;
}

const mockCompanies: Company[] = [
  { id: "1", name: "Vertex Partners", logo: "VP", revenue: "$52.0M", status: "Partner", employees: "420", industry: ["Consulting", "Management"], owner: "Orlando", website: "vertexpartners.com" },
  { id: "2", name: "DataFlow Solutions", logo: "DF", revenue: "$24.0M", status: "Prospect", employees: "163", industry: ["Data Platform", "Analytics"], owner: "Orlando", website: "dataflow.io" },
  { id: "3", name: "TechVentures Inc", logo: "TV", revenue: "$3.0M", status: "Prospect", employees: "6,400", industry: ["Collaboration", "SaaS"], owner: "Orlando", website: "techventures.com" },
  { id: "4", name: "Halo Collar", logo: "HC", revenue: "$50.0M", status: "Partner", employees: "20,452", industry: ["Pet Tech", "IoT"], owner: "Orlando", website: "halocollar.com" },
  { id: "5", name: "Bright Dynamics", logo: "BD", revenue: "$13.0M", status: "Customer", employees: "160,000", industry: ["Creator Economy"], owner: "Orlando", website: "brightdynamics.com" },
  { id: "6", name: "NexGen AI", logo: "NA", revenue: "$12.0B", status: "Customer", employees: "302,000", industry: ["Software", "Technology"], owner: "Orlando", website: "nexgenai.com" },
  { id: "7", name: "CloudPeak", logo: "CP", revenue: "$17.0M", status: "Prospect", employees: "239,000", industry: ["Social Media", "Cloud"], owner: "Orlando", website: "cloudpeak.io" },
  { id: "8", name: "Pulse Media", logo: "PM", revenue: "$12.0M", status: "Customer", employees: "65,302", industry: ["Community", "Media"], owner: "Orlando", website: "pulsemedia.co" },
  { id: "9", name: "IronForge Dev", logo: "IF", revenue: "$20.0M", status: "Partner", employees: "461,000", industry: ["Location Technology"], owner: "Orlando", website: "ironforgedev.com" },
  { id: "10", name: "Skyline Group", logo: "SG", revenue: "$7.0M", status: "Prospect", employees: "20,452", industry: ["Video", "Messaging"], owner: "Orlando", website: "skylinegroup.com" },
  { id: "11", name: "Quantum Leap", logo: "QL", revenue: "$56.0M", status: "Partner", employees: "45,430", industry: ["Entertainment", "AI"], owner: "Orlando", website: "quantumleap.io" },
  { id: "12", name: "Swift Commerce", logo: "SC", revenue: "$18.0M", status: "Partner", employees: "452", industry: ["Professional Networking"], owner: "Orlando", website: "swiftcommerce.co" },
  { id: "13", name: "Apex Strategy", logo: "AS", revenue: "$15.0M", status: "Partner", employees: "652", industry: ["Productivity", "SaaS"], owner: "Orlando", website: "apexstrategy.com" },
  { id: "14", name: "GreenWave", logo: "GW", revenue: "$12.0M", status: "Churned", employees: "45,452", industry: ["CleanTech", "Energy"], owner: "Orlando", website: "greenwave.eco" },
  { id: "15", name: "Fusion Labs", logo: "FL", revenue: "$8.5M", status: "Customer", employees: "89", industry: ["DevTools", "Open Source"], owner: "Orlando", website: "fusionlabs.dev" },
];

const statusStyles: Record<string, string> = {
  Partner: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Prospect: "bg-amber-50 text-amber-700 border-amber-200",
  Customer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Churned: "bg-red-50 text-red-600 border-red-200",
};

const logoColors = [
  "bg-indigo-100 text-indigo-700", "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function getColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return logoColors[Math.abs(h) % logoColors.length];
}

export default function CompaniesPage() {
  const [companies] = useState<Company[]>(mockCompanies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const per = 10;

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    const match = q === "" || `${c.name} ${c.industry.join(" ")} ${c.website}`.toLowerCase().includes(q);
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
      <Header title="Companies" subtitle={`${filtered.length} companies`} />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition">
                <SlidersHorizontal className="w-4 h-4" /> Show Filters
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition">
                <Workflow className="w-4 h-4" /> Create Workflow <ChevronDown className="w-3 h-3" />
              </button>
              <div className="hidden md:flex items-center gap-1 ml-2">
                {["All", "Partner", "Prospect", "Customer", "Churned"].map((s) => (
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
                {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Upload className="w-4 h-4" /><span className="hidden sm:inline">Import</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Create Account</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-12 px-5 py-3">
                    <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20" />
                  </th>
                  <th className="text-left px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Name <SI f="name" /></span>
                  </th>
                  <th className="text-left px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort("revenue")}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Revenue <SI f="revenue" /></span>
                  </th>
                  <th className="text-left px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort("status")}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Status <SI f="status" /></span>
                  </th>
                  <th className="text-left px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort("employees")}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Employees <SI f="employees" /></span>
                  </th>
                  <th className="text-left px-3 py-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</span>
                  </th>
                  <th className="text-left px-3 py-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</span>
                  </th>
                  <th className="w-24 px-3 py-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</span>
                  </th>
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
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getColor(c.name)}`}>
                          <span className="text-xs font-bold">{c.logo}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition cursor-pointer">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.website}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900">{c.revenue}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-gray-700">{c.employees}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.industry.slice(0, 2).map((ind) => (
                          <span key={ind} className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{ind}</span>
                        ))}
                        {c.industry.length > 2 && (
                          <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">+{c.industry.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-gray-500">{c.owner}</span>
                    </td>
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
                      <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">No companies found</p>
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
              <p className="text-sm text-gray-500">Showing {(page - 1) * per + 1}–{Math.min(page * per, sorted.length)} of {sorted.length}</p>
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
