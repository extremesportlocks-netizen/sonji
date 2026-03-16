"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import { useModal } from "@/components/modals/modal-provider";
import {
  Search, Plus, Building2, Loader2, ChevronLeft, ChevronRight, Users, X,
  Globe, MapPin, DollarSign, TrendingUp, ExternalLink,
} from "lucide-react";

interface Company {
  id: string; name: string; domain: string; industry: string; revenue: string;
  employeeCount: number; status: string; contacts: number; deals: number; totalValue: number;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  prospect: "bg-blue-50 text-blue-700 border-blue-200",
  partner: "bg-violet-50 text-violet-700 border-violet-200",
  churned: "bg-red-50 text-red-600 border-red-200",
};

// ─── DEMO DATA ───

const INDUSTRY_COMPANIES: Record<string, Company[]> = {
  agency_consulting: [
    { id: "c1", name: "Brightview Hotels", domain: "brightviewhotels.com", industry: "Hospitality", revenue: "$12M", employeeCount: 85, status: "active", contacts: 4, deals: 2, totalValue: 102000 },
    { id: "c2", name: "Sterling Partners", domain: "sterlingpartners.com", industry: "Financial Services", revenue: "$28M", employeeCount: 120, status: "active", contacts: 3, deals: 1, totalValue: 120000 },
    { id: "c3", name: "Meridian Law Group", domain: "meridianlaw.com", industry: "Legal", revenue: "$8M", employeeCount: 42, status: "active", contacts: 2, deals: 1, totalValue: 15000 },
    { id: "c4", name: "Summit Athletics", domain: "summitathletics.com", industry: "Fitness & Sports", revenue: "$4M", employeeCount: 30, status: "active", contacts: 2, deals: 1, totalValue: 36000 },
    { id: "c5", name: "Coastal Real Estate", domain: "coastalre.com", industry: "Real Estate", revenue: "$22M", employeeCount: 55, status: "active", contacts: 3, deals: 1, totalValue: 72000 },
    { id: "c6", name: "Harbor Dental", domain: "harbordental.com", industry: "Healthcare", revenue: "$3M", employeeCount: 18, status: "active", contacts: 2, deals: 1, totalValue: 60000 },
    { id: "c7", name: "Apex Construction", domain: "apexconstruction.com", industry: "Construction", revenue: "$15M", employeeCount: 65, status: "prospect", contacts: 1, deals: 1, totalValue: 36000 },
    { id: "c8", name: "Nova Fitness", domain: "novafitness.com", industry: "Fitness", revenue: "$2M", employeeCount: 12, status: "churned", contacts: 1, deals: 1, totalValue: 5000 },
  ],
  health_wellness: [
    { id: "c1", name: "Southwest General Hospital", domain: "swgeneral.org", industry: "Hospital", revenue: "$180M", employeeCount: 2400, status: "partner", contacts: 12, deals: 0, totalValue: 0 },
    { id: "c2", name: "Wellness Corp Insurance", domain: "wellnesscorp.com", industry: "Insurance", revenue: "$45M", employeeCount: 200, status: "active", contacts: 3, deals: 0, totalValue: 0 },
    { id: "c3", name: "The Pharmacy Hub", domain: "pharmacyhub.com", industry: "Pharmacy", revenue: "$12M", employeeCount: 35, status: "partner", contacts: 2, deals: 0, totalValue: 0 },
    { id: "c4", name: "MedSupply Direct", domain: "medsupplydirect.com", industry: "Medical Supply", revenue: "$8M", employeeCount: 28, status: "active", contacts: 1, deals: 0, totalValue: 0 },
  ],
  home_services: [
    { id: "c1", name: "Eagle Property Management", domain: "eaglepm.com", industry: "Property Mgmt", revenue: "$6M", employeeCount: 22, status: "active", contacts: 8, deals: 5, totalValue: 45000 },
    { id: "c2", name: "Sunrise HOA", domain: "sunrisehoa.org", industry: "HOA", revenue: "$1.2M", employeeCount: 3, status: "active", contacts: 2, deals: 3, totalValue: 28000 },
    { id: "c3", name: "Gulf Coast Builders", domain: "gulfcoastbuilders.com", industry: "Construction", revenue: "$18M", employeeCount: 85, status: "partner", contacts: 4, deals: 2, totalValue: 62000 },
    { id: "c4", name: "Palm Bay Insurance", domain: "palmbayins.com", industry: "Insurance", revenue: "$4M", employeeCount: 15, status: "prospect", contacts: 1, deals: 0, totalValue: 0 },
  ],
  legal: [
    { id: "c1", name: "Harbor Construction LLC", domain: "harborconstruction.com", industry: "Construction", revenue: "$22M", employeeCount: 120, status: "active", contacts: 3, deals: 1, totalValue: 15000 },
    { id: "c2", name: "Apex Financial Group", domain: "apexfinancial.com", industry: "Financial Services", revenue: "$50M", employeeCount: 180, status: "active", contacts: 2, deals: 1, totalValue: 25000 },
    { id: "c3", name: "Meridian Insurance", domain: "meridianins.com", industry: "Insurance", revenue: "$35M", employeeCount: 90, status: "prospect", contacts: 1, deals: 0, totalValue: 0 },
  ],
  ecommerce: [
    { id: "c1", name: "DraftKings", domain: "draftkings.com", industry: "Sports Betting", revenue: "$3.7B", employeeCount: 6000, status: "partner", contacts: 0, deals: 0, totalValue: 0 },
    { id: "c2", name: "Telegram (ESL Channel)", domain: "t.me/eslsports", industry: "Social Media", revenue: "—", employeeCount: 0, status: "active", contacts: 0, deals: 0, totalValue: 0 },
  ],
};

function fmt(n: number) { return n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`; }

// ─── MAIN ───

export default function CompaniesPage() {
  const ic = useIndustry();
  const { openModal } = useModal();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const demoIndustry = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const isDemo = demoIndustry && demoIndustry !== "ecommerce";

    if (isDemo) {
      const key = demoIndustry || "agency_consulting";
      setCompanies(INDUSTRY_COMPANIES[key] || []);
      setLoading(false);
    } else {
      // Real data
      fetch("/api/companies?pageSize=50")
        .then(r => r.json())
        .then(json => { if (json.ok) setCompanies(json.data || []); })
        .catch(() => {
          // Fallback to ecommerce demo data
          setCompanies(INDUSTRY_COMPANIES.ecommerce || []);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const filtered = search
    ? companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.industry?.toLowerCase().includes(search.toLowerCase()))
    : companies;

  const totalValue = companies.reduce((s, c) => s + (c.totalValue || 0), 0);
  const totalContacts = companies.reduce((s, c) => s + (c.contacts || 0), 0);
  const companyLabel = "Companies";

  return (
    <>
      <Header title={companyLabel} />
      <div className="p-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Building2 className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-400 font-medium">Total {companyLabel}</span></div>
            <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-400 font-medium">Total Contacts</span></div>
            <p className="text-2xl font-bold text-gray-900">{totalContacts}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-400 font-medium">Active</span></div>
            <p className="text-2xl font-bold text-emerald-600">{companies.filter(c => c.status === "active").length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-violet-500" /><span className="text-xs text-gray-400 font-medium">Total Value</span></div>
            <p className="text-2xl font-bold text-gray-900">{fmt(totalValue)}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? "company" : companyLabel.toLowerCase()}</p>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder={`Search ${companyLabel.toLowerCase()}...`} value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-52 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <button onClick={() => openModal("company")} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Plus className="w-4 h-4" /> Add {"Company"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No {companyLabel.toLowerCase()} found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacts</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deals</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition cursor-pointer">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-indigo-600">{c.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          {c.domain && <p className="text-[10px] text-gray-400 flex items-center gap-1"><Globe className="w-2.5 h-2.5" />{c.domain}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5"><span className="text-sm text-gray-600">{c.industry || "—"}</span></td>
                    <td className="px-3 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusStyles[c.status?.toLowerCase()] || "bg-gray-100 text-gray-500 border-gray-200"}`}>{c.status}</span>
                    </td>
                    <td className="px-3 py-3.5 text-right"><span className="text-sm text-gray-700">{c.revenue || "—"}</span></td>
                    <td className="px-3 py-3.5 text-right"><span className="text-sm text-gray-600">{c.contacts || 0}</span></td>
                    <td className="px-3 py-3.5 text-right"><span className="text-sm text-gray-600">{c.deals || 0}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm font-bold text-gray-900">{c.totalValue > 0 ? fmt(c.totalValue) : "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
