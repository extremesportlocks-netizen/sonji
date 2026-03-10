import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-block mb-8">
          <span className="text-2xl font-bold text-gray-900">sonji<span className="text-indigo-500">.</span></span>
        </Link>

        {/* 404 number */}
        <div className="relative mb-6">
          <span className="text-[120px] font-bold text-gray-100 leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard"
            className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm">
            Go to Dashboard
          </Link>
          <Link href="/"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition">
            Back to Home
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-gray-400">
          <Link href="/dashboard/contacts" className="hover:text-indigo-600 transition">Contacts</Link>
          <Link href="/dashboard/deals" className="hover:text-indigo-600 transition">Deals</Link>
          <Link href="/dashboard/settings" className="hover:text-indigo-600 transition">Settings</Link>
          <a href="mailto:hello@sonji.io" className="hover:text-indigo-600 transition">Support</a>
        </div>
      </div>
    </div>
  );
}
