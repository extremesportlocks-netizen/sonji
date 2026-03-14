"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Phone,
  Mail,
  Video,
} from "lucide-react";
import { useModal } from "@/components/modals/modal-provider";

// ────────────────────────────────────
// HEADER COMPONENT
// Fixed top bar with search, quick actions, notifications, user
// ────────────────────────────────────

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { openModal } = useModal();

  const createOptions = [
    { label: "Add Contact", icon: "👤", modal: "contact" as const },
    { label: "Add Deal", icon: "🤝", modal: "deal" as const },
    { label: "Add Task", icon: "✓", modal: "task" as const },
    { label: "Schedule Meeting", icon: "📅", modal: "meeting" as const },
    { label: "Compose Email", icon: "✉️", modal: "email" as const },
    { label: "Import Contacts", icon: "📥", modal: "import" as const },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Page title */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8" data-tour="search">
          <button
            onClick={() => document.dispatchEvent(new CustomEvent("sonji:open-command-palette"))}
            className="relative w-full flex items-center pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg 
                       text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition cursor-pointer text-left"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <span>Search contacts, deals, or type /ai...</span>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Quick communication icons */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition hidden sm:flex">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition hidden sm:flex">
            <Mail className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition hidden sm:flex">
            <Video className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block" />

          {/* Notifications */}
          <button data-tour="notifications" className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
          </button>

          {/* Create Button */}
          <div className="relative" data-tour="create">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="flex items-center gap-1.5 ml-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {/* Dropdown */}
            {showCreateMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCreateMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {createOptions.map((opt) => (
                    <button
                      key={opt.label}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => { setShowCreateMenu(false); openModal(opt.modal); }}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span>{opt.label}</span>
                      <Plus className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">O</span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Orlando</p>
                    <p className="text-xs text-gray-400">hello@sonji.io</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left transition">
                      Account Settings
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left transition">
                      Billing
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left transition">
                      Help & Support
                    </button>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition">
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
