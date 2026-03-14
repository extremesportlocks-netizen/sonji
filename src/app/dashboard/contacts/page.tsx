"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useCRM } from "@/lib/crm-store";
import { useModal } from "@/components/modals/modal-provider";
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

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lead: "bg-indigo-50 text-indigo-700 border-indigo-200",
  lost: "bg-red-50 text-red-600 border-red-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
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

function getInitials(company: string) {
  return company.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function ContactsPage() {
  const { contacts, deleteContact, refresh } = useCRM();
  const { openModal } = useModal();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState("All");

  // Re-fetch contacts on mount (picks up imports from Settings/Stripe)
  useEffect(() => { refresh(); }, []);
  const [sortField, setSortField] = useState("lastName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const per = 10;

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const match = q === "" || `${c.firstName} ${c.lastName} ${c.email} ${c.company}`.toLowerCase().includes(q);
    const stat = statusFilter === "All" || c.status.toLowerCase() === statusFilter.toLowerCase();
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

  const statuses = ["All", "Active", "Lead", "Inactive", "Lost"];
  const statusCounts: Record<string, number> = { All: contacts.length };
  contacts.forEach((c) => {
    const key = c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase();
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  return (
    <>
      <Header title="Contacts" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                    statusFilter === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s} {statusCounts[s] !== undefined ? `(${statusCounts[s]})` : ""}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-52 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => openModal("contact")}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Contact
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="w-12 px-5 py-3">
                    <input type="checkbox" checked={rows.length > 0 && selected.size === rows.length} onChange={toggleAll}
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
                  <th className="text-left px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort("score")}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Score <SI f="score" /></span>
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
                          <span className="text-[10px] font-bold">{getInitials(c.company)}</span>
                        </div>
                        <span className="text-sm text-gray-700">{c.company}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-500">{c.email}</span></td>
                    <td className="px-3 py-3"><span className="text-sm text-gray-500">{c.phone}</span></td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[c.status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${c.score >= 70 ? "bg-emerald-500" : c.score >= 40 ? "bg-amber-400" : "bg-gray-300"}`} style={{ width: `${c.score}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-6">{c.score}</span>
                      </div>
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
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Mail className="w-3.5 h-3.5 text-gray-400" /> Send Email</button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Phone className="w-3.5 h-3.5 text-gray-400" /> Call</button>
                                <div className="border-t border-gray-100 my-1" />
                                <button onClick={() => { deleteContact(c.id); setMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
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
