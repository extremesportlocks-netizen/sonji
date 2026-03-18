"use client";

import { getDemoIndustry } from "@/lib/tenant-utils";
import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import { useIndustry } from "@/lib/use-industry";
import {
  Calendar, Plus, Copy, ExternalLink, Clock, CheckCircle,
  Video, MapPin, Phone, Users, Settings, Globe, Edit3,
  Link2, BarChart3,
} from "lucide-react";

interface BookingLink {
  id: string;
  name: string;
  type: "one_on_one" | "group" | "round_robin";
  duration: number; // minutes
  location: "video" | "phone" | "in_person";
  url: string;
  bookings: number;
  active: boolean;
  color: string;
}

const locationIcons: Record<string, React.ElementType> = { video: Video, phone: Phone, in_person: MapPin };

const INDUSTRY_LINKS: Record<string, BookingLink[]> = {
  agency_consulting: [
    { id: "b1", name: "Discovery Call", type: "one_on_one", duration: 30, location: "video", url: "sonji.io/book/power-marketing/discovery", bookings: 47, active: true, color: "bg-indigo-500" },
    { id: "b2", name: "Strategy Session", type: "one_on_one", duration: 60, location: "video", url: "sonji.io/book/power-marketing/strategy", bookings: 18, active: true, color: "bg-violet-500" },
    { id: "b3", name: "Monthly Review", type: "one_on_one", duration: 45, location: "video", url: "sonji.io/book/power-marketing/review", bookings: 32, active: true, color: "bg-blue-500" },
    { id: "b4", name: "Quick Check-In", type: "one_on_one", duration: 15, location: "phone", url: "sonji.io/book/power-marketing/checkin", bookings: 56, active: true, color: "bg-emerald-500" },
    { id: "b5", name: "Team Onboarding", type: "group", duration: 90, location: "video", url: "sonji.io/book/power-marketing/onboarding", bookings: 8, active: true, color: "bg-amber-500" },
  ],
  health_wellness: [
    { id: "b1", name: "New Patient Consultation", type: "one_on_one", duration: 15, location: "video", url: "sonji.io/book/clyr-health/consult", bookings: 28, active: true, color: "bg-teal-500" },
    { id: "b2", name: "Dosing Adjustment Review", type: "one_on_one", duration: 10, location: "video", url: "sonji.io/book/clyr-health/dosing", bookings: 14, active: true, color: "bg-violet-500" },
    { id: "b3", name: "Treatment Check-In (Week 4)", type: "one_on_one", duration: 10, location: "video", url: "sonji.io/book/clyr-health/checkin", bookings: 22, active: true, color: "bg-blue-500" },
    { id: "b4", name: "Refill Consultation", type: "one_on_one", duration: 10, location: "video", url: "sonji.io/book/clyr-health/refill", bookings: 18, active: true, color: "bg-emerald-500" },
  ],
  ecommerce: [
    { id: "b1", name: "VIP Strategy Call", type: "one_on_one", duration: 15, location: "phone", url: "sonji.io/book/esl-sports/vip", bookings: 8, active: true, color: "bg-amber-500" },
    { id: "b2", name: "Partnership Inquiry", type: "one_on_one", duration: 30, location: "video", url: "sonji.io/book/esl-sports/partner", bookings: 3, active: true, color: "bg-indigo-500" },
  ],
  home_services: [
    { id: "b1", name: "Free Estimate", type: "round_robin", duration: 30, location: "in_person", url: "sonji.io/book/apex-roofing/estimate", bookings: 67, active: true, color: "bg-emerald-500" },
    { id: "b2", name: "Emergency Service", type: "one_on_one", duration: 15, location: "phone", url: "sonji.io/book/apex-roofing/emergency", bookings: 12, active: true, color: "bg-red-500" },
    { id: "b3", name: "Maintenance Inspection", type: "round_robin", duration: 45, location: "in_person", url: "sonji.io/book/apex-roofing/inspection", bookings: 34, active: true, color: "bg-blue-500" },
  ],
  legal: [
    { id: "b1", name: "Free Consultation", type: "round_robin", duration: 30, location: "video", url: "sonji.io/book/sterling-law/consult", bookings: 45, active: true, color: "bg-indigo-500" },
    { id: "b2", name: "Case Review", type: "one_on_one", duration: 60, location: "in_person", url: "sonji.io/book/sterling-law/review", bookings: 18, active: true, color: "bg-violet-500" },
    { id: "b3", name: "Document Signing", type: "one_on_one", duration: 15, location: "in_person", url: "sonji.io/book/sterling-law/signing", bookings: 28, active: true, color: "bg-emerald-500" },
  ],
  fitness_gym: [
    { id: "b1", name: "Free Trial Session", type: "one_on_one", duration: 60, location: "in_person", url: "sonji.io/book/iron-republic/trial", bookings: 78, active: true, color: "bg-orange-500" },
    { id: "b2", name: "Personal Training", type: "one_on_one", duration: 60, location: "in_person", url: "sonji.io/book/iron-republic/pt", bookings: 156, active: true, color: "bg-emerald-500" },
    { id: "b3", name: "Body Composition Scan", type: "one_on_one", duration: 15, location: "in_person", url: "sonji.io/book/iron-republic/scan", bookings: 34, active: true, color: "bg-blue-500" },
  ],
  beauty_salon: [
    { id: "b1", name: "Haircut & Style", type: "one_on_one", duration: 45, location: "in_person", url: "sonji.io/book/luxe-beauty/haircut", bookings: 234, active: true, color: "bg-pink-500" },
    { id: "b2", name: "Color Service", type: "one_on_one", duration: 120, location: "in_person", url: "sonji.io/book/luxe-beauty/color", bookings: 89, active: true, color: "bg-violet-500" },
    { id: "b3", name: "Bridal Consultation", type: "one_on_one", duration: 30, location: "in_person", url: "sonji.io/book/luxe-beauty/bridal", bookings: 12, active: true, color: "bg-rose-500" },
    { id: "b4", name: "Keratin Treatment", type: "one_on_one", duration: 150, location: "in_person", url: "sonji.io/book/luxe-beauty/keratin", bookings: 22, active: true, color: "bg-amber-500" },
  ],
  real_estate: [
    { id: "b1", name: "Property Showing", type: "round_robin", duration: 30, location: "in_person", url: "sonji.io/book/summit-realty/showing", bookings: 124, active: true, color: "bg-emerald-500" },
    { id: "b2", name: "Home Valuation", type: "one_on_one", duration: 45, location: "in_person", url: "sonji.io/book/summit-realty/valuation", bookings: 45, active: true, color: "bg-blue-500" },
    { id: "b3", name: "Buyer Consultation", type: "one_on_one", duration: 60, location: "video", url: "sonji.io/book/summit-realty/buyer", bookings: 67, active: true, color: "bg-indigo-500" },
  ],
  coaching_education: [
    { id: "b1", name: "Discovery Call", type: "one_on_one", duration: 30, location: "video", url: "sonji.io/book/elevate/discovery", bookings: 56, active: true, color: "bg-violet-500" },
    { id: "b2", name: "1:1 Coaching Session", type: "one_on_one", duration: 60, location: "video", url: "sonji.io/book/elevate/coaching", bookings: 89, active: true, color: "bg-indigo-500" },
    { id: "b3", name: "VIP Day Booking", type: "one_on_one", duration: 480, location: "in_person", url: "sonji.io/book/elevate/vip-day", bookings: 4, active: true, color: "bg-amber-500" },
    { id: "b4", name: "Group Mastermind", type: "group", duration: 90, location: "video", url: "sonji.io/book/elevate/mastermind", bookings: 24, active: true, color: "bg-purple-500" },
  ],
  restaurant_food: [
    { id: "b1", name: "Table Reservation", type: "one_on_one", duration: 120, location: "in_person", url: "sonji.io/book/copper-table/reservation", bookings: 456, active: true, color: "bg-amber-500" },
    { id: "b2", name: "Private Dining", type: "one_on_one", duration: 180, location: "in_person", url: "sonji.io/book/copper-table/private", bookings: 18, active: true, color: "bg-rose-500" },
    { id: "b3", name: "Catering Tasting", type: "one_on_one", duration: 60, location: "in_person", url: "sonji.io/book/copper-table/tasting", bookings: 8, active: true, color: "bg-violet-500" },
  ],
  automotive: [
    { id: "b1", name: "Service Appointment", type: "round_robin", duration: 15, location: "in_person", url: "sonji.io/book/precision-auto/service", bookings: 234, active: true, color: "bg-blue-500" },
    { id: "b2", name: "Diagnostic Check", type: "one_on_one", duration: 30, location: "in_person", url: "sonji.io/book/precision-auto/diagnostic", bookings: 67, active: true, color: "bg-amber-500" },
    { id: "b3", name: "Fleet Service Block", type: "group", duration: 480, location: "in_person", url: "sonji.io/book/precision-auto/fleet", bookings: 12, active: true, color: "bg-emerald-500" },
  ],
  nonprofit: [
    { id: "b1", name: "Donor Meeting", type: "one_on_one", duration: 45, location: "in_person", url: "sonji.io/book/harbor-foundation/donor", bookings: 34, active: true, color: "bg-violet-500" },
    { id: "b2", name: "Volunteer Orientation", type: "group", duration: 60, location: "in_person", url: "sonji.io/book/harbor-foundation/volunteer", bookings: 28, active: true, color: "bg-emerald-500" },
    { id: "b3", name: "Sponsorship Call", type: "one_on_one", duration: 30, location: "video", url: "sonji.io/book/harbor-foundation/sponsorship", bookings: 15, active: true, color: "bg-blue-500" },
  ],
};

const typeLabels: Record<string, string> = { one_on_one: "1:1", group: "Group", round_robin: "Round Robin" };

export default function SchedulingPage() {
  const ic = useIndustry();
  const [links, setLinks] = useState<BookingLink[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const di = getDemoIndustry();
    const key = di; if (!key) return;
    setLinks(INDUSTRY_LINKS[key] || INDUSTRY_LINKS.ecommerce);
  }, []);

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(`https://${url}`).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalBookings = links.reduce((s, l) => s + l.bookings, 0);

  return (
    <>
      <Header title="Scheduling" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Link2 className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-400">Booking Links</span></div>
            <p className="text-2xl font-bold text-gray-900">{links.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-400">Total Bookings</span></div>
            <p className="text-2xl font-bold text-emerald-600">{totalBookings}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1"><BarChart3 className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-400">This Month</span></div>
            <p className="text-2xl font-bold text-blue-600">{Math.round(totalBookings * 0.35)}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Your Booking Links</h2>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
            <Plus className="w-4 h-4" /> Create Booking Link
          </button>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {links.map(link => {
            const LocIcon = locationIcons[link.location] || Globe;
            return (
              <div key={link.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-10 rounded-full ${link.color}`} />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{link.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{typeLabels[link.type]}</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400"><Clock className="w-2.5 h-2.5" />{link.duration} min</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400"><LocIcon className="w-2.5 h-2.5" />{link.location === "in_person" ? "In Person" : link.location === "video" ? "Video" : "Phone"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* URL */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-1.5 text-[11px] text-gray-500 font-mono truncate">{link.url}</div>
                  <button onClick={() => copyUrl(link.id, link.url)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                    {copied === link.id ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">{link.bookings} bookings</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"><ExternalLink className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"><Settings className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Embed Instructions */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Embed on your website</h3>
          <p className="text-xs text-gray-500 mb-3">Add this code to any page to embed your booking widget:</p>
          <div className="bg-gray-900 rounded-lg p-4 text-[11px] font-mono text-green-400">
            &lt;script src="https://sonji.io/embed.js" data-tenant="your-slug"&gt;&lt;/script&gt;
          </div>
        </div>
      </div>
    </>
  );
}
