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

const AGENCY_POSTS: SocialPost[] = [
  // Scheduled
  { id: "p1", platform: "instagram", content: "🚀 New case study: How we helped Brightview Hotels achieve 4.2x ROAS on Google Ads. Full breakdown in our latest blog post ⬇️\n\n#digitalmarketing #ppc #hotelmarketing #roas", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "10:00 AM", type: "carousel", client: "Power Marketing" },
  { id: "p2", platform: "linkedin", content: "Agencies: Your clients don't care about impressions.\n\nThey care about revenue.\n\nHere's the exact framework we use to tie every marketing dollar to bottom-line results...", status: "scheduled", scheduledDate: "Mar 18", scheduledTime: "8:30 AM", type: "text", client: "Power Marketing" },
  { id: "p3", platform: "facebook", content: "🎉 We just helped Sterling Partners close their biggest quarter ever — $2.8M in new business attributed to organic search. Here's how we did it...", status: "scheduled", scheduledDate: "Mar 19", scheduledTime: "12:00 PM", type: "image", client: "Power Marketing" },
  { id: "p4", platform: "instagram", content: "Behind the scenes of the Summit Athletics brand refresh 🎨\n\nSwipe to see the before/after →", status: "scheduled", scheduledDate: "Mar 20", scheduledTime: "2:00 PM", type: "carousel", client: "Summit Athletics" },
  // Drafts
  { id: "p5", platform: "instagram", content: "Client spotlight: How @glowmedspa grew their patient base 40% in 6 months with targeted Meta ads 💉✨", status: "draft", scheduledDate: "", scheduledTime: "", type: "reel", client: "Glow Med Spa" },
  { id: "p6", platform: "tiktok", content: "POV: You're an agency owner checking your client's ROAS at 6am ☕📈 #agencylife #marketing", status: "draft", scheduledDate: "", scheduledTime: "", type: "reel", client: "Power Marketing" },
  // Published
  { id: "p7", platform: "instagram", content: "March team spotlight: Meet Rocco, our SEO wizard 🧙‍♂️ In the last 90 days, he's driven 340% organic traffic growth for our clients.", status: "published", scheduledDate: "Mar 14", scheduledTime: "11:00 AM", type: "image", client: "Power Marketing", engagement: { likes: 89, comments: 12, shares: 8, reach: 2400 } },
  { id: "p8", platform: "linkedin", content: "We're hiring! Looking for a senior PPC specialist to join our growing team. Remote-friendly, great clients, and a culture that values results over hours.", status: "published", scheduledDate: "Mar 12", scheduledTime: "9:00 AM", type: "text", client: "Power Marketing", engagement: { likes: 156, comments: 34, shares: 28, reach: 8900 } },
  { id: "p9", platform: "facebook", content: "New blog post: '5 Signs Your Agency is Undercharging (And What to Do About It)' — honest pricing tips from our founder.", status: "published", scheduledDate: "Mar 10", scheduledTime: "1:00 PM", type: "image", client: "Power Marketing", engagement: { likes: 67, comments: 15, shares: 22, reach: 3100 } },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
  scheduled: { label: "Scheduled", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  published: { label: "Published", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
};

function fmt(n: number) { return n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : `${n}`; }

export default function SocialPage() {
  const ic = useIndustry();
  const [posts, setPosts] = useState<SocialPost[]>(AGENCY_POSTS);
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
