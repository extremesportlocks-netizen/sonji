import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts, tenants } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth-context";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth(req);
    const { message, history } = await req.json();

    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    // Gather CRM context for the AI
    const [stats] = await db.select({
      totalContacts: sql<number>`count(*)::int`,
      totalRevenue: sql<number>`COALESCE(sum((${contacts.customFields}->>'ltv')::numeric), 0)`,
      avgLtv: sql<number>`COALESCE(avg((${contacts.customFields}->>'ltv')::numeric), 0)`,
      activeSubscribers: sql<number>`count(*) filter (where ${contacts.customFields}->>'subscriptionStatus' = 'active')::int`,
      whaleCount: sql<number>`count(*) filter (where (${contacts.customFields}->>'ltv')::numeric >= 500)::int`,
      lapsedCount: sql<number>`count(*) filter (where ${contacts.customFields}->>'subscriptionStatus' = 'canceled')::int`,
    }).from(contacts).where(eq(contacts.tenantId, ctx.tenantId));

    // Get tenant info
    const [tenant] = await db.select({ name: tenants.name }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);

    const systemPrompt = `You are the AI assistant built into Sonji CRM. You help business owners understand their customer data and take action.

CURRENT CRM DATA for ${tenant?.name || "this business"}:
- Total contacts: ${stats.totalContacts}
- Total lifetime revenue: $${Number(stats.totalRevenue).toLocaleString()}
- Average customer LTV: $${Number(stats.avgLtv).toFixed(0)}
- Active subscribers: ${stats.activeSubscribers}
- High value clients ($500+ LTV): ${stats.whaleCount}
- Lapsed/canceled: ${stats.lapsedCount}

You can help with:
- Answering questions about their data ("How many whales do I have?")
- Suggesting campaigns and segments
- Drafting email copy
- Strategic advice on re-engagement, retention, growth
- Explaining CRM features

Keep answers concise and actionable. Use the real numbers above. If asked to do something you can't (like actually send an email), explain how to do it in Sonji.`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ response: `Based on your CRM data:\n\n• ${stats.totalContacts} total contacts\n• $${Number(stats.totalRevenue).toLocaleString()} lifetime revenue\n• ${stats.whaleCount} whale customers ($500+)\n• ${stats.activeSubscribers} active subscribers\n• ${stats.lapsedCount} lapsed customers\n\nTo enable full AI conversations, add ANTHROPIC_API_KEY to your Vercel environment variables.` });
    }

    // Call Claude API
    const messages = [
      ...(history || []).slice(-8).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text || "No response";

    return NextResponse.json({ response: aiResponse });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
