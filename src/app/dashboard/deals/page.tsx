"use client";

import { useState, useMemo } from "react";
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
  LayoutGrid,
  List,
  Columns3,
  GripVertical,
  Building2,
  User,
  Calendar,
  DollarSign,
  X,
  ChevronDown,
  Trash2,
} from "lucide-react";

// ────────────────────────────────────
// PIPELINE STAGES
// ────────────────────────────────────

interface Stage {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const stages: Stage[] = [
  { id: "Lead", name: "Lead", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
  { id: "Sales Qualified", name: "Sales Qualified", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
  { id: "Meeting Booked", name: "Meeting Booked", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
  { id: "Proposal Sent", name: "Proposal Sent", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
  { id: "Negotiation", name: "Negotiation", color: "text-orange-700", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
  { id: "Closed Won", name: "Closed Won", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
  { id: "Closed Lost", name: "Closed Lost", color: "text-red-600", borderColor: "border-red-400", bgColor: "bg-red-50" },
];

// ────────────────────────────────────
// HELPERS
// ────────────────────────────────────

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

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function getCompanyInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ────────────────────────────────────
// DEAL CARD
// ────────────────────────────────────

function DealCard({ deal, onDragStart, onDragEnd, onDelete }: {
  deal: { id: string; title: string; value: number; stage: string; pipeline: string; contactName: string; assignedTo: string; closeDate: string; notes: string };
  onDragStart: (e: React.DragEvent, dealId: string) => void;
  onDragEnd: () => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const company = deal.contactName; // Using contactName as display

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onDragEnd={onDragEnd}
      className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
          <h4 className="text-sm font-semibold text-gray-900 leading-snug">{deal.title}</h4>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <button className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">Edit</button>
                <button className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">View Details</button>
                <button className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">Add Note</button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { onDelete(deal.id); setMenuOpen(false); }} className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="flex items-center gap-2 mb-2">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-600">{deal.contactName}</span>
      </div>

      {/* Pipeline */}
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500">{deal.pipeline}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm font-bold text-gray-900">{formatCurrency(deal.value)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">{deal.closeDate}</span>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────

export default function DealsPage() {
  const { deals, moveDeal, deleteDeal, stats } = useCRM();
  const { openModal } = useModal();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "list" | "grid">("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const filtered = deals.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.contactName.toLowerCase().includes(q);
  });

  const dealsByStage = useMemo(() => {
    const grouped: Record<string, typeof filtered> = {};
    stages.forEach((s) => { grouped[s.id] = []; });
    filtered.forEach((d) => {
      if (grouped[d.stage]) grouped[d.stage].push(d);
      else {
        // If stage doesn't match exactly, try to find closest
        const match = stages.find(s => s.id.toLowerCase() === d.stage.toLowerCase());
        if (match) grouped[match.id].push(d);
        else if (grouped["Lead"]) grouped["Lead"].push(d);
      }
    });
    return grouped;
  }, [filtered]);

  const totalValue = filtered.reduce((s, d) => s + d.value, 0);

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggingId(dealId);
    e.dataTransfer.setData("text/plain", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => setDragOverStage(null);

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain");
    if (dealId) {
      moveDeal(dealId, stageId);
    }
    setDragOverStage(null);
    setDraggingId(null);
  };

  return (
    <>
      <Header title="Deals" />
      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{filtered.length} Deals</h2>
                <p className="text-xs text-gray-400">{formatCurrency(totalValue)} total pipeline</p>
              </div>
              <div className="w-px h-8 bg-gray-200 mx-2" />
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition ${showFilters ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                <button onClick={() => setView("kanban")} className={`p-2 transition ${view === "kanban" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`} title="Kanban">
                  <Columns3 className="w-4 h-4" />
                </button>
                <button onClick={() => setView("list")} className={`p-2 transition border-l border-gray-200 ${view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`} title="List">
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => setView("grid")} className={`p-2 transition border-l border-gray-200 ${view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`} title="Grid">
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition"
                />
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
              <button
                onClick={() => openModal("deal")}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
              >
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Create Deal</span>
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Pipeline</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>All Pipelines</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Deal Amount</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>Any Amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Close Date</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>Any Date</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Assigned To</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>Anyone</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = dealsByStage[stage.id] || [];
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);
            const isDragOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-[300px]"
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${stage.bgColor} ${stage.color} ${stage.borderColor}`}>
                      {stage.name}
                      <span className={`ml-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stage.bgColor} ${stage.color}`}>
                        {stageDeals.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stage Total */}
                <div className="text-xs text-gray-400 mb-3 px-1">
                  {formatCurrency(stageTotal)} · {stageDeals.length} deal{stageDeals.length !== 1 ? "s" : ""}
                </div>

                {/* Cards */}
                <div
                  className={`space-y-3 min-h-[100px] rounded-xl p-2 transition ${
                    isDragOver ? "bg-indigo-50/50 border-2 border-dashed border-indigo-300" : "bg-gray-50/50"
                  }`}
                >
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onDragStart={handleDragStart} onDragEnd={() => { setDragOverStage(null); setDraggingId(null); }} onDelete={deleteDeal} />
                  ))}

                  {stageDeals.length === 0 && !isDragOver && (
                    <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                      No deals in this stage
                    </div>
                  )}

                  {isDragOver && stageDeals.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-indigo-500 font-medium">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
