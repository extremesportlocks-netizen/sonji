"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import InteractiveHeroDemo from "@/components/interactive-hero-demo";
import {
  ArrowRight, Users, BarChart3, Mail, Calendar, Zap, Bot, FileText,
  DollarSign, MessageSquare, Heart, Dumbbell, Scissors, Briefcase,
  Home, Sparkles, Shield, Gauge, Lock, Infinity,
} from "lucide-react";

/* ═══ SCROLL REVEAL ═══ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("revealed"); obs.unobserve(el); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal-item ${className}`} style={{ transitionDelay: `${delay}s` }}>{children}</div>;
}

/* ═══ DATA ═══ */
const features = [
  { icon: Users, title: "Contacts & CRM", desc: "Custom fields, tags, full activity timelines. Import from Stripe or CSV in seconds.", color: "bg-blue-50 text-blue-600" },
  { icon: BarChart3, title: "Pipeline & Deals", desc: "Visual Kanban boards. Drag deals through stages. Track value and forecast revenue.", color: "bg-indigo-50 text-indigo-600" },
  { icon: Briefcase, title: "Project Management", desc: "Track time, budgets, margins, and team allocation. Deal closes → project begins. Replace Monday.com.", color: "bg-violet-50 text-violet-600" },
  { icon: Mail, title: "Email & SMS", desc: "Campaigns, drip sequences, reminders. Bring your own Twilio — no markup, full savings.", color: "bg-emerald-50 text-emerald-600" },
  { icon: Zap, title: "Automations", desc: "64+ industry-specific workflows. Trigger on any event — new lead, payment, missed meeting.", color: "bg-amber-50 text-amber-600" },
  { icon: Bot, title: "AI + Ghosting Alerts", desc: "Predictive cooling detection, smart campaigns, contact insights. AI catches what you miss.", color: "bg-purple-50 text-purple-600" },
  { icon: DollarSign, title: "Invoicing & Payments", desc: "Create, send, track invoices. Stripe-powered payments. Real revenue data — not fake dashboards.", color: "bg-rose-50 text-rose-600" },
  { icon: Calendar, title: "Scheduling", desc: "Calendar view, booking pages, availability rules, automated reminders. Replace Calendly.", color: "bg-cyan-50 text-cyan-600" },
  { icon: MessageSquare, title: "Unified Inbox", desc: "Every email, SMS, and form submission in one 3-panel inbox per contact.", color: "bg-orange-50 text-orange-600" },
];

const industries = [
  { icon: Heart, name: "Health & Wellness", desc: "Patient intake, treatment tracking, Botox rebooking, telehealth workflows.", color: "text-rose-500 bg-rose-50", pipeline: ["Intake", "Treatment", "Follow-up"] },
  { icon: Briefcase, name: "Agencies & Consulting", desc: "Project management, retainer tracking, scope creep detection, client onboarding.", color: "text-indigo-500 bg-indigo-50", pipeline: ["Discovery", "Proposal", "Active"] },
  { icon: Home, name: "Real Estate", desc: "Lead pipeline, showing scheduler, commission tracking, anniversary CMA.", color: "text-emerald-500 bg-emerald-50", pipeline: ["Lead", "Showing", "Closed"] },
  { icon: Dumbbell, name: "Fitness & Gym", desc: "Member management, class scheduling, at-risk detection, trial conversion.", color: "text-orange-500 bg-orange-50", pipeline: ["Trial", "Active", "At Risk"] },
  { icon: Scissors, name: "Beauty & Salon", desc: "Appointments, rebooking reminders, bridal packages, loyalty tracking.", color: "text-pink-500 bg-pink-50", pipeline: ["Booked", "Served", "Rebook"] },
  { icon: Sparkles, name: "Plus 7 More", desc: "Legal, coaching, home services, restaurants, automotive, nonprofits, e-commerce.", color: "text-gray-500 bg-gray-50", pipeline: ["Lead", "Active", "Won"] },
];

const testimonials = [
  { quote: "The dashboard alone is worth it. I can see my entire pipeline, revenue, and team activity in one glance. It's like having a $50K custom tool at a fraction of the cost.", name: "Jessica M.", role: "Owner, Glow Med Spa", color: "bg-indigo-500" },
  { quote: "We switched from GoHighLevel and saved $400/month. But the real win is the automation — it handles follow-ups before my team even starts their day.", name: "Marcus R.", role: "Founder, Apex Consulting", color: "bg-emerald-500" },
  { quote: "Setup took five minutes. FIVE. Our Salesforce migration took three months. Sonji just works exactly how our business works, right out of the box.", name: "Sarah L.", role: "Managing Partner, Bright Realty", color: "bg-violet-500" },
];

const workflowSteps = [
  { type: "trigger", color: "bg-amber-50 text-amber-600 border-amber-200", label: "Trigger", labelColor: "text-amber-600", title: "New lead submitted via intake form", desc: "Contact form, landing page, or embedded widget — any source", icon: "⚡" },
  { type: "ai", color: "bg-purple-50 text-purple-600 border-purple-200", label: "AI Analysis", labelColor: "text-purple-600", title: "AI qualifies and scores the lead", desc: "Evaluates business size, service need, and urgency — assigns a score from 1 to 100", icon: "✦" },
  { type: "action", color: "bg-blue-50 text-blue-600 border-blue-200", label: "Action", labelColor: "text-blue-600", title: "Route to the right team member", desc: "High-score leads go to sales. Medium leads enter nurture. Low leads get auto-response.", icon: "→" },
  { type: "result", color: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Result", labelColor: "text-emerald-600", title: "Personalized follow-up sent in under 60 seconds", desc: "AI-drafted email + SMS. Calendar link included. CRM record created with full attribution.", icon: "✓" },
];

const logos = ["Glow Med Spa", "Apex Consulting", "Bright Realty", "Summit Fitness", "Nova Salon", "Peak Contractors", "Harbor Legal", "Zenith Health"];

/* ═══ PAGE ═══ */
export default function HomePage() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <style jsx global>{`
        .reveal-item{opacity:0;transform:translateY(30px);transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1),transform 0.8s cubic-bezier(0.16,1,0.3,1)}
        .reveal-item.revealed{opacity:1;transform:translateY(0)}
        @keyframes scroll-logos{to{transform:translateX(-50%)}}
        @keyframes hero-fade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}
        .hero-a{animation:hero-fade 0.8s ease both}
        .hero-a1{animation-delay:0.1s}.hero-a2{animation-delay:0.2s}.hero-a3{animation-delay:0.3s}.hero-a4{animation-delay:0.45s}
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled?"bg-[#FAFAFA]/95 shadow-sm":"bg-[#FAFAFA]/80"} backdrop-blur-xl border-b border-gray-200/50`}>
        <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            sonji<span className="text-violet-500">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#platform" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Platform</a>
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Features</a>
            <Link href="/compare" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Compare</Link>
            <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">About</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Pricing</Link>
            <a href="#customers" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Customers</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition">Sign in</Link>
            <Link href="/signup" className="text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-5 py-2.5 rounded-[10px] transition hover:-translate-y-px hover:shadow-md">Start for free</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-[140px] pb-20 px-8 text-center relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(99,102,241,0.04)_0%,transparent_70%)] pointer-events-none" />
        <div className="hero-a inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 mb-8">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" style={{animation:"pulse-dot 2s infinite"}} />
          Now with AI-powered automation
        </div>
        <h1 className="hero-a hero-a1 text-[clamp(42px,6vw,72px)] font-extrabold tracking-[-2.5px] leading-[1.05] max-w-[800px] mx-auto mb-6">
          The CRM that{" "}<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">just works.</span>
        </h1>
        <p className="hero-a hero-a2 text-lg text-gray-500 max-w-[540px] mx-auto mb-10 leading-relaxed">
          One tool. One price. Contacts, pipeline, email, scheduling, invoicing, and AI — all included. Set up in 5 minutes. No hidden fees.
        </p>
        <div className="hero-a hero-a3 flex items-center justify-center gap-3 flex-wrap mb-4">
          <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white font-semibold text-[15px] rounded-xl hover:bg-gray-800 hover:-translate-y-px hover:shadow-lg transition">Start for free</Link>
          <a href="#platform" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-semibold text-[15px] rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow transition">See the platform <ArrowRight className="w-4 h-4" /></a>
        </div>
        <p className="hero-a hero-a3 text-sm text-gray-400">No credit card required · 14-day free trial · Cancel anytime</p>

        {/* INTERACTIVE HERO DEMO */}
        <div className="hero-a hero-a4">
          <InteractiveHeroDemo />
        </div>
      </section>

      {/* ═══ LOGO BAR ═══ */}
      <div className="py-14 text-center overflow-hidden">
        <p className="text-[13px] text-gray-400 font-medium uppercase tracking-[2px] mb-8">Trusted by businesses across industries</p>
        <div className="overflow-hidden"><div className="flex gap-12 w-max" style={{animation:"scroll-logos 30s linear infinite"}}>
          {[...logos,...logos].map((n,i)=>(<span key={i} className="text-base font-bold text-gray-300 whitespace-nowrap tracking-tight hover:text-gray-500 transition cursor-default select-none">{n}</span>))}
        </div></div>
      </div>

      {/* ═══ [01] PLATFORM ═══ */}
      <section className="py-24 px-8" id="platform">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <p className="text-[13px] font-semibold font-mono text-indigo-600 mb-2 flex items-center gap-3">[01]<span className="h-px flex-1 max-w-[60px] bg-gray-200"/></p>
            <p className="text-xs uppercase tracking-[2px] text-gray-400 font-semibold mb-3">Powerful platform</p>
            <h2 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-tight leading-[1.1] mb-4">Your business at<br/>full throttle.</h2>
            <p className="text-[17px] text-gray-500 max-w-[560px] leading-relaxed">CRM, project management, AI automations, and predictive analytics — all in one platform. 19 dashboard widgets. 64 pre-built automations. 12 industry templates. No hidden fees.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-4 mt-12">
            {[
              {icon:"⚡",title:"Automate everything",desc:"Build workflows that trigger on any event — new lead, payment received, missed appointment. Route leads, send follow-ups, update records. Zero manual work.",bg:"bg-blue-50 text-blue-600"},
              {icon:"✦",title:"Deploy AI",desc:"AI chatbot answers questions 24/7. AI generates email copy, qualifies leads, and scores prospects. Draft entire campaigns with one click.",bg:"bg-purple-50 text-purple-600"},
              {icon:"◉",title:"Email & SMS built in",desc:"Send campaigns, drip sequences, appointment reminders, and review requests. No Mailchimp. No Twilio. Everything in one place.",bg:"bg-emerald-50 text-emerald-600"},
              {icon:"◈",title:"Powerful reporting",desc:"Revenue charts, conversion funnels, UTM attribution, pipeline analysis. Real-time data visualized in dashboards that look like they cost $50K.",bg:"bg-amber-50 text-amber-600"},
            ].map((f,i)=>(<Reveal key={f.title} delay={i*0.1}><div className="bg-white border border-gray-100 rounded-[20px] p-8 hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5 ${f.bg}`}>{f.icon}</div>
              <h3 className="text-lg font-bold tracking-tight mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div></Reveal>))}
          </div>

          {/* WORKFLOW DEMO */}
          <Reveal><div className="mt-12 bg-white border border-gray-100 rounded-[28px] p-10">
            <div className="mb-6"><h3 className="text-lg font-bold tracking-tight mb-1">AI-Powered Lead Workflow</h3><p className="text-sm text-gray-400">See how a new lead flows through your automated pipeline</p></div>
            <div className="space-y-0">
              {workflowSteps.map((s,i)=>(<Reveal key={s.label} delay={i*0.15}><div className={`flex items-start gap-5 py-5 ${i<workflowSteps.length-1?"border-b border-gray-100":""}`}>
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-base flex-shrink-0 border ${s.color}`}>{s.icon}</div>
                <div><p className={`text-[10px] uppercase tracking-[1.5px] font-semibold mb-1 ${s.labelColor}`}>{s.label}</p><p className="text-[15px] font-semibold text-gray-900 mb-0.5">{s.title}</p><p className="text-[13px] text-gray-400">{s.desc}</p></div>
              </div></Reveal>))}
            </div>
          </div></Reveal>
        </div>
      </section>

      {/* ═══ [02] INDUSTRIES ═══ */}
      <section className="py-24 px-8 bg-white" id="features">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <p className="text-[13px] font-semibold font-mono text-indigo-600 mb-2 flex items-center gap-3">[02]<span className="h-px flex-1 max-w-[60px] bg-gray-200"/></p>
            <p className="text-xs uppercase tracking-[2px] text-gray-400 font-semibold mb-3">Custom-tailored</p>
            <h2 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-tight leading-[1.1] mb-4">Built for your industry.<br/>Not everyone else&apos;s.</h2>
            <p className="text-[17px] text-gray-500 max-w-[560px] leading-relaxed">Every deployment is configured for your business. A roofing company gets a different CRM than a med spa. Your workflows, your pipeline stages, your way.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {industries.map((ind,i)=>{const Icon=ind.icon;return(<Reveal key={ind.name} delay={i*0.08}><div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-7 hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${ind.color}`}><Icon className="w-5 h-5"/></div>
              <h3 className="text-base font-bold tracking-tight mb-2">{ind.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{ind.desc}</p>
              <div className="bg-white border border-gray-100 rounded-lg p-3 font-mono text-xs text-gray-400">
                <div className="flex items-center justify-between">{ind.pipeline.map((stage,j)=>(<span key={stage} className="flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${j===0?"bg-indigo-500":j===1?"bg-amber-500":"bg-emerald-500"}`}/>{stage}{j<ind.pipeline.length-1&&<span className="ml-2 text-gray-300">→</span>}</span>))}</div>
              </div>
            </div></Reveal>);})}
          </div>
        </div>
      </section>

      {/* ═══ [03] FEATURES ═══ */}
      <section className="py-24 px-8">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <p className="text-[13px] font-semibold font-mono text-indigo-600 mb-2 flex items-center gap-3">[03]<span className="h-px flex-1 max-w-[60px] bg-gray-200"/></p>
            <p className="text-xs uppercase tracking-[2px] text-gray-400 font-semibold mb-3">Everything included</p>
            <h2 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-tight leading-[1.1] mb-4">One platform.<br/>Zero bloat.</h2>
            <p className="text-[17px] text-gray-500 max-w-[560px] leading-relaxed">Every feature built to be best-in-class, not just checked off a list. No add-ons, no per-feature pricing, no nickel-and-diming.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {features.map((f,i)=>{const Icon=f.icon;return(<Reveal key={f.title} delay={i*0.06}><div className="bg-white border border-gray-100 rounded-[20px] p-7 hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}><Icon className="w-5 h-5"/></div>
              <h3 className="text-base font-bold tracking-tight mb-2 group-hover:text-indigo-600 transition">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div></Reveal>);})}
          </div>
        </div>
      </section>

      {/* ═══ [04] SCALE ═══ */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <p className="text-[13px] font-semibold font-mono text-indigo-600 mb-2 flex items-center gap-3">[04]<span className="h-px flex-1 max-w-[60px] bg-gray-200"/></p>
            <p className="text-xs uppercase tracking-[2px] text-gray-400 font-semibold mb-3">Built for scale</p>
            <h2 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-tight leading-[1.1] mb-4">Grow without limits.</h2>
            <p className="text-[17px] text-gray-500 max-w-[560px] leading-relaxed">Enterprise-grade infrastructure with startup speed. Your CRM scales from 10 customers to 10,000 without breaking a sweat.</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[{value:"99.9%",label:"Uptime SLA",color:"text-indigo-600"},{value:"<50ms",label:"API Latency",color:"text-emerald-600"},{value:"256-bit",label:"SSL Encryption",color:"text-violet-600"},{value:"∞",label:"Contacts",color:"text-amber-600"}].map((s,i)=>(
              <Reveal key={s.label} delay={i*0.1}><div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-7 text-center hover:border-gray-200 hover:shadow transition">
                <p className={`text-4xl font-extrabold font-mono tracking-tight mb-1 ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
              </div></Reveal>
            ))}
          </div>
          <Reveal><div className="mt-8 bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-5">◎</div>
                <h3 className="text-lg font-bold tracking-tight mb-2">Your brand. Your platform.</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Custom domain, your logo, your colors. Clients see your brand — not ours. Dashboard, login, emails, and SMS all carry your identity. White-label from day one.</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 font-mono text-xs">
                <div className="flex items-center gap-2.5 mb-4"><div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center text-white text-[9px] font-extrabold">YB</div><span className="text-sm font-semibold text-gray-900">Your Brand CRM</span></div>
                <div className="space-y-1.5 text-gray-400"><p>✓ Custom domain: app.yourbrand.com</p><p>✓ Branded login & dashboard</p><p>✓ Custom email sender identity</p><p>✓ Your colors, logo, typography</p></div>
              </div>
            </div>
          </div></Reveal>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-8" id="customers">
        <div className="max-w-[1100px] mx-auto">
          <Reveal><div className="text-center mb-12"><h2 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-tight leading-[1.1]">Built for businesses<br/>that move fast.</h2></div></Reveal>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t,i)=>(<Reveal key={t.name} delay={i*0.1}><div className="bg-white border border-gray-100 rounded-[20px] p-7 hover:border-gray-200 hover:shadow-md transition">
              <p className="text-[15px] text-gray-600 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-sm font-bold ${t.color}`}>{t.name.split(" ").map(n=>n[0]).join("")}</div>
                <div><p className="text-sm font-semibold text-gray-900">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
              </div>
            </div></Reveal>))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-[1100px] mx-auto text-center">
          <Reveal>
            <p className="text-[13px] font-semibold font-mono text-indigo-600 mb-2">[Pricing]</p>
            <h2 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-tight leading-[1.1] mb-4">Simple, transparent<br/>pricing.</h2>
            <p className="text-[17px] text-gray-500 max-w-[560px] mx-auto mb-12">No hidden fees. No per-message charges. Start free, upgrade when you&apos;re ready.</p>
          </Reveal>
          <Reveal><div className="grid md:grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-[28px] overflow-hidden text-left">
            {[
              {name:"Starter",price:"$99",desc:"Everything a small team needs to get organized.",features:["2,500 contacts","3 team members","Email marketing (5K/mo)","1 pipeline","Intake forms","Scheduling","Basic automations"]},
              {name:"Growth",price:"$199",desc:"For growing businesses that need more power.",popular:true,features:["25,000 contacts","15 team members","Email + SMS (BYOK)","Unlimited pipelines","AI assistant + Ghosting Alerts","Project management","Automation builder","Custom domain"]},
              {name:"Scale",price:"$349",desc:"Full platform with white-label and API access.",features:["Unlimited contacts","Unlimited team","Everything in Growth","Full white-label","API access","Affiliate system","Priority support","Custom integrations"]},
            ].map(plan=>(<div key={plan.name} className={`bg-white p-8 relative ${plan.popular?"bg-gradient-to-b from-indigo-50/30 to-white":""}`}>
              {plan.popular&&<span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-1 rounded-md">Popular</span>}
              <p className="text-xs uppercase tracking-[1.5px] text-gray-400 font-semibold mb-3">{plan.name}</p>
              <p className="text-4xl font-extrabold font-mono tracking-tight mb-1">{plan.price}<span className="text-sm font-medium text-gray-400 tracking-normal">/mo</span></p>
              <p className="text-sm text-gray-400 mb-6">{plan.desc}</p>
              <Link href="/signup" className={`block w-full text-center py-3 text-sm font-semibold rounded-[10px] transition mb-6 ${plan.popular?"bg-indigo-600 text-white hover:bg-indigo-700":"bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow"}`}>
                {plan.name==="Scale"?"Talk to sales":"Start free trial"}
              </Link>
              <ul className="space-y-2.5">{plan.features.map(f=>(<li key={f} className="flex items-start gap-2 text-sm text-gray-600"><span className="text-indigo-600 font-bold mt-px">✓</span>{f}</li>))}</ul>
            </div>))}
          </div></Reveal>
          <Reveal><p className="mt-6 text-sm text-gray-400">All plans include a 14-day free trial. No credit card required. <Link href="/pricing" className="text-indigo-600 hover:text-indigo-700 font-medium">See full comparison →</Link></p></Reveal>
        </div>
      </section>

      {/* ═══ DARK CTA ═══ */}
      <section className="py-24 px-8">
        <div className="max-w-[1100px] mx-auto"><Reveal><div className="bg-gray-900 rounded-[28px] py-20 px-12 text-center relative overflow-hidden">
          <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none"/>
          <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(139,92,246,0.1),transparent_70%)] pointer-events-none"/>
          <h2 className="text-[clamp(32px,4vw,48px)] font-extrabold text-white tracking-tight leading-[1.1] mb-4 relative">Start with a free CRM.<br/>Upgrade when you&apos;re ready.</h2>
          <p className="text-[17px] text-white/50 mb-9 relative">No credit card required. Set up in minutes. Cancel anytime.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap relative">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[15px] rounded-xl transition shadow-[0_4px_12px_rgba(99,102,241,0.25)]">Start for free</Link>
            <a href="mailto:hello@sonji.io" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-[15px] rounded-xl border border-white/15 transition">Talk to sales</a>
          </div>
        </div></Reveal></div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16 px-8 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12">
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-3">sonji<span className="text-violet-500">.</span></div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[280px]">The all-in-one CRM built for businesses that want to stop juggling tools and start growing. One platform, one price, zero complexity.</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[1.5px] text-gray-400 font-semibold mb-4">Platform</h4>
            <div className="space-y-2.5">{["Dashboard","Contacts","Pipeline","Email & SMS","Automations","AI Assistant"].map(l=>(<a key={l} href="#platform" className="block text-sm text-gray-500 hover:text-gray-900 transition">{l}</a>))}</div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[1.5px] text-gray-400 font-semibold mb-4">Industries</h4>
            <div className="space-y-2.5">{["Health & Wellness","Agencies","Real Estate","Fitness & Gym","Beauty & Salon","Home Services","Legal","Coaching","Restaurants","Automotive","Nonprofits","E-Commerce"].map(l=>(<a key={l} href="#features" className="block text-sm text-gray-500 hover:text-gray-900 transition">{l}</a>))}</div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[1.5px] text-gray-400 font-semibold mb-4">Company</h4>
            <div className="space-y-2.5">
              <Link href="/pricing" className="block text-sm text-gray-500 hover:text-gray-900 transition">Pricing</Link>
              <Link href="/compare" className="block text-sm text-gray-500 hover:text-gray-900 transition">Compare</Link>
              <Link href="/roi" className="block text-sm text-gray-500 hover:text-gray-900 transition">ROI Calculator</Link>
              <Link href="/about" className="block text-sm text-gray-500 hover:text-gray-900 transition">About</Link>
              <Link href="/demo" className="block text-sm text-gray-500 hover:text-gray-900 transition">Demo</Link>
              <Link href="/login" className="block text-sm text-gray-500 hover:text-gray-900 transition">Login</Link>
              <a href="mailto:hello@sonji.io" className="block text-sm text-gray-500 hover:text-gray-900 transition">Contact</a>
              <a href="/privacy" className="block text-sm text-gray-500 hover:text-gray-900 transition">Privacy Policy</a>
              <a href="/terms" className="block text-sm text-gray-500 hover:text-gray-900 transition">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto mt-12 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between text-sm text-gray-400">
          <span>© 2026 Sonji. All rights reserved.</span>
          <span>Built by ESL Consulting LLC</span>
        </div>
      </footer>
    </div>
  );
}
