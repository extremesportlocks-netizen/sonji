import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  decimal,
  boolean,
  date,
  time,
} from "drizzle-orm/pg-core";

// ════════════════════════════════════════
// PLATFORM TABLES (No RLS)
// ════════════════════════════════════════

/**
 * TENANTS — Master registry. One row per customer account.
 * This table does NOT have RLS — it's platform-level.
 */
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  customDomain: varchar("custom_domain", { length: 255 }),
  plan: varchar("plan", { length: 50 }).notNull().default("starter"),
  industry: varchar("industry", { length: 100 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  branding: jsonb("branding").default({
    logoUrl: null,
    faviconUrl: null,
    primaryColor: "#6366f1",
    accentColor: "#0f172a",
    fontHeading: "Inter",
    fontBody: "Inter",
    businessName: "",
    supportEmail: "",
    customCss: "",
  }),
  settings: jsonb("settings").default({
    timezone: "America/New_York",
    currency: "usd",
    dateFormat: "MM/DD/YYYY",
  }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * PLATFORM_USERS — Internal Sonji team accounts.
 */
export const platformUsers = pgTable("platform_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("support"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * PLATFORM_EVENTS — Audit log for billing, provisioning, errors.
 */
export const platformEvents = pgTable("platform_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ════════════════════════════════════════
// TENANT-SCOPED TABLES (RLS Enabled)
// Every table below has a tenant_id column.
// RLS policies are applied via raw SQL migration.
// ════════════════════════════════════════

/**
 * USERS — Team members per tenant.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  clerkId: varchar("clerk_id", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * CONTACTS — CRM contact records.
 */
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  tags: jsonb("tags").default([]),
  customFields: jsonb("custom_fields").default({}),
  source: varchar("source", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * PIPELINES — Custom deal pipeline definitions.
 */
export const pipelines = pgTable("pipelines", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  stages: jsonb("stages").notNull().default([
    { name: "Lead", order: 0, color: "#6366f1" },
    { name: "Qualified", order: 1, color: "#2563eb" },
    { name: "Proposal", order: 2, color: "#d97706" },
    { name: "Won", order: 3, color: "#059669" },
    { name: "Lost", order: 4, color: "#dc2626" },
  ]),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * DEALS — Individual deals/opportunities.
 */
export const deals = pgTable("deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  pipelineId: uuid("pipeline_id").notNull().references(() => pipelines.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  title: varchar("title", { length: 255 }).notNull(),
  value: decimal("value", { precision: 12, scale: 2 }),
  stage: varchar("stage", { length: 100 }).notNull().default("Lead"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  expectedClose: date("expected_close"),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * FORMS — Intake/onboarding form definitions.
 */
export const forms = pgTable("forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }),
  fields: jsonb("fields").notNull().default([]),
  settings: jsonb("settings").default({}),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * FORM_SUBMISSIONS — Submitted form responses.
 */
export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  formId: uuid("form_id").notNull().references(() => forms.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  data: jsonb("data").notNull(),
  sourceUrl: varchar("source_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * EMAIL_CAMPAIGNS — Email campaign records.
 */
export const emailCampaigns = pgTable("email_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }),
  bodyHtml: text("body_html"),
  segmentFilter: jsonb("segment_filter"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  sentAt: timestamp("sent_at"),
  stats: jsonb("stats").default({ sent: 0, opened: 0, clicked: 0, bounced: 0 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * EMAIL_SEQUENCES — Automated drip sequences.
 */
export const emailSequences = pgTable("email_sequences", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  steps: jsonb("steps").notNull().default([]),
  triggerType: varchar("trigger_type", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("paused"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * APPOINTMENTS — Scheduled appointments.
 */
export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  userId: uuid("user_id").references(() => users.id),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"),
  notes: text("notes"),
  location: varchar("location", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * AVAILABILITY_RULES — Per-user calendar availability.
 */
export const availabilityRules = pgTable("availability_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sun, 6=Sat
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  timezone: varchar("timezone", { length: 100 }).default("America/New_York"),
});

/**
 * INVOICES — Invoice records with Stripe integration.
 */
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  items: jsonb("items").notNull().default([]),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
  dueDate: date("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * MESSAGES — Unified inbox (email + SMS + form submissions).
 */
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  direction: varchar("direction", { length: 20 }).notNull(), // inbound | outbound
  channel: varchar("channel", { length: 20 }).notNull(), // email | sms | form
  subject: varchar("subject", { length: 500 }),
  body: text("body").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * AUTOMATIONS — Workflow automation definitions.
 */
export const automations = pgTable("automations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  trigger: jsonb("trigger").notNull(),
  actions: jsonb("actions").notNull().default([]),
  status: varchar("status", { length: 50 }).notNull().default("paused"),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * ACTIVITY_LOG — Per-tenant audit trail.
 */
export const activityLog = pgTable("activity_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  action: varchar("action", { length: 255 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * COMPANIES — Business/organization records linked to contacts.
 */
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  size: varchar("size", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  tags: jsonb("tags").default([]),
  customFields: jsonb("custom_fields").default({}),
  status: varchar("status", { length: 50 }).notNull().default("prospect"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * TASKS — To-do items assignable to users, optionally linked to contacts.
 */
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("todo"),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  companyId: uuid("company_id").references(() => companies.id),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * NOTIFICATIONS — In-app notification feed per user.
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  channel: varchar("channel", { length: 20 }).notNull().default("in_app"),
  read: boolean("read").notNull().default(false),
  actionUrl: varchar("action_url", { length: 500 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * API_KEYS — External API access tokens per tenant (Scale tier).
 */
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull(),
  prefix: varchar("prefix", { length: 20 }).notNull(), // first 8 chars for display: sk_live_abc12...
  permissions: jsonb("permissions").default([]),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * PROJECTS — Operations/delivery tracking.
 * A project is created when a deal is won (sales → ops handoff).
 * Tracks time, budget, team allocation, and profit margins.
 */
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  dealId: uuid("deal_id").references(() => deals.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  companyId: uuid("company_id").references(() => companies.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("planning"), // planning, active, on_hold, completed, canceled
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),

  // Budget & Financial
  budgetAmount: decimal("budget_amount", { precision: 12, scale: 2 }), // Total budget for the project
  budgetType: varchar("budget_type", { length: 20 }).default("fixed"), // fixed, hourly, retainer
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }), // For hourly projects
  retainerHours: integer("retainer_hours"), // Monthly retainer hours
  costRate: decimal("cost_rate", { precision: 8, scale: 2 }), // Internal cost per hour (for margin calc)

  // Timeline
  startDate: date("start_date"),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),

  // Team
  managerId: uuid("manager_id").references(() => users.id),
  teamMembers: jsonb("team_members").default([]), // Array of { userId, role, allocation% }

  // Tracking
  totalHoursLogged: decimal("total_hours_logged", { precision: 8, scale: 2 }).default("0"),
  totalCostIncurred: decimal("total_cost_incurred", { precision: 12, scale: 2 }).default("0"),

  // Metadata
  tags: jsonb("tags").default([]),
  customFields: jsonb("custom_fields").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * TIME ENTRIES — Time tracking per project/task.
 * Feeds into budget tracking, resource loading, and profit margins.
 */
export const timeEntries = pgTable("time_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  taskId: uuid("task_id").references(() => tasks.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  description: text("description"),
  hours: decimal("hours", { precision: 6, scale: 2 }).notNull(),
  date: date("date").notNull(),
  billable: boolean("billable").default(true),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }), // Override rate for this entry
  costRate: decimal("cost_rate", { precision: 8, scale: 2 }), // Internal cost rate
  status: varchar("status", { length: 20 }).default("logged"), // logged, approved, invoiced
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
