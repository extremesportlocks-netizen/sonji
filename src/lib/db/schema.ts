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
