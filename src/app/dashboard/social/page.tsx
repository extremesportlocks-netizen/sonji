"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  Plus, Calendar, Clock, CheckCircle, Edit3, Trash2,
  Image, Video, Link2, MoreHorizontal, Eye, TrendingUp,
  Heart, MessageSquare, Share2, Send,
} from "lucide-react";

interface SocialPost {
  id: string;
  platform: "instagram" | "facebook" | "linkedin" | "twitter" | "tiktok";
  content: string;
  status: "draft" | "scheduled" | "published";
  scheduledDate: string;
  scheduledTime: string;
  type: "image" | "video" | "carousel" | "text" | "reel";
  engagement?: { likes: number; comments: number; shares: number; reach: number };
  client?: string;
}

const platformConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  instagram: { label: "Instagram", color: "text-pink-600", bg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400", icon: "📸" },
  facebook: { label: "Facebook", color: "text-blue-600", bg: "bg-blue-600", icon: "📘" },
  linkedin: { label: "LinkedIn", color: "text-blue-700", bg: "bg-blue-800", icon: "💼" },
  twitter: { label: "X / Twitter", color: "text-gray-900", bg: "bg-gray-900", icon: "𝕏" },
  tiktok: { label: "TikTok", color: "text-gray-900", bg: "bg-gray-900", icon: "🎵" },
};

const typeIcons: Record<string, React.ElementType> = { image: Image, video: Video, carousel: Image, text: MessageSquare, reel: Video };

const INDUSTRY_POSTS: Record<string, SocialPost[]> = {
  agency_consulting: [
    { id: "p1", platform: "instagram", content: "🚀 New case study: How we helped Brightview Hotels achieve 4.2x ROAS on Google Ads. Full breakdown in our latest blog post ⬇️\n\n#digitalmarketing #ppc #hotelmarketing #roas", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "10:00 AM", type: "carousel", client: "Power Marketing" },
    { id: "p2", platform: "linkedin", content: "Agencies: Your clients don't care about impressions.\n\nThey care about revenue.\n\nHere's the exact framework we use to tie every marketing dollar to bottom-line results...", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "8:30 AM", type: "text", client: "Power Marketing" },
    { id: "p3", platform: "facebook", content: "🎉 We just helped Sterling Partners close their biggest quarter ever — $2.8M in new business attributed to organic search.", status: "scheduled", scheduledDate: "Mar 19", scheduledTime: "12:00 PM", type: "image", client: "Power Marketing" },
    { id: "p4", platform: "instagram", content: "Behind the scenes of the Summit Athletics brand refresh 🎨 Swipe to see the before/after →", status: "scheduled", scheduledDate: "Mar 20", scheduledTime: "2:00 PM", type: "carousel", client: "Summit Athletics" },
    { id: "p5", platform: "tiktok", content: "POV: You're an agency owner checking your client's ROAS at 6am ☕📈 #agencylife #marketing", status: "draft", scheduledDate: "", scheduledTime: "", type: "reel", client: "Power Marketing" },
    { id: "p6", platform: "instagram", content: "March team spotlight: Meet Rocco, our SEO wizard 🧙‍♂️", status: "published", scheduledDate: "Mar 14", scheduledTime: "11:00 AM", type: "image", client: "Power Marketing", engagement: { likes: 89, comments: 12, shares: 8, reach: 2400 } },
    { id: "p7", platform: "linkedin", content: "We're hiring! Looking for a senior PPC specialist to join our growing team.", status: "published", scheduledDate: "Mar 12", scheduledTime: "9:00 AM", type: "text", client: "Power Marketing", engagement: { likes: 156, comments: 34, shares: 28, reach: 8900 } },
  ],
  health_wellness: [
    { id: "p1", platform: "instagram", content: "Spring is the perfect time to refresh your look ✨ Book a consultation and learn about our latest treatments!", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "10:00 AM", type: "image", client: "Glow Med Spa" },
    { id: "p2", platform: "facebook", content: "Patient testimonial: 'I've lost 32 lbs in 3 months on the GLP-1 program. Best decision I ever made!' - Sarah T.", status: "scheduled", scheduledDate: "Mar 19", scheduledTime: "12:00 PM", type: "image", client: "Glow Med Spa" },
    { id: "p3", platform: "instagram", content: "Botox before & after — subtle, natural results ✨ #botox #medspa #antiaging", status: "published", scheduledDate: "Mar 14", scheduledTime: "2:00 PM", type: "carousel", client: "Glow Med Spa", engagement: { likes: 234, comments: 18, shares: 12, reach: 5600 } },
    { id: "p4", platform: "tiktok", content: "A day in the life at the med spa 💉✨ #medspa #botox #aesthetics", status: "draft", scheduledDate: "", scheduledTime: "", type: "reel", client: "Glow Med Spa" },
  ],
  ecommerce: [
    { id: "p1", platform: "instagram", content: "🏀 March Madness is HERE. Who's ready for tonight's slate? 4 locks dropping at 5 PM 🔥", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "3:00 PM", type: "image", client: "ESL Sports" },
    { id: "p2", platform: "twitter", content: "4-0 on NCAAB today 🔥🔥🔥 Our subscribers know. Link in bio.", status: "published", scheduledDate: "Mar 15", scheduledTime: "11:00 PM", type: "text", client: "ESL Sports", engagement: { likes: 67, comments: 23, shares: 15, reach: 3200 } },
    { id: "p3", platform: "instagram", content: "VIP members got early access to tonight's plays 30 minutes before tip. Want in? Link in bio 👆", status: "draft", scheduledDate: "", scheduledTime: "", type: "image", client: "ESL Sports" },
  ],
  fitness_gym: [
    { id: "p1", platform: "instagram", content: "New class alert! 🔥 Saturday 8 AM HIIT is officially on the schedule. First class FREE for non-members!", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "10:00 AM", type: "image", client: "Iron Republic" },
    { id: "p2", platform: "tiktok", content: "Coach Jake's 5-minute ab burner that will destroy you 💀🔥 #gym #fitness #abs #workout", status: "scheduled", scheduledDate: "Mar 19", scheduledTime: "6:00 PM", type: "reel", client: "Iron Republic" },
    { id: "p3", platform: "instagram", content: "Member spotlight: Stephanie crushed her PR this week — 225lb deadlift! 🏋️‍♀️💪", status: "published", scheduledDate: "Mar 14", scheduledTime: "12:00 PM", type: "image", client: "Iron Republic", engagement: { likes: 145, comments: 28, shares: 6, reach: 3800 } },
  ],
  beauty_salon: [
    { id: "p1", platform: "instagram", content: "Bridal season is HERE 👰✨ Book your bridal trial now — spots are filling up fast!", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "11:00 AM", type: "carousel", client: "Luxe Beauty" },
    { id: "p2", platform: "instagram", content: "Keratin transformation! Swipe for the before & after 😍 #keratin #hairgoals #salon", status: "published", scheduledDate: "Mar 13", scheduledTime: "2:00 PM", type: "carousel", client: "Luxe Beauty", engagement: { likes: 312, comments: 45, shares: 22, reach: 8200 } },
    { id: "p3", platform: "tiktok", content: "How to maintain your blowout for 3+ days 💁‍♀️ #hairtok #blowout #hairtips", status: "draft", scheduledDate: "", scheduledTime: "", type: "reel", client: "Luxe Beauty" },
  ],
  real_estate: [
    { id: "p1", platform: "instagram", content: "Just listed! 4521 Bayshore Dr — 4 bed, 3 bath waterfront beauty 🏠 $450K. DM for details!", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "9:00 AM", type: "carousel", client: "Summit Realty" },
    { id: "p2", platform: "facebook", content: "Open house this Saturday 1-4 PM at 1234 Gulf Blvd! Stop by for snacks and a tour 🏡", status: "scheduled", scheduledDate: "Mar 19", scheduledTime: "10:00 AM", type: "image", client: "Summit Realty" },
    { id: "p3", platform: "instagram", content: "SOLD! 🎉 Congratulations to the Williams family on their new home!", status: "published", scheduledDate: "Mar 14", scheduledTime: "3:00 PM", type: "image", client: "Summit Realty", engagement: { likes: 178, comments: 42, shares: 15, reach: 4500 } },
  ],
  home_services: [
    { id: "p1", platform: "facebook", content: "Storm season is coming ⛈️ Get a FREE roof inspection before it's too late. Call or book online!", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "8:00 AM", type: "image", client: "Apex Roofing" },
    { id: "p2", platform: "instagram", content: "Before & after: Full roof replacement on this beautiful Cape Coral home 🏠✅", status: "published", scheduledDate: "Mar 12", scheduledTime: "12:00 PM", type: "carousel", client: "Apex Roofing", engagement: { likes: 56, comments: 8, shares: 12, reach: 2100 } },
  ],
  coaching_education: [
    { id: "p1", platform: "linkedin", content: "The #1 reason entrepreneurs stay stuck at $300K isn't strategy. It's identity.\n\nHere's what I mean...", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "8:00 AM", type: "text", client: "Elevate Coaching" },
    { id: "p2", platform: "instagram", content: "Spring Mastermind Cohort is FULL! 🎉 6 incredible entrepreneurs ready to scale to 7 figures.", status: "published", scheduledDate: "Mar 10", scheduledTime: "10:00 AM", type: "image", client: "Elevate Coaching", engagement: { likes: 89, comments: 15, shares: 8, reach: 2800 } },
  ],
  restaurant_food: [
    { id: "p1", platform: "instagram", content: "Tonight's special: Pan-seared Chilean sea bass with truffle risotto 🐟✨ Reserve your table now!", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "3:00 PM", type: "image", client: "The Copper Table" },
    { id: "p2", platform: "instagram", content: "Chef's table experience last night was incredible! Thank you @riversidecorp for choosing us 🍷", status: "published", scheduledDate: "Mar 15", scheduledTime: "11:00 AM", type: "carousel", client: "The Copper Table", engagement: { likes: 198, comments: 32, shares: 18, reach: 5200 } },
  ],
  automotive: [
    { id: "p1", platform: "facebook", content: "Spring service special! Oil change + tire rotation for $49.99 this month only. Book online!", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "9:00 AM", type: "image", client: "Precision Auto" },
    { id: "p2", platform: "instagram", content: "Another happy customer! Thomas's timing belt is done and running smooth 🔧✅", status: "published", scheduledDate: "Mar 16", scheduledTime: "4:00 PM", type: "image", client: "Precision Auto", engagement: { likes: 34, comments: 6, shares: 2, reach: 890 } },
  ],
  nonprofit: [
    { id: "p1", platform: "instagram", content: "Save the date! 🌟 Spring Gala — April 20, 2026. Tickets and sponsorships available now!", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "10:00 AM", type: "image", client: "Harbor Foundation" },
    { id: "p2", platform: "facebook", content: "Thanks to YOUR donations, we served 450 meals this month. Every dollar makes a difference. 💚", status: "published", scheduledDate: "Mar 14", scheduledTime: "12:00 PM", type: "image", client: "Harbor Foundation", engagement: { likes: 234, comments: 28, shares: 45, reach: 6800 } },
    { id: "p3", platform: "linkedin", content: "Corporate partnerships make our mission possible. Thank you Apex Financial Group for your $25K commitment!", status: "published", scheduledDate: "Mar 10", scheduledTime: "9:00 AM", type: "text", client: "Harbor Foundation", engagement: { likes: 89, comments: 12, shares: 22, reach: 3400 } },
  ],
  legal: [
    { id: "p1", platform: "linkedin", content: "Important update: Florida estate planning laws are changing in 2026. Here's what you need to know...", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "8:30 AM", type: "text", client: "Sterling Law" },
    { id: "p2", platform: "facebook", content: "Free 30-minute consultation for personal injury cases. No win, no fee. Call us today.", status: "published", scheduledDate: "Mar 12", scheduledTime: "10:00 AM", type: "image", client: "Sterling Law", engagement: { likes: 45, comments: 8, shares: 12, reach: 2200 } },
  ],
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
  scheduled: { label: "Scheduled", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  published: { label: "Published", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
};

function fmt(n: number) { return n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : `${n}`; }

export default function SocialPage() {
  const ic = useIndustry();
  const [posts, setPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    const di = typeof window !== "undefined" ? localStorage.getItem("sonji-demo-industry") : null;
    const key = di || "ecommerce";
    setPosts(INDUSTRY_POSTS[key] || INDUSTRY_POSTS.ecommerce);
  }, []);
  const [filter, setFilter] = useState<"all" | "draft" | "scheduled" | "published">("all");
  const [view, setView] = useState<"list" | "calendar">("list");

  const filtered = filter === "all" ? posts : posts.filter(p => p.status === filter);
  const scheduled = posts.filter(p => p.status === "scheduled").length;
  const drafts = posts.filter(p => p.status === "draft").length;
  const published = posts.filter(p => p.status === "published").length;
  const totalReach = posts.filter(p => p.engagement).reduce((s, p) => s + (p.engagement?.reach || 0), 0);

  return (
    <>
      <Header title="Social Media" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-400">Scheduled</span></div>
            <p className="text-2xl font-bold text-blue-600">{scheduled}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Edit3 className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-400">Drafts</span></div>
            <p className="text-2xl font-bold text-gray-600">{drafts}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-400">Published</span></div>
            <p className="text-2xl font-bold text-emerald-600">{published}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Eye className="w-4 h-4 text-violet-500" /><span className="text-xs text-gray-400">Total Reach</span></div>
            <p className="text-2xl font-bold text-violet-600">{fmt(totalReach)}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(["all", "scheduled", "draft", "published"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${filter === f ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}>
                {f === "all" ? "All Posts" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
            <Plus className="w-4 h-4" /> Create Post
          </button>
        </div>

        {/* Posts List */}
        <div className="space-y-3">
          {filtered.map(post => {
            const pc = platformConfig[post.platform];
            const sc = statusConfig[post.status];
            const TypeIcon = typeIcons[post.type] || Image;
            return (
              <div key={post.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition group">
                <div className="flex items-start gap-4">
                  {/* Platform Badge */}
                  <div className={`w-10 h-10 rounded-xl ${pc.bg} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                    {pc.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-medium ${pc.color}`}>{pc.label}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1"><TypeIcon className="w-2.5 h-2.5" />{post.type}</span>
                      {post.client && <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{post.client}</span>}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">{post.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        {post.scheduledDate && (
                          <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{post.scheduledDate} {post.scheduledTime}</span>
                        )}
                        {post.engagement && (
                          <>
                            <span className="flex items-center gap-1"><Heart className="w-2.5 h-2.5 text-pink-400" />{post.engagement.likes}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5 text-blue-400" />{post.engagement.comments}</span>
                            <span className="flex items-center gap-1"><Share2 className="w-2.5 h-2.5 text-emerald-400" />{post.engagement.shares}</span>
                            <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5 text-violet-400" />{fmt(post.engagement.reach)} reach</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"><Edit3 className="w-3.5 h-3.5" /></button>
                        {post.status === "draft" && <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"><Send className="w-3.5 h-3.5" /></button>}
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
