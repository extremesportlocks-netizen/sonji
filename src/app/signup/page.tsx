"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Building2, Check } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", business: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/onboarding";
    }, 1500);
  };

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex w-[480px] bg-indigo-600 flex-col items-center justify-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -right-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 -left-10 w-80 h-80 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white" />
        </div>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <span className="text-2xl font-bold text-white">sonji<span className="text-violet-300">.</span></span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Replace $700/month in subscriptions.</h2>
          <p className="text-indigo-200 text-sm leading-relaxed max-w-xs mx-auto mb-10">
            Everything you need in one place. Set up in 5 minutes. No consultants required.
          </p>

          {/* Feature list */}
          <div className="text-left space-y-4">
            {[
              "Contacts & CRM with custom fields",
              "Visual pipeline & deal tracking",
              "Email marketing & automated sequences",
              "Scheduling & booking pages",
              "Invoicing with Stripe payments",
              "AI-powered insights",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-white/90">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-block mb-10">
            <span className="text-2xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-8">Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="John Doe" value={form.name}
                    onChange={(e) => update("name", e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Acme Inc" value={form.business}
                    onChange={(e) => update("business", e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" placeholder="you@company.com" value={form.email}
                  onChange={(e) => update("email", e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={form.password}
                  onChange={(e) => update("password", e.target.value)} required minLength={8}
                  className="w-full pl-10 pr-11 py-3 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition ${
                      form.password.length >= i * 3
                        ? form.password.length >= 12 ? "bg-emerald-500" : form.password.length >= 8 ? "bg-amber-500" : "bg-red-400"
                        : "bg-gray-200"
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="terms" required className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20 mt-0.5" />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                I agree to the <a href="/terms" className="text-indigo-600 hover:text-indigo-700">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-70">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Start Free Trial <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account? <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
