/**
 * SLACK NOTIFICATION ENGINE
 *
 * Formats CRM events as Slack Block Kit messages.
 * Supports rich cards with contact info, deal values, action buttons.
 *
 * Pure logic — actual Slack API calls (webhook POST) happen in the action handler.
 * In production: POST formatted payload to tenant's Slack webhook URL.
 */

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  elements?: any[];
  fields?: { type: string; text: string }[];
  accessory?: any;
  block_id?: string;
}

export interface SlackMessage {
  channel?: string;
  text: string; // fallback text for notifications
  blocks: SlackBlock[];
  unfurl_links?: boolean;
}

export interface SlackChannelConfig {
  newLead: string;        // #sales
  dealStageChanged: string; // #deals
  dealWon: string;        // #wins
  dealLost: string;       // #deals
  invoicePaid: string;    // #revenue
  appointmentScheduled: string; // DM to assignee
  taskOverdue: string;    // DM to assignee
  formSubmitted: string;  // #leads
  general: string;        // #general
}

// ════════════════════════════════════════
// BLOCK BUILDERS
// ════════════════════════════════════════

function headerBlock(text: string): SlackBlock {
  return { type: "header", text: { type: "plain_text", text, emoji: true } };
}

function sectionBlock(text: string): SlackBlock {
  return { type: "section", text: { type: "mrkdwn", text } };
}

function fieldsBlock(fields: [string, string][]): SlackBlock {
  return {
    type: "section",
    fields: fields.map(([label, value]) => ({
      type: "mrkdwn",
      text: `*${label}*\n${value}`,
    })),
  };
}

function divider(): SlackBlock {
  return { type: "divider" };
}

function contextBlock(text: string): SlackBlock {
  return {
    type: "context",
    elements: [{ type: "mrkdwn", text }],
  };
}

function actionsBlock(buttons: { text: string; url?: string; action_id?: string; style?: "primary" | "danger" }[]): SlackBlock {
  return {
    type: "actions",
    elements: buttons.map((btn) => ({
      type: "button",
      text: { type: "plain_text", text: btn.text, emoji: true },
      ...(btn.url ? { url: btn.url } : {}),
      ...(btn.action_id ? { action_id: btn.action_id } : {}),
      ...(btn.style ? { style: btn.style } : {}),
    })),
  };
}

// ════════════════════════════════════════
// EVENT → MESSAGE FORMATTERS
// ════════════════════════════════════════

interface BaseUrl { appUrl: string; } // e.g., "https://acme.sonji.io"

/**
 * New lead / form submission
 */
export function formatNewLead(data: {
  contactName: string;
  email?: string;
  phone?: string;
  source: string;
  formName?: string;
  score?: number;
  contactId: string;
}, urls: BaseUrl): SlackMessage {
  const scoreEmoji = data.score ? (data.score >= 70 ? "🔥" : data.score >= 40 ? "🟡" : "🔵") : "";
  const scoreText = data.score ? ` — Score: ${data.score}/100 ${scoreEmoji}` : "";

  return {
    text: `New lead: ${data.contactName}${scoreText}`,
    blocks: [
      headerBlock("🆕 New Lead Received"),
      sectionBlock(`*${data.contactName}*${scoreText}`),
      fieldsBlock([
        ["Email", data.email || "—"],
        ["Phone", data.phone || "—"],
        ["Source", data.source],
        ["Form", data.formName || "Direct"],
      ]),
      divider(),
      actionsBlock([
        { text: "👤 View Contact", url: `${urls.appUrl}/contacts/${data.contactId}`, style: "primary" },
        { text: "📧 Send Email", url: `${urls.appUrl}/messages?compose=${data.contactId}` },
        { text: "📞 Log Call", action_id: `log_call_${data.contactId}` },
      ]),
      contextBlock(`via sonji. • ${new Date().toLocaleString()}`),
    ],
  };
}

/**
 * Deal stage changed
 */
export function formatDealStageChanged(data: {
  dealTitle: string;
  contactName: string;
  previousStage: string;
  newStage: string;
  value: number;
  assignedTo: string;
  dealId: string;
}, urls: BaseUrl): SlackMessage {
  return {
    text: `Deal moved: ${data.dealTitle} → ${data.newStage}`,
    blocks: [
      headerBlock("📊 Deal Stage Changed"),
      sectionBlock(`*${data.dealTitle}*\n${data.previousStage} → *${data.newStage}*`),
      fieldsBlock([
        ["Contact", data.contactName],
        ["Value", `$${data.value.toLocaleString()}`],
        ["Assigned To", data.assignedTo],
        ["Stage", `${data.previousStage} ➜ ${data.newStage}`],
      ]),
      actionsBlock([
        { text: "🤝 View Deal", url: `${urls.appUrl}/deals?id=${data.dealId}`, style: "primary" },
      ]),
      contextBlock(`via sonji. • ${new Date().toLocaleString()}`),
    ],
  };
}

/**
 * Deal won — celebration message
 */
export function formatDealWon(data: {
  dealTitle: string;
  contactName: string;
  value: number;
  assignedTo: string;
  dealId: string;
  contactId: string;
}, urls: BaseUrl): SlackMessage {
  return {
    text: `🎉 Deal won! ${data.dealTitle} — $${data.value.toLocaleString()}`,
    blocks: [
      headerBlock("🎉🎉🎉 DEAL WON! 🎉🎉🎉"),
      sectionBlock(`*${data.dealTitle}*\n\n💰 *$${data.value.toLocaleString()}* closed by *${data.assignedTo}*`),
      fieldsBlock([
        ["Client", data.contactName],
        ["Deal Value", `$${data.value.toLocaleString()}`],
        ["Closed By", data.assignedTo],
      ]),
      divider(),
      actionsBlock([
        { text: "🤝 View Deal", url: `${urls.appUrl}/deals?id=${data.dealId}`, style: "primary" },
        { text: "👤 View Client", url: `${urls.appUrl}/contacts/${data.contactId}` },
      ]),
      contextBlock(`via sonji. • ${new Date().toLocaleString()}`),
    ],
  };
}

/**
 * Deal lost
 */
export function formatDealLost(data: {
  dealTitle: string;
  contactName: string;
  value: number;
  reason?: string;
  dealId: string;
}, urls: BaseUrl): SlackMessage {
  return {
    text: `Deal lost: ${data.dealTitle} — $${data.value.toLocaleString()}`,
    blocks: [
      headerBlock("❌ Deal Lost"),
      sectionBlock(`*${data.dealTitle}* — $${data.value.toLocaleString()}`),
      fieldsBlock([
        ["Client", data.contactName],
        ["Value", `$${data.value.toLocaleString()}`],
        ["Reason", data.reason || "Not specified"],
      ]),
      actionsBlock([
        { text: "View Deal", url: `${urls.appUrl}/deals?id=${data.dealId}` },
      ]),
      contextBlock(`via sonji. • ${new Date().toLocaleString()}`),
    ],
  };
}

/**
 * Invoice paid
 */
export function formatInvoicePaid(data: {
  invoiceNumber: string;
  contactName: string;
  amount: number;
  currency: string;
  invoiceId: string;
}, urls: BaseUrl): SlackMessage {
  return {
    text: `💰 Invoice paid: ${data.invoiceNumber} — $${data.amount.toLocaleString()}`,
    blocks: [
      headerBlock("💰 Invoice Paid"),
      sectionBlock(`*${data.invoiceNumber}* from *${data.contactName}*`),
      fieldsBlock([
        ["Amount", `$${data.amount.toLocaleString()} ${data.currency.toUpperCase()}`],
        ["Client", data.contactName],
      ]),
      actionsBlock([
        { text: "📄 View Invoice", url: `${urls.appUrl}/invoices/${data.invoiceId}`, style: "primary" },
      ]),
      contextBlock(`via sonji. • ${new Date().toLocaleString()}`),
    ],
  };
}

/**
 * Appointment scheduled
 */
export function formatAppointmentScheduled(data: {
  title: string;
  contactName: string;
  date: string;
  time: string;
  type: string;
  link?: string;
  assignedTo: string;
  appointmentId: string;
}, urls: BaseUrl): SlackMessage {
  return {
    text: `📅 Meeting scheduled: ${data.title} with ${data.contactName}`,
    blocks: [
      headerBlock("📅 Meeting Scheduled"),
      sectionBlock(`*${data.title}*\nwith *${data.contactName}*`),
      fieldsBlock([
        ["Date", data.date],
        ["Time", data.time],
        ["Type", data.type],
        ["Assigned To", data.assignedTo],
      ]),
      ...(data.link ? [sectionBlock(`🔗 <${data.link}|Join Meeting>`)] : []),
      actionsBlock([
        { text: "📅 View Meeting", url: `${urls.appUrl}/meetings?id=${data.appointmentId}`, style: "primary" },
        { text: "👤 View Contact", url: `${urls.appUrl}/contacts?name=${encodeURIComponent(data.contactName)}` },
      ]),
      contextBlock(`via sonji. • ${new Date().toLocaleString()}`),
    ],
  };
}

/**
 * Task overdue
 */
export function formatTaskOverdue(data: {
  title: string;
  assignedTo: string;
  dueDate: string;
  contactName?: string;
  taskId: string;
}, urls: BaseUrl): SlackMessage {
  return {
    text: `⚠️ Overdue task: ${data.title}`,
    blocks: [
      headerBlock("⚠️ Task Overdue"),
      sectionBlock(`*${data.title}*\nAssigned to *${data.assignedTo}* — was due ${data.dueDate}`),
      ...(data.contactName ? [fieldsBlock([["Related Contact", data.contactName]])] : []),
      actionsBlock([
        { text: "✅ Mark Complete", action_id: `complete_task_${data.taskId}`, style: "primary" },
        { text: "📋 View Task", url: `${urls.appUrl}/tasks?id=${data.taskId}` },
      ]),
      contextBlock(`via sonji. • ${new Date().toLocaleString()}`),
    ],
  };
}

/**
 * Stripe payment received (from Stripe sync)
 */
export function formatStripePayment(data: {
  customerName: string;
  amount: number;
  currency: string;
  description?: string;
  receiptUrl?: string;
}, _urls: BaseUrl): SlackMessage {
  return {
    text: `💳 Payment: $${data.amount.toLocaleString()} from ${data.customerName}`,
    blocks: [
      headerBlock("💳 Stripe Payment Received"),
      sectionBlock(`*$${data.amount.toLocaleString()} ${data.currency.toUpperCase()}* from *${data.customerName}*`),
      ...(data.description ? [sectionBlock(data.description)] : []),
      ...(data.receiptUrl ? [actionsBlock([{ text: "🧾 View Receipt", url: data.receiptUrl }])] : []),
      contextBlock(`via Stripe → sonji. • ${new Date().toLocaleString()}`),
    ],
  };
}

// ════════════════════════════════════════
// DAILY DIGEST
// ════════════════════════════════════════

/**
 * Format a daily summary digest for Slack.
 */
export function formatDailyDigest(data: {
  date: string;
  newLeads: number;
  dealsWon: number;
  revenueToday: number;
  meetingsToday: number;
  tasksOverdue: number;
  activePipelineValue: number;
}, urls: BaseUrl): SlackMessage {
  return {
    text: `📊 Daily Digest — ${data.date}`,
    blocks: [
      headerBlock(`📊 Daily Digest — ${data.date}`),
      sectionBlock(`Here's your business at a glance:`),
      fieldsBlock([
        ["New Leads", `${data.newLeads}`],
        ["Deals Won", `${data.dealsWon}`],
        ["Revenue Today", `$${data.revenueToday.toLocaleString()}`],
        ["Meetings Today", `${data.meetingsToday}`],
        ["Overdue Tasks", `${data.tasksOverdue}`],
        ["Pipeline Value", `$${data.activePipelineValue.toLocaleString()}`],
      ]),
      divider(),
      actionsBlock([
        { text: "📊 Open Dashboard", url: `${urls.appUrl}/dashboard`, style: "primary" },
        { text: "📋 View Tasks", url: `${urls.appUrl}/tasks` },
      ]),
      contextBlock(`sonji. daily digest • ${new Date().toLocaleString()}`),
    ],
  };
}
