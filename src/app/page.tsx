export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold tracking-tight text-gray-900">
            sonji<span className="text-indigo-500">.</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition">Pricing</a>
            <a href="#faq" className="hover:text-gray-900 transition">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition hidden sm:block">
              Log in
            </a>
            <a
              href="/signup"
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
            Stop overpaying for tools you barely use
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            The CRM that<br />
            <span className="text-indigo-600">just works.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            One tool. One price. Contacts, pipeline, email, scheduling, invoicing, 
            and more — all included. Set up in 5 minutes. No hidden fees. No consultants needed.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-base transition shadow-lg shadow-indigo-500/25"
            >
              Start Free Trial
            </a>
            <a
              href="#features"
              className="px-8 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg text-base transition border border-gray-200"
            >
              See Features
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            No credit card required &middot; 14-day free trial &middot; Cancel anytime
          </p>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-6">
            Replacing tools your team already knows
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-gray-300 text-lg font-semibold">
            <span>Salesforce</span>
            <span>HubSpot</span>
            <span>GoHighLevel</span>
            <span>Calendly</span>
            <span>Mailchimp</span>
            <span>FreshBooks</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
              Everything you need
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              One platform. Zero bloat.
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Every feature built to be best-in-class, not just checked off a list.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "👥", title: "Contacts & CRM", desc: "Manage contacts, custom fields, tags, activity timelines. Import from anywhere." },
              { icon: "📊", title: "Pipeline & Deals", desc: "Visual Kanban boards. Drag deals through stages. Track value and forecast revenue." },
              { icon: "📝", title: "Intake Forms", desc: "Drag-and-drop builder with conditional logic. Embed anywhere. Auto-create contacts." },
              { icon: "📧", title: "Email Marketing", desc: "Beautiful templates, segmented campaigns, automated sequences, open/click tracking." },
              { icon: "📅", title: "Scheduling", desc: "Booking pages, availability rules, confirmations, reschedule. Embed on your site." },
              { icon: "💰", title: "Invoicing", desc: "Create, send, and track invoices. Accept payments via Stripe. Recurring billing." },
              { icon: "💬", title: "Unified Inbox", desc: "Every email, SMS, and form submission in one timeline per contact." },
              { icon: "⚡", title: "Automations", desc: "Visual workflow builder. Triggers, conditions, actions. Set it and forget it." },
              { icon: "🤖", title: "AI Assistant", desc: "Draft emails, summarize contacts, analyze form data. Powered by Claude." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
            Honest pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            One price. Everything included.
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            No per-SMS charges. No AI usage fees. No surprise overages. 
            The price you see is the price you pay. Period.
          </p>
          <div className="mt-12 inline-block bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Coming soon</p>
            <p className="text-5xl font-bold text-gray-900">Simple tiers</p>
            <p className="mt-3 text-gray-500">Starter &middot; Growth &middot; Scale</p>
            <a
              href="/signup"
              className="mt-8 inline-block px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
            >
              Join the Waitlist
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Ready to simplify everything?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Join the businesses switching from $700/month in subscriptions to one tool that works.
          </p>
          <a
            href="/signup"
            className="mt-8 inline-block px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-base transition shadow-lg shadow-indigo-500/25"
          >
            Get Started Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold text-gray-900">
            sonji<span className="text-indigo-500">.</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="/privacy" className="hover:text-gray-600 transition">Privacy</a>
            <a href="/terms" className="hover:text-gray-600 transition">Terms</a>
            <a href="mailto:hello@sonji.io" className="hover:text-gray-600 transition">Contact</a>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Sonji. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
