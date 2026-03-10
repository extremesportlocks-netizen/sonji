import { z } from "zod";

// ════════════════════════════════════════
// COMMON VALIDATORS
// ════════════════════════════════════════

export const uuid = z.string().uuid();
export const email = z.string().email().max(255);
export const phone = z.string().max(50).optional();
export const slug = z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens");

/** Pagination query params */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/** Search/filter query params */
export const searchSchema = z.object({
  q: z.string().max(255).optional(),
  status: z.string().max(50).optional(),
  tags: z.string().optional(), // comma-separated
});

// ════════════════════════════════════════
// CONTACT SCHEMAS
// ════════════════════════════════════════

export const createContactSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().max(255).optional(),
  email: email.optional(),
  phone: phone,
  company: z.string().max(255).optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
  source: z.string().max(100).optional(),
  status: z.enum(["active", "lead", "inactive", "lost"]).default("active"),
});

export const updateContactSchema = createContactSchema.partial();

// ════════════════════════════════════════
// DEAL SCHEMAS
// ════════════════════════════════════════

export const createDealSchema = z.object({
  pipelineId: uuid,
  contactId: uuid.optional(),
  title: z.string().min(1).max(255),
  value: z.coerce.number().min(0).optional(),
  stage: z.string().max(100).default("Lead"),
  assignedTo: uuid.optional(),
  expectedClose: z.string().optional(), // ISO date string
  notes: z.string().optional(),
});

export const updateDealSchema = createDealSchema.partial();

export const moveDealSchema = z.object({
  stage: z.string().min(1).max(100),
  pipelineId: uuid.optional(),
});

// ════════════════════════════════════════
// COMPANY SCHEMAS
// ════════════════════════════════════════

export const createCompanySchema = z.object({
  name: z.string().min(1).max(255),
  domain: z.string().max(255).optional(),
  industry: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  phone: phone,
  address: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

// ════════════════════════════════════════
// TASK SCHEMAS
// ════════════════════════════════════════

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  assignedTo: uuid.optional(),
  contactId: uuid.optional(),
  dueDate: z.string().optional(), // ISO date string
});

export const updateTaskSchema = createTaskSchema.partial();

// ════════════════════════════════════════
// ACTIVITY SCHEMAS
// ════════════════════════════════════════

export const createActivitySchema = z.object({
  contactId: uuid.optional(),
  action: z.string().min(1).max(255),
  type: z.enum(["call", "email", "meeting", "note", "followup", "task", "system"]).default("note"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ════════════════════════════════════════
// TENANT / ONBOARDING SCHEMAS
// ════════════════════════════════════════

export const createTenantSchema = z.object({
  name: z.string().min(1).max(255),
  slug: slug,
  plan: z.enum(["starter", "growth", "scale"]).default("starter"),
  industry: z.string().max(100).optional(),
  ownerEmail: email,
  ownerName: z.string().min(1).max(255),
});

export const updateTenantSettingsSchema = z.object({
  name: z.string().max(255).optional(),
  branding: z.object({
    logoUrl: z.string().url().nullable().optional(),
    primaryColor: z.string().max(20).optional(),
    accentColor: z.string().max(20).optional(),
    fontHeading: z.string().max(100).optional(),
    fontBody: z.string().max(100).optional(),
    businessName: z.string().max(255).optional(),
    supportEmail: z.string().email().optional(),
  }).optional(),
  settings: z.object({
    timezone: z.string().max(100).optional(),
    currency: z.string().max(10).optional(),
    dateFormat: z.string().max(20).optional(),
  }).optional(),
});

// ════════════════════════════════════════
// NOTIFICATION SCHEMAS
// ════════════════════════════════════════

export const notificationPrefsSchema = z.object({
  newContact: z.boolean().optional(),
  dealStageChange: z.boolean().optional(),
  taskAssigned: z.boolean().optional(),
  formSubmission: z.boolean().optional(),
  meetingReminder: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

// ════════════════════════════════════════
// HELPER: Parse and validate request body
// ════════════════════════════════════════

export async function parseBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<{ data?: T; errors?: Record<string, string[]> }> {
  try {
    const raw = await req.json();
    const result = schema.safeParse(raw);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".") || "_root";
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return { errors };
    }
    return { data: result.data };
  } catch {
    return { errors: { _root: ["Invalid JSON body"] } };
  }
}

/** Parse URL search params against a schema */
export function parseQuery<T>(url: URL, schema: z.ZodSchema<T>): T {
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });
  return schema.parse(params);
}
