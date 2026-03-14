import { Resend } from "resend";

/**
 * SONJI EMAIL SERVICE
 * 
 * Two modes:
 * 1. Platform-managed: Sonji's Resend account, per-tenant verified domains
 * 2. BYOK: Tenant provides their own Resend API key
 * 
 * Tenant email config stored in tenants.settings.email:
 * {
 *   mode: "platform" | "byok",
 *   resendApiKey?: string,          // BYOK only
 *   domain?: string,                // e.g. "glowmedspa.com"
 *   domainId?: string,              // Resend domain ID
 *   domainVerified: boolean,
 *   fromName?: string,              // e.g. "Glow Med Spa"
 *   fromEmail?: string,             // e.g. "hello@glowmedspa.com"
 *   replyTo?: string,
 *   dnsRecords?: any[],             // Records tenant needs to add
 * }
 */

// Platform Resend instance (Sonji's account)
function getPlatformResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Tenant's own Resend instance (BYOK)
function getTenantResend(apiKey: string): Resend {
  return new Resend(apiKey);
}

// Get the right Resend instance for a tenant
export function getResendForTenant(emailConfig: any): Resend | null {
  if (!emailConfig) return getPlatformResend();
  if (emailConfig.mode === "byok" && emailConfig.resendApiKey) {
    return getTenantResend(emailConfig.resendApiKey);
  }
  return getPlatformResend();
}

// ─── DOMAIN MANAGEMENT ───

export async function addDomain(domain: string, apiKey?: string): Promise<{
  success: boolean;
  domainId?: string;
  records?: any[];
  error?: string;
}> {
  const resend = apiKey ? getTenantResend(apiKey) : getPlatformResend();
  if (!resend) return { success: false, error: "Resend not configured" };

  try {
    const result = await resend.domains.create({ name: domain });
    if (result.error) return { success: false, error: result.error.message };

    return {
      success: true,
      domainId: result.data?.id,
      records: result.data?.records || [],
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add domain" };
  }
}

export async function verifyDomain(domainId: string, apiKey?: string): Promise<{
  verified: boolean;
  status?: string;
  error?: string;
}> {
  const resend = apiKey ? getTenantResend(apiKey) : getPlatformResend();
  if (!resend) return { verified: false, error: "Resend not configured" };

  try {
    const result = await resend.domains.verify(domainId);
    if (result.error) return { verified: false, error: result.error.message };

    return {
      verified: true,
      status: (result.data as any)?.status,
    };
  } catch (err) {
    return { verified: false, error: err instanceof Error ? err.message : "Verification failed" };
  }
}

export async function getDomainStatus(domainId: string, apiKey?: string): Promise<{
  status: string;
  records?: any[];
  error?: string;
}> {
  const resend = apiKey ? getTenantResend(apiKey) : getPlatformResend();
  if (!resend) return { status: "error", error: "Resend not configured" };

  try {
    const result = await resend.domains.get(domainId);
    if (result.error) return { status: "error", error: result.error.message };

    return {
      status: (result.data as any)?.status || "unknown",
      records: (result.data as any)?.records || [],
    };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to get domain" };
  }
}

export async function removeDomain(domainId: string, apiKey?: string): Promise<{ success: boolean; error?: string }> {
  const resend = apiKey ? getTenantResend(apiKey) : getPlatformResend();
  if (!resend) return { success: false, error: "Resend not configured" };

  try {
    await resend.domains.remove(domainId);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to remove domain" };
  }
}

// ─── SEND EMAIL ───

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;        // Full "Name <email>" format
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(
  emailConfig: any,
  params: SendEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendForTenant(emailConfig);
  if (!resend) return { success: false, error: "Email not configured. Add a Resend API key or connect a domain." };

  // Determine "from" address
  let from = params.from;
  if (!from) {
    if (emailConfig?.fromEmail) {
      from = emailConfig.fromName
        ? `${emailConfig.fromName} <${emailConfig.fromEmail}>`
        : emailConfig.fromEmail;
    } else if (emailConfig?.domain && emailConfig?.domainVerified) {
      const name = emailConfig.fromName || "Sonji";
      from = `${name} <noreply@${emailConfig.domain}>`;
    } else {
      // Fallback to platform domain
      from = "Sonji <noreply@sonji.io>";
    }
  }

  try {
    const result = await resend.emails.send({
      from: from || "Sonji <noreply@sonji.io>",
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: (params.replyTo || emailConfig?.replyTo || undefined) as string | undefined,
    });

    if (result.error) return { success: false, error: result.error.message };
    return { success: true, id: result.data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to send email" };
  }
}

// ─── BATCH SEND ───

export async function sendBatchEmail(
  emailConfig: any,
  emails: SendEmailParams[]
): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
  const results = { success: true, sent: 0, failed: 0, errors: [] as string[] };

  // Resend supports batch of up to 100
  for (let i = 0; i < emails.length; i += 100) {
    const batch = emails.slice(i, i + 100);
    const promises = batch.map((e) => sendEmail(emailConfig, e));
    const responses = await Promise.allSettled(promises);

    for (const r of responses) {
      if (r.status === "fulfilled" && r.value.success) {
        results.sent++;
      } else {
        results.failed++;
        const err = r.status === "fulfilled" ? r.value.error : "Promise rejected";
        if (err) results.errors.push(err);
      }
    }
  }

  results.success = results.failed === 0;
  return results;
}

// ─── VERIFY BYOK KEY ───

export async function verifyResendKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const resend = new Resend(apiKey);
    const result = await resend.domains.list();
    if (result.error) return { valid: false, error: result.error.message };
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid API key" };
  }
}
