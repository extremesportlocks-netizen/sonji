import { db } from "@/lib/db";
import { tenants, users, pipelines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ════════════════════════════════════════
// INDUSTRY TEMPLATES
// ════════════════════════════════════════

const INDUSTRY_PIPELINES: Record<string, { name: string; stages: { name: string; order: number; color: string }[] }> = {
  health_wellness: {
    name: "Patient Pipeline",
    stages: [
      { name: "Intake", order: 0, color: "#6366f1" },
      { name: "Payment Collected", order: 1, color: "#2563eb" },
      { name: "Under Review", order: 2, color: "#f59e0b" },
      { name: "Approved", order: 3, color: "#059669" },
      { name: "Prescribed", order: 4, color: "#06b6d4" },
      { name: "Shipped", order: 5, color: "#8b5cf6" },
      { name: "Delivered", order: 6, color: "#10b981" },
      { name: "Active", order: 7, color: "#22c55e" },
    ],
  },
  fitness_gym: {
    name: "Member Pipeline",
    stages: [
      { name: "Lead", order: 0, color: "#6366f1" },
      { name: "Trial Booked", order: 1, color: "#2563eb" },
      { name: "Trial Completed", order: 2, color: "#f59e0b" },
      { name: "Membership Offered", order: 3, color: "#f97316" },
      { name: "Active Member", order: 4, color: "#059669" },
      { name: "At Risk", order: 5, color: "#dc2626" },
    ],
  },
  beauty_salon: {
    name: "Client Pipeline",
    stages: [
      { name: "New Client", order: 0, color: "#6366f1" },
      { name: "Booked", order: 1, color: "#2563eb" },
      { name: "Served", order: 2, color: "#059669" },
      { name: "Rebooking Window", order: 3, color: "#f59e0b" },
      { name: "Loyal Regular", order: 4, color: "#8b5cf6" },
      { name: "Lapsed", order: 5, color: "#dc2626" },
    ],
  },
  agency_consulting: {
    name: "Sales Pipeline",
    stages: [
      { name: "Discovery", order: 0, color: "#6366f1" },
      { name: "Proposal Sent", order: 1, color: "#2563eb" },
      { name: "Negotiation", order: 2, color: "#f59e0b" },
      { name: "Contract Signed", order: 3, color: "#059669" },
      { name: "Onboarding", order: 4, color: "#06b6d4" },
      { name: "Active Client", order: 5, color: "#8b5cf6" },
      { name: "Renewal", order: 6, color: "#f97316" },
    ],
  },
  real_estate: {
    name: "Transaction Pipeline",
    stages: [
      { name: "Lead", order: 0, color: "#6366f1" },
      { name: "Contacted", order: 1, color: "#2563eb" },
      { name: "Showing Scheduled", order: 2, color: "#f59e0b" },
      { name: "Offer Submitted", order: 3, color: "#f97316" },
      { name: "Under Contract", order: 4, color: "#059669" },
      { name: "Closed", order: 5, color: "#8b5cf6" },
    ],
  },
  home_services: {
    name: "Job Pipeline",
    stages: [
      { name: "Estimate Requested", order: 0, color: "#6366f1" },
      { name: "Site Visit", order: 1, color: "#2563eb" },
      { name: "Estimate Sent", order: 2, color: "#f59e0b" },
      { name: "Follow-up", order: 3, color: "#f97316" },
      { name: "Job Booked", order: 4, color: "#059669" },
      { name: "Completed", order: 5, color: "#8b5cf6" },
    ],
  },
  legal: {
    name: "Case Pipeline",
    stages: [
      { name: "Inquiry", order: 0, color: "#6366f1" },
      { name: "Consultation", order: 1, color: "#2563eb" },
      { name: "Evaluation", order: 2, color: "#f59e0b" },
      { name: "Engagement Sent", order: 3, color: "#f97316" },
      { name: "Retained", order: 4, color: "#059669" },
      { name: "Case Closed", order: 5, color: "#8b5cf6" },
    ],
  },
  coaching_education: {
    name: "Enrollment Pipeline",
    stages: [
      { name: "Lead", order: 0, color: "#6366f1" },
      { name: "Application", order: 1, color: "#2563eb" },
      { name: "Discovery Call", order: 2, color: "#f59e0b" },
      { name: "Call Completed", order: 3, color: "#f97316" },
      { name: "Enrolled", order: 4, color: "#059669" },
      { name: "Alumni", order: 5, color: "#8b5cf6" },
    ],
  },
  restaurant_food: {
    name: "Customer Pipeline",
    stages: [
      { name: "New Customer", order: 0, color: "#6366f1" },
      { name: "Return Visitor", order: 1, color: "#2563eb" },
      { name: "Regular", order: 2, color: "#059669" },
      { name: "Catering Lead", order: 3, color: "#f59e0b" },
      { name: "Catering Booked", order: 4, color: "#8b5cf6" },
      { name: "Lapsed", order: 5, color: "#dc2626" },
    ],
  },
  automotive: {
    name: "Service Pipeline",
    stages: [
      { name: "Lead", order: 0, color: "#6366f1" },
      { name: "Estimate Given", order: 1, color: "#2563eb" },
      { name: "Scheduled", order: 2, color: "#f59e0b" },
      { name: "In Service", order: 3, color: "#f97316" },
      { name: "Completed", order: 4, color: "#059669" },
      { name: "Maintenance Due", order: 5, color: "#8b5cf6" },
    ],
  },
  nonprofit: {
    name: "Donor Pipeline",
    stages: [
      { name: "Prospect", order: 0, color: "#6366f1" },
      { name: "Contacted", order: 1, color: "#2563eb" },
      { name: "First Gift", order: 2, color: "#059669" },
      { name: "Repeat Donor", order: 3, color: "#8b5cf6" },
      { name: "Major Donor", order: 4, color: "#f59e0b" },
      { name: "Lapsed", order: 5, color: "#dc2626" },
    ],
  },
  ecommerce: {
    name: "Customer Pipeline",
    stages: [
      { name: "Subscriber", order: 0, color: "#6366f1" },
      { name: "First Purchase", order: 1, color: "#2563eb" },
      { name: "Repeat Customer", order: 2, color: "#059669" },
      { name: "VIP", order: 3, color: "#8b5cf6" },
      { name: "Win-Back", order: 4, color: "#f59e0b" },
      { name: "Churned", order: 5, color: "#dc2626" },
    ],
  },
  other: {
    name: "Default Pipeline",
    stages: [
      { name: "Lead", order: 0, color: "#6366f1" },
      { name: "Qualified", order: 1, color: "#2563eb" },
      { name: "Proposal", order: 2, color: "#f59e0b" },
      { name: "Won", order: 3, color: "#059669" },
      { name: "Lost", order: 4, color: "#dc2626" },
    ],
  },
};

// ════════════════════════════════════════
// PROVISIONING
// ════════════════════════════════════════

interface ProvisionTenantParams {
  name: string;
  slug: string;
  plan: "starter" | "growth" | "scale";
  industry: string;
  ownerEmail: string;
  ownerName: string;
  clerkOrgId?: string;
  clerkUserId?: string;
}

interface ProvisionResult {
  tenantId: string;
  userId: string;
  pipelineId: string;
  slug: string;
}

/**
 * Provision a new tenant.
 * Creates: tenant row, owner user, industry-specific pipeline.
 */
export async function provisionTenant(params: ProvisionTenantParams): Promise<ProvisionResult> {
  // 1. Check slug uniqueness
  const existing = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, params.slug));
  if (existing.length > 0) {
    throw new Error(`Slug "${params.slug}" is already taken`);
  }

  // 2. Create tenant
  const [tenant] = await db.insert(tenants).values({
    name: params.name,
    slug: params.slug,
    plan: params.plan,
    industry: params.industry,
    branding: {
      logoUrl: null,
      faviconUrl: null,
      primaryColor: "#6366f1",
      accentColor: "#0f172a",
      fontHeading: "Inter",
      fontBody: "Inter",
      businessName: params.name,
      supportEmail: params.ownerEmail,
      customCss: "",
    },
    settings: {
      timezone: "America/New_York",
      currency: "usd",
      dateFormat: "MM/DD/YYYY",
    },
  }).returning();

  // 3. Create owner user
  const [owner] = await db.insert(users).values({
    tenantId: tenant.id,
    clerkId: params.clerkUserId || null,
    email: params.ownerEmail,
    name: params.ownerName,
    role: "owner",
  }).returning();

  // 4. Create industry-specific pipeline
  const template = INDUSTRY_PIPELINES[params.industry] || INDUSTRY_PIPELINES.other;
  const [pipeline] = await db.insert(pipelines).values({
    tenantId: tenant.id,
    name: template.name,
    stages: template.stages,
    isDefault: true,
  }).returning();

  return {
    tenantId: tenant.id,
    userId: owner.id,
    pipelineId: pipeline.id,
    slug: tenant.slug,
  };
}

/**
 * Check if a slug is available.
 */
export async function isSlugAvailable(slugToCheck: string): Promise<boolean> {
  const reserved = new Set(["www", "app", "admin", "api", "docs", "status", "blog", "mail", "smtp", "demo", "test"]);
  if (reserved.has(slugToCheck)) return false;

  const existing = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, slugToCheck));
  return existing.length === 0;
}
