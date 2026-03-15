"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useModal } from "@/components/modals/modal-provider";
import {
  Upload, CreditCard, Mail, Users, Handshake, CheckCircle,
  ChevronRight, Sparkles, Zap, ArrowRight,
} from "lucide-react";

/**
 * NEW TENANT WELCOME
 *
 * Shows when a fresh tenant lands on the dashboard with zero data.
 * Guides them through the first 5 actions to get their CRM productive.
 */

interface TenantInfo {
  name: string;
  industry: string;
  plan: string;
}

const INDUSTRY_NAMES: Record<string, string> = {
  health: "Health & Wellness", fitness: "Fitness & Gym", beauty: "Beauty & Salon",
  agency: "Agency & Consulting", realestate: "Real Estate", contractors: "Home Services",
  legal: "Legal", coaching: "Coaching & Education", restaurant: "Restaurant & Food",
  automotive: "Automotive", nonprofit: "Nonprofit", ecommerce: "E-Commerce",
};

export default function NewTenantWelcome({ stats }: { stats: any }) {
  const { openModal } = useModal();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem("sonji-tenant");
      if (t) setTenant(JSON.parse(t));
      const d = localStorage.getItem("sonji-welcome-dismissed");
      if (d) setDismissed(true);
    } catch {}
  }, []);

  // Don't show if they have real data or dismissed it
  const hasData = stats && (stats.totalContacts > 0 || stats.totalDeals > 0);
  if (hasData || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("sonji-welcome-dismissed", "true");
  };

  const steps = [
    {
      id: "import",
      icon: Upload,
      color: "bg-violet-100 text-violet-600",
      title: "Import your contacts",
      desc: "CSV upload or connect Stripe to pull in customer data automatically",
      action: () => openModal("import"),
      actionLabel: "Import CSV",
      altHref: "/dashboard/settings?tab=integrations",
      altLabel: "Connect Stripe",
    },
    {
      id: "stripe",
      icon: CreditCard,
      color: "bg-emerald-100 text-emerald-600",
      title: "Connect Stripe",
      desc: "Import customer history, track payments, and calculate LTV automatically",
      action: null,
      actionLabel: null,
      altHref: "/dashboard/settings?tab=integrations",
      altLabel: "Go to Integrations",
    },
    {
      id: "contact",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      title: "Add your first contact",
      desc: "Create a contact manually to start building your pipeline",
      action: () => openModal("contact"),
      actionLabel: "Create Contact",
      altHref: null,
      altLabel: null,
    },
    {
      id: "deal",
      icon: Handshake,
      color: "bg-amber-100 text-amber-600",
      title: "Create your first deal",
      desc: "Add a deal to your pipeline to start tracking revenue",
      action: () => openModal("deal"),
      actionLabel: "Create Deal",
      altHref: null,
      altLabel: null,
    },
    {
      id: "email",
      icon: Mail,
      color: "bg-rose-100 text-rose-600",
      title: "Send your first email",
      desc: "Connect Resend and send a campaign or one-to-one email",
      action: () => openModal("email"),
      actionLabel: "Compose Email",
      altHref: "/dashboard/settings?tab=integrations",
      altLabel: "Setup Email",
    },
  ];

  return (
    <div className="mb-6">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Welcome to Sonji</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {tenant?.name || "Your CRM"} is ready!
          </h1>
          <p className="text-white/70 text-sm max-w-lg">
            {tenant?.industry ? (
              <>Your {INDUSTRY_NAMES[tenant.industry] || tenant.industry} workspace is set up with industry-specific pipelines, templates, and automations. Let's get your data in.</>
            ) : (
              <>Your workspace is set up and ready. Complete these 5 steps to start closing deals.</>
            )}
          </p>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900">Quick Start Guide</h2>
          </div>
          <button onClick={dismiss} className="text-xs text-gray-400 hover:text-gray-600 transition">
            Dismiss
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {step.action && (
                    <button onClick={step.action}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                      {step.actionLabel} <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {step.altHref && (
                    <Link href={step.altHref}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition">
                      {step.altLabel} <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
