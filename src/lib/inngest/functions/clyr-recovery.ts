import { inngest } from "../client";
import { getClient_raw } from "@/lib/db";
import { sendEmail } from "@/lib/services/email";

/**
 * CLYR ABANDONED CART RECOVERY — Inngest Functions
 *
 * Two sequences:
 * 1. Checkout Abandoned — patient reached Stripe payment page, didn't pay
 *    - 1hr: warm nudge ("You're one step away")
 *    - 24hr: urgency ("Your provider spot is still reserved")
 *    - 72hr: last chance ("Last chance to start your treatment")
 *
 * 2. Intake Abandoned — patient completed intake but never clicked checkout
 *    - 1hr: soft touch ("We noticed you started your consultation")
 *    - 24hr: reminder ("Your health profile is saved")
 *    - 72hr: offer help ("Questions? We're here to help")
 *
 * Kill trigger: If the patient completes payment at any point, stop the sequence.
 * Check is done before each email send by querying the deal's current stage.
 */

// ════════════════════════════════════════
// SEQUENCE 1: CHECKOUT ABANDONED
// ════════════════════════════════════════

export const clyrCheckoutAbandonedRecovery = inngest.createFunction(
  {
    id: "clyr-checkout-abandoned-recovery",
    name: "CLYR: Checkout Abandoned Recovery Sequence",
    cancelOn: [
      {
        event: "clyr/checkout.confirmed",
        match: "data.contactEmail",
      },
    ],
  },
  { event: "clyr/checkout.abandoned" },
  async ({ event, step }) => {
    const { tenantId, contactId, dealId, contactEmail, firstName, treatment, plan } = event.data;

    if (!contactEmail) return { skipped: true, reason: "No email" };

    const treatmentName = treatment === "tirzepatide" ? "Tirzepatide" : "Semaglutide";
    const planLabel = plan === "3-month" ? "3-Month Starter" : plan === "6-month" ? "6-Month Plan" : "Monthly";

    // ─── Email 1: 1 hour after abandonment — warm nudge ───
    await step.sleep("wait-1hr", "1h");

    const shouldSend1 = await step.run("check-kill-1", async () => {
      return await isStillAbandoned(tenantId, contactId);
    });

    if (shouldSend1) {
      await step.run("send-email-1-checkout", async () => {
        await sendRecoveryEmail(contactEmail, firstName, {
          subject: "You're one step away from starting your weight loss journey",
          preheader: "Your consultation is ready — just complete checkout to get started.",
          headline: "You're Almost There",
          body: `
            <p>Hi ${firstName || "there"},</p>
            <p>We noticed you started your ${treatmentName} consultation but didn't complete checkout. Your health screening is already approved — you're just one step away from getting started.</p>
            <p><strong>Your selection:</strong> ${treatmentName} + B12 — ${planLabel}</p>
            <p>Your provider is ready to review your case as soon as payment is confirmed. Most patients receive their medication within 5-7 business days.</p>
          `,
          ctaText: "Complete Your Order",
          ctaUrl: "https://www.clyr.health/intake.html",
        });

        await updateRecoveryStatus(tenantId, contactId, "email_1_sent");
      });
    }

    // ─── Email 2: 24 hours — urgency ───
    await step.sleep("wait-24hr", "23h"); // 23hr because we already waited 1hr

    const shouldSend2 = await step.run("check-kill-2", async () => {
      return await isStillAbandoned(tenantId, contactId);
    });

    if (shouldSend2) {
      await step.run("send-email-2-checkout", async () => {
        await sendRecoveryEmail(contactEmail, firstName, {
          subject: `Your ${treatmentName} provider spot is still reserved`,
          preheader: "Don't lose your place — complete your order today.",
          headline: "Your Provider Spot Is Reserved",
          body: `
            <p>Hi ${firstName || "there"},</p>
            <p>Just a quick reminder — your ${treatmentName} + B12 consultation is still waiting for you. You've already completed the hardest part (the health screening), and your information is saved.</p>
            <p>Here's what happens after you complete checkout:</p>
            <ol style="color: #374151; line-height: 1.8;">
              <li>A licensed provider reviews your case (usually within 24-48 hours)</li>
              <li>If approved, your prescription is sent to our compounding pharmacy</li>
              <li>Medication ships directly to your door in discreet packaging</li>
            </ol>
            <p>No need to redo anything — just pick up where you left off.</p>
          `,
          ctaText: "Complete Your Order Now",
          ctaUrl: "https://www.clyr.health/intake.html",
        });

        await updateRecoveryStatus(tenantId, contactId, "email_2_sent");
      });
    }

    // ─── Email 3: 72 hours — last chance ───
    await step.sleep("wait-72hr", "48h"); // 48hr because we already waited 24hr total

    const shouldSend3 = await step.run("check-kill-3", async () => {
      return await isStillAbandoned(tenantId, contactId);
    });

    if (shouldSend3) {
      await step.run("send-email-3-checkout", async () => {
        await sendRecoveryEmail(contactEmail, firstName, {
          subject: "Last chance to start your treatment plan",
          preheader: "Your saved consultation expires soon. Have questions? We're here.",
          headline: "Last Chance — Your Consultation Is Expiring",
          body: `
            <p>Hi ${firstName || "there"},</p>
            <p>This is our final reminder — your ${treatmentName} + B12 consultation will expire soon, and you'll need to restart the process from scratch.</p>
            <p>If something held you back, we get it. Here are answers to the most common concerns:</p>
            <ul style="color: #374151; line-height: 1.8;">
              <li><strong>Is this safe for me?</strong> A licensed provider reviews your complete health profile before approving anything.</li>
              <li><strong>What if I have questions?</strong> Our care team is available Mon-Fri 9am-6pm ET at <a href="mailto:contact@clyr.health" style="color: #2bbcb3;">contact@clyr.health</a></li>
              <li><strong>Can I cancel?</strong> Monthly plans can be cancelled anytime — no contracts, no hidden fees.</li>
            </ul>
          `,
          ctaText: "Complete Your Order Before It Expires",
          ctaUrl: "https://www.clyr.health/intake.html",
          footerExtra: `<p style="margin-top: 16px; font-size: 13px; color: #9ca3af;">Have questions? Reply to this email or contact us at <a href="https://www.clyr.health/contact.html" style="color: #2bbcb3;">clyr.health/contact</a>. We're happy to help.</p>`,
        });

        await updateRecoveryStatus(tenantId, contactId, "email_3_sent");
      });
    }

    // Mark sequence as complete
    await step.run("mark-expired", async () => {
      await updateRecoveryStatus(tenantId, contactId, "expired");
    });

    return {
      completed: true,
      contactEmail,
      emailsSent: [shouldSend1, shouldSend2, shouldSend3].filter(Boolean).length,
    };
  }
);

// ════════════════════════════════════════
// SEQUENCE 2: INTAKE ABANDONED
// ════════════════════════════════════════

export const clyrIntakeAbandonedRecovery = inngest.createFunction(
  {
    id: "clyr-intake-abandoned-recovery",
    name: "CLYR: Intake Abandoned Recovery Sequence",
    cancelOn: [
      {
        event: "clyr/checkout.confirmed",
        match: "data.contactEmail",
      },
    ],
  },
  { event: "clyr/intake.abandoned" },
  async ({ event, step }) => {
    const { tenantId, contactId, contactEmail, firstName, treatment } = event.data;

    if (!contactEmail) return { skipped: true, reason: "No email" };

    const treatmentName = treatment === "tirzepatide" ? "Tirzepatide" : treatment === "semaglutide" ? "Semaglutide" : "your selected treatment";

    // ─── Email 1: 1 hour — soft touch ───
    await step.sleep("wait-1hr", "1h");

    const shouldSend1 = await step.run("check-kill-1", async () => {
      return await isStillAbandoned(tenantId, contactId);
    });

    if (shouldSend1) {
      await step.run("send-email-1-intake", async () => {
        await sendRecoveryEmail(contactEmail, firstName, {
          subject: "We noticed you started your consultation",
          preheader: "Your health screening is complete — here's what's next.",
          headline: "You're Already Approved",
          body: `
            <p>Hi ${firstName || "there"},</p>
            <p>Great news — you've already completed your health screening and you're eligible for ${treatmentName} + B12 through CLYR Health.</p>
            <p>The next step is simple: choose your plan and complete checkout. A licensed provider will review your case, and if approved, your medication ships directly to your door.</p>
            <p>The whole process takes about 2 minutes to finish.</p>
          `,
          ctaText: "Finish Your Consultation",
          ctaUrl: "https://www.clyr.health/intake.html",
        });

        await updateRecoveryStatus(tenantId, contactId, "email_1_sent");
      });
    }

    // ─── Email 2: 24 hours — remind profile is saved ───
    await step.sleep("wait-24hr", "23h");

    const shouldSend2 = await step.run("check-kill-2", async () => {
      return await isStillAbandoned(tenantId, contactId);
    });

    if (shouldSend2) {
      await step.run("send-email-2-intake", async () => {
        await sendRecoveryEmail(contactEmail, firstName, {
          subject: "Your health profile is saved — pick up where you left off",
          preheader: "No need to redo the screening. Your info is ready.",
          headline: "Your Profile Is Waiting",
          body: `
            <p>Hi ${firstName || "there"},</p>
            <p>Just wanted to let you know — your health screening results are saved. You don't need to fill anything out again.</p>
            <p>When you're ready, just visit our site to choose your plan and complete checkout. The whole thing takes under 2 minutes.</p>
            <p><strong>What you'll get:</strong></p>
            <ul style="color: #374151; line-height: 1.8;">
              <li>Licensed provider consultation</li>
              <li>${treatmentName} + B12 compounded medication</li>
              <li>Free shipping in discreet packaging</li>
              <li>Ongoing care team support</li>
            </ul>
          `,
          ctaText: "Choose Your Plan",
          ctaUrl: "https://www.clyr.health/intake.html",
        });

        await updateRecoveryStatus(tenantId, contactId, "email_2_sent");
      });
    }

    // ─── Email 3: 72 hours — offer help ───
    await step.sleep("wait-72hr", "48h");

    const shouldSend3 = await step.run("check-kill-3", async () => {
      return await isStillAbandoned(tenantId, contactId);
    });

    if (shouldSend3) {
      await step.run("send-email-3-intake", async () => {
        await sendRecoveryEmail(contactEmail, firstName, {
          subject: "Questions? We're here to help",
          preheader: "If something's holding you back, our care team can help.",
          headline: "We're Here If You Need Us",
          body: `
            <p>Hi ${firstName || "there"},</p>
            <p>We understand that starting a weight management program is a big decision, and it's completely normal to have questions.</p>
            <p>If anything is holding you back — concerns about the medication, pricing, or the process — our care team is happy to help:</p>
            <ul style="color: #374151; line-height: 1.8;">
              <li><strong>Email:</strong> <a href="mailto:contact@clyr.health" style="color: #2bbcb3;">contact@clyr.health</a></li>
              <li><strong>Contact form:</strong> <a href="https://www.clyr.health/contact.html" style="color: #2bbcb3;">clyr.health/contact</a></li>
              <li><strong>Available:</strong> Mon-Fri 9am-6pm ET, Sat 10am-2pm ET</li>
            </ul>
            <p>No pressure — we just want to make sure you have everything you need to make the right decision for your health.</p>
          `,
          ctaText: "Contact Our Care Team",
          ctaUrl: "https://www.clyr.health/contact.html",
        });

        await updateRecoveryStatus(tenantId, contactId, "email_3_sent");
      });
    }

    await step.run("mark-expired", async () => {
      await updateRecoveryStatus(tenantId, contactId, "expired");
    });

    return {
      completed: true,
      contactEmail,
      emailsSent: [shouldSend1, shouldSend2, shouldSend3].filter(Boolean).length,
    };
  }
);

// ════════════════════════════════════════
// SEQUENCE 3: WELCOME EMAIL ON PAYMENT
// ════════════════════════════════════════

export const clyrWelcomeEmail = inngest.createFunction(
  {
    id: "clyr-welcome-email",
    name: "CLYR: Welcome Email After Payment",
  },
  { event: "clyr/checkout.confirmed" },
  async ({ event, step }) => {
    const { contactEmail, firstName, treatment, plan, amount } = event.data;

    if (!contactEmail) return { skipped: true, reason: "No email" };

    const treatmentName = treatment === "tirzepatide" ? "Tirzepatide" : "Semaglutide";
    const planLabel = plan === "3-month" ? "3-Month Starter" : plan === "6-month" ? "6-Month Plan" : "Monthly";

    await step.run("send-welcome", async () => {
      await sendRecoveryEmail(contactEmail, firstName, {
        subject: `Welcome to CLYR Health — your ${treatmentName} journey starts now`,
        preheader: "Your order is confirmed. Here's what happens next.",
        headline: "Welcome to CLYR Health",
        body: `
          <p>Hi ${firstName || "there"},</p>
          <p>Thank you for choosing CLYR Health! Your order has been confirmed and a licensed provider is now reviewing your case.</p>
          <p><strong>Your order:</strong> ${treatmentName} + B12 — ${planLabel}${amount ? ` ($${amount})` : ""}</p>
          <p><strong>Here's what happens next:</strong></p>
          <ol style="color: #374151; line-height: 1.8;">
            <li><strong>Provider Review</strong> — A licensed physician will review your health profile (typically 24-48 hours)</li>
            <li><strong>Prescription</strong> — If approved, your prescription is sent to our compounding pharmacy</li>
            <li><strong>Shipping</strong> — Your medication ships in discreet packaging, usually within 5-7 business days</li>
          </ol>
          <p>You can track your status anytime in your <a href="https://www.clyr.health/portal/" style="color: #2bbcb3; font-weight: 600;">Patient Portal</a>.</p>
          <p>If you have any questions, our care team is here for you at <a href="mailto:contact@clyr.health" style="color: #2bbcb3;">contact@clyr.health</a>.</p>
        `,
        ctaText: "Visit Your Patient Portal",
        ctaUrl: "https://www.clyr.health/portal/",
      });
    });

    return { sent: true, contactEmail };
  }
);

// ════════════════════════════════════════
// SHARED HELPERS
// ════════════════════════════════════════

/**
 * Check if a contact's deal is still in an abandoned stage.
 * Returns false if they've completed payment (kill trigger).
 */
async function isStillAbandoned(tenantId: string, contactId: string): Promise<boolean> {
  try {
    const sql = getClient_raw();
    const rows = await sql`
      SELECT d.stage, c.custom_fields
      FROM contacts c
      LEFT JOIN deals d ON d.contact_id = c.id AND d.tenant_id = c.tenant_id
      WHERE c.tenant_id = ${tenantId} AND c.id = ${contactId}
      LIMIT 1
    `;

    if (rows.length === 0) return false;

    const stage = rows[0].stage;
    const cf = (rows[0].custom_fields as any) || {};

    // Kill trigger: if they've paid or progressed past abandonment, stop
    const PAID_STAGES = ["Payment Collected", "Under Review", "Approved", "Prescribed", "Shipped", "Delivered", "Active"];
    if (stage && PAID_STAGES.includes(stage)) return false;

    // Also check recoveryStatus
    if (cf.recoveryStatus === "recovered") return false;

    return true;
  } catch (err) {
    console.error("[CLYR Recovery] Kill trigger check failed:", err);
    return false; // Fail safe — don't send if we can't verify
  }
}

/**
 * Update the recoveryStatus field on a contact's custom_fields.
 */
async function updateRecoveryStatus(tenantId: string, contactId: string, status: string) {
  try {
    const sql = getClient_raw();
    await sql`
      UPDATE contacts
      SET custom_fields = custom_fields || ${JSON.stringify({ recoveryStatus: status })}::jsonb
      WHERE tenant_id = ${tenantId} AND id = ${contactId}
    `;
  } catch (err) {
    console.error("[CLYR Recovery] Failed to update recovery status:", err);
  }
}

/**
 * Send a branded CLYR Health recovery/transactional email.
 */
async function sendRecoveryEmail(
  to: string,
  firstName: string | undefined,
  options: {
    subject: string;
    preheader: string;
    headline: string;
    body: string;
    ctaText: string;
    ctaUrl: string;
    footerExtra?: string;
  }
) {
  const html = buildClyrEmailHtml(options);

  const result = await sendEmail(null, {
    to,
    subject: options.subject,
    html,
    from: "CLYR Health <noreply@sonji.io>", // TODO: Switch to noreply@clyr.health once Resend domain is verified
    replyTo: "contact@clyr.health",
  });

  if (!result.success) {
    console.error(`[CLYR Recovery] Email failed to ${to}:`, result.error);
    throw new Error(`Email failed: ${result.error}`);
  }

  console.log(`[CLYR Recovery] Email sent to ${to}: "${options.subject}" (${result.id})`);
  return result;
}

/**
 * Build a branded CLYR Health HTML email.
 * Clean, mobile-responsive, matches clyr.health design system.
 */
function buildClyrEmailHtml(options: {
  preheader: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  footerExtra?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CLYR Health</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f3f4f6;">
    ${options.preheader}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:700;color:#2bbcb3;letter-spacing:2px;">CLYR</span>
              <span style="font-size:14px;color:#6b7280;display:block;margin-top:2px;">HEALTH</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

              <!-- Headline -->
              <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#1a1a2e;line-height:1.3;">
                ${options.headline}
              </h1>

              <!-- Body -->
              <div style="font-size:15px;line-height:1.7;color:#374151;">
                ${options.body}
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
                <tr>
                  <td style="border-radius:8px;background-color:#2bbcb3;">
                    <a href="${options.ctaUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      ${options.ctaText}
                    </a>
                  </td>
                </tr>
              </table>

              ${options.footerExtra || ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                CLYR Health &bull; Clyr Health, LLC<br>
                <a href="https://www.clyr.health/privacy.html" style="color:#9ca3af;text-decoration:underline;">Privacy Policy</a> &bull;
                <a href="https://www.clyr.health/terms.html" style="color:#9ca3af;text-decoration:underline;">Terms of Service</a><br>
                <a href="mailto:contact@clyr.health" style="color:#9ca3af;text-decoration:underline;">contact@clyr.health</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
