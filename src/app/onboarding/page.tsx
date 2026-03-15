"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Building2,
  Heart,
  Dumbbell,
  Scissors,
  Briefcase,
  Home,
  Sparkles,
  Rocket,
  Hammer,
  Scale,
  Target,
  UtensilsCrossed,
  Car,
  HandHeart,
  ShoppingCart,
  Loader2,
  AlertCircle,
} from "lucide-react";

const steps = ["Account", "Plan", "Brand", "Industry", "Ready"];

const plans = [
  { name: "Starter", price: "$99", period: "/mo", value: "starter", desc: "For small teams getting started", features: ["2,500 contacts", "3 team members", "Email marketing (5K/mo)", "1 pipeline", "Basic analytics"], popular: false },
  { name: "Growth", price: "$199", period: "/mo", value: "growth", desc: "For growing businesses", features: ["25,000 contacts", "15 team members", "Email + SMS", "Unlimited pipelines", "Advanced analytics", "Custom domain", "AI assistant"], popular: true },
  { name: "Scale", price: "$349", period: "/mo", value: "scale", desc: "For agencies & enterprises", features: ["Unlimited contacts", "Unlimited team", "Everything in Growth", "Full white-label", "API access", "Affiliate system", "Priority support"], popular: false },
];

const industries = [
  { id: "health", name: "Health & Wellness", icon: Heart, desc: "Med spas, clinics, telehealth", color: "bg-rose-50 text-rose-600 border-rose-200" },
  { id: "fitness", name: "Fitness & Gym", icon: Dumbbell, desc: "Gyms, trainers, studios", color: "bg-orange-50 text-orange-600 border-orange-200" },
  { id: "beauty", name: "Beauty & Salon", icon: Scissors, desc: "Salons, barbers, spas", color: "bg-pink-50 text-pink-600 border-pink-200" },
  { id: "agency", name: "Agency & Consulting", icon: Briefcase, desc: "Marketing, consulting, services", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  { id: "realestate", name: "Real Estate", icon: Home, desc: "Agents, brokers, property mgmt", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { id: "contractors", name: "Home Services", icon: Hammer, desc: "Roofing, HVAC, plumbing, electrical", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { id: "legal", name: "Legal & Law Firms", icon: Scale, desc: "Attorneys, paralegals, firms", color: "bg-slate-50 text-slate-600 border-slate-200" },
  { id: "coaching", name: "Coaching & Education", icon: Target, desc: "Coaches, tutors, course creators", color: "bg-violet-50 text-violet-600 border-violet-200" },
  { id: "restaurant", name: "Restaurant & Food", icon: UtensilsCrossed, desc: "Restaurants, catering, cafes", color: "bg-red-50 text-red-600 border-red-200" },
  { id: "automotive", name: "Automotive", icon: Car, desc: "Dealerships, repair, detailing", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: "nonprofit", name: "Nonprofit", icon: HandHeart, desc: "Charities, foundations, churches", color: "bg-teal-50 text-teal-600 border-teal-200" },
  { id: "ecommerce", name: "E-Commerce", icon: ShoppingCart, desc: "Online stores, DTC, subscriptions", color: "bg-purple-50 text-purple-600 border-purple-200" },
];

const presetColors = ["#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#0f172a", "#0ea5e9"];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [provisioning, setProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provisionResult, setProvisionResult] = useState<{ tenantId: string; slug: string } | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    ownerName: "",
    plan: "growth",
    brandColor: "#6366f1",
    logo: null as string | null,
    industry: "",
  });

  // Pre-fill from Clerk user data
  useEffect(() => {
    if (isLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        email: user.emailAddresses[0]?.emailAddress || prev.email,
        ownerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || prev.ownerName,
      }));
    }
  }, [isLoaded, user]);

  const slug = slugify(formData.businessName);

  const canProceed = () => {
    if (step === 0) return formData.businessName.length >= 2;
    if (step === 1) return formData.plan;
    if (step === 2) return formData.brandColor;
    if (step === 3) return formData.industry;
    return true;
  };

  const handleLaunch = async () => {
    setProvisioning(true);
    setError(null);

    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.businessName,
          slug,
          plan: formData.plan,
          industry: formData.industry,
          ownerEmail: formData.email,
          ownerName: formData.ownerName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Something went wrong. Please try again.");
        setProvisioning(false);
        return;
      }

      setProvisionResult({ tenantId: data.tenantId, slug: data.slug });

      // Cache tenant info so dashboard picks it up immediately
      sessionStorage.setItem("sonji-tenant-verified", "true");
      sessionStorage.setItem("sonji-tenant", JSON.stringify({
        id: data.tenantId,
        slug: data.slug,
        name: formData.businessName,
        plan: formData.plan,
        industry: formData.industry,
      }));

      setStep(4); // Move to "Ready" step
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setProvisioning(false);
    }
  };

  const next = () => {
    if (step === 3) {
      // Step 4 transition = "Launch My CRM" → calls the API
      handleLaunch();
    } else {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  };

  const prev = () => { setStep((s) => Math.max(s - 1, 0)); setError(null); };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">
            sonji<span className="text-violet-500">.</span>
          </div>
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                  i < step ? "bg-indigo-600 text-white" :
                  i === step ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-600" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${i < step ? "bg-indigo-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-400">Step {step + 1} of {steps.length}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center pt-12 pb-24 px-6">
        <div className="w-full max-w-3xl">

          {/* ═══ STEP 1: Account ═══ */}
          {step === 0 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Set up your workspace</h1>
              <p className="text-gray-500 mb-8">Signed in as <span className="font-medium text-gray-700">{formData.email || "..."}</span></p>

              <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Business Name</label>
                  <input type="text" placeholder="e.g. Extreme Sport Locks" value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
                </div>
                {formData.businessName.length >= 2 && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">Your workspace URL:</span>
                    <span className="text-sm font-semibold text-indigo-600">{slug}.sonji.io</span>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Your Name</label>
                  <input type="text" placeholder="Your full name" value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Plan ═══ */}
          {step === 1 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose your plan</h1>
              <p className="text-gray-500 mb-8">All plans include everything. No hidden fees. Cancel anytime.</p>

              <div className="grid grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <button key={plan.name}
                    onClick={() => setFormData({ ...formData, plan: plan.value })}
                    className={`relative text-left p-6 rounded-2xl border-2 transition ${
                      formData.plan === plan.value
                        ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-500/10"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}>
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}
                    <p className={`text-sm font-semibold mb-1 ${formData.plan === plan.value ? "text-indigo-700" : "text-gray-900"}`}>{plan.name}</p>
                    <div className="flex items-baseline gap-0.5 mb-2">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-sm text-gray-400">{plan.period}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">{plan.desc}</p>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                          <Check className={`w-3.5 h-3.5 flex-shrink-0 ${formData.plan === plan.value ? "text-indigo-600" : "text-gray-400"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {formData.plan === plan.value && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Brand ═══ */}
          {step === 2 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand your CRM</h1>
              <p className="text-gray-500 mb-8">Make it yours. Pick your brand color.</p>

              <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Brand Color</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {presetColors.map((c) => (
                      <button key={c} onClick={() => setFormData({ ...formData, brandColor: c })}
                        className={`w-10 h-10 rounded-xl transition-all ${formData.brandColor === c ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : "hover:scale-105"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input type="text" value={formData.brandColor}
                        onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                        className="w-24 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Preview</label>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: formData.brandColor }} />
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: formData.brandColor }}>
                          <span className="text-white text-sm font-bold">{formData.businessName?.[0] || "S"}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{formData.businessName || "Your Business"}</p>
                          <p className="text-xs text-gray-400">{slug || "yourbusiness"}.sonji.io</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-4 py-2 text-xs font-medium text-white rounded-lg" style={{ backgroundColor: formData.brandColor }}>
                          Primary Button
                        </div>
                        <div className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg bg-white">
                          Secondary
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 4: Industry ═══ */}
          {step === 3 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">What's your industry?</h1>
              <p className="text-gray-500 mb-8">We'll set up pipeline stages, form templates, and email templates tailored to your business.</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {industries.map((ind) => {
                  const Icon = ind.icon;
                  return (
                    <button key={ind.id}
                      onClick={() => setFormData({ ...formData, industry: ind.id })}
                      className={`text-left p-5 rounded-2xl border-2 transition ${
                        formData.industry === ind.id
                          ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-500/10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${ind.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold mb-0.5 ${formData.industry === ind.id ? "text-indigo-700" : "text-gray-900"}`}>
                            {ind.name}
                          </p>
                          <p className="text-xs text-gray-500">{ind.desc}</p>
                        </div>
                        {formData.industry === ind.id && (
                          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ STEP 5: Ready ═══ */}
          {step === 4 && (
            <div className="text-center pt-8">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: formData.brandColor }}>
                <Rocket className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h1>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Your CRM is live at <span className="font-semibold text-gray-900">{provisionResult?.slug || slug}.sonji.io</span>
              </p>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-sm mx-auto mb-8 text-left">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick-start checklist</h3>
                <div className="space-y-3">
                  {[
                    { label: "Account created", done: true },
                    { label: `${plans.find(p => p.value === formData.plan)?.name || "Growth"} plan selected`, done: true },
                    { label: "Brand colors applied", done: true },
                    { label: `${industries.find(i => i.id === formData.industry)?.name || "Industry"} templates loaded`, done: true },
                    { label: "Import your contacts", done: false },
                    { label: "Connect Stripe", done: false },
                    { label: "Send your first email", done: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.done ? "bg-emerald-500" : "border-2 border-gray-200"
                      }`}>
                        {item.done && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${item.done ? "text-gray-500 line-through" : "text-gray-700"}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white rounded-xl transition shadow-lg shadow-indigo-500/25"
                style={{ backgroundColor: formData.brandColor }}>
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={prev}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                step === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
              }`}
              disabled={step === 0 || provisioning}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition ${i === step ? "bg-indigo-600 w-6" : i < step ? "bg-indigo-600" : "bg-gray-200"}`} />
              ))}
            </div>

            <button onClick={next}
              disabled={!canProceed() || provisioning}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition ${
                canProceed() && !provisioning
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}>
              {provisioning ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating workspace...</>
              ) : step === 3 ? (
                <><Rocket className="w-4 h-4" /> Launch My CRM</>
              ) : (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
