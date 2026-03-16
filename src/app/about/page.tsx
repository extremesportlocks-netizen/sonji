"use client";

import Link from "next/link";
import { ArrowRight, Users, Code, Zap, Shield, Heart, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="text-xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></Link>
          <div className="flex items-center gap-4">
            <Link href="/compare" className="text-sm text-gray-600 hover:text-gray-900 transition">Compare</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Built by operators,<br />for operators.</h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Sonji started because we were tired of paying for 6 different tools that didn't talk to each other. So we built one that does everything.
            </p>
          </div>

          {/* Story */}
          <div className="prose prose-gray max-w-none mb-16">
            <div className="bg-gray-50 rounded-2xl p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mt-0 mb-3">The problem we solved</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every small business owner knows the pain: you need a CRM for contacts, a separate tool for email, another for SMS, something else for scheduling, a project management app, and an analytics dashboard. That's $500-1,000/month before you've made a single sale.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Worse, none of them share data. Your CRM doesn't know what your email tool is doing. Your project management app can't see your pipeline. Your analytics are spread across 6 different dashboards that all report different numbers.
              </p>
              <p className="text-gray-600 leading-relaxed mb-0">
                We built Sonji to fix this. One platform. One price. Everything connected. And we built it specifically for 12 different industries — not a generic tool that you have to configure yourself.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Shield, title: "Honest pricing", desc: "No per-user fees. No per-SMS charges. No hidden usage caps. The price you see is the price you pay." },
                { icon: Zap, title: "5-minute setup", desc: "Pick your industry, set your brand colors, and you're live. No consultants. No 6-month implementation." },
                { icon: Heart, title: "Built for your vertical", desc: "12 industry templates with real pipelines, automations, and terminology — not generic placeholders." },
              ].map(v => (
                <div key={v.title} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                    <v.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-xs text-gray-500">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-16">
            <h2 className="text-xl font-bold mb-6">By the numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "55", label: "Pages built" },
                { value: "19", label: "Dashboard widgets" },
                { value: "64", label: "Pre-built automations" },
                { value: "12", label: "Industry templates" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-sm text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to try it?</h2>
            <p className="text-gray-500 mb-6">14-day free trial. No credit card. Set up in 5 minutes.</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/signup" className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/demo" className="px-6 py-3 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition">
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
