import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex w-[480px] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-bold">sonji<span className="text-violet-200">.</span></Link>
          <h2 className="text-3xl font-bold mt-12 leading-tight">Welcome back.</h2>
          <p className="text-white/60 mt-4 text-sm leading-relaxed">Your dashboard, contacts, deals, and projects are waiting for you.</p>
        </div>
        <div className="relative z-10">
          <p className="text-xs text-white/40">© 2026 Sonji. All rights reserved.</p>
        </div>
      </div>

      {/* Right — Clerk Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></Link>
          <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
        </div>
        <div className="hidden lg:block mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1">Access your Sonji dashboard</p>
        </div>
        <SignIn
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
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
          signUpUrl="/signup"
        />
      </div>
    </div>
  );
}
