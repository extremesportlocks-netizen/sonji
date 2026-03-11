/**
 * EMAIL TEMPLATE ENGINE
 *
 * Renders HTML emails with variable substitution, conditional blocks,
 * and prebuilt industry templates. No external dependencies.
 *
 * Variables: {{contact.firstName}}, {{deal.title}}, {{tenant.businessName}}
 * Conditionals: {{#if deal.value}}...{{/if}}
 * Loops: {{#each items}}...{{/each}}
 */

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  category: "welcome" | "followup" | "nurture" | "invoice" | "meeting" | "notification" | "custom";
  variables: string[]; // list of available variables for this template
}

export interface EmailRenderContext {
  contact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  deal?: {
    title?: string;
    value?: number;
    stage?: string;
    expectedClose?: string;
  };
  tenant?: {
    businessName?: string;
    supportEmail?: string;
    phone?: string;
    website?: string;
    primaryColor?: string;
    logoUrl?: string;
  };
  user?: {
    name?: string;
    email?: string;
    title?: string;
    phone?: string;
  };
  meeting?: {
    title?: string;
    date?: string;
    time?: string;
    link?: string;
    location?: string;
  };
  invoice?: {
    number?: string;
    total?: number;
    dueDate?: string;
    paymentLink?: string;
    items?: { description: string; qty: number; rate: number }[];
  };
  custom?: Record<string, string>;
  unsubscribeUrl?: string;
}

// ════════════════════════════════════════
// VARIABLE RESOLUTION
// ════════════════════════════════════════

/**
 * Resolve a dot-notation variable path from context.
 * e.g., "contact.firstName" → context.contact.firstName
 */
function resolveVariable(path: string, context: Record<string, any>): string {
  const parts = path.trim().split(".");
  let current: any = context;
  for (const part of parts) {
    if (current === null || current === undefined) return "";
    current = current[part];
  }
  if (current === null || current === undefined) return "";
  if (typeof current === "number") return current.toLocaleString();
  return String(current);
}

/**
 * Replace all {{variable}} placeholders in a string.
 */
export function renderVariables(template: string, context: EmailRenderContext): string {
  // Simple variable replacement: {{contact.firstName}}
  let result = template.replace(/\{\{([^#/}]+?)\}\}/g, (_, path) => {
    return escapeHtml(resolveVariable(path, context as Record<string, any>));
  });

  // Conditional blocks: {{#if variable}}content{{/if}}
  result = result.replace(/\{\{#if\s+(.+?)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, path, content) => {
    const value = resolveVariable(path, context as Record<string, any>);
    return value && value !== "0" && value !== "false" ? content : "";
  });

  // Negative conditional: {{#unless variable}}content{{/unless}}
  result = result.replace(/\{\{#unless\s+(.+?)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (_, path, content) => {
    const value = resolveVariable(path, context as Record<string, any>);
    return !value || value === "0" || value === "false" ? content : "";
  });

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ════════════════════════════════════════
// EMAIL WRAPPER
// ════════════════════════════════════════

/**
 * Wrap email body in a branded HTML shell with responsive layout.
 */
export function wrapInEmailShell(bodyHtml: string, context: EmailRenderContext): string {
  const primaryColor = context.tenant?.primaryColor || "#6366f1";
  const businessName = context.tenant?.businessName || "Sonji";
  const logoUrl = context.tenant?.logoUrl;
  const supportEmail = context.tenant?.supportEmail || "hello@sonji.io";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${businessName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

<!-- Header -->
<tr><td style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
  ${logoUrl
    ? `<img src="${logoUrl}" alt="${businessName}" style="height:32px;" />`
    : `<span style="font-size:20px;font-weight:700;color:#09090b;">${businessName}</span>`
  }
</td></tr>

<!-- Body -->
<tr><td style="padding:32px;font-size:15px;line-height:1.7;color:#3f3f46;">
${bodyHtml}
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid #e4e4e7;font-size:12px;color:#a1a1aa;text-align:center;">
  <p style="margin:0 0 8px;">${businessName} · <a href="mailto:${supportEmail}" style="color:${primaryColor};text-decoration:none;">${supportEmail}</a></p>
  ${context.unsubscribeUrl ? `<p style="margin:0;"><a href="${context.unsubscribeUrl}" style="color:#a1a1aa;text-decoration:underline;">Unsubscribe</a></p>` : ""}
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Generate a plain-text version from HTML body.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ════════════════════════════════════════
// PREBUILT TEMPLATES
// ════════════════════════════════════════

export const TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    id: "tpl_welcome",
    name: "Welcome Email",
    subject: "Welcome to {{tenant.businessName}}!",
    category: "welcome",
    variables: ["contact.firstName", "tenant.businessName", "tenant.supportEmail"],
    bodyHtml: `
<p>Hi {{contact.firstName}},</p>
<p>Welcome to <strong>{{tenant.businessName}}</strong>! We're excited to have you on board.</p>
<p>Here's what happens next:</p>
<ol style="padding-left:20px;">
  <li>We'll review your information within 24 hours</li>
  <li>A member of our team will reach out to schedule your first appointment</li>
  <li>In the meantime, feel free to reply to this email with any questions</li>
</ol>
<p>We're here to help every step of the way.</p>
<p>Best,<br/>The {{tenant.businessName}} Team</p>`,
    bodyText: "",
  },

  followup: {
    id: "tpl_followup",
    name: "Follow-up After Meeting",
    subject: "Great meeting, {{contact.firstName}} — next steps",
    category: "followup",
    variables: ["contact.firstName", "meeting.title", "user.name", "tenant.businessName"],
    bodyHtml: `
<p>Hi {{contact.firstName}},</p>
<p>Thanks for taking the time to meet today. I really enjoyed our conversation about <strong>{{meeting.title}}</strong>.</p>
<p>As discussed, here are the next steps:</p>
<ol style="padding-left:20px;">
  <li>I'll send over the proposal by end of this week</li>
  <li>We'll schedule a follow-up call to review together</li>
  <li>If approved, we can kick off implementation immediately</li>
</ol>
<p>Don't hesitate to reach out if you have any questions in the meantime.</p>
<p>Best regards,<br/>{{user.name}}<br/>{{tenant.businessName}}</p>`,
    bodyText: "",
  },

  invoice_sent: {
    id: "tpl_invoice",
    name: "Invoice Sent",
    subject: "Invoice {{invoice.number}} from {{tenant.businessName}}",
    category: "invoice",
    variables: ["contact.firstName", "invoice.number", "invoice.total", "invoice.dueDate", "invoice.paymentLink", "tenant.businessName"],
    bodyHtml: `
<p>Hi {{contact.firstName}},</p>
<p>Please find your invoice details below:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  <tr style="background:#f4f4f5;">
    <td style="padding:10px 16px;font-weight:600;font-size:13px;">Invoice Number</td>
    <td style="padding:10px 16px;font-size:13px;">{{invoice.number}}</td>
  </tr>
  <tr>
    <td style="padding:10px 16px;font-weight:600;font-size:13px;">Amount Due</td>
    <td style="padding:10px 16px;font-size:13px;font-weight:700;">\${{invoice.total}}</td>
  </tr>
  <tr style="background:#f4f4f5;">
    <td style="padding:10px 16px;font-weight:600;font-size:13px;">Due Date</td>
    <td style="padding:10px 16px;font-size:13px;">{{invoice.dueDate}}</td>
  </tr>
</table>
{{#if invoice.paymentLink}}
<p style="text-align:center;margin:24px 0;">
  <a href="{{invoice.paymentLink}}" style="display:inline-block;padding:12px 32px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Pay Now</a>
</p>
{{/if}}
<p>If you have any questions about this invoice, please reply to this email.</p>
<p>Thank you,<br/>{{tenant.businessName}}</p>`,
    bodyText: "",
  },

  meeting_reminder: {
    id: "tpl_meeting_reminder",
    name: "Meeting Reminder",
    subject: "Reminder: {{meeting.title}} — {{meeting.date}} at {{meeting.time}}",
    category: "meeting",
    variables: ["contact.firstName", "meeting.title", "meeting.date", "meeting.time", "meeting.link", "meeting.location", "user.name"],
    bodyHtml: `
<p>Hi {{contact.firstName}},</p>
<p>Just a friendly reminder about our upcoming meeting:</p>
<div style="background:#f4f4f5;padding:16px 20px;border-radius:8px;margin:16px 0;">
  <p style="margin:0 0 4px;font-weight:700;">{{meeting.title}}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#71717a;">📅 {{meeting.date}} at {{meeting.time}}</p>
  {{#if meeting.link}}<p style="margin:0;font-size:13px;">🔗 <a href="{{meeting.link}}" style="color:#6366f1;">Join Video Call</a></p>{{/if}}
  {{#if meeting.location}}<p style="margin:0;font-size:13px;color:#71717a;">📍 {{meeting.location}}</p>{{/if}}
</div>
<p>Looking forward to speaking with you!</p>
<p>{{user.name}}</p>`,
    bodyText: "",
  },

  nurture_1: {
    id: "tpl_nurture_1",
    name: "Nurture — Check-in",
    subject: "Checking in, {{contact.firstName}}",
    category: "nurture",
    variables: ["contact.firstName", "user.name", "tenant.businessName"],
    bodyHtml: `
<p>Hi {{contact.firstName}},</p>
<p>I wanted to check in and see if you had any questions about {{tenant.businessName}}. I know things can get busy, so no pressure at all.</p>
<p>If you're ready to move forward, I'd love to schedule a quick call to walk through next steps. If not, no worries — I'm here whenever you need me.</p>
<p>Best,<br/>{{user.name}}</p>`,
    bodyText: "",
  },
};

/**
 * Render a complete email (subject + HTML body + plain text).
 */
export function renderEmail(
  template: EmailTemplate,
  context: EmailRenderContext
): { subject: string; html: string; text: string } {
  const subject = renderVariables(template.subject, context);
  const bodyHtml = renderVariables(template.bodyHtml, context);
  const html = wrapInEmailShell(bodyHtml, context);
  const text = htmlToPlainText(renderVariables(template.bodyHtml, context));

  return { subject, html, text };
}

/**
 * Get all available templates, optionally filtered by category.
 */
export function getTemplates(category?: EmailTemplate["category"]): EmailTemplate[] {
  const all = Object.values(TEMPLATES);
  if (!category) return all;
  return all.filter((t) => t.category === category);
}
