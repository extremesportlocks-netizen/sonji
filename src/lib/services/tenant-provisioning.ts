import { db } from "@/lib/db";
import { tenants, users, pipelines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ════════════════════════════════════════
// INDUSTRY TEMPLATES
// ════════════════════════════════════════

const INDUSTRY_PIPELINES: Record<string, { name: string; stages: { name: string; order: number; color: string }[] }> = {
  health: {
    name: "Patient Pipeline",
    stages: [
      { name: "Intake", order: 0, color: "#6366f1" },
      { name: "Provider Review", order: 1, color: "#2563eb" },
      { name: "Treatment Active", order: 2, color: "#059669" },
      { name: "Follow-up", order: 3, color: "#d97706" },
      { name: "Churned", order: 4, color: "#dc2626" },
    ],
  },
  fitness: {
    name: "Member Pipeline",
    stages: [
      { name: "Trial", order: 0, color: "#6366f1" },
      { name: "Signed Up", order: 1, color: "#2563eb" },
      { name: "Active Member", order: 2, color: "#059669" },
      { name: "At Risk", order: 3, color: "#d97706" },
      { name: "Cancelled", order: 4, color: "#dc2626" },
    ],
  },
  beauty: {
    name: "Client Pipeline",
    stages: [
      { name: "Booked", order: 0, color: "#6366f1" },
      { name: "Visited", order: 1, color: "#2563eb" },
      { name: "Regular", order: 2, color: "#059669" },
      { name: "Lapsed", order: 3, color: "#d97706" },
      { name: "Lost", order: 4, color: "#dc2626" },
    ],
  },
  agency: {
    name: "Sales Pipeline",
    stages: [
      { name: "Lead", order: 0, color: "#6366f1" },
      { name: "Discovery", order: 1, color: "#2563eb" },
      { name: "Proposal Sent", order: 2, color: "#d97706" },
      { name: "Negotiation", order: 3, color: "#f59e0b" },
      { name: "Closed Won", order: 4, color: "#059669" },
      { name: "Closed Lost", order: 5, color: "#dc2626" },
    ],
  },
  realestate: {
    name: "Transaction Pipeline",
    stages: [
      { name: "Inquiry", order: 0, color: "#6366f1" },
      { name: "Showing", order: 1, color: "#2563eb" },
      { name: "Offer Made", order: 2, color: "#d97706" },
      { name: "Under Contract", order: 3, color: "#f59e0b" },
      { name: "Closed", order: 4, color: "#059669" },
      { name: "Lost", order: 5, color: "#dc2626" },
    ],
  },
  other: {
    name: "Default Pipeline",
    stages: [
      { name: "Lead", order: 0, color: "#6366f1" },
      { name: "Qualified", order: 1, color: "#2563eb" },
      { name: "Proposal", order: 2, color: "#d97706" },
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
