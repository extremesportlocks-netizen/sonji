"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  CheckSquare,
  Calendar,
  BarChart3,
  Workflow,
  Activity,
  FileText,
  Settings,
  ChevronDown,
  Search,
  Plus,
  Star,
  MessageSquare,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ────────────────────────────────────
// NAV CONFIG
// Grouped like CloseCRM: core → insight → system
// ────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Companies", href: "/dashboard/companies", icon: Building2 },
      { label: "Contacts", href: "/dashboard/contacts", icon: Users },
      { label: "Deals", href: "/dashboard/deals", icon: Handshake },
      { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { label: "Meetings", href: "/dashboard/meetings", icon: Calendar },
      { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: 3 },
    ],
  },
  {
    label: "Insight & Control",
    collapsible: true,
    items: [
      { label: "Activities", href: "/dashboard/activities", icon: Activity },
      { label: "Reports", href: "/dashboard/reports", icon: FileText },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Workflows", href: "/dashboard/workflows", icon: Workflow },
    ],
  },
  {
    label: "System",
    collapsible: true,
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

// ────────────────────────────────────
// SIDEBAR COMPONENT
// ────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 bottom-0 z-40
        flex flex-col
        bg-white border-r border-gray-100
        transition-all duration-200 ease-in-out
        ${collapsed ? "w-[68px]" : "w-[260px]"}
      `}
    >
      {/* ── Logo Area ── */}
      <div className={`
        flex items-center h-16 border-b border-gray-100
        ${collapsed ? "justify-center px-2" : "px-5"}
      `}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Sonji</p>
              <p className="text-xs text-gray-400 truncate">My Workspace</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        )}
      </div>

      {/* ── Search ── */}
      {!collapsed && (
        <div className="px-3 py-3">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <Search className="w-4 h-4" />
            <span>Search</span>
            <kbd className="ml-auto text-[10px] font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-400">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* ── Navigation Groups ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.label || "main"} className={group.label ? "mt-6" : "mt-1"}>
            {/* Group Label */}
            {group.label && !collapsed && (
              <button
                onClick={() => group.collapsible && toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-3 mb-1"
              >
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {group.label}
                </span>
                {group.collapsible && (
                  <ChevronDown
                    className={`w-3 h-3 text-gray-400 transition-transform ${
                      collapsedGroups[group.label] ? "-rotate-90" : ""
                    }`}
                  />
                )}
              </button>
            )}

            {/* Nav Items */}
            {!collapsedGroups[group.label] && (
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 rounded-lg text-sm font-medium transition-all
                          ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"}
                          ${active
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon
                          className={`flex-shrink-0 ${
                            active ? "text-indigo-600" : "text-gray-400"
                          }`}
                          size={20}
                          strokeWidth={active ? 2 : 1.5}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* ── Favorites Section ── */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Favorites
            </span>
            <Plus className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-50 cursor-pointer">
              <Star className="w-4 h-4 text-gray-300" />
              <span className="text-gray-400 text-xs">Pin your favorites here</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Chats ── */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Recent Chats
            </span>
            <Plus className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 px-3 py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-50 cursor-pointer">
              <MessageSquare className="w-4 h-4 text-gray-300" />
              <span className="truncate text-xs text-gray-400">No recent conversations</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Collapse Toggle ── */}
      <div className="border-t border-gray-100 px-3 py-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition"
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <ChevronsLeft className="w-4 h-4" />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
