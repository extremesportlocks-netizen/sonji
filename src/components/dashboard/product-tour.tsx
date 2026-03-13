"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Users,
  Handshake,
  MessageSquare,
  BarChart3,
  Settings,
  Zap,
  Search,
  Bell,
  Plus,
  Sparkles,
} from "lucide-react";

export interface TourStep {
  id: string;
  title: string;
  body: string;
  icon: React.ElementType;
  target?: string; // CSS selector for the element to highlight (future: scroll into view + spotlight)
  position: "center" | "bottom-left" | "bottom-right" | "top-center";
}

const defaultSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Sonji!",
    body: "Let's take a quick tour of your CRM. This will only take a minute and you can replay it anytime from Settings.",
    icon: Sparkles,
    position: "center",
  },
  {
    id: "sidebar",
    title: "Your Navigation",
    body: "The sidebar is your home base. Everything you need — contacts, deals, tasks, meetings, messages — is one click away. It collapses for more screen space.",
    icon: LayoutDashboard,
    target: "[data-tour='sidebar']",
    position: "bottom-right",
  },
  {
    id: "contacts",
    title: "Contacts & Companies",
    body: "Your entire network lives here. Import contacts from a CSV, add them manually, or they'll auto-create when someone fills out an intake form.",
    icon: Users,
    target: "[data-tour='contacts']",
    position: "bottom-right",
  },
  {
    id: "deals",
    title: "Pipeline & Deals",
    body: "Drag deals through your pipeline stages on a visual Kanban board. Track values, set close dates, and never lose a lead.",
    icon: Handshake,
    target: "[data-tour='deals']",
    position: "bottom-right",
  },
  {
    id: "messages",
    title: "Unified Inbox",
    body: "Every email, SMS, and form submission in one place. Reply via email or text without switching tools. Full conversation history per contact.",
    icon: MessageSquare,
    target: "[data-tour='messages']",
    position: "bottom-right",
  },
  {
    id: "search",
    title: "Global Search",
    body: "Press the search bar or hit Ctrl+K to search across everything — contacts, deals, companies, tasks. Find anything in seconds.",
    icon: Search,
    target: "[data-tour='search']",
    position: "bottom-left",
  },
  {
    id: "notifications",
    title: "Stay in the Loop",
    body: "The bell icon shows real-time notifications — new form submissions, deal stage changes, task assignments, and more.",
    icon: Bell,
    target: "[data-tour='notifications']",
    position: "bottom-left",
  },
  {
    id: "create",
    title: "Quick Create",
    body: "The + button lets you quickly create a contact, deal, task, or meeting from anywhere in the app. No need to navigate first.",
    icon: Plus,
    target: "[data-tour='create']",
    position: "bottom-left",
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    body: "Track your revenue, pipeline health, conversion rates, and team performance. All data updates in real-time.",
    icon: BarChart3,
    target: "[data-tour='analytics']",
    position: "bottom-right",
  },
  {
    id: "workflows",
    title: "Automate Everything",
    body: "Build automated workflows that trigger on events — new lead, deal won, form submitted. Send emails, assign tasks, and update records without lifting a finger.",
    icon: Zap,
    target: "[data-tour='workflows']",
    position: "bottom-right",
  },
  {
    id: "settings",
    title: "Make It Yours",
    body: "Customize your brand colors, invite team members, manage billing, connect integrations, and configure notification preferences.",
    icon: Settings,
    target: "[data-tour='settings']",
    position: "bottom-right",
  },
  {
    id: "done",
    title: "You're ready to go!",
    body: "That's the quick tour. Check the Getting Started checklist on your dashboard for next steps. Need help? We're always a click away.",
    icon: Sparkles,
    position: "center",
  },
];

interface ProductTourProps {
  steps?: TourStep[];
  onComplete?: () => void;
  onDismiss?: () => void;
}

export default function ProductTour({ steps = defaultSteps, onComplete, onDismiss }: ProductTourProps) {
  const [active, setActive] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const next = useCallback(() => {
    if (isLast) {
      setActive(false);
      onComplete?.();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLast, onComplete]);

  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const dismiss = () => {
    setActive(false);
    onDismiss?.();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!active) return;
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active, next]);

  if (!active || !step) return null;

  const Icon = step.icon;

  // Position classes
  const positionClasses: Record<string, string> = {
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-24 left-8",
    "bottom-right": "bottom-24 right-8",
    "top-center": "top-24 left-1/2 -translate-x-1/2",
  };

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />

      {/* Tour Card */}
      <div className={`absolute ${positionClasses[step.position]} z-10 tour-card-animate`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[420px] overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }} />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step indicator + dismiss */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400 font-medium">Step {currentStep + 1} of {steps.length}</span>
              <button onClick={dismiss} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-500 leading-relaxed mb-6 ml-[52px]">
              {step.body}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={dismiss}
                className="text-sm text-gray-400 hover:text-gray-600 transition">
                Skip tour
              </button>

              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button onClick={prev}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                )}
                <button onClick={next}
                  className="flex items-center gap-1 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
                  {isLast ? "Finish" : "Next"} {!isLast && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {steps.map((_, i) => (
                <button key={i} onClick={() => setCurrentStep(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? "w-4 bg-indigo-600" : i < currentStep ? "w-1.5 bg-indigo-300" : "w-1.5 bg-gray-200"
                  }`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tour-card-animate {
          animation: tourIn 0.25s ease-out;
        }
        @keyframes tourIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to manage tour state. Use in the dashboard layout.
 */
export function useTour() {
  const [showTour, setShowTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("sonji_tour_completed");
      if (seen === "true") {
        setTourCompleted(true);
        return;
      }
    } catch {}
    if (!tourCompleted) {
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [tourCompleted]);

  const startTour = () => setShowTour(true);
  const completeTour = () => {
    setShowTour(false);
    setTourCompleted(true);
    try { localStorage.setItem("sonji_tour_completed", "true"); } catch {}
  };
  const dismissTour = () => {
    setShowTour(false);
    setTourCompleted(true);
    try { localStorage.setItem("sonji_tour_completed", "true"); } catch {}
  };

  return { showTour, startTour, completeTour, dismissTour };
}
