"use client";

import { getDemoIndustry } from "@/lib/tenant-utils";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/dashboard/header";
import { useModal } from "@/components/modals/modal-provider";
import { useIndustry } from "@/lib/use-industry";
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
  Settings2,
  Check,
  Loader2,
  DollarSign,
  ShoppingCart,
  Calendar,
  Tag,
} from "lucide-react";

// ═══ TYPES ═══

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  source: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: string;
}

// ═══ COLUMN DEFINITIONS ═══

interface ColumnDef {
  key: string;
  label: string;
  width?: string;
  defaultOn: boolean;
  render: (c: Contact) => React.ReactNode;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lead: "bg-indigo-50 text-indigo-700 border-indigo-200",
  lost: "bg-red-50 text-red-600 border-red-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
};

function formatCurrency(n: number) {
  if (!n) return "$0";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

const logoColors = [
  "bg-indigo-100 text-indigo-700", "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700", "bg-orange-100 text-orange-700",
];

function getLogoColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return logoColors[Math.abs(h) % logoColors.length];
}

const ALL_COLUMNS: ColumnDef[] = [
  {
    key: "name", label: "Name", defaultOn: true,
    render: (c) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-gray-600">{c.firstName?.[0] || "?"}{c.lastName?.[0] || ""}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{c.firstName} {c.lastName}</p>
          {c.tags.length > 0 && (
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {c.tags.slice(0, 2).map((t) => (
                <span key={t} className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{t}</span>
              ))}
              {c.tags.length > 2 && <span className="text-[10px] text-gray-400">+{c.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "email", label: "Email", defaultOn: true,
    render: (c) => <span className="text-sm text-gray-500 truncate block">{c.email || "—"}</span>,
  },
  {
    key: "phone", label: "Phone", defaultOn: true,
    render: (c) => <span className="text-sm text-gray-500">{c.phone || "—"}</span>,
  },
  {
    key: "status", label: "Status", defaultOn: true,
    render: (c) => (
      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusStyles[c.status.toLowerCase()] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
        {c.status}
      </span>
    ),
  },
  {
    key: "ltv", label: "LTV", defaultOn: true,
    render: (c) => <span className="text-sm font-semibold text-gray-900">{formatCurrency(c.customFields?.ltv || 0)}</span>,
  },
  {
    key: "purchases", label: "Purchases", defaultOn: true,
    render: (c) => <span className="text-sm text-gray-700">{c.customFields?.purchaseCount || 0}</span>,
  },
  {
    key: "subscriptionStatus", label: "Subscription", defaultOn: true,
    render: (c) => {
      const ss = c.customFields?.subscriptionStatus || "never";
      const styles: Record<string, string> = {
        active: "bg-emerald-50 text-emerald-700 border-emerald-200",
        canceled: "bg-red-50 text-red-600 border-red-200",
        expired: "bg-amber-50 text-amber-600 border-amber-200",
        "one-time": "bg-blue-50 text-blue-600 border-blue-200",
        never: "bg-gray-50 text-gray-400 border-gray-200",
      };
      return (
        <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${styles[ss] || styles.never}`}>
          {ss === "one-time" ? "One-Time" : ss}
        </span>
      );
    },
  },
  {
    key: "plan", label: "Plan", defaultOn: false,
    render: (c) => {
      const plan = c.customFields?.subscriptionPlan;
      const amt = c.customFields?.subscriptionAmount;
      if (!plan && !amt) return <span className="text-xs text-gray-400">—</span>;
      return (
        <div>
          <span className="text-xs font-medium text-gray-700">{plan || "—"}</span>
          {amt && <span className="text-[10px] text-gray-400 ml-1">{formatCurrency(amt)}</span>}
        </div>
      );
    },
  },
  {
    key: "daysLeft", label: "Days Left", defaultOn: true,
    render: (c) => {
      const endDate = c.customFields?.manualActiveUntil || c.customFields?.subscriptionEnd;
      if (!endDate) return <span className="text-xs text-gray-400">—</span>;
      const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
      if (daysLeft <= 0) return <span className="text-xs font-bold text-red-600">Expired</span>;
      if (daysLeft <= 7) return <span className="text-xs font-bold text-red-600">{daysLeft}d</span>;
      if (daysLeft <= 30) return <span className="text-xs font-bold text-amber-600">{daysLeft}d</span>;
      return <span className="text-xs font-bold text-emerald-600">{daysLeft}d</span>;
    },
  },
  {
    key: "highestCharge", label: "Top Charge", defaultOn: false,
    render: (c) => <span className="text-sm font-medium text-gray-700">{c.customFields?.highestCharge ? formatCurrency(c.customFields.highestCharge) : "—"}</span>,
  },
  {
    key: "lastPurchase", label: "Last Purchase", defaultOn: false,
    render: (c) => <span className="text-xs text-gray-500">{formatDate(c.customFields?.lastPurchaseDate)}</span>,
  },
  {
    key: "avgOrder", label: "Avg Order", defaultOn: false,
    render: (c) => <span className="text-sm text-gray-600">{formatCurrency(c.customFields?.avgOrderValue || 0)}</span>,
  },
  {
    key: "company", label: "Company", defaultOn: false,
    render: (c) => c.company ? (
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${getLogoColor(c.company)}`}>
          <span className="text-[9px] font-bold">{c.company[0]}</span>
        </div>
        <span className="text-sm text-gray-700 truncate">{c.company}</span>
      </div>
    ) : <span className="text-sm text-gray-400">—</span>,
  },
  {
    key: "daysSince", label: "Days Since", defaultOn: false,
    render: (c) => {
      const d = c.customFields?.daysSinceLastPurchase;
      if (d === null || d === undefined) return <span className="text-xs text-gray-400">—</span>;
      return <span className={`text-xs font-medium ${d <= 30 ? "text-emerald-600" : d <= 90 ? "text-amber-600" : "text-red-500"}`}>{d}d</span>;
    },
  },
  {
    key: "source", label: "Source", defaultOn: false,
    render: (c) => <span className="text-xs text-gray-500 capitalize">{(c.source || "—").replace(/_/g, " ")}</span>,
  },
  {
    key: "created", label: "Created", defaultOn: false,
    render: (c) => <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span>,
  },
];

// ═══ COMPONENT ═══

export default function ContactsPage() {
  const { openModal } = useModal();
  const ic = useIndustry();

  // Data state
  const [contactsList, setContactsList] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(25);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Filter segments — each maps to API query params
  const hvLabel = ic?.highValueLabel || "High Value";
  type Segment = { key: string; label: string; params: Record<string, string> };
  const segments: Segment[] = [
    { key: "all", label: "All", params: {} },
    { key: "active_sub", label: ic ? `Active ${ic.contactLabelPlural}` : "Active Subscribers", params: { subStatus: "active" } },
    { key: "whales", label: `${hvLabel} ($500+)`, params: { minLtv: "500" } },
    { key: "lapsed", label: "Lapsed", params: { tag: "Lapsed" } },
    { key: "winback", label: "Win-Back", params: { tag: "Win-Back" } },
    { key: "inactive", label: "Inactive", params: { status: "inactive" } },
    { key: "high_freq", label: "High Frequency", params: { tag: "High Frequency" } },
  ];
  const [activeSegment, setActiveSegment] = useState("all");
  const currentSegment = segments.find((s) => s.key === activeSegment) || segments[0];
  const [search, setSearch] = useState("");

  // Column customization
  const [visibleCols, setVisibleCols] = useState<Set<string>>(() => new Set(ALL_COLUMNS.filter((c) => c.defaultOn).map((c) => c.key)));
  const [showColPicker, setShowColPicker] = useState(false);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuId, setMenuId] = useState<string | null>(null);
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(per),
        sortBy,
        sortOrder: sortDir,
      });
      if (search) params.set("q", search);
      // Apply segment filters
      for (const [k, v] of Object.entries(currentSegment.params)) {
        params.set(k, v);
      }

      // Check demo mode
      const demoIndustry = getDemoIndustry();

      if (demoIndustry) {
        // Try demo contacts first
        try {
          const res = await fetch(`/api/demo/contacts?industry=${demoIndustry}&page=${page}&pageSize=${per}`);
          const json = await res.json();
          if (json.ok && json.data?.length) {
            setContactsList(json.data);
            setTotal(json.meta?.total || json.data.length);
            return;
          }
        } catch {}
      }

      // Fall back to real API
      try {
        const res = await fetch(`/api/contacts?${params.toString()}`);
        const json = await res.json();
        if (json.ok) {
          setContactsList(json.data || []);
          setTotal(json.meta?.total || 0);
          return;
        }
      } catch {}

      // Last resort: demo ecommerce
      if (demoIndustry) {
        const res = await fetch(`/api/demo/contacts?industry=${demoIndustry}&page=${page}&pageSize=${per}`);
        const json = await res.json();
        if (json.ok) {
          setContactsList(json.data || []);
          setTotal(json.meta?.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [page, per, sortBy, sortDir, search, activeSegment]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const totalPages = Math.ceil(total / per);
  const columns = ALL_COLUMNS.filter((c) => visibleCols.has(c.key));

  const toggleSort = (key: string) => {
    if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("asc"); }
    setPage(1);
  };

  const toggleCol = (key: string) => {
    const next = new Set(visibleCols);
    next.has(key) ? next.delete(key) : next.add(key);
    setVisibleCols(next);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      fetchContacts();
      setMenuId(null);
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    } catch {}
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} contact${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    try {
      await Promise.all(Array.from(selected).map(id => fetch(`/api/contacts/${id}`, { method: "DELETE" })));
      setSelected(new Set());
      fetchContacts();
    } catch {}
  };

  return (
    <>
      <Header title={ic?.contactLabelPlural || "Contacts"} />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {segments.map((seg) => (
                <button key={seg.key}
                  onClick={() => { setActiveSegment(seg.key); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition whitespace-nowrap ${
                    activeSegment === seg.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {seg.label} {activeSegment === seg.key && total > 0 ? `(${total.toLocaleString()})` : ""}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder={`Search ${(ic?.contactLabelPlural || "contacts").toLowerCase()}...`} value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-52 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
                {search && (
                  <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Column Picker */}
              <div className="relative">
                <button onClick={() => setShowColPicker(!showColPicker)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <Settings2 className="w-3.5 h-3.5" /> Columns
                </button>
                {showColPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowColPicker(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase">Toggle Columns</p>
                      {ALL_COLUMNS.map((col) => (
                        <button key={col.key} onClick={() => toggleCol(col.key)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            visibleCols.has(col.key) ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
                          }`}>
                            {visibleCols.has(col.key) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {col.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button onClick={() => {
                const csv = ["First Name,Last Name,Email,Phone,Status,LTV,Purchases,Subscription", ...contactsList.map((c: any) =>
                  `"${c.firstName || ""}","${c.lastName || ""}","${c.email || ""}","${c.phone || ""}","${c.status || ""}",${c.customFields?.ltv || 0},${c.customFields?.purchaseCount || 0},"${c.customFields?.subscriptionStatus || ""}"`
                )].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "contacts-export.csv"; a.click(); URL.revokeObjectURL(url);
              }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Download className="w-3.5 h-3.5" /> Export
              </button>

              <button onClick={() => openModal("import")}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Upload className="w-3.5 h-3.5" /> Import CSV
              </button>

              <button onClick={() => openModal("contact")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Plus className="w-3.5 h-3.5" /> Create {ic?.contactLabel || "Contact"}
              </button>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
              <span className="text-xs font-semibold text-indigo-700">{selected.size} selected</span>
              <button onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              <button onClick={() => setSelected(new Set())}
                className="text-xs text-gray-500 hover:text-gray-700 ml-auto">
                Clear selection
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox"
                      checked={contactsList.length > 0 && selected.size === contactsList.length}
                      onChange={() => {
                        if (selected.size === contactsList.length) setSelected(new Set());
                        else setSelected(new Set(contactsList.map((c) => c.id)));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                  </th>
                  {columns.map((col) => (
                    <th key={col.key}
                      className="text-left px-3 py-3 cursor-pointer select-none"
                      onClick={() => toggleSort(col.key === "name" ? "lastName" : col.key === "ltv" ? "customFields" : col.key)}>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        {col.label}
                        {sortBy === col.key && (
                          sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="w-20 px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-5 py-16 text-center">
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : contactsList.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-5 py-16 text-center">
                      <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">
                        {(() => { try { const t = JSON.parse(sessionStorage.getItem("sonji-tenant") || "{}"); return t.industry === "health_wellness" ? "No patients yet" : t.industry === "agency_consulting" ? "No clients yet" : "No contacts found"; } catch { return "No contacts found"; } })()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(() => { try { const t = JSON.parse(sessionStorage.getItem("sonji-tenant") || "{}"); return t.industry === "health_wellness" ? "Your first checkout on clyr.health will sync here automatically" : "Connect Stripe to sync your customers, or import a CSV"; } catch { return "Try adjusting your search or filters"; } })()}
                      </p>
                    </td>
                  </tr>
                ) : (
                  contactsList.map((c) => (
                    <tr key={c.id} onClick={() => window.location.href = `/dashboard/contacts/${c.id}`}
                      className={`group transition cursor-pointer ${selected.has(c.id) ? "bg-indigo-50/50" : "hover:bg-gray-50/70"}`}>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(c.id)}
                          onChange={() => {
                            const n = new Set(selected);
                            n.has(c.id) ? n.delete(c.id) : n.add(c.id);
                            setSelected(n);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                      </td>
                      {columns.map((col) => (
                        <td key={col.key} className="px-3 py-3">{col.render(c)}</td>
                      ))}
                      <td className="px-3 py-3">
                        <div className="relative flex items-center gap-0.5">
                          <button onClick={(e) => { e.stopPropagation(); window.location.href = `/dashboard/contacts/${c.id}`; }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition opacity-0 group-hover:opacity-100"><Eye className="w-3.5 h-3.5" /></button>
                          <div className="relative">
                            <button onClick={(e) => { e.stopPropagation(); setMenuId(menuId === c.id ? null : c.id); }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                            {menuId === c.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                  <button onClick={() => { setMenuId(null); window.location.href = `/dashboard/contacts/${c.id}`; }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="w-3.5 h-3.5 text-gray-400" /> View</button>
                                  <button onClick={() => { setMenuId(null); openModal("email", { prefillTo: c.email, prefillSubject: `Following up — ${c.firstName}` }); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Mail className="w-3.5 h-3.5 text-gray-400" /> Email</button>
                                  <div className="border-t border-gray-100 my-1" />
                                  <button onClick={() => handleDelete(c.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">
                  Showing {((page - 1) * per + 1).toLocaleString()}–{Math.min(page * per, total).toLocaleString()} of {total.toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">Show</span>
                  <select value={per} onChange={(e) => { setPer(Number(e.target.value)); setPage(1); }}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    {[25, 50, 100, 250].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span className="text-xs text-gray-400">per page</span>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1}
                    className="px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-md disabled:opacity-30">First</button>
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {(() => {
                    const pages: (number | "...")[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (page > 3) pages.push("...");
                      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                      if (page < totalPages - 2) pages.push("...");
                      pages.push(totalPages);
                    }
                    return pages.map((p, i) =>
                      p === "..." ? (
                        <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">...</span>
                      ) : (
                        <button key={p} onClick={() => setPage(p as number)}
                          className={`w-8 h-8 text-xs font-medium rounded-lg transition ${page === p ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{p}</button>
                      )
                    );
                  })()}
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                    className="px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-md disabled:opacity-30">Last</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
