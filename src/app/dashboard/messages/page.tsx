"use client";

import { getActiveIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useModal } from "@/components/modals/modal-provider";
import { useIndustry } from "@/lib/use-industry";
import {
  Search, Plus, Mail, MessageSquare, Phone, Star, Archive,
  Trash2, Reply, Forward, MoreHorizontal, X, Clock, Send,
  ChevronRight, Inbox, CheckCheck, AlertCircle, User,
} from "lucide-react";

// ─── TYPES ───

interface Message {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  channel: "email" | "sms" | "form";
  starred: boolean;
  read: boolean;
  time: string;
  date: string;
}

// ─── DEMO DATA ───

const INDUSTRY_MESSAGES: Record<string, Message[]> = {
  agency_consulting: [
    { id: "m1", from: "Brightview Hotels", fromEmail: "john@brightviewhotels.com", subject: "Re: March PPC Report", preview: "Thanks for sending over the report. The ROAS numbers look great this month, especially on the branded campaigns...", body: "Thanks for sending over the report. The ROAS numbers look great this month, especially on the branded campaigns. Can we schedule a call to discuss scaling the budget for Q2? We're thinking about adding Google Discovery ads.\n\nAlso, the landing page conversion rate jumped to 4.2% — whatever changes you made last week are working.", channel: "email", starred: true, read: false, time: "10:34 AM", date: "Today" },
    { id: "m2", from: "Summit Athletics", fromEmail: "mark@summitathletics.com", subject: "Brand guidelines feedback", preview: "Love the color palette direction. Two notes: can we try a darker navy for the primary instead of the current blue?", body: "Love the color palette direction. Two notes:\n\n1. Can we try a darker navy for the primary instead of the current blue?\n2. The serif font for headings feels a bit formal — can we see a modern sans-serif option?\n\nOtherwise, the mood board is exactly what we envisioned.", channel: "email", starred: false, read: false, time: "9:15 AM", date: "Today" },
    { id: "m3", from: "Meridian Law Group", fromEmail: "amanda@meridianlaw.com", subject: "Website review — a few changes", preview: "The homepage looks fantastic! Just a few tweaks we'd like before we sign off on the final design...", body: "The homepage looks fantastic! Just a few tweaks:\n\n- Attorney bio photos need to be larger on desktop\n- Practice area icons should link to their respective pages\n- Footer needs to include our bar registration numbers\n\nTimeline still looking good for April 1 launch?", channel: "email", starred: false, read: true, time: "Yesterday", date: "Yesterday" },
    { id: "m4", from: "New Lead: Apex Construction", fromEmail: "form@sonji.io", subject: "Contact form submission", preview: "Name: Jake Morrison | Company: Apex Construction | Interest: Social media management for commercial projects", body: "New contact form submission:\n\nName: Jake Morrison\nCompany: Apex Construction\nEmail: jake@apexconstruction.com\nPhone: (239) 555-0198\nInterest: Social media management for commercial projects\nBudget: $2,500-5,000/mo\nNote: 'Referred by Harbor Dental'", channel: "form", starred: false, read: false, time: "Yesterday", date: "Yesterday" },
    { id: "m5", from: "Harbor Dental", fromEmail: "lisa@harbordental.com", subject: "Re: Content calendar for April", preview: "Approved! Please go ahead and schedule all posts. The before/after photos are ready in the shared drive.", body: "Approved! Please go ahead and schedule all posts. The before/after photos are ready in the shared drive.\n\nOne addition — can we add a post about our new teeth whitening special ($199) launching April 15?", channel: "email", starred: false, read: true, time: "2 days ago", date: "Mar 14" },
    { id: "m6", from: "Rocco", fromEmail: "rocco@powermarketing.com", subject: "Sterling Partners — renewal strategy", preview: "Hey, just got off the phone with Sterling. They're happy but hinting at possibly reducing scope. Let's hop on a call...", body: "Hey, just got off the phone with Sterling. They're happy but hinting at possibly reducing scope to save budget. Let's hop on a call before their renewal on April 15 to discuss our counter-strategy.\n\nI'm thinking we show them the attribution report — their organic traffic is up 340% since we started. Hard to argue with that.", channel: "email", starred: true, read: true, time: "2 days ago", date: "Mar 14" },
  ],
  health_wellness: [
    { id: "m1", from: "Jessica Brown", fromEmail: "jessica.b@gmail.com", subject: "Question about injection site", preview: "Hi! I just did my first Tirzepatide injection and have a small red spot at the injection site. Is this normal?", body: "Hi! I just did my first Tirzepatide injection and have a small red spot at the injection site. Is this normal? Also, should I rotate injection sites each week?\n\nThanks!", channel: "email", starred: false, read: false, time: "11:20 AM", date: "Today" },
    { id: "m2", from: "Michael Torres", fromEmail: "m.torres@outlook.com", subject: "Dosage adjustment request", preview: "I've been on Semaglutide for 6 weeks. Lost 12 lbs so far but side effects are manageable. Can we discuss moving up?", body: "I've been on Semaglutide 0.25mg for 6 weeks. Lost 12 lbs so far which is great. Side effects (mild nausea) are manageable now.\n\nCan we discuss moving up to the next dose? I feel like my body has adjusted.", channel: "email", starred: false, read: false, time: "9:45 AM", date: "Today" },
    { id: "m3", from: "Stripe Notification", fromEmail: "notifications@stripe.com", subject: "New payment — Sarah Mitchell $320", preview: "A new payment of $320.00 was received for Tirzepatide Monthly subscription.", body: "New Payment Received\n\nCustomer: Sarah Mitchell\nAmount: $320.00\nPlan: Tirzepatide Monthly\nStatus: Paid\n\nView in Stripe Dashboard", channel: "email", starred: false, read: false, time: "8:30 AM", date: "Today" },
    { id: "m4", from: "David Park", fromEmail: "dpark@gmail.com", subject: "Re: Shipping update", preview: "Got the package yesterday! Everything looks good. Quick question about storing the vials...", body: "Got the package yesterday! Everything looks good and well packaged.\n\nQuick question about storing the vials — should they be refrigerated right away or only after first use?", channel: "email", starred: true, read: true, time: "Yesterday", date: "Yesterday" },
    { id: "m5", from: "MDI Provider Alert", fromEmail: "noreply@mdintegrations.com", subject: "New patient case approved — Emily Chen", preview: "Provider has approved the treatment plan for patient Emily Chen. Prescription is being sent to pharmacy.", body: "Case Update\n\nPatient: Emily Chen\nStatus: Approved\nTreatment: Tirzepatide 6-Month\nProvider: Licensed Physician\n\nPrescription has been submitted to your pharmacy partner.", channel: "email", starred: true, read: true, time: "Yesterday", date: "Yesterday" },
  ],
  ecommerce: [
    { id: "m1", from: "Wayne Barry", fromEmail: "wayne.b@gmail.com", subject: "How do I upgrade to yearly?", preview: "Hey, I've been on monthly for 3 months now and want to switch to the yearly VIP plan. How do I do that?", body: "Hey, I've been on monthly for 3 months now and want to switch to the yearly VIP plan. How do I do that? Also, do I get credit for the months I already paid?", channel: "email", starred: false, read: false, time: "2:15 PM", date: "Today" },
    { id: "m2", from: "Chris Persaud", fromEmail: "(305) 555-0198", subject: "SMS", preview: "Picks were fire today 🔥🔥🔥 4-0 on NCAAB. Thanks bro", body: "Picks were fire today 🔥🔥🔥 4-0 on NCAAB. Thanks bro", channel: "sms", starred: true, read: true, time: "11:30 AM", date: "Today" },
    { id: "m3", from: "Stripe", fromEmail: "notifications@stripe.com", subject: "Payment failed — Andrew Krieman", preview: "The recurring payment of $165.00 for Andrew Krieman (VIP Monthly) failed. Reason: card_declined.", body: "Payment Failed\n\nCustomer: Andrew Krieman\nAmount: $165.00\nPlan: VIP Monthly\nReason: card_declined\nRetry: Scheduled for Mar 18\n\nAction: Update payment method or contact customer.", channel: "email", starred: false, read: false, time: "8:00 AM", date: "Today" },
    { id: "m4", from: "Tyler McLaughlin", fromEmail: "tyler.m@yahoo.com", subject: "Feature request", preview: "Any chance you could add NFL player props to the picks? Would love to see that as a VIP feature.", body: "Any chance you could add NFL player props to the picks? I know it's offseason now but would love to see that as a VIP feature when the season starts.\n\nAlso, the Telegram channel is clutch. Keep it up!", channel: "email", starred: false, read: true, time: "Yesterday", date: "Yesterday" },
  ],
  home_services: [
    { id: "m1", from: "Linda Garcia", fromEmail: "(239) 555-0142", subject: "SMS", preview: "Is there any way to bump up the timeline? We're having a family event April 10 and really want the roof done.", body: "Is there any way to bump up the timeline? We're having a family event April 10 and really want the roof done.", channel: "sms", starred: false, read: false, time: "9:45 AM", date: "Today" },
    { id: "m2", from: "New Lead: Susan Taylor", fromEmail: "form@sonji.io", subject: "Emergency roof leak", preview: "Name: Susan Taylor | Phone: (239) 555-0198 | Issue: Active leak in master bedroom | Note: 'Water coming through ceiling'", body: "Emergency Estimate Request:\n\nName: Susan Taylor\nPhone: (239) 555-0198\nAddress: 1847 Palm Beach Blvd\nIssue: Active leak in master bedroom\nUrgency: EMERGENCY\nNote: 'Water coming through ceiling right now — please call ASAP'", channel: "form", starred: true, read: false, time: "8:12 AM", date: "Today" },
    { id: "m3", from: "Thomas Brown", fromEmail: "thomas.b@outlook.com", subject: "Re: HVAC installation schedule", preview: "Looks good. We'll be home all day Thursday for the install. Do your guys need access to the attic beforehand?", body: "Looks good. We'll be home all day Thursday for the install. Do your guys need access to the attic beforehand?\n\nAlso, can you send me the warranty info for the Carrier unit we picked?", channel: "email", starred: false, read: true, time: "Yesterday", date: "Yesterday" },
    { id: "m4", from: "Google Review Alert", fromEmail: "noreply@google.com", subject: "New review from Barbara Martinez", preview: "⭐⭐⭐⭐⭐ 'Gutters look amazing! Crew was professional and cleaned up perfectly. Will definitely use again.'", body: "New Google Review (5 stars):\n\n'Gutters look amazing! Crew was professional and cleaned up perfectly. Will definitely use them again for all our exterior work.'\n\n— Barbara Martinez", channel: "email", starred: true, read: true, time: "2 days ago", date: "Mar 14" },
  ],
  legal: [
    { id: "m1", from: "Marcus Johnson", fromEmail: "marcus.j@gmail.com", subject: "Documents you requested", preview: "Attached are the medical records and police report. Let me know if you need anything else for the case.", body: "Hi,\n\nAttached are the medical records from Southwest General and the police report from the accident on January 15th. I also included photos of the vehicle damage.\n\nLet me know if you need anything else for the case.\n\nThanks,\nMarcus", channel: "email", starred: false, read: false, time: "11:30 AM", date: "Today" },
    { id: "m2", from: "Sarah Mitchell", fromEmail: "(239) 555-0234", subject: "SMS", preview: "Can we move the Wednesday meeting to Thursday? I need to pick up my daughter from school that day.", body: "Can we move the Wednesday meeting to Thursday? I need to pick up my daughter from school that day.", channel: "sms", starred: false, read: false, time: "10:15 AM", date: "Today" },
    { id: "m3", from: "New Inquiry: Patricia Williams", fromEmail: "form@sonji.io", subject: "Estate planning consultation", preview: "Name: Patricia Williams | Topic: Estate planning — trust setup | Note: 'Husband recently passed, need to update everything'", body: "New Consultation Request:\n\nName: Patricia Williams\nEmail: patricia.w@gmail.com\nPhone: (239) 555-0156\nTopic: Estate planning — trust setup\nPreferred time: Afternoons\nNote: 'Husband recently passed, need to update everything urgently'", channel: "form", starred: true, read: false, time: "9:00 AM", date: "Today" },
  ],
  fitness_gym: [
    { id: "m1", from: "Brandon Lewis", fromEmail: "(305) 555-0167", subject: "SMS", preview: "Hey, loved the intro session yesterday! When can I book my first PT session with Coach Sarah?", body: "Hey, loved the intro session yesterday! When can I book my first PT session with Coach Sarah?", channel: "sms", starred: false, read: false, time: "7:30 AM", date: "Today" },
    { id: "m2", from: "Stephanie Clark", fromEmail: "steph.c@gmail.com", subject: "Re: PT package renewal", preview: "I'm definitely renewing. Can I switch from the 12-pack to the unlimited monthly plan instead?", body: "I'm definitely renewing. Can I switch from the 12-pack to the unlimited monthly plan instead? I've been going 3-4x/week and it would save me money.\n\nAlso, do you have any openings on Saturday mornings with Coach Sarah?", channel: "email", starred: true, read: false, time: "Yesterday", date: "Yesterday" },
    { id: "m3", from: "Class Booking Alert", fromEmail: "system@sonji.io", subject: "HIIT class at capacity", preview: "Monday 6:00 PM HIIT class has reached 25/25 capacity. 3 members are on the waitlist.", body: "Class Alert:\n\nClass: HIIT Burn\nTime: Monday 6:00 PM\nCapacity: 25/25 (FULL)\nWaitlist: 3 members\n\nConsider opening a second session.", channel: "email", starred: false, read: true, time: "Yesterday", date: "Yesterday" },
  ],
  beauty_salon: [
    { id: "m1", from: "Charlotte Davis", fromEmail: "charlotte.d@gmail.com", subject: "Bridal trial — a few changes", preview: "Loved the trial! Two small tweaks: can we go a shade warmer on the highlights, and I want the updo a bit more relaxed?", body: "Loved the trial! Two small tweaks:\n\n1. Can we go a shade warmer on the highlights? The cool blonde was pretty but I want it to match my dress better.\n2. The updo was beautiful but can we make it a bit more relaxed/romantic?\n\nOtherwise, my mom and I are SO excited. Thank you!", channel: "email", starred: true, read: false, time: "10:00 AM", date: "Today" },
    { id: "m2", from: "Amelia Wilson", fromEmail: "(239) 555-0189", subject: "SMS", preview: "Running 10 min late for my 2pm keratin! So sorry, traffic on 41 is terrible today.", body: "Running 10 min late for my 2pm keratin! So sorry, traffic on 41 is terrible today.", channel: "sms", starred: false, read: false, time: "1:50 PM", date: "Today" },
    { id: "m3", from: "New Booking", fromEmail: "system@sonji.io", subject: "Online booking — Harper Garcia", preview: "Harper Garcia booked Blowout + Style for Thursday March 19 at 3:00 PM with Stylist Alex.", body: "New Online Booking:\n\nClient: Harper Garcia\nService: Blowout + Style\nDate: Thursday, March 19\nTime: 3:00 PM\nStylist: Alex\nNotes: 'Same as last time please!'", channel: "form", starred: false, read: true, time: "Yesterday", date: "Yesterday" },
  ],
  real_estate: [
    { id: "m1", from: "Amanda Hill", fromEmail: "amanda.h@gmail.com", subject: "Re: 4521 Bayshore Dr", preview: "We love it! Can we put in an offer today? My pre-approval letter is attached.", body: "We love it! Can we put in an offer today? My pre-approval letter is attached. We're thinking $425K — is that competitive?\n\nAlso, can you check if the seller would include the washer/dryer?", channel: "email", starred: true, read: false, time: "9:30 AM", date: "Today" },
    { id: "m2", from: "Robert Chen", fromEmail: "(239) 555-0178", subject: "SMS", preview: "Had 3 showings today on the waterfront. One couple very interested — coming back Saturday with their parents.", body: "Had 3 showings today on the waterfront. One couple very interested — coming back Saturday with their parents.", channel: "sms", starred: true, read: false, time: "5:30 PM", date: "Today" },
    { id: "m3", from: "Title Company", fromEmail: "closing@firstnationaltitle.com", subject: "Closing docs ready — Williams Estate", preview: "The Williams Estate closing package is ready for review. Please confirm the March 28 closing date.", body: "The Williams Estate closing package is ready for review. All documents have been prepared and are available in the secure portal.\n\nPlease confirm the March 28 closing date at 2:00 PM.\n\nBest,\nFirst National Title", channel: "email", starred: false, read: true, time: "Yesterday", date: "Yesterday" },
  ],
  coaching_education: [
    { id: "m1", from: "Jason Wright", fromEmail: "jason.w@gmail.com", subject: "Session follow-up + question", preview: "Great session today! Quick question about the goal-setting framework — do you have the template you mentioned?", body: "Great session today! Quick question about the goal-setting framework — do you have the template you mentioned? I want to share it with my team.\n\nAlso, I finished the accountability exercises. Attached my reflection notes.", channel: "email", starred: false, read: false, time: "3:00 PM", date: "Today" },
    { id: "m2", from: "Nathan Harris", fromEmail: "form@sonji.io", subject: "VIP Day application", preview: "Name: Nathan Harris | Date preference: March 25 | Focus: Business scaling strategy | Budget: Ready to invest", body: "VIP Day Application:\n\nName: Nathan Harris\nEmail: nathan.h@outlook.com\nDate preference: March 25\nFocus: Business scaling strategy\nCurrent revenue: $350K/year\nGoal: $1M in 12 months\nNote: 'Referred by Jason Wright'", channel: "form", starred: true, read: false, time: "10:00 AM", date: "Today" },
    { id: "m3", from: "Lindsey K.", fromEmail: "(305) 555-0212", subject: "SMS", preview: "Hey coach, sorry I've been MIA. Work got crazy. Can we reschedule our Wednesday session to Friday?", body: "Hey coach, sorry I've been MIA. Work got crazy. Can we reschedule our Wednesday session to Friday?", channel: "sms", starred: false, read: false, time: "Yesterday", date: "Yesterday" },
  ],
  restaurant_food: [
    { id: "m1", from: "Michael Rivera", fromEmail: "form@sonji.io", subject: "Reservation — party of 6", preview: "Name: Michael Rivera | Date: Friday March 20 | Time: 7:30 PM | Party size: 6 | Note: 'Birthday celebration'", body: "New Reservation:\n\nName: Michael Rivera\nDate: Friday, March 20\nTime: 7:30 PM\nParty size: 6\nOccasion: Birthday celebration\nDietary needs: 1 gluten-free, 1 vegetarian\nNote: 'Can we have a corner booth?'", channel: "form", starred: false, read: false, time: "2:00 PM", date: "Today" },
    { id: "m2", from: "Apex Financial Group", fromEmail: "admin@apexfinancial.com", subject: "Corporate lunch — April 12", preview: "We'd like to book catering for 35 people on April 12. Budget is $3,500. Can you send menu options?", body: "We'd like to book catering for 35 people on April 12 for our quarterly team lunch.\n\nBudget: $3,500\nDietary: 4 vegetarian, 2 vegan, 1 gluten-free\nTime: 11:30 AM setup, 12:00 PM service\nLocation: Our office — 1200 Apex Blvd, Suite 400\n\nCan you send menu options?", channel: "email", starred: true, read: false, time: "11:00 AM", date: "Today" },
    { id: "m3", from: "Marcus Rivera", fromEmail: "(239) 555-0156", subject: "SMS", preview: "Hey, can I add grilled salmon to my usual meal prep order this week? And double the rice.", body: "Hey, can I add grilled salmon to my usual meal prep order this week? And double the rice.", channel: "sms", starred: false, read: true, time: "Yesterday", date: "Yesterday" },
  ],
  automotive: [
    { id: "m1", from: "Thomas Brown", fromEmail: "(239) 555-0134", subject: "SMS", preview: "Hey, car is making a weird noise after the timing belt job. Kind of a squealing when I start it cold. Normal?", body: "Hey, car is making a weird noise after the timing belt job. Kind of a squealing when I start it cold. Normal?", channel: "sms", starred: true, read: false, time: "8:00 AM", date: "Today" },
    { id: "m2", from: "Enterprise Fleet", fromEmail: "fleet@enterprisefleet.com", subject: "5 vehicles due for service", preview: "5 vehicles in our SWFL fleet are approaching their 30K mile service interval. Can we schedule a block appointment?", body: "5 vehicles in our SWFL fleet are approaching their 30K mile service interval:\n\n1. 2024 Ford Transit — 29,400 mi\n2. 2024 Ford Transit — 28,800 mi\n3. 2023 Chevy Express — 31,200 mi (overdue)\n4. 2024 Ram ProMaster — 29,100 mi\n5. 2024 Ford Transit — 28,500 mi\n\nCan we schedule a block appointment for next week?", channel: "email", starred: false, read: false, time: "10:30 AM", date: "Today" },
    { id: "m3", from: "Google Review Alert", fromEmail: "noreply@google.com", subject: "New review from Nancy Davis", preview: "⭐⭐⭐⭐⭐ 'Great service! In and out in under 2 hours for my 30K. Fair pricing too.'", body: "New Google Review (5 stars):\n\n'Great service! In and out in under 2 hours for my 30K mile service. Fair pricing and they even washed my car. Will be back!'\n\n— Nancy Davis", channel: "email", starred: true, read: true, time: "Yesterday", date: "Yesterday" },
  ],
  nonprofit: [
    { id: "m1", from: "Robert Chen", fromEmail: "robert.c@gmail.com", subject: "Re: Spring Gala invitation", preview: "We'll be there! Table for 8 please. Also, I'd like to discuss increasing our monthly contribution — can we schedule a call?", body: "We'll be there! Table for 8 please.\n\nAlso, I'd like to discuss increasing our monthly contribution from $500 to $1,000. Been meaning to do this for a while. Can we schedule a call this week?\n\nBest,\nRobert", channel: "email", starred: true, read: false, time: "11:00 AM", date: "Today" },
    { id: "m2", from: "Volunteer Application", fromEmail: "form@sonji.io", subject: "New volunteer — Sarah Lopez", preview: "Name: Sarah Lopez | Interest: Event planning | Availability: Weekends | Note: 'Experienced event coordinator'", body: "New Volunteer Application:\n\nName: Sarah Lopez\nEmail: sarah.l@gmail.com\nPhone: (239) 555-0198\nInterest: Event planning\nAvailability: Weekends\nExperience: 5 years event coordination\nNote: 'Heard about you from Amanda Hill'", channel: "form", starred: false, read: false, time: "9:00 AM", date: "Today" },
    { id: "m3", from: "Community Bank", fromEmail: "partnerships@communitybankfl.com", subject: "Sponsorship inquiry — Spring Gala", preview: "We'd like to explore sponsorship opportunities for the Spring Gala. What levels are available?", body: "We'd like to explore sponsorship opportunities for the Spring Gala.\n\nWhat levels are available? We're particularly interested in the Gold or Platinum tier.\n\nPlease send a sponsorship deck when available.\n\nBest,\nCommunity Bank of FL", channel: "email", starred: false, read: false, time: "Yesterday", date: "Yesterday" },
  ],
};

const DEFAULT_MESSAGES: Message[] = [
  { id: "m1", from: "New Contact", fromEmail: "form@sonji.io", subject: "Contact form submission", preview: "New contact submitted through your website form.", body: "New contact form submission received.", channel: "form", starred: false, read: false, time: "2 hours ago", date: "Today" },
];

// ─── MAIN COMPONENT ───

export default function MessagesPage() {
  const { openModal } = useModal();
  const ic = useIndustry();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");

  useEffect(() => {
    const demoIndustry = getActiveIndustry();
    if (demoIndustry && INDUSTRY_MESSAGES[demoIndustry]) {
      const msgs = INDUSTRY_MESSAGES[demoIndustry];
      setMessages(msgs);
      if (msgs.length > 0) setSelected(msgs[0]);
      return;
    }
    fetch("/api/messages?limit=50").then(r => r.json()).then(data => {
      if (data?.data?.length) {
        const msgs = data.data.map((m: any) => ({
          id: m.id, from: m.contactId || "Unknown", subject: m.subject || "(no subject)",
          preview: (m.body || "").substring(0, 120), body: m.body || "",
          time: new Date(m.createdAt).toLocaleDateString(), channel: m.channel || "email",
          read: m.status !== "new", starred: false,
        }));
        setMessages(msgs);
        if (msgs.length > 0) setSelected(msgs[0]);
      } else {
        setMessages([]);
      }
    }).catch(() => {});
  }, []);

  const filtered = messages.filter(m => {
    if (search) { const q = search.toLowerCase(); if (!m.from.toLowerCase().includes(q) && !m.subject.toLowerCase().includes(q) && !m.preview.toLowerCase().includes(q)) return false; }
    if (filter === "unread" && m.read) return false;
    if (filter === "starred" && !m.starred) return false;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  const markRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    fetch(`/api/messages?id=${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "read" }),
    }).catch(() => {});
  };

  const toggleStar = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
  };

  const channelIcon = (ch: string) => ch === "sms" ? <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> : ch === "form" ? <Inbox className="w-3.5 h-3.5 text-violet-500" /> : <Mail className="w-3.5 h-3.5 text-blue-500" />;

  return (
    <>
      <Header title="Messages" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
          <div className="flex h-full">

            {/* LEFT — Message List */}
            <div className="w-[380px] border-r border-gray-100 flex flex-col">
              {/* Toolbar */}
              <div className="p-3 border-b border-gray-100 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <button onClick={() => openModal("email")} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {[{ key: "all" as const, label: `All (${messages.length})` }, { key: "unread" as const, label: `Unread (${unreadCount})` }, { key: "starred" as const, label: "Starred" }].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${filter === f.key ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto">
                {filtered.map(m => (
                  <button key={m.id} onClick={() => { setSelected(m); markRead(m.id); }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                      selected?.id === m.id ? "bg-indigo-50/50 border-l-2 border-l-indigo-500" : ""
                    } ${!m.read ? "bg-blue-50/30" : ""}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        {channelIcon(m.channel)}
                        <span className={`text-sm ${!m.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{m.from}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {m.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                        {!m.read && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                        <span className="text-[10px] text-gray-400">{m.time}</span>
                      </div>
                    </div>
                    <p className={`text-xs ${!m.read ? "font-medium text-gray-800" : "text-gray-600"} truncate`}>{m.subject}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{m.preview}</p>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="p-8 text-center"><p className="text-sm text-gray-400">No messages</p></div>
                )}
              </div>
            </div>

            {/* RIGHT — Message Detail */}
            <div className="flex-1 flex flex-col">
              {selected ? (
                <>
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">{selected.from[0]}</span>
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-gray-900">{selected.from}</h2>
                          <p className="text-xs text-gray-400">{selected.fromEmail} · {selected.date} at {selected.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleStar(selected.id)} className={`p-2 rounded-lg transition ${selected.starred ? "text-amber-400 bg-amber-50" : "text-gray-400 hover:bg-gray-100"}`}>
                          <Star className={`w-4 h-4 ${selected.starred ? "fill-amber-400" : ""}`} />
                        </button>
                        <button onClick={() => openModal("email", { prefillTo: selected.fromEmail, prefillSubject: `Re: ${selected.subject}` })} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                          <Reply className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{selected.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {channelIcon(selected.channel)}
                      <span className="text-xs text-gray-400 capitalize">{selected.channel === "form" ? "Form Submission" : selected.channel}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {selected.body}
                    </div>
                  </div>

                  {/* Quick Reply */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Type a quick reply..."
                        className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                        <Send className="w-4 h-4" /> Reply
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Select a message to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
