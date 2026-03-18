"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Circle, CreditCard, Users, Send, Zap,
  ArrowRight, Sparkles, RefreshCw,
} from "lucide-react";

/**
 * GETTING STARTED — Onboarding checklist for fresh tenants
 * 
 * Shows when a real tenant has zero contacts.
 * Guides them through connecting integrations and getting data flowing.
 * Dismissable — stores in sessionStorage.
 * 
 * Health & Wellness specific steps for CLYR:
 * 1. Connect Stripe → sync existing patients
 * 2. Connect email (Resend) → send patient notifications
 * 3. Import existing contacts or wait for first checkout sync
 * 4. Set up automations
 */

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  checkFn?: () => Promise<boolean>;
}

const STEPS: Step[] = [
  {
    id: "stripe",
    title: "Connect Stripe",
    description: "Sync your payment data — customers, subscriptions, and revenue flow in automatically",
    icon: CreditCard,
    href: "/dashboard/settings?tab=integrations",
  },
  {
    id: "contacts",
    title: "Your first patient",
    description: "Run a test checkout on your site, or import existing contacts from a CSV file",
    icon: Users,
    href: "/dashboard/contacts",
  },
  {
    id: "email",
    title: "Connect email sending",
    description: "Set up Resend to send patient notifications, appointment reminders, and campaigns",
    icon: Send,
    href: "/dashboard/settings?tab=integrations",
  },
  {
    id: "automations",
    title: "Set up automations",
    description: "Automate follow-ups, appointment reminders, and re-engagement campaigns",
    icon: Zap,
    href: "/dashboard/workflows",
  },
];

export default function GettingStarted({ totalContacts, tenantIndustry }: { totalContacts: number; tenantIndustry?: string }) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("sonji-getting-started-dismissed")) {
      setDismissed(true);
      return;
    }

    // Check Stripe connection status
    fetch("/api/integrations/stripe")
      .then(r => r.json())
      .then(data => {
        if (data.connected) {
          setStripeConnected(true);
          setCompleted(prev => { const next = new Set(prev); next.add("stripe"); return next; });
        }
      })
      .catch(() => {});

    // Check if they have contacts
    if (totalContacts > 0) {
      setCompleted(prev => { const next = new Set(prev); next.add("contacts"); return next; });
    }
  }, [totalContacts]);

  // Don't show if dismissed or not a real tenant
  const isReal = typeof window !== "undefined" && sessionStorage.getItem("sonji-tenant-verified") === "true";
  if (dismissed || !isReal) return null;

  // Don't show if they have significant data already (past onboarding phase)
  if (totalContacts > 10) return null;

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("sonji-getting-started-dismissed", "1");
  };

  const completedCount = completed.size;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  const industryName = tenantIndustry === "health_wellness" ? "telehealth" :
    tenantIndustry === "agency_consulting" ? "agency" :
    tenantIndustry === "ecommerce" ? "e-commerce" : "business";

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border border-indigo-200/60 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Get your {industryName} CRM running</h2>
            <p className="text-xs text-gray-500 mt-0.5">{completedCount}/{STEPS.length} steps completed</p>
          </div>
        </div>
        <button onClick={dismiss} className="text-xs text-gray-400 hover:text-gray-600 transition">
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/80 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(progressPct, 5)}%` }} />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 gap-3">
        {STEPS.map(step => {
          const done = completed.has(step.id);
          const Icon = step.icon;
          return (
            <button key={step.id} onClick={() => router.push(step.href)}
              className={`text-left p-4 rounded-xl border transition group ${
                done ? "bg-white/60 border-emerald-200" : "bg-white/80 border-gray-200 hover:border-indigo-300 hover:shadow-sm"
              }`}>
              <div className="flex items-center gap-2.5 mb-2">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-indigo-400 flex-shrink-0 transition" />
                )}
                <span className={`text-sm font-semibold ${done ? "text-emerald-700 line-through" : "text-gray-900"}`}>
                  {step.title}
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${done ? "text-emerald-600/60" : "text-gray-500"}`}>
                {step.description}
              </p>
              {!done && (
                <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                  Get started <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
