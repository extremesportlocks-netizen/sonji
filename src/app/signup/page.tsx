import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex w-[480px] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-bold">sonji<span className="text-violet-200">.</span></Link>
          <h2 className="text-3xl font-bold mt-12 leading-tight">One platform.<br />One price.<br />Everything included.</h2>
          <p className="text-white/60 mt-4 text-sm leading-relaxed">CRM, project management, email, SMS, automations, AI insights, and more — set up in 5 minutes.</p>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">19</div>
            <span className="text-sm text-white/70">Dashboard widgets, customizable</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">64</div>
            <span className="text-sm text-white/70">Pre-built automations across 12 industries</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">$0</div>
            <span className="text-sm text-white/70">Hidden fees — the price you see is what you pay</span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-xs text-white/40">Trusted by agencies, med spas, law firms, and more.</p>
        </div>
      </div>

      {/* Right — Clerk Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></Link>
          <p className="text-sm text-gray-500 mt-2">Start your 14-day free trial</p>
        </div>
        <div className="hidden lg:block mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">14-day free trial · No credit card required</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-md",
              card: "shadow-lg border border-gray-100 rounded-2xl",
              headerTitle: "text-gray-900",
              headerSubtitle: "text-gray-500",
              socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 rounded-xl",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm",
              footerActionLink: "text-indigo-600 hover:text-indigo-700",
              formFieldInput: "rounded-xl border-gray-200 focus:ring-indigo-500 focus:border-indigo-500",
            },
          }}
          fallbackRedirectUrl="/onboarding"
          forceRedirectUrl="/onboarding"
          signInUrl="/login"
        />
        <p className="text-xs text-gray-400 mt-6 text-center max-w-sm">
          By signing up, you agree to our <Link href="/terms" className="text-indigo-600 hover:underline">Terms</Link> and <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
