"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  Phone,
  Video,
  CheckSquare,
  ListPlus,
  Pencil,
  MapPin,
  Clock,
  Globe,
  Heart,
  Tag,
  Building2,
  Users,
  Calendar,
  StickyNote,
  UserCheck,
  ArrowUpRight,
  ExternalLink,
  Copy,
  MoreHorizontal,
} from "lucide-react";

// ────────────────────────────────────
// MOCK CONTACT DATA
// ────────────────────────────────────

const contact = {
  id: "1",
  firstName: "Mason",
  lastName: "Thompson",
  title: "VP of Operations",
  company: "Vertex Partners",
  avatar: "MT",
  location: "New York, NY",
  email: "mason@vertexpartners.com",
  emailWork: "m.thompson@vertexpartners.com",
  phone: "+1 (555) 234-5678",
  phoneMobile: "+1 (555) 987-6543",
  phoneLabels: ["Work", "Mobile"],
  address: "350 5th Avenue, Suite 4400, New York, NY 10118",
  lifecycleStage: "Customer",
  status: "Active",
  preferredContact: "Email",
  localTime: "11:58 PM EST",
  localDate: "March 10, 2026",
  languages: "English",
  source: "Inbound — Website",
  description: "Mason is the VP of Operations at Vertex Partners. He is responsible for overseeing the company's operational strategy and managing a team of 35. Key decision-maker for technology procurement and vendor relationships.",
  tags: ["Enterprise", "Q1 Priority", "Decision Maker"],
  customFields: {
    "Annual Budget": "$500K+",
    "Team Size": "35",
    "Last NPS Score": "9/10",
  },
};

const company = {
  name: "Vertex Partners",
  logo: "VP",
  description: "Vertex Partners is a management consulting firm specializing in digital transformation and operational excellence for mid-market companies.",
  website: "vertexpartners.com",
  foundedYear: "2014",
  employees: "420 Employees",
  subsidiaries: "3 Subsidiaries",
  revenue: "$52M ARR",
  industry: ["Consulting", "Management"],
  keywords: ["Digital Transformation", "Operations", "Strategy", "Enterprise", "B2B"],
};

const activities = [
  { type: "call", title: "Call", desc: "Discussed pricing and timeline for custom integration project", time: "Jul 4, 2025 at 12:00", icon: Phone },
  { type: "meeting", title: "Meeting", desc: "Met with Annual Software License review — agreed on renewal terms", time: "Jun 30, 2025 at 17:50", icon: Users },
  { type: "note", title: "Note", desc: "Note about Enterprise Platform Migration — needs exec approval by Q3", time: "May 25, 2025 at 13:00", icon: StickyNote },
  { type: "followup", title: "Follow-up", desc: "Follow-up with Consulting Services Package — sent revised SOW", time: "Apr 10, 2025 at 08:15", icon: UserCheck },
  { type: "email", title: "Email", desc: "Sent Q2 proposal deck with updated pricing tiers and implementation timeline", time: "Mar 15, 2025 at 10:30", icon: Mail },
  { type: "call", title: "Call", desc: "Initial discovery call — identified 3 key pain points in current workflow", time: "Feb 20, 2025 at 14:00", icon: Phone },
];

const tasks = [
  { title: "Follow up with Mason Thompson", desc: "Send a follow-up email to discuss the next steps for the Enterprise Platform Migration deal.", due: "Mar 5, 2025 at 16:30", status: "In Progress", priority: "High" },
  { title: "Prepare compliance documentation", desc: "Compile SOC 2 and ISO 27001 compliance documentation for TechVentures CFO review.", due: "Feb 20, 2025 at 11:45", status: "Todo", priority: "Medium" },
  { title: "Schedule quarterly business review", desc: "Set up QBR for Q2 with Mason and the Vertex leadership team.", due: "Apr 1, 2025 at 09:00", status: "Todo", priority: "Low" },
];

const deals = [
  { title: "Enterprise Platform Migration", stage: "Proposal Sent", value: "$120,000", close: "Jan 10, 2026" },
  { title: "Annual Software License", stage: "Closed Won", value: "$45,000", close: "Mar 30, 2026" },
];

// ────────────────────────────────────
// HELPERS
// ────────────────────────────────────

const activityStyles: Record<string, { bg: string; color: string }> = {
  call: { bg: "bg-blue-50", color: "text-blue-600" },
  meeting: { bg: "bg-violet-50", color: "text-violet-600" },
  note: { bg: "bg-amber-50", color: "text-amber-600" },
  followup: { bg: "bg-rose-50", color: "text-rose-500" },
  email: { bg: "bg-emerald-50", color: "text-emerald-600" },
};

const priorityStyles: Record<string, string> = {
  High: "bg-red-50 text-red-600 border-red-200",
  Medium: "bg-amber-50 text-amber-600 border-amber-200",
  Low: "bg-gray-50 text-gray-500 border-gray-200",
};

const statusBadgeStyles: Record<string, string> = {
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  "Todo": "bg-gray-50 text-gray-600 border-gray-200",
  "Done": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const dealStageStyles: Record<string, string> = {
  "Proposal Sent": "bg-violet-50 text-violet-700",
  "Closed Won": "bg-emerald-50 text-emerald-700",
  "Closed Lost": "bg-red-50 text-red-600",
  "Lead": "bg-indigo-50 text-indigo-700",
  "Sales Qualified": "bg-blue-50 text-blue-700",
};

// ────────────────────────────────────
// CONTACT DETAIL PAGE
// ────────────────────────────────────

export default function ContactDetailPage() {
  const [activeTab, setActiveTab] = useState<"activity" | "tasks" | "deals" | "email">("activity");
  const tabs = [
    { key: "activity", label: "Activity", count: activities.length },
    { key: "tasks", label: "Tasks", count: tasks.length },
    { key: "deals", label: "Deals", count: deals.length },
    { key: "email", label: "Email", count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/contacts" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <span className="text-sm text-gray-400">/</span>
            <Link href="/dashboard/contacts" className="text-sm text-gray-500 hover:text-gray-700 transition">
              Contacts
            </Link>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-900">Contact Details</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Send Email">
              <Mail className="w-[18px] h-[18px]" />
            </button>
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Call">
              <Phone className="w-[18px] h-[18px]" />
            </button>
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Video Call">
              <Video className="w-[18px] h-[18px]" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <CheckSquare className="w-4 h-4" /> Create task
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <ListPlus className="w-4 h-4" /> Add to list
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Pencil className="w-4 h-4" /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Contact Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <span className="text-xl font-bold text-white">{contact.avatar}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contact.firstName} {contact.lastName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{contact.title} at {contact.company}, {contact.location}</p>
          </div>
        </div>
      </div>

      {/* ── THREE COLUMN LAYOUT ── */}
      <div className="px-6 pb-8 grid grid-cols-12 gap-6">

        {/* ═══ LEFT COLUMN — Contact Info ═══ */}
        <div className="col-span-3 space-y-5">
          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-gray-400">⋮⋮</span> Contact information
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <div className="flex items-center gap-2 group">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`mailto:${contact.email}`} className="text-sm text-indigo-600 hover:text-indigo-700 transition">{contact.email}</a>
                  <button className="opacity-0 group-hover:opacity-100 transition"><Copy className="w-3 h-3 text-gray-400" /></button>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{contact.phone}</span>
                    <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Work</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{contact.phoneMobile}</span>
                    <span className="text-[10px] font-medium bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Mobile</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-700 leading-relaxed">{contact.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-gray-400">⋮⋮</span> About
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Lifecycle Stage</p>
                <p className="text-sm font-medium text-gray-900">{contact.lifecycleStage}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Status</p>
                <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{contact.status}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Preferred Contact Method</p>
                <p className="text-sm text-gray-700">{contact.preferredContact}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Local time</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-700">{contact.localTime}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 ml-5">{contact.localDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Languages</p>
                <p className="text-sm text-gray-700">{contact.languages}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Source</p>
                <p className="text-sm text-gray-700">{contact.source}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{contact.description}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                  {tag}
                </span>
              ))}
              <button className="text-xs font-medium text-gray-400 hover:text-indigo-600 px-2.5 py-1 rounded-full border border-dashed border-gray-300 hover:border-indigo-300 transition">
                + Add
              </button>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Custom Fields</h3>
            <div className="space-y-2.5">
              {Object.entries(contact.customFields).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{key}</span>
                  <span className="text-sm font-medium text-gray-700">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ CENTER COLUMN — Activity / Tasks / Deals / Email ═══ */}
        <div className="col-span-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center border-b border-gray-100 px-5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition -mb-px ${
                    activeTab === tab.key
                      ? "text-indigo-600 border-indigo-600"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* ACTIVITY TAB */}
              {activeTab === "activity" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Activity</h3>
                    <span className="text-xs text-gray-400">{activities.length} Total</span>
                  </div>
                  <div className="space-y-1">
                    {activities.map((a, i) => {
                      const style = activityStyles[a.type] || activityStyles.note;
                      const Icon = a.icon;
                      return (
                        <div key={i} className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition cursor-pointer">
                          <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${style.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                              <span className="text-xs text-gray-400">{a.time}</span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TASKS TAB */}
              {activeTab === "tasks" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
                    <span className="text-xs text-gray-400">{tasks.length} Task{tasks.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-3">
                    {tasks.map((task, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 hover:shadow-sm transition">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                <CheckSquare className="w-4 h-4 text-rose-500" />
                              </div>
                              <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                            </div>
                            <p className="text-xs text-gray-400 ml-10">{task.due}</p>
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed mb-3 ml-10">{task.desc}</p>
                        <div className="flex items-center gap-2 ml-10">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusBadgeStyles[task.status] || ""}`}>{task.status}</span>
                          <span className="text-xs text-gray-300">&middot;</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityStyles[task.priority] || ""}`}>&bull; {task.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DEALS TAB */}
              {activeTab === "deals" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Deals</h3>
                    <span className="text-xs text-gray-400">{deals.length} Deal{deals.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-3">
                    {deals.map((deal, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 hover:shadow-sm transition cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900">{deal.title}</p>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${dealStageStyles[deal.stage] || "bg-gray-100 text-gray-600"}`}>
                            {deal.stage}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="font-semibold text-gray-900 text-sm">{deal.value}</span>
                          <span className="text-gray-300">&middot;</span>
                          <span>Expected close: {deal.close}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMAIL TAB */}
              {activeTab === "email" && (
                <div className="text-center py-12">
                  <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No email threads yet</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">Send the first email to start a conversation</p>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                    <Mail className="w-4 h-4" /> Compose Email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN — Company Info ═══ */}
        <div className="col-span-3 space-y-5">
          {/* Company Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-gray-400">⋮⋮</span> Company information
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-indigo-700">{company.logo}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                <p className="text-xs text-gray-400">Management consulting firm</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{company.description}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-0.5">Website</p>
                <a href={`https://${company.website}`} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition">
                  {company.website} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Founded year</p>
                  <p className="text-sm font-medium text-gray-900">{company.foundedYear}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Number of employees</p>
                  <p className="text-sm font-medium text-gray-900">{company.employees}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Subsidiaries</p>
                  <p className="text-sm font-medium text-gray-900">{company.subsidiaries}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Revenue</p>
                  <p className="text-sm font-medium text-gray-900">{company.revenue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Industry Tags */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Industry</h3>
            <div className="flex flex-wrap gap-2">
              {company.industry.map((ind) => (
                <span key={ind} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {company.keywords.map((kw) => (
                <span key={kw} className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-indigo-600">
                View all deals <ArrowUpRight className="w-4 h-4" />
              </a>
              <a href="#" className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-indigo-600">
                View company contacts <ArrowUpRight className="w-4 h-4" />
              </a>
              <a href="#" className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-indigo-600">
                Activity history <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
