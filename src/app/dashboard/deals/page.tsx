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
} from "lucide-react";

// ────────────────────────────────────
// TYPES
// ────────────────────────────────────

interface Deal {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  contact: string;
  pipeline: string;
  amount: number;
  expectedClose: string;
  stage: string;
  creator: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

// ────────────────────────────────────
// PIPELINE STAGES
// ────────────────────────────────────

const stages: Stage[] = [
  { id: "lead", name: "Lead", color: "text-indigo-700", borderColor: "border-indigo-400", bgColor: "bg-indigo-50" },
  { id: "qualified", name: "Sales Qualified", color: "text-blue-700", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
  { id: "meeting", name: "Meeting Booked", color: "text-amber-700", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
  { id: "proposal", name: "Proposal Sent", color: "text-violet-700", borderColor: "border-violet-400", bgColor: "bg-violet-50" },
  { id: "won", name: "Closed Won", color: "text-emerald-700", borderColor: "border-emerald-400", bgColor: "bg-emerald-50" },
  { id: "lost", name: "Closed Lost", color: "text-red-600", borderColor: "border-red-400", bgColor: "bg-red-50" },
];

// ────────────────────────────────────
// MOCK DEALS
// ────────────────────────────────────

const mockDeals: Deal[] = [
  { id: "d1", title: "Epic Adventure Package", company: "Vertex Partners", companyLogo: "VP", contact: "Mason Thompson", pipeline: "Sales Pipeline", amount: 28000, expectedClose: "Dec 31, 2025", stage: "lead", creator: "Orlando" },
  { id: "d2", title: "Luxury Cruise Experience", company: "CloudPeak", companyLogo: "CP", contact: "Elijah Harris", pipeline: "Enterprise", amount: 50000, expectedClose: "Sep 20, 2026", stage: "lead", creator: "Orlando" },
  { id: "d3", title: "Premium Island Getaway", company: "DataFlow Solutions", companyLogo: "DF", contact: "Logan Mitchell", pipeline: "Adventure Seekers", amount: 35000, expectedClose: "Jan 15, 2026", stage: "qualified", creator: "Orlando" },
  { id: "d4", title: "Cloud Infrastructure Setup", company: "TechVentures Inc", companyLogo: "TV", contact: "Lucas Anderson", pipeline: "Tech Pipeline", amount: 85000, expectedClose: "Feb 20, 2026", stage: "qualified", creator: "Orlando" },
  { id: "d5", title: "Exclusive Safari Tour", company: "Bright Dynamics", companyLogo: "BD", contact: "Aiden Parker", pipeline: "Vacation Ventures", amount: 45000, expectedClose: "Mar 10, 2026", stage: "meeting", creator: "Orlando" },
  { id: "d6", title: "Urban Exploration Tour", company: "NexGen AI", companyLogo: "NA", contact: "Caleb Reed", pipeline: "Cultural Connect", amount: 15000, expectedClose: "Feb 28, 2026", stage: "meeting", creator: "Orlando" },
  { id: "d7", title: "Security Audit & Implementation", company: "Pulse Media", companyLogo: "PM", contact: "Benjamin Scott", pipeline: "Sales Pipeline", amount: 35000, expectedClose: "Feb 15, 2026", stage: "proposal", creator: "Orlando" },
  { id: "d8", title: "Annual Software License", company: "IronForge Dev", companyLogo: "IF", contact: "William Young", pipeline: "Tech Pipeline", amount: 45000, expectedClose: "Mar 30, 2026", stage: "proposal", creator: "Orlando" },
  { id: "d9", title: "Enterprise Platform Migration", company: "Skyline Group", companyLogo: "SG", contact: "Joshua Murphy", pipeline: "Enterprise", amount: 120000, expectedClose: "Jan 10, 2026", stage: "won", creator: "Orlando" },
  { id: "d10", title: "Training & Support Contract", company: "Quantum Leap", companyLogo: "QL", contact: "Sarah Chen", pipeline: "Sales Pipeline", amount: 28000, expectedClose: "Feb 15, 2026", stage: "won", creator: "Orlando" },
  { id: "d11", title: "Family Fun Package", company: "Swift Commerce", companyLogo: "SC", contact: "Emily Rodriguez", pipeline: "Joyful Journeys", amount: 12000, expectedClose: "Oct 30, 2026", stage: "lost", creator: "Orlando" },
  { id: "d12", title: "Mountain Adventure Pack", company: "Halo Collar", companyLogo: "HC", contact: "Jackson Brooks", pipeline: "Adventure Awaits", amount: 30000, expectedClose: "May 25, 2026", stage: "lost", creator: "Orlando" },
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

// ────────────────────────────────────
// DEAL CARD
// ────────────────────────────────────

function DealCard({ deal, onDragStart, onDragEnd }: { deal: Deal; onDragStart: (e: React.DragEvent, dealId: string) => void; onDragEnd: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onDragEnd={onDragEnd}
      className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition cursor-grab active:cursor-grabbing group"
    >
      {/* Title + Menu */}
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
                <button className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left">Delete</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Company */}
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-3.5 h-3.5 text-gray-400" />
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded flex items-center justify-center ${getColor(deal.company)}`}>
            <span className="text-[8px] font-bold">{deal.companyLogo}</span>
          </div>
          <span className="text-xs text-gray-600">{deal.company}</span>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-2 mb-2">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500">{deal.creator}</span>
      </div>

      {/* Pipeline */}
      <div className="text-xs text-gray-400 mb-3">
        Pipeline: <span className="text-gray-600">{deal.pipeline}</span>
      </div>

      {/* Amount + Close Date */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.amount)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">{deal.expectedClose}</span>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────
// DEALS PAGE
// ────────────────────────────────────

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"kanban" | "list" | "grid">("kanban");
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Filter by search
  const filtered = deals.filter((d) => {
    if (search === "") return true;
    return `${d.title} ${d.company} ${d.contact}`.toLowerCase().includes(search.toLowerCase());
  });

  // Group by stage
  const dealsByStage: Record<string, Deal[]> = {};
  stages.forEach((s) => { dealsByStage[s.id] = []; });
  filtered.forEach((d) => { if (dealsByStage[d.stage]) dealsByStage[d.stage].push(d); });

  // Total pipeline value
  const totalValue = filtered.reduce((sum, d) => sum + d.amount, 0);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggingId(dealId);
    e.dataTransfer.setData("text/plain", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the column, not entering a child
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData("text/plain") || draggingId;
    if (!dealId) return;

    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage: stageId } : d
      )
    );
    setDraggingId(null);
  };

  return (
    <>
      <Header title="Deals" subtitle={`${filtered.length} deals · ${formatCurrency(totalValue)} total pipeline`} />

      <div className="p-6">
        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition ${
                  showFilters ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>

              {/* View toggles */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-2">
                <button
                  onClick={() => setView("kanban")}
                  className={`p-2 transition ${view === "kanban" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
                  title="Kanban"
                >
                  <Columns3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 transition border-l border-gray-200 ${view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
                  title="List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 transition border-l border-gray-200 ${view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
                  title="Grid"
                >
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
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Upload className="w-4 h-4" /><span className="hidden sm:inline">Import CSV</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Create Deal</span>
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Company</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>All Companies</option>
                  </select>
                </div>
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
              </div>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = dealsByStage[stage.id] || [];
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);
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
                <div className={`flex items-center justify-between mb-3 px-1`}>
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
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`space-y-3 min-h-[100px] rounded-xl p-2 transition ${
                    isDragOver ? "bg-indigo-50/50 border-2 border-dashed border-indigo-300" : "bg-gray-50/50"
                  }`}
                >
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onDragStart={handleDragStart} onDragEnd={() => { setDragOverStage(null); setDraggingId(null); }} />
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
