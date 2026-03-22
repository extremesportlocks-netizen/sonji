"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { getDemoIndustry } from "@/lib/tenant-utils";
import { Palette, Type, Globe, Image, Eye, Save, RotateCcw, Check, Monitor, Smartphone } from "lucide-react";

function getTenantDefaults() {
  if (typeof window === "undefined") return { name: "", domain: "", industry: "" };
  try {
    const t = JSON.parse(sessionStorage.getItem("sonji-tenant") || "{}");
    return { name: t.name || "", domain: t.slug ? `${t.slug}.sonji.io` : "", industry: t.industry || "" };
  } catch { return { name: "", domain: "", industry: "" }; }
}

// Demo data — only shown in ESL admin brain mode
const DEMO_BRANDS: Record<string, any> = {
  agency_consulting: {
    name: "Power Marketing", domain: "app.powermarketing.com", primaryColor: "#6366f1", accentColor: "#8b5cf6",
    emailFrom: "team@powermarketing.com", emailReplyTo: "colton@powermarketing.com",
    loginMessage: "Sign in to your client dashboard", footerText: "© 2026 Power Marketing Agency",
  },
  health_wellness: {
    name: "CLYR Health", domain: "app.clyr.health", primaryColor: "#2bbcb3", accentColor: "#0074d4",
    emailFrom: "care@clyr.health", emailReplyTo: "contact@clyr.health",
    loginMessage: "Sign in to your patient portal", footerText: "© 2026 Clyr Health, LLC",
  },
};

export default function WhiteLabelPage() {
  const [brand, setBrand] = useState({
    name: "", domain: "", primaryColor: "#6366f1", accentColor: "#8b5cf6",
    logoUrl: "", faviconUrl: "", emailFrom: "", emailReplyTo: "",
    loginMessage: "Sign in to your dashboard", footerText: "",
  });
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const demoKey = getDemoIndustry();
    if (demoKey && DEMO_BRANDS[demoKey]) {
      setBrand(b => ({ ...b, ...DEMO_BRANDS[demoKey] }));
    } else {
      // Real tenant — use tenant's own info as defaults
      const t = getTenantDefaults();
      setBrand(b => ({
        ...b,
        name: t.name || b.name,
        domain: t.domain || b.domain,
        footerText: t.name ? `© 2026 ${t.name}` : b.footerText,
      }));
    }
  }, []);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <>
      <Header title="White-Label" />
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Brand Your CRM</h2>
                <p className="text-xs text-gray-500 mt-0.5">Your clients see your brand, not Sonji. Custom domain, colors, logo, and emails.</p>
              </div>
              <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-3 py-1 rounded-full">Scale Plan Feature</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings */}
            <div className="space-y-4">
              {/* Brand Identity */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Palette className="w-4 h-4 text-violet-500" /> Brand Identity</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Business Name</label>
                    <input value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={brand.primaryColor} onChange={e => setBrand({...brand, primaryColor: e.target.value})}
                          className="w-8 h-8 rounded border-0 cursor-pointer" />
                        <input value={brand.primaryColor} onChange={e => setBrand({...brand, primaryColor: e.target.value})}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={brand.accentColor} onChange={e => setBrand({...brand, accentColor: e.target.value})}
                          className="w-8 h-8 rounded border-0 cursor-pointer" />
                        <input value={brand.accentColor} onChange={e => setBrand({...brand, accentColor: e.target.value})}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Domain */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> Custom Domain</h3>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Dashboard URL</label>
                  <input value={brand.domain} onChange={e => setBrand({...brand, domain: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <p className="text-[10px] text-gray-400 mt-1">Your clients visit this URL to access their dashboard. Add a CNAME record pointing to <code className="text-gray-500">proxy.sonji.io</code></p>
                </div>
              </div>

              {/* Email Branding */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Type className="w-4 h-4 text-emerald-500" /> Email & Login</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Email From Address</label>
                    <input value={brand.emailFrom} onChange={e => setBrand({...brand, emailFrom: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Login Page Message</label>
                    <input value={brand.loginMessage} onChange={e => setBrand({...brand, loginMessage: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Footer Text</label>
                    <input value={brand.footerText} onChange={e => setBrand({...brand, footerText: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button onClick={save} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            {/* Preview */}
            <div>
              <div className="sticky top-20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Eye className="w-4 h-4 text-gray-400" /> Live Preview</h3>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                    <button onClick={() => setPreview("desktop")} className={`p-1.5 rounded-md transition ${preview === "desktop" ? "bg-white shadow-sm" : ""}`}><Monitor className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => setPreview("mobile")} className={`p-1.5 rounded-md transition ${preview === "mobile" ? "bg-white shadow-sm" : ""}`}><Smartphone className="w-4 h-4 text-gray-500" /></button>
                  </div>
                </div>

                {/* Mock Login Page */}
                <div className={`bg-white rounded-xl border-2 border-gray-200 overflow-hidden ${preview === "mobile" ? "max-w-[320px] mx-auto" : ""}`}>
                  {/* Browser Chrome */}
                  <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                    <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-gray-400 font-mono text-center">{brand.domain}</div>
                  </div>

                  {/* Login Page Preview */}
                  <div className="p-8 text-center" style={{ minHeight: preview === "mobile" ? 400 : 350 }}>
                    <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: brand.primaryColor }}>
                      {brand.name[0]}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{brand.name}</h2>
                    <p className="text-xs text-gray-500 mb-6">{brand.loginMessage}</p>

                    <div className="max-w-xs mx-auto space-y-3">
                      <input disabled placeholder="Email address" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50" />
                      <input disabled placeholder="Password" type="password" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50" />
                      <button disabled className="w-full py-2.5 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: brand.primaryColor }}>
                        Sign In
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-400 mt-8">{brand.footerText}</p>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: brand.primaryColor }} />
                    <span className="text-[10px] text-gray-400">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: brand.accentColor }} />
                    <span className="text-[10px] text-gray-400">Accent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
