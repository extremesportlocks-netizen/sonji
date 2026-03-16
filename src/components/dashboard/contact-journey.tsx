"use client";

import { Mail, Phone, DollarSign, FileText, Calendar, CheckCircle, Zap, Star, UserPlus, MessageSquare, TrendingUp } from "lucide-react";

/**
 * CONTACT JOURNEY TIMELINE
 * Shows the full lifecycle of a contact from first touch to now.
 * Used on the Contact Detail page.
 */

interface JourneyEvent {
  date: string;
  type: "first_touch" | "email" | "call" | "payment" | "form" | "meeting" | "deal" | "automation" | "milestone" | "note" | "sms";
  title: string;
  detail?: string;
  value?: number;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; line: string }> = {
  first_touch: { icon: UserPlus, color: "bg-violet-100 text-violet-600", line: "border-violet-300" },
  email: { icon: Mail, color: "bg-blue-100 text-blue-600", line: "border-blue-200" },
  call: { icon: Phone, color: "bg-emerald-100 text-emerald-600", line: "border-emerald-200" },
  payment: { icon: DollarSign, color: "bg-green-100 text-green-600", line: "border-green-200" },
  form: { icon: FileText, color: "bg-rose-100 text-rose-600", line: "border-rose-200" },
  meeting: { icon: Calendar, color: "bg-indigo-100 text-indigo-600", line: "border-indigo-200" },
  deal: { icon: TrendingUp, color: "bg-amber-100 text-amber-600", line: "border-amber-200" },
  automation: { icon: Zap, color: "bg-amber-100 text-amber-600", line: "border-amber-200" },
  milestone: { icon: Star, color: "bg-yellow-100 text-yellow-600", line: "border-yellow-200" },
  note: { icon: FileText, color: "bg-gray-100 text-gray-500", line: "border-gray-200" },
  sms: { icon: MessageSquare, color: "bg-teal-100 text-teal-600", line: "border-teal-200" },
};

// Generate journey from contact data
export function generateJourney(contact: any): JourneyEvent[] {
  const events: JourneyEvent[] = [];
  const cf = contact?.customFields || {};
  const name = `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim();

  // First touch
  events.push({
    date: contact?.createdAt ? new Date(contact.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown",
    type: "first_touch",
    title: "First contact",
    detail: cf.source ? `Source: ${cf.source}` : "Added to CRM",
  });

  // If they have a subscription
  if (cf.subscriptionStatus && cf.subscriptionStatus !== "never") {
    events.push({
      date: cf.subscriptionStartDate ? new Date(cf.subscriptionStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      type: "payment",
      title: `Subscribed: ${cf.subscriptionPlan || "Plan"}`,
      detail: cf.subscriptionAmount ? `$${cf.subscriptionAmount}/period` : undefined,
      value: cf.subscriptionAmount,
    });
  }

  // Purchase history
  if (cf.purchaseCount && cf.purchaseCount > 1) {
    events.push({
      date: "Ongoing",
      type: "milestone",
      title: `${cf.purchaseCount} total purchases`,
      detail: cf.ltv ? `Lifetime value: $${cf.ltv.toLocaleString()}` : undefined,
      value: cf.ltv,
    });
  }

  // First purchase
  if (cf.firstPurchaseDate) {
    events.push({
      date: new Date(cf.firstPurchaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: "payment",
      title: "First purchase",
      value: cf.firstPurchaseAmount,
    });
  }

  // Last purchase
  if (cf.lastPurchaseDate && cf.lastPurchaseDate !== cf.firstPurchaseDate) {
    events.push({
      date: new Date(cf.lastPurchaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: "payment",
      title: "Latest purchase",
      value: cf.lastPurchaseAmount,
    });
  }

  // Automations
  if (cf.subscriptionStatus === "active") {
    events.push({ date: "Auto", type: "automation", title: "Welcome sequence sent", detail: "3-email drip completed" });
  }
  if (cf.subscriptionStatus === "canceled") {
    events.push({ date: "Auto", type: "automation", title: "Win-back sequence triggered", detail: "60-day re-engagement" });
  }

  // If LTV is high
  if (cf.ltv && cf.ltv > 500) {
    events.push({ date: "Today", type: "milestone", title: cf.ltv > 1000 ? "VIP Status" : "Valuable Customer", detail: `LTV: $${cf.ltv.toLocaleString()}`, value: cf.ltv });
  }

  // Sort by reverse date (newest first is better for timeline display)
  return events;
}

export default function ContactJourney({ contact }: { contact: any }) {
  const events = generateJourney(contact);

  if (events.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Customer Journey</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[17px] top-4 bottom-4 w-px bg-gray-200" />

        <div className="space-y-4">
          {events.map((event, i) => {
            const config = typeConfig[event.type] || typeConfig.note;
            const Icon = config.icon;
            return (
              <div key={i} className="flex items-start gap-3 relative">
                <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0 z-10`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    {event.value && event.value > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">${event.value.toLocaleString()}</span>
                    )}
                  </div>
                  {event.detail && <p className="text-xs text-gray-400 mt-0.5">{event.detail}</p>}
                  <p className="text-[10px] text-gray-300 mt-0.5">{event.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
