"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ArrowRight, HelpCircle, Minus } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 99,
    annualPrice: 79,
    desc: "For small teams getting organized",
    cta: "Start Free Trial",
    popular: false,
    features: {
      "Contacts": "2,500",
      "Team Members": "3",
      "Pipelines": "1",
      "Email Sends / Month": "5,000",
      "SMS / Month": "500",
      "Intake Forms": "1",
      "Scheduling Calendars": "1",
      "File Storage": "2 GB",
      "Custom Fields": true,
      "Import / Export": true,
      "Email Sequences": true,
      "Invoicing": true,
      "Activity Timeline": true,
      "Basic Analytics": true,
      "Advanced Analytics": false,
      "Custom Domain": false,
      "AI Assistant": false,
      "Automation Builder": false,
      "White-Label": false,
      "API Access": false,
      "Affiliate System": false,
      "Priority Support": false,
    },
  },
  {
    name: "Growth",
    monthlyPrice: 199,
    annualPrice: 159,
    desc: "For growing businesses that need more",
    cta: "Start Free Trial",
    popular: true,
    features: {
      "Contacts": "25,000",
      "Team Members": "15",
      "Pipelines": "Unlimited",
      "Email Sends / Month": "25,000",
      "SMS / Month": "5,000",
      "Intake Forms": "Unlimited",
      "Scheduling Calendars": "Unlimited",
      "File Storage": "25 GB",
      "Custom Fields": true,
      "Import / Export": true,
      "Email Sequences": true,
      "Invoicing": true,
      "Activity Timeline": true,
      "Basic Analytics": true,
      "Advanced Analytics": true,
      "Custom Domain": true,
      "AI Assistant": true,
      "Automation Builder": true,
      "White-Label": false,
      "API Access": false,
      "Affiliate System": false,
      "Priority Support": false,
    },
  },
  {
    name: "Scale",
    monthlyPrice: 349,
    annualPrice: 279,
    desc: "For agencies & enterprises",
    cta: "Start Free Trial",
    popular: false,
    features: {
      "Contacts": "Unlimited",
      "Team Members": "Unlimited",
      "Pipelines": "Unlimited",
      "Email Sends / Month": "Unlimited",
      "SMS / Month": "25,000",
      "Intake Forms": "Unlimited",
      "Scheduling Calendars": "Unlimited",
      "File Storage": "100 GB",
      "Custom Fields": true,
      "Import / Export": true,
      "Email Sequences": true,
      "Invoicing": true,
      "Activity Timeline": true,
      "Basic Analytics": true,
      "Advanced Analytics": true,
      "Custom Domain": true,
      "AI Assistant": true,
      "Automation Builder": true,
      "White-Label": true,
      "API Access": true,
      "Affiliate System": true,
      "Priority Support": true,
    },
  },
];

const featureGroups = [
  {
    name: "Core",
    features: ["Contacts", "Team Members", "Pipelines", "File Storage"],
  },
  {
    name: "Communication",
    features: ["Email Sends / Month", "SMS / Month", "Email Sequences"],
  },
  {
    name: "Tools",
    features: ["Intake Forms", "Scheduling Calendars", "Invoicing", "Custom Fields", "Import / Export", "Activity Timeline"],
  },
  {
    name: "Advanced",
    features: ["Basic Analytics", "Advanced Analytics", "Custom Domain", "AI Assistant", "Automation Builder"],
  },
  {
    name: "Scale Features",
    features: ["White-Label", "API Access", "Affiliate System", "Priority Support"],
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-gray-300 mx-auto" />;
  return <span className="text-sm font-medium text-gray-900">{value}</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">sonji<span className="text-indigo-500">.</span></Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="/#features" className="hover:text-gray-900 transition">Features</Link>
            <Link href="/pricing" className="text-indigo-600 font-medium">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">Log in</Link>
            <Link href="/signup" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Simple, honest pricing.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          One price. Everything included. No per-SMS charges, no AI usage fees, no surprise overages.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full p-1">
          <button onClick={() => setAnnual(false)}
            className={`px-5 py-2 text-sm font-medium rounded-full transition ${!annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            Monthly
          </button>
          <button onClick={() => setAnnual(true)}
            className={`px-5 py-2 text-sm font-medium rounded-full transition ${annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            Annual <span className="text-emerald-600 text-xs font-semibold ml-1">Save 20%</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div key={plan.name}
                className={`relative rounded-2xl p-8 transition ${
                  plan.popular
                    ? "border-2 border-indigo-600 shadow-xl shadow-indigo-500/10 bg-white"
                    : "border border-gray-200 bg-white hover:border-gray-300"
                }`}>
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-indigo-600 px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">${price}</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                {annual && (
                  <p className="text-xs text-gray-400 mb-6">Billed annually (${price * 12}/yr)</p>
                )}
                {!annual && <p className="text-xs text-gray-400 mb-6">Billed monthly</p>}

                <Link href="/signup"
                  className={`block w-full text-center py-3 text-sm font-medium rounded-xl transition mb-6 ${
                    plan.popular
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200"
                  }`}>
                  {plan.cta}
                </Link>

                <div className="space-y-3">
                  {Object.entries(plan.features).slice(0, 10).map(([feature, value]) => (
                    <div key={feature} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{feature}</span>
                      {typeof value === "boolean" ? (
                        value ? <Check className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-gray-300" />
                      ) : (
                        <span className="font-medium text-gray-900">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full Comparison Table */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Full Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 pr-6 w-1/3"></th>
                  {plans.map((p) => (
                    <th key={p.name} className="text-center py-4 px-4">
                      <span className={`text-sm font-semibold ${p.popular ? "text-indigo-600" : "text-gray-900"}`}>{p.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureGroups.map((group) => (
                  <>
                    <tr key={group.name}>
                      <td colSpan={4} className="pt-6 pb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{group.name}</span>
                      </td>
                    </tr>
                    {group.features.map((feature) => (
                      <tr key={feature} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="py-3 pr-6 text-sm text-gray-600">{feature}</td>
                        {plans.map((plan) => (
                          <td key={`${plan.name}-${feature}`} className="py-3 px-4 text-center">
                            <FeatureValue value={plan.features[feature as keyof typeof plan.features]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-24 bg-gray-50">
        <div className="max-w-3xl mx-auto pt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is there a free trial?", a: "Yes! Every plan comes with a 14-day free trial. No credit card required. You get full access to all features in your chosen tier." },
              { q: "Are there any hidden fees?", a: "None. The price you see is the price you pay. SMS, email, AI, storage — it's all included. We don't charge per-message or per-API-call." },
              { q: "Can I switch plans later?", a: "Absolutely. Upgrade or downgrade anytime. If you upgrade mid-cycle, you'll be prorated. If you downgrade, the change takes effect at your next billing date." },
              { q: "What happens when I hit my contact limit?", a: "We'll notify you when you're approaching your limit. You can upgrade at any time. We never delete your data — we just pause new contact creation until you upgrade." },
              { q: "Do you offer white-labeling?", a: "Yes, on the Scale plan. You get a fully branded CRM with your logo, colors, custom domain, and branded login page. Your clients will never see the Sonji brand." },
              { q: "Can I cancel anytime?", a: "Yes. No contracts, no cancellation fees. Cancel with one click from your Settings page. Your data is available for export for 30 days after cancellation." },
            ].map((item) => (
              <details key={item.q} className="bg-white rounded-xl border border-gray-200 group">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-medium text-gray-900 list-none">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to simplify everything?</h2>
        <p className="text-gray-500 mb-8">Start your 14-day free trial. No credit card required.</p>
        <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-lg shadow-indigo-500/25">
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xl font-bold text-gray-900">sonji<span className="text-indigo-500">.</span></span>
          <div className="flex gap-8 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition">Terms</Link>
            <a href="mailto:hello@sonji.io" className="hover:text-gray-600 transition">Contact</a>
          </div>
          <p className="text-sm text-gray-400">&copy; 2026 Sonji. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
