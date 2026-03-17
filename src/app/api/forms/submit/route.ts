import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms, formSubmissions, contacts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";

/**
 * POST /api/forms/submit — PUBLIC form submission (no auth required)
 * 
 * Body: { formId: string, data: { firstName, lastName, email, phone, ... }, sourceUrl?: string }
 * 
 * 1. Validates form exists and is active
 * 2. Creates or updates contact in CRM
 * 3. Logs form submission
 * 4. Emits Inngest event → triggers automations
 * 5. Returns success with redirect URL if configured
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formId, data, sourceUrl } = body;

    if (!formId || !data) {
      return NextResponse.json({ error: "formId and data are required" }, { status: 400 });
    }

    // 1. Find form
    const [form] = await db.select().from(forms).where(eq(forms.id, formId)).limit(1);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    if (form.status !== "active") {
      return NextResponse.json({ error: "Form is not accepting submissions" }, { status: 400 });
    }

    // 2. Create or update contact
    let contactId: string | null = null;
    const email = data.email?.toLowerCase()?.trim();
    const firstName = data.firstName?.trim() || data.first_name?.trim() || "";
    const lastName = data.lastName?.trim() || data.last_name?.trim() || "";
    const phone = data.phone?.trim() || "";

    if (email) {
      // Check for existing contact
      const existing = await db.select().from(contacts)
        .where(and(eq(contacts.tenantId, form.tenantId), eq(contacts.email, email)))
        .limit(1);

      if (existing.length > 0) {
        contactId = existing[0].id;
        // Update with any new data
        const updates: any = { updatedAt: new Date() };
        if (firstName && !existing[0].firstName) updates.firstName = firstName;
        if (lastName && !existing[0].lastName) updates.lastName = lastName;
        if (phone && !existing[0].phone) updates.phone = phone;

        // Add "Form Submission" tag
        const tags = Array.isArray(existing[0].tags) ? [...existing[0].tags] : [];
        if (!tags.includes("Form Submission")) {
          tags.push("Form Submission");
          updates.tags = tags;
        }

        await db.update(contacts).set(updates).where(eq(contacts.id, contactId));
      } else {
        // Create new contact
        const [newContact] = await db.insert(contacts).values({
          tenantId: form.tenantId,
          firstName,
          lastName,
          email,
          phone,
          source: "form",
          status: "active",
          tags: ["Form Submission"],
        }).returning();
        contactId = newContact.id;
      }
    }

    // 3. Log submission
    const [submission] = await db.insert(formSubmissions).values({
      tenantId: form.tenantId,
      formId: form.id,
      contactId,
      data,
      sourceUrl: sourceUrl || null,
    }).returning();

    // 4. Emit Inngest event → triggers automations
    inngest.send({
      name: "crm/form.submitted",
      data: {
        tenantId: form.tenantId,
        formId: form.id,
        formName: form.name,
        submissionId: submission.id,
        contactId,
        contactName: `${firstName} ${lastName}`.trim(),
        contactEmail: email,
        contactPhone: phone,
        formData: data,
      },
    }).catch(() => {});

    // 5. Return success
    const settings = form.settings as any;
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      contactId,
      redirectUrl: settings?.redirectUrl || null,
      thankYouMessage: settings?.thankYouMessage || "Thank you for your submission!",
    });
  } catch (err) {
    console.error("[Form Submit] Error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
