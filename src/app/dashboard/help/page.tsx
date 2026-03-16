"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Search, BookOpen, Video, MessageSquare, ChevronRight,
  Users, BarChart3, Zap, Mail, DollarSign, Settings,
  Calendar, FileText, FolderKanban, Bot, Shield,
} from "lucide-react";

const categories = [
  { id: "getting-started", name: "Getting Started", icon: BookOpen, color: "bg-indigo-50 text-indigo-600", articles: 8 },
  { id: "contacts", name: "Contacts & CRM", icon: Users, color: "bg-blue-50 text-blue-600", articles: 12 },
  { id: "deals", name: "Deals & Pipeline", icon: BarChart3, color: "bg-violet-50 text-violet-600", articles: 9 },
  { id: "projects", name: "Project Management", icon: FolderKanban, color: "bg-purple-50 text-purple-600", articles: 7 },
  { id: "automations", name: "Automations", icon: Zap, color: "bg-amber-50 text-amber-600", articles: 11 },
  { id: "email-sms", name: "Email & SMS", icon: Mail, color: "bg-emerald-50 text-emerald-600", articles: 10 },
  { id: "billing", name: "Billing & Payments", icon: DollarSign, color: "bg-green-50 text-green-600", articles: 6 },
  { id: "scheduling", name: "Scheduling", icon: Calendar, color: "bg-teal-50 text-teal-600", articles: 5 },
  { id: "reports", name: "Reports & Analytics", icon: FileText, color: "bg-rose-50 text-rose-600", articles: 8 },
  { id: "ai", name: "AI Features", icon: Bot, color: "bg-fuchsia-50 text-fuchsia-600", articles: 6 },
  { id: "integrations", name: "Integrations", icon: Settings, color: "bg-gray-50 text-gray-600", articles: 14 },
  { id: "security", name: "Security & Privacy", icon: Shield, color: "bg-red-50 text-red-600", articles: 4 },
];

const popularArticles = [
  { title: "How to import contacts from Stripe", category: "Contacts & CRM", reads: 342 },
  { title: "Setting up your first automation", category: "Automations", reads: 289 },
  { title: "Connecting your Twilio account (BYOK)", category: "Email & SMS", reads: 256 },
  { title: "Understanding Ghosting Alerts", category: "AI Features", reads: 234 },
  { title: "Creating a booking link", category: "Scheduling", reads: 198 },
  { title: "Converting deals to projects", category: "Project Management", reads: 187 },
  { title: "Setting up email templates", category: "Email & SMS", reads: 176 },
  { title: "Dashboard widget customization", category: "Getting Started", reads: 165 },
];

const videoGuides = [
  { title: "Sonji in 5 Minutes — Complete Overview", duration: "5:12", views: 1240 },
  { title: "Setting Up Your First Pipeline", duration: "3:45", views: 890 },
  { title: "Automation Builder Deep Dive", duration: "8:30", views: 670 },
  { title: "Project Management for Agencies", duration: "6:15", views: 520 },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");

  const filteredCats = categories.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredArticles = popularArticles.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Header title="Help Center" />
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">How can we help?</h1>
            <p className="text-sm text-gray-500 mb-6">Search our knowledge base or browse categories below.</p>
            <div className="relative max-w-lg mx-auto">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-3.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredCats.map(cat => {
                const Icon = cat.icon;
                return (
                  <div key={cat.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-md transition cursor-pointer group">
                    <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition">{cat.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.articles} articles</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popular Articles */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Popular Articles</h2>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {filteredArticles.map((article, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900 group-hover:text-indigo-600 transition">{article.title}</p>
                      <p className="text-[10px] text-gray-400">{article.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400">{article.reads} reads</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Guides */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Video Guides</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {videoGuides.map((video, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-indigo-200 hover:shadow-md transition cursor-pointer group">
                  <div className="aspect-video bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center relative">
                    <Video className="w-8 h-8 text-indigo-400" />
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded">{video.duration}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-gray-900 group-hover:text-indigo-600 transition leading-snug">{video.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{video.views.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 p-6 text-center">
            <MessageSquare className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Still need help?</h3>
            <p className="text-xs text-gray-500 mb-4">Our support team responds within 2 hours during business hours.</p>
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Contact Support</button>
          </div>
        </div>
      </div>
    </>
  );
}
