"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/lib/sidebar-context";
import {
  LayoutDashboard, Building2, Users, Handshake, CheckSquare, Calendar,
  BarChart3, Workflow, Activity, FileText, Settings, ChevronDown, Search,
  Plus, Star, MessageSquare, ChevronsLeft, ChevronsRight, ClipboardList,
  DollarSign, Send, Puzzle, GripVertical, X,
} from "lucide-react";

const DEMO_NAMES: Record<string,{ name: string; initial: string }> = {
  health_wellness: { name: "Glow Med Spa", initial: "G" },
  fitness_gym: { name: "Iron Republic", initial: "I" },
  beauty_salon: { name: "Luxe Beauty", initial: "L" },
  agency_consulting: { name: "Power Marketing", initial: "P" },
  real_estate: { name: "Summit Realty", initial: "S" },
  home_services: { name: "Apex Roofing", initial: "A" },
  legal: { name: "Sterling Law", initial: "S" },
  coaching_education: { name: "Elevate Coaching", initial: "E" },
  restaurant_food: { name: "The Copper Table", initial: "T" },
  automotive: { name: "Precision Auto", initial: "P" },
  nonprofit: { name: "Harbor Foundation", initial: "H" },
  ecommerce: { name: "ESL Sports", initial: "E" },
};

// Industry-specific sidebar label overrides
const INDUSTRY_NAV_LABELS: Record<string, Record<string, string>> = {
  health_wellness: { contacts: "Patients", deals: "Treatments", companies: "Providers", invoices: "Billing" },
  fitness_gym: { contacts: "Members", deals: "Memberships", companies: "Locations" },
  beauty_salon: { contacts: "Clients", deals: "Appointments", invoices: "Billing" },
  agency_consulting: { contacts: "Clients", deals: "Projects", companies: "Accounts", invoices: "Billing" },
  real_estate: { contacts: "Leads", deals: "Transactions", companies: "Brokerages" },
  home_services: { contacts: "Customers", deals: "Jobs", companies: "Properties" },
  legal: { contacts: "Clients", deals: "Cases", companies: "Firms" },
  coaching_education: { contacts: "Students", deals: "Enrollments", invoices: "Payments" },
  restaurant_food: { contacts: "Customers", deals: "Orders", invoices: "Checks" },
  automotive: { contacts: "Customers", deals: "Work Orders", companies: "Fleets" },
  nonprofit: { contacts: "Supporters", deals: "Campaigns", companies: "Partners", invoices: "Donations" },
};

// ────────────────────────────────────
// NAV CONFIG
// ────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  group: string;
}

const allNavItems: NavItem[] = [
  // Core
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "core" },
  { id: "companies", label: "Companies", href: "/dashboard/companies", icon: Building2, group: "core" },
  { id: "contacts", label: "Contacts", href: "/dashboard/contacts", icon: Users, group: "core" },
  { id: "deals", label: "Deals", href: "/dashboard/deals", icon: Handshake, group: "core" },
  { id: "tasks", label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, group: "core" },
  { id: "meetings", label: "Meetings", href: "/dashboard/meetings", icon: Calendar, group: "core" },
  { id: "messages", label: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: 3, group: "core" },
  { id: "campaigns", label: "Campaigns", href: "/dashboard/campaigns", icon: Send, group: "core" },
  { id: "forms", label: "Forms", href: "/dashboard/forms", icon: ClipboardList, group: "core" },
  { id: "invoices", label: "Invoices", href: "/dashboard/invoices", icon: DollarSign, group: "core" },
  // Insight & Control
  { id: "activities", label: "Activities", href: "/dashboard/activities", icon: Activity, group: "insight" },
  { id: "reports", label: "Reports", href: "/dashboard/reports", icon: FileText, group: "insight" },
  { id: "analytics", label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, group: "insight" },
  { id: "workflows", label: "Workflows", href: "/dashboard/workflows", icon: Workflow, group: "insight" },
  // System
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings, group: "system" },
  { id: "integrations", label: "Integrations", href: "/dashboard/settings?tab=integrations", icon: Puzzle, group: "system" },
];

const defaultOrder = allNavItems.map((i) => i.id);

function loadSidebarState() {
  if (typeof window === "undefined") return { order: defaultOrder, favorites: [] as string[] };
  try {
    const saved = localStorage.getItem("sonji-sidebar");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge in any new items that weren't in saved order
      const savedOrder = parsed.order || defaultOrder;
      const savedSet = new Set(savedOrder);
      const merged = [...savedOrder, ...defaultOrder.filter((id) => !savedSet.has(id))];
      return { order: merged, favorites: parsed.favorites || [] };
    }
  } catch {}
  return { order: defaultOrder, favorites: [] as string[] };
}

function saveSidebarState(order: string[], favorites: string[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("sonji-sidebar", JSON.stringify({ order, favorites })); } catch {}
}

// ────────────────────────────────────
// SIDEBAR COMPONENT
// ────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useSidebar();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [order, setOrder] = useState<string[]>(defaultOrder);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [demoCompany, setDemoCompany] = useState<{ name: string; initial: string } | null>(null);
  const [demoKey, setDemoKey] = useState<string | null>(null);

  // Listen for demo mode changes
  useEffect(() => {
    const update = () => {
      const key = localStorage.getItem("sonji-demo-industry");
      setDemoCompany(key && DEMO_NAMES[key] ? DEMO_NAMES[key] : null);
      setDemoKey(key && key !== "ecommerce" ? key : null);
    };
    update();
    window.addEventListener("sonji-demo-change", update);
    return () => window.removeEventListener("sonji-demo-change", update);
  }, []);

  // Get label for a nav item, with industry override
  const getLabel = (item: NavItem) => {
    if (demoKey && INDUSTRY_NAV_LABELS[demoKey]?.[item.id]) {
      return INDUSTRY_NAV_LABELS[demoKey][item.id];
    }
    return item.label;
  };

  // Load saved state on mount
  useEffect(() => {
    const saved = loadSidebarState();
    setOrder(saved.order);
    setFavorites(saved.favorites);
  }, []);

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
    if (href.includes("?")) return pathname.startsWith(href.split("?")[0]) && href.includes("integrations") && pathname.includes("settings");
    return pathname.startsWith(href);
  };

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    saveSidebarState(order, next);
  };

  // Drag and drop reorder within a group
  const handleDragStart = (id: string) => setDragId(id);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const dragItem = allNavItems.find((i) => i.id === dragId);
    const targetItem = allNavItems.find((i) => i.id === targetId);
    if (!dragItem || !targetItem || dragItem.group !== targetItem.group) return;

    const newOrder = [...order];
    const dragIdx = newOrder.indexOf(dragId);
    const targetIdx = newOrder.indexOf(targetId);
    newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, dragId);
    setOrder(newOrder);
    saveSidebarState(newOrder, favorites);
  };

  const handleDragEnd = () => setDragId(null);

  // Get ordered items for a group
  const getGroupItems = (group: string) => {
    return order
      .map((id) => allNavItems.find((i) => i.id === id))
      .filter((i): i is NavItem => !!i && i.group === group);
  };

  const favoriteItems = favorites
    .map((id) => allNavItems.find((i) => i.id === id))
    .filter((i): i is NavItem => !!i);

  const groups = [
    { key: "core", label: "", collapsible: false },
    { key: "insight", label: "Insight & Control", collapsible: true },
    { key: "system", label: "System", collapsible: true },
  ];

  const renderNavItem = (item: NavItem, draggable = false) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const isFav = favorites.includes(item.id);

    return (
      <li key={item.id}
        draggable={draggable && editMode}
        onDragStart={() => handleDragStart(item.id)}
        onDragOver={(e) => handleDragOver(e, item.id)}
        onDragEnd={handleDragEnd}
        className={`${dragId === item.id ? "opacity-40" : ""}`}
      >
        <div className="flex items-center group">
          {editMode && !collapsed && draggable && (
            <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab flex-shrink-0 mr-0.5 hover:text-gray-500" />
          )}
          <div onClick={() => router.push(item.href)}
            className={`
              flex items-center gap-3 rounded-lg text-sm font-medium transition-all flex-1 cursor-pointer
              ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"}
              ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
            `}
            title={collapsed ? getLabel(item) : undefined}
          >
            <Icon className={`flex-shrink-0 ${active ? "text-indigo-600" : "text-gray-400"}`} size={20} strokeWidth={active ? 2 : 1.5} />
            {!collapsed && (
              <>
                <span className="flex-1">{getLabel(item)}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">{item.badge}</span>
                )}
              </>
            )}
          </div>
          {!collapsed && !editMode && (
            <button onClick={(e) => { e.preventDefault(); toggleFavorite(item.id); }}
              className={`p-1 rounded transition flex-shrink-0 ${isFav ? "text-amber-400 hover:text-amber-500" : "text-transparent group-hover:text-gray-300 hover:!text-amber-400"}`}>
              <Star className="w-3.5 h-3.5" fill={isFav ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <aside data-tour="sidebar"
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-white border-r border-gray-100 transition-all duration-200 ease-in-out ${collapsed ? "w-[68px]" : "w-[260px]"}`}>

      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-gray-100 ${collapsed ? "justify-center px-2" : "px-5"}`}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{demoCompany?.initial || "S"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{demoCompany?.initial || "S"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{demoCompany?.name || "Sonji"}</p>
              <p className="text-xs text-gray-400 truncate">{demoCompany ? "Demo Workspace" : "My Workspace"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-3">
          <button onClick={() => document.dispatchEvent(new CustomEvent("sonji:open-command-palette"))}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <Search className="w-4 h-4" />
            <span>Search</span>
            <kbd className="ml-auto text-[10px] font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-400">⌘K</kbd>
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-3 py-3 flex justify-center">
          <button onClick={() => document.dispatchEvent(new CustomEvent("sonji:open-command-palette"))}
            className="w-10 h-10 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => {
          const items = getGroupItems(group.key);
          if (items.length === 0) return null;

          return (
            <div key={group.key} className={group.label ? "mt-6" : "mt-1"}>
              {group.label && !collapsed && (
                <button onClick={() => group.collapsible && toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 mb-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{group.label}</span>
                  {group.collapsible && (
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${collapsedGroups[group.label] ? "-rotate-90" : ""}`} />
                  )}
                </button>
              )}
              {!collapsedGroups[group.label] && (
                <ul className="space-y-0.5">
                  {items.map((item) => renderNavItem(item, true))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Favorites */}
      {!collapsed && favoriteItems.length > 0 && (
        <div className="px-3 pb-2 border-t border-gray-100 pt-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Favorites</span>
          </div>
          <ul className="space-y-0.5">
            {favoriteItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={`fav-${item.id}`}>
                  <div className="flex items-center group">
                    <div onClick={() => router.push(item.href)}
                      className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all flex-1 px-3 py-1.5 cursor-pointer ${
                        active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
                      }`}>
                      <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" />
                      <span className="flex-1 text-xs">{getLabel(item)}</span>
                    </div>
                    <button onClick={() => toggleFavorite(item.id)}
                      className="p-1 text-transparent group-hover:text-gray-300 hover:!text-red-400 rounded transition">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!collapsed && favoriteItems.length === 0 && (
        <div className="px-3 pb-2 border-t border-gray-100 pt-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Favorites</span>
          </div>
          <div className="px-3 py-1.5">
            <p className="text-xs text-gray-400">Hover any page and click ★ to pin</p>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="border-t border-gray-100 px-3 py-2 flex items-center gap-1">
        {!collapsed && (
          <button onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition flex-1 ${
              editMode ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}>
            <GripVertical className="w-3.5 h-3.5" />
            {editMode ? "Done" : "Reorder"}
          </button>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-2 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
