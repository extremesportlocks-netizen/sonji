import { inngest } from "../client";
import { db } from "@/lib/db";
import { emailCampaigns, contacts, tenants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendBatchEmail, getResendForTenant } from "@/lib/services/email";
import { sendNotification } from "@/lib/services/notifications";

/**
 * CAMPAIGN SENDER — Sends email campaigns in batches via Resend
 */
export const campaignSender = inngest.createFunction(
  { id: "campaign-sender", name: "Send Email Campaign" },
  { event: "crm/campaign.send" },
  async ({ event, step }) => {
    const { tenantId, campaignId, subject, html, segment } = event.data;

    // Get tenant email config
    const emailConfig = await step.run("get-config", async () => {
      const [tenant] = await db.select({ settings: tenants.settings }).from(tenants)
        .where(eq(tenants.id, tenantId)).limit(1);
      return (tenant?.settings as any)?.email || null;
    });

    // Get recipients
    const recipients = await step.run("get-recipients", async () => {
      const conditions = [eq(contacts.tenantId, tenantId), eq(contacts.status, "active")];
      const rows = await db.select({
        email: contacts.email,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
      }).from(contacts).where(and(...conditions)).limit(5000);
      return rows.filter(r => r.email);
    });

    if (!recipients.length) {
      await step.run("mark-empty", async () => {
        await db.update(emailCampaigns)
          .set({ status: "failed" } as any)
          .where(eq(emailCampaigns.id, campaignId));
      });
      return { sent: 0, error: "No recipients" };
    }

    // Send in batches of 100
    const batchSize = 100;
    let totalSent = 0;
    let totalFailed = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      await step.run(`send-batch-${batchNum}`, async () => {
        const emails = batch.map(r => ({
          to: r.email!,
          subject,
          html: html
            .replace(/\{\{firstName\}\}/g, r.firstName || "")
            .replace(/\{\{lastName\}\}/g, r.lastName || ""),
          tags: [{ name: "campaign", value: campaignId }],
        }));

        const result = await sendBatchEmail(emailConfig, emails);
        if (result.success) {
          totalSent += batch.length;
        } else {
          totalFailed += batch.length;
        }
      });

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await step.sleep(`batch-delay-${batchNum}`, "2s");
      }
    }

    // Update campaign status
    await step.run("mark-complete", async () => {
      await db.update(emailCampaigns)
        .set({
          status: "sent",
          sentAt: new Date(),
        } as any)
        .where(eq(emailCampaigns.id, campaignId));
    });

    return { sent: totalSent, failed: totalFailed, total: recipients.length };
  }
);
