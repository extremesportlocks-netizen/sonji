"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  ChevronRight,
  Users,
  Handshake,
  Mail,
  FileText,
  Calendar,
  UserPlus,
  Palette,
  Upload,
  Rocket,
  PartyPopper,
  Sparkles,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  completed: boolean;
  autoCompleted?: boolean;
}

export default function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "account", label: "Create your account", description: "Sign up and set your password", icon: Rocket, href: "#", completed: true, autoCompleted: true },
    { id: "brand", label: "Brand your CRM", description: "Logo, colors, and business name", icon: Palette, href: "/dashboard/settings", completed: true, autoCompleted: true },
    { id: "import", label: "Import your contacts", description: "Upload a CSV or add contacts manually", icon: Upload, href: "/dashboard/contacts", completed: false },
    { id: "deal", label: "Create your first deal", description: "Add a deal to your pipeline", icon: Handshake, href: "/dashboard/deals", completed: false },
    { id: "email", label: "Send your first email", description: "Compose and send an email to a contact", icon: Mail, href: "/dashboard/messages", completed: false },
    { id: "form", label: "Create an intake form", description: "Build a form to capture leads on your site", icon: FileText, href: "/dashboard/settings", completed: false },
    { id: "schedule", label: "Set up your availability", description: "Configure your booking calendar", icon: Calendar, href: "/dashboard/meetings", completed: false },
    { id: "invite", label: "Invite a team member", description: "Add someone to your workspace", icon: UserPlus, href: "/dashboard/settings", completed: false },
  ]);

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progress = (completedCount / totalCount) * 100;
  const allDone = completedCount === totalCount;

  const toggleItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i));
      const newCompleted = updated.filter((i) => i.completed).length;
      if (newCompleted === totalCount && !celebrating) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 3000);
      }
      return updated;
    });
  };

  if (dismissed) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 relative">
      {/* Celebration overlay */}
      {celebrating && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-indigo-600 to-violet-600 flex flex-col items-center justify-center rounded-2xl animate-in">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">You're all set!</h3>
          <p className="text-indigo-200 text-sm">Your CRM is fully configured and ready to go.</p>
          <button onClick={() => setDismissed(true)}
            className="mt-6 px-6 py-2 bg-white text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition">
            Let's go
          </button>
          <style jsx>{`
            .animate-in { animation: scaleIn 0.3s ease-out; }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          `}</style>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Getting Started</h3>
            <p className="text-xs text-gray-500 mt-0.5">{completedCount} of {totalCount} completed — {allDone ? "All done!" : "let's finish setting up"}</p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition" title="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-4">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Checklist */}
      <div className="px-3 pb-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition group ${
                item.completed ? "opacity-60" : "hover:bg-gray-50"
              }`}>
              {/* Checkbox */}
              <button onClick={() => !item.autoCompleted && toggleItem(item.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                  item.completed
                    ? "bg-indigo-600 text-white"
                    : "border-2 border-gray-200 hover:border-indigo-400 text-transparent hover:text-indigo-400"
                }`}>
                <Check className="w-3.5 h-3.5" />
              </button>

              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.completed ? "bg-gray-100 text-gray-400" : "bg-indigo-50 text-indigo-600"
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {item.label}
                </p>
                <p className={`text-xs ${item.completed ? "text-gray-300" : "text-gray-400"}`}>
                  {item.description}
                </p>
              </div>

              {/* Action */}
              {!item.completed && (
                <Link href={item.href}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-indigo-100 flex-shrink-0">
                  Start <ChevronRight className="w-3 h-3" />
                </Link>
              )}

              {item.completed && item.autoCompleted && (
                <span className="text-[10px] text-gray-400 flex-shrink-0">Auto</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
