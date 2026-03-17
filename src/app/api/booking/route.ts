import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, contacts, tenants, availabilityRules } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";

/**
 * GET /api/booking?tenant=xxx&slug=consultation — Get available time slots
 * Public endpoint — no auth required
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenant");
    const slug = url.searchParams.get("slug");
    const dateStr = url.searchParams.get("date"); // YYYY-MM-DD

    if (!tenantId) {
      return NextResponse.json({ error: "tenant parameter required" }, { status: 400 });
    }

    // Get tenant info
    const [tenant] = await db.select({ id: tenants.id, settings: tenants.settings })
      .from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const settings = tenant.settings as any;
    const businessName = settings?.businessName || "Business";
    const bookingConfig = settings?.scheduling || {};

    // Get availability rules for this tenant
    const rules = await db.select().from(availabilityRules)
      .where(eq(availabilityRules.tenantId, tenantId));

    // Default availability: Mon-Fri 9am-5pm
    const defaultSlots = [];
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const dayOfWeek = targetDate.getDay();

    const rule = rules.find(r => r.dayOfWeek === dayOfWeek);
    const startHour = rule ? parseInt(String(rule.startTime).split(":")[0]) : 9;
    const endHour = rule ? parseInt(String(rule.endTime).split(":")[0]) : 17;
    const slotDuration = bookingConfig.defaultDuration || 30; // minutes

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Get existing appointments for this date
      const dateStart = new Date(targetDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(targetDate);
      dateEnd.setHours(23, 59, 59, 999);

      const existing = await db.select({ startsAt: appointments.startsAt, endsAt: appointments.endsAt })
        .from(appointments)
        .where(and(
          eq(appointments.tenantId, tenantId),
          gte(appointments.startsAt, dateStart),
          lte(appointments.startsAt, dateEnd),
        ));

      const bookedTimes = existing.map(a => ({
        start: new Date(a.startsAt).getHours() * 60 + new Date(a.startsAt).getMinutes(),
        end: a.endsAt ? new Date(a.endsAt).getHours() * 60 + new Date(a.endsAt).getMinutes() : 0,
      }));

      for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += slotDuration) {
          const slotStart = hour * 60 + min;
          const slotEnd = slotStart + slotDuration;
          if (slotEnd > endHour * 60) continue;

          const isBooked = bookedTimes.some(b => slotStart < b.end && slotEnd > b.start);
          if (!isBooked) {
            const h = String(Math.floor(slotStart / 60)).padStart(2, "0");
            const m = String(slotStart % 60).padStart(2, "0");
            defaultSlots.push({
              time: `${h}:${m}`,
              available: true,
            });
          }
        }
      }
    }

    return NextResponse.json({
      businessName,
      date: targetDate.toISOString().split("T")[0],
      dayOfWeek,
      slots: defaultSlots,
      duration: slotDuration,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load slots" }, { status: 500 });
  }
}

/**
 * POST /api/booking — Book an appointment (public, no auth)
 * Body: { tenantId, date, time, name, email, phone?, notes?, type? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, date, time, name, email, phone, notes, type } = body;

    if (!tenantId || !date || !time || !name || !email) {
      return NextResponse.json({ error: "tenantId, date, time, name, and email are required" }, { status: 400 });
    }

    // Verify tenant exists
    const [tenant] = await db.select({ id: tenants.id }).from(tenants)
      .where(eq(tenants.id, tenantId)).limit(1);
    if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Find or create contact
    let contactId: string | null = null;
    const existing = await db.select().from(contacts)
      .where(and(eq(contacts.tenantId, tenantId), eq(contacts.email, email.toLowerCase())))
      .limit(1);

    if (existing.length > 0) {
      contactId = existing[0].id;
      const tags = Array.isArray(existing[0].tags) ? [...existing[0].tags] : [];
      if (!tags.includes("Booking")) {
        tags.push("Booking");
        await db.update(contacts).set({ tags, updatedAt: new Date() })
          .where(eq(contacts.id, contactId));
      }
    } else {
      const [firstName, ...lastParts] = name.split(" ");
      const [newContact] = await db.insert(contacts).values({
        tenantId,
        firstName,
        lastName: lastParts.join(" ") || "",
        email: email.toLowerCase(),
        phone: phone || null,
        source: "booking",
        status: "active",
        tags: ["Booking"],
      }).returning();
      contactId = newContact.id;
    }

    // Parse datetime
    const [hours, minutes] = time.split(":").map(Number);
    const startsAt = new Date(date);
    startsAt.setHours(hours, minutes, 0, 0);

    const settings = (await db.select({ settings: tenants.settings }).from(tenants)
      .where(eq(tenants.id, tenantId)).limit(1))[0]?.settings as any;
    const duration = settings?.scheduling?.defaultDuration || 30;

    const endsAt = new Date(startsAt.getTime() + duration * 60000);

    // Create appointment
    const [appointment] = await db.insert(appointments).values({
      tenantId,
      contactId,
      contactName: name,
      title: type || "Booking",
      type: type || "meeting",
      startsAt,
      endsAt,
      status: "scheduled",
      notes: notes || null,
    }).returning();

    // Emit event → triggers automations
    inngest.send({
      name: "crm/appointment.scheduled",
      data: {
        tenantId,
        appointmentId: appointment.id,
        contactId,
        contactName: name,
        contactEmail: email,
        contactPhone: phone,
        date,
        time,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      message: `Booked for ${date} at ${time}`,
    });
  } catch (err) {
    console.error("[Booking] Error:", err);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
