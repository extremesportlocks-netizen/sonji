"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Settings,
  Palette,
  CreditCard,
  Users,
  Bell,
  Puzzle,
  Globe,
  Upload,
  Save,
  Check,
} from "lucide-react";

const tabs = [
  { key: "general", label: "General", icon: Settings },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "team", label: "Team", icon: Users },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "integrations", label: "Integrations", icon: Puzzle },
];

const integrations = [
  { name: "Stripe", desc: "Payment processing and invoicing", connected: true, icon: "💳" },
  { name: "Resend", desc: "Transactional and marketing emails", connected: true, icon: "📧" },
  { name: "Twilio", desc: "SMS messaging and voice", connected: false, icon: "💬" },
  { name: "Google Calendar", desc: "Sync meetings and availability", connected: false, icon: "📅" },
  { name: "Slack", desc: "Team notifications and alerts", connected: false, icon: "💬" },
  { name: "Zapier", desc: "Connect 5,000+ apps", connected: false, icon: "⚡" },
];

const teamMembers = [
  { name: "Orlando", email: "hello@sonji.io", role: "Owner", avatar: "O", status: "Active" },
  { name: "Sarah Chen", email: "sarah@sonji.io", role: "Admin", avatar: "SC", status: "Active" },
  { name: "Marcus Rivera", email: "marcus@sonji.io", role: "Member", avatar: "MR", status: "Active" },
  { name: "Emily Rodriguez", email: "emily@sonji.io", role: "Member", avatar: "ER", status: "Invited" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <>
      <Header title="Settings" />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      activeTab === tab.key ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}>
                    <Icon className={`w-4 h-4 ${activeTab === tab.key ? "text-indigo-600" : "text-gray-400"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {/* GENERAL */}
            {activeTab === "general" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">General Settings</h2>
                <p className="text-sm text-gray-500 mb-6">Manage your workspace configuration</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Business Name</label>
                    <input type="text" defaultValue="My Business" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Workspace URL</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg">https://</span>
                      <input type="text" defaultValue="mybusiness" className="flex-1 px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
                      <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg">.sonji.io</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Timezone</label>
                      <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option>America/New_York (EST)</option>
                        <option>America/Chicago (CST)</option>
                        <option>America/Denver (MST)</option>
                        <option>America/Los_Angeles (PST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Currency</label>
                      <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option>USD — US Dollar</option>
                        <option>EUR — Euro</option>
                        <option>GBP — British Pound</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Date Format</label>
                    <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* BRANDING */}
            {activeTab === "branding" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Branding</h2>
                <p className="text-sm text-gray-500 mb-6">Customize how your CRM looks to your team and clients</p>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center border-2 border-dashed border-indigo-300">
                        <span className="text-xl font-bold text-indigo-600">S</span>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                        <Upload className="w-4 h-4" /> Upload Logo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600 border border-gray-200 cursor-pointer" />
                        <input type="text" defaultValue="#6366f1" className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-gray-200 cursor-pointer" />
                        <input type="text" defaultValue="#0f172a" className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Preview</label>
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Your Business</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg">Primary Button</div>
                        <div className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded-lg">Secondary Button</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                    <Save className="w-4 h-4" /> Save Branding
                  </button>
                </div>
              </div>
            )}

            {/* BILLING */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Current Plan</h2>
                  <p className="text-sm text-gray-500 mb-4">You are on the Growth plan</p>
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">Growth Plan</p>
                      <p className="text-xs text-indigo-600 mt-0.5">10,000 contacts · 10 team members · All features</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-900">$149<span className="text-sm font-normal text-indigo-600">/mo</span></p>
                      <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1">Upgrade to Scale</button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">VISA</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                        <p className="text-xs text-gray-400">Expires 12/2028</p>
                      </div>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Update</button>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM */}
            {activeTab === "team" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Manage who has access to this workspace</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                    <Users className="w-4 h-4" /> Invite Member
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {teamMembers.map((m) => (
                    <div key={m.email} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">{m.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          m.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>{m.status}</span>
                        <select className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none" defaultValue={m.role}>
                          <option>Owner</option>
                          <option>Admin</option>
                          <option>Member</option>
                          <option>Viewer</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mb-6">Choose what you want to be notified about</p>
                <div className="space-y-4">
                  {[
                    { label: "New contact created", desc: "Get notified when a new contact is added to the CRM" },
                    { label: "Deal stage changes", desc: "Get notified when deals move between pipeline stages" },
                    { label: "Task assigned to you", desc: "Get notified when someone assigns you a task" },
                    { label: "Form submissions", desc: "Get notified when someone submits an intake form" },
                    { label: "Meeting reminders", desc: "Get reminded 15 minutes before scheduled meetings" },
                    { label: "Weekly digest", desc: "Receive a weekly summary of your CRM activity" },
                  ].map((n) => (
                    <div key={n.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{n.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INTEGRATIONS */}
            {activeTab === "integrations" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Integrations</h2>
                <p className="text-sm text-gray-500 mb-6">Connect your favorite tools to Sonji</p>
                <div className="space-y-3">
                  {integrations.map((int) => (
                    <div key={int.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{int.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{int.name}</p>
                          <p className="text-xs text-gray-400">{int.desc}</p>
                        </div>
                      </div>
                      {int.connected ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <button className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200 hover:bg-indigo-100 transition">
                          Connect
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
