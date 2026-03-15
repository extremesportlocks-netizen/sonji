import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";

export const maxDuration = 30;

interface SmartCampaign {
  id: string;
  name: string;
  emoji: string;
  reason: string;
  urgency: "high" | "medium" | "low";
  contactCount: number;
  contacts: { id: string; firstName: string; lastName: string; email: string; ltv: number; daysSince: number; purchases: number }[];
  subject: string;
  body: string;
  estimatedRevenue: string;
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);

    const allContacts = await db.select({
      id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName,
      email: contacts.email, status: contacts.status, tags: contacts.tags, customFields: contacts.customFields,
    }).from(contacts).where(eq(contacts.tenantId, ctx.tenantId));

    const enriched = allContacts.map(c => {
      const cf = (c.customFields as any) || {};
      return { ...c, ltv: parseFloat(cf.ltv || "0"), purchases: parseInt(cf.purchaseCount || "0"),
        daysSince: parseInt(cf.daysSinceLastPurchase || "0"), avgOrder: parseFloat(cf.avgOrderValue || "0"),
        subStatus: cf.subscriptionStatus || "never", highestCharge: parseFloat(cf.highestCharge || "0") };
    }).filter(c => c.email);

    const campaigns: SmartCampaign[] = [];

    // 1: Urgent Win-Back (<30 days)
    const urgentLapsed = enriched.filter(c => c.subStatus === "canceled" && c.daysSince > 0 && c.daysSince <= 30 && c.ltv > 0).sort((a, b) => b.ltv - a.ltv).slice(0, 50);
    if (urgentLapsed.length > 0) {
      const totalLtv = urgentLapsed.reduce((s, c) => s + c.ltv, 0);
      campaigns.push({ id: "urgent_winback", name: "Urgent Win-Back", emoji: "🚨", urgency: "high", contactCount: urgentLapsed.length,
        reason: `${urgentLapsed.length} customers canceled in the last 30 days. The first month has the highest recovery rate.`,
        contacts: urgentLapsed.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName || "", email: c.email!, ltv: c.ltv, daysSince: c.daysSince, purchases: c.purchases })),
        subject: "We want you back, {{firstName}}", estimatedRevenue: `$${Math.round(totalLtv * 0.15).toLocaleString()} potential`,
        body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a1a2e;">{{firstName}}, we noticed you left</h2><p style="color:#555;line-height:1.6;">We're sorry to see you go. If something wasn't right, we'd love to hear about it. And if you're open to giving us another shot:</p><a href="#" style="display:inline-block;background:#6d28d9;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">Come Back — Special Offer Inside</a><p style="color:#999;font-size:13px;">Just reply if you have any questions.</p></div>` });
    }

    // 2: Whale Retention
    const coldWhales = enriched.filter(c => c.ltv >= 500 && c.daysSince > 60 && c.subStatus !== "active").sort((a, b) => b.ltv - a.ltv).slice(0, 30);
    if (coldWhales.length > 0) {
      const totalLtv = coldWhales.reduce((s, c) => s + c.ltv, 0);
      campaigns.push({ id: "whale_retention", name: "VIP Whale Re-engagement", emoji: "🐋", urgency: "high", contactCount: coldWhales.length,
        reason: `${coldWhales.length} of your $500+ LTV customers have gone quiet. Combined value: $${totalLtv.toLocaleString()}.`,
        contacts: coldWhales.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName || "", email: c.email!, ltv: c.ltv, daysSince: c.daysSince, purchases: c.purchases })),
        subject: "A personal note for you, {{firstName}}", estimatedRevenue: `$${Math.round(totalLtv * 0.2).toLocaleString()} potential`,
        body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a1a2e;">{{firstName}}, you're one of our best</h2><p style="color:#555;line-height:1.6;">I'm reaching out personally because you're one of our most valued customers. It's been a while since we connected, and I wanted to make sure everything is okay.</p><p style="color:#555;line-height:1.6;">As a VIP, I'd like to offer you exclusive early access:</p><a href="#" style="display:inline-block;background:#6d28d9;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">Claim Your VIP Access</a><p style="color:#999;font-size:13px;">Thank you for being incredible.</p></div>` });
    }

    // 3: One-Time Buyers
    const oneTimers = enriched.filter(c => c.purchases === 1 && c.daysSince > 14 && c.ltv > 0).sort((a, b) => b.ltv - a.ltv).slice(0, 100);
    if (oneTimers.length > 0) {
      const avgOrder = oneTimers.reduce((s, c) => s + c.avgOrder, 0) / oneTimers.length;
      campaigns.push({ id: "one_time_buyers", name: "Convert One-Time Buyers", emoji: "1️⃣", urgency: "medium", contactCount: oneTimers.length,
        reason: `${oneTimers.length} people bought once and never came back. The 1st→2nd purchase gap is where most businesses lose customers.`,
        contacts: oneTimers.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName || "", email: c.email!, ltv: c.ltv, daysSince: c.daysSince, purchases: c.purchases })),
        subject: "How was your experience, {{firstName}}?", estimatedRevenue: `$${Math.round(oneTimers.length * avgOrder * 0.1).toLocaleString()} if 10% convert`,
        body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a1a2e;">Hey {{firstName}},</h2><p style="color:#555;line-height:1.6;">Thanks for trying us out! We hope you had a great experience.</p><p style="color:#555;line-height:1.6;">As a thank you, here's something special for your next order:</p><a href="#" style="display:inline-block;background:#6d28d9;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">Get Your Return Offer</a></div>` });
    }

    // 4: Loyalists Going Quiet
    const freqGoneQuiet = enriched.filter(c => c.purchases >= 5 && c.daysSince > 45 && c.subStatus !== "active").sort((a, b) => b.purchases - a.purchases).slice(0, 50);
    if (freqGoneQuiet.length > 0) {
      const totalLtv = freqGoneQuiet.reduce((s, c) => s + c.ltv, 0);
      campaigns.push({ id: "freq_gone_quiet", name: "Loyalists Going Quiet", emoji: "🔥", urgency: "medium", contactCount: freqGoneQuiet.length,
        reason: `${freqGoneQuiet.length} customers with 5+ purchases have gone quiet. These were regulars. Combined value: $${totalLtv.toLocaleString()}.`,
        contacts: freqGoneQuiet.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName || "", email: c.email!, ltv: c.ltv, daysSince: c.daysSince, purchases: c.purchases })),
        subject: "We miss seeing you, {{firstName}}", estimatedRevenue: `$${Math.round(totalLtv * 0.12).toLocaleString()} potential`,
        body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a1a2e;">{{firstName}}, it's been too long</h2><p style="color:#555;line-height:1.6;">You used to be one of our regulars, and honestly — we've missed you.</p><a href="#" style="display:inline-block;background:#6d28d9;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">See What's New</a></div>` });
    }

    // 5: Mid-Tier Upsell
    const midTier = enriched.filter(c => c.ltv >= 200 && c.ltv < 500 && (c.subStatus === "active" || c.daysSince < 30) && c.purchases >= 2).sort((a, b) => b.ltv - a.ltv).slice(0, 50);
    if (midTier.length > 0) {
      campaigns.push({ id: "mid_tier_upsell", name: "Mid-Tier → Whale Upsell", emoji: "📈", urgency: "low", contactCount: midTier.length,
        reason: `${midTier.length} active customers in the $200-499 range. One more purchase pushes them into whale territory.`,
        contacts: midTier.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName || "", email: c.email!, ltv: c.ltv, daysSince: c.daysSince, purchases: c.purchases })),
        subject: "Something exclusive for our best customers", estimatedRevenue: `$${Math.round(midTier.length * 150).toLocaleString()} upsell potential`,
        body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a1a2e;">{{firstName}}, you've earned this</h2><p style="color:#555;line-height:1.6;">As one of our most engaged customers, we wanted to give you first access to something special.</p><a href="#" style="display:inline-block;background:#6d28d9;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">Unlock Premium Access</a></div>` });
    }

    // 6: Wake the Dead (180+ days)
    const dormant = enriched.filter(c => c.daysSince > 180 && c.ltv > 0 && c.subStatus !== "active").sort((a, b) => b.ltv - a.ltv).slice(0, 100);
    if (dormant.length > 0) {
      const totalLtv = dormant.reduce((s, c) => s + c.ltv, 0);
      campaigns.push({ id: "wake_the_dead", name: "Wake the Dead", emoji: "💀", urgency: "low", contactCount: dormant.length,
        reason: `${dormant.length} customers haven't engaged in 6+ months. Traditional emails won't work. This needs a bold subject and irresistible offer. Past value: $${totalLtv.toLocaleString()}.`,
        contacts: dormant.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName || "", email: c.email!, ltv: c.ltv, daysSince: c.daysSince, purchases: c.purchases })),
        subject: "Should we close your account, {{firstName}}?", estimatedRevenue: `$${Math.round(totalLtv * 0.05).toLocaleString()} if 5% reactivate`,
        body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a1a2e;">{{firstName}}, are you still there?</h2><p style="color:#555;line-height:1.6;">We haven't heard from you in a while, and we're doing some housekeeping. Before we update our records, we wanted to give you one last chance:</p><a href="#" style="display:inline-block;background:#dc2626;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">Wait — Don't Remove Me!</a><p style="color:#999;font-size:13px;">This is the last email we'll send unless you re-engage.</p></div>` });
    }

    const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    campaigns.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return NextResponse.json({ campaigns, summary: { totalCampaigns: campaigns.length, totalReachable: campaigns.reduce((s, c) => s + c.contactCount, 0), totalAnalyzed: enriched.length } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
