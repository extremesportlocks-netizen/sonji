"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/dashboard/header";
import { Search, Plus, Building2, Loader2, ChevronLeft, ChevronRight, Users, X } from "lucide-react";
import { useModal } from "@/components/modals/modal-provider";

interface Company {
  id: string; name: string; domain: string; industry: string; revenue: string;
  employeeCount: number; status: string; createdAt: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  prospect: "bg-blue-50 text-blue-700 border-blue-200",
  partner: "bg-violet-50 text-violet-700 border-violet-200",
  churned: "bg-red-50 text-red-600 border-red-200",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { openModal } = useModal();
  const per = 25;

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(per) });
      if (search) params.set("q", search);
      const res = await fetch(`/api/companies?${params}`);
      const json = await res.json();
      if (json.ok) { setCompanies(json.data || []); setTotal(json.meta?.total || 0); }
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);
  const totalPages = Math.ceil(total / per);

  return (
    <>
      <Header title="Companies" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">{total} {total === 1 ? "company" : "companies"}</p>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search companies..." value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-52 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <button onClick={() => openModal("company")} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Plus className="w-4 h-4" /> Create Company
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Plus className="w-3.5 h-3.5" /> Create Account
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
          ) : companies.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No companies yet</p>
              <p className="text-xs text-gray-400 mt-1">Companies are created automatically when you add a company name to a contact, or you can create one manually.</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Industry</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Employees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {companies.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        {c.domain && <p className="text-xs text-gray-400">{c.domain}</p>}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">{c.industry || "—"}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusStyles[c.status?.toLowerCase()] || "bg-gray-100 text-gray-500 border-gray-200"}`}>{c.status || "—"}</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">{c.employeeCount || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-1">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
