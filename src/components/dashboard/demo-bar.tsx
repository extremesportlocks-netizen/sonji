"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Sparkles, X } from "lucide-react";

const INDUSTRIES = [
  { key: "ecommerce", name: "ESL Sports (Live)", icon: "🛒", live: true },
  { key: "health_wellness", name: "Glow Med Spa", icon: "♥" },
  { key: "fitness_gym", name: "Iron Republic Fitness", icon: "💪" },
  { key: "beauty_salon", name: "Luxe Beauty Studio", icon: "✂" },
  { key: "agency_consulting", name: "Power Marketing Agency", icon: "🏢" },
  { key: "real_estate", name: "Summit Realty Group", icon: "🏠" },
  { key: "home_services", name: "Apex Roofing & HVAC", icon: "🔧" },
  { key: "legal", name: "Sterling Law Group", icon: "⚖" },
  { key: "coaching_education", name: "Elevate Coaching Co.", icon: "🎓" },
  { key: "restaurant_food", name: "The Copper Table", icon: "🍽" },
  { key: "automotive", name: "Precision Auto Works", icon: "🚗" },
  { key: "nonprofit", name: "Harbor Community Foundation", icon: "💚" },
];

export function getDemoIndustry(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sonji-demo-industry");
}

export function setDemoIndustry(key: string | null) {
  if (typeof window === "undefined") return;
  if (key) localStorage.setItem("sonji-demo-industry", key);
  else localStorage.removeItem("sonji-demo-industry");
  window.dispatchEvent(new Event("sonji-demo-change"));
}

export function useDemoMode() {
  const [industry, setIndustry] = useState<string | null>(null);
  useEffect(() => {
    setIndustry(getDemoIndustry());
    const handler = () => setIndustry(getDemoIndustry());
    window.addEventListener("sonji-demo-change", handler);
    return () => window.removeEventListener("sonji-demo-change", handler);
  }, []);
  return industry;
}

export default function DemoBar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [isRealTenant, setIsRealTenant] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    setActive(getDemoIndustry());
    const handler = () => setActive(getDemoIndustry());
    window.addEventListener("sonji-demo-change", handler);

  // Check if this is a real authenticated tenant
    const verified = sessionStorage.getItem("sonji-tenant-verified");
    if (verified === "true") {
      setIsRealTenant(true);
      // Only show demo bar for platform admin (Orlando) — not all tenant owners
      try {
        const user = JSON.parse(sessionStorage.getItem("sonji-user") || "{}");
        const adminEmails = ["contact@extremesportlocks.com", "orlandosmith1996@gmail.com", "orlandoenterprises54@gmail.com"];
        if (adminEmails.includes(user.email)) setIsOwner(true);
      } catch {}
    }

    return () => window.removeEventListener("sonji-demo-change", handler);
  }, []);

  // Hide demo bar for real tenants UNLESS they're an owner (brain mode)
  if (isRealTenant && !isOwner) return null;

  const current = INDUSTRIES.find(i => i.key === active);

  const select = (key: string) => {
    setDemoIndustry(key);
    setOpen(false);
    window.location.reload();
  };

  const exitDemo = () => {
    setDemoIndustry("ecommerce");
    window.location.reload();
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white">
        <div className="flex items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-200" />
            <span className="text-[11px] font-semibold text-violet-200 uppercase tracking-widest">Demo Mode</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Switcher */}
            <button onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm font-medium">
              {current ? (
                <><span>{current.icon}</span><span>{current.name}</span></>
              ) : (
                <span className="text-violet-200">Select Industry Demo</span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition ${open ? "rotate-180" : ""}`} />
            </button>

            {active && active !== "ecommerce" && (
              <button onClick={exitDemo} className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg transition text-xs font-medium">
                <X className="w-3 h-3" /> Back to Live Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-4 z-50 mt-1">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-72 max-h-96 overflow-y-auto py-1">
            {INDUSTRIES.map(ind => (
              <button key={ind.key} onClick={() => select(ind.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition ${active === ind.key ? "bg-violet-50" : ""}`}>
                <span className="text-lg">{ind.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${active === ind.key ? "text-violet-700" : "text-gray-900"}`}>{ind.name}</p>
                </div>
                {ind.live && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">LIVE</span>}
                {active === ind.key && <span className="text-[9px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">Active</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
