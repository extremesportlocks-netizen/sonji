/**
 * AUTOMATION ENGINE
 *
 * A state machine that executes trigger → condition → action workflows.
 * Supports sequential steps, conditional branching, delays, and parallel actions.
 * Pure logic — action execution is delegated to handler functions.
 *
 * Example workflow:
 * Trigger: "form.submitted"
 * → Condition: lead score > 70
 *   → Action: assign to sales team
 *   → Action: send welcome email
 *   → Wait: 2 days
 *   → Condition: no response
 *     → Action: send follow-up
 * → Condition: lead score <= 70
 *   → Action: add to nurture sequence
 */

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export type TriggerType =
  | "contact.created"
  | "contact.updated"
  | "contact.tagged"
  | "deal.created"
  | "deal.stage_changed"
  | "deal.won"
  | "deal.lost"
  | "form.submitted"
  | "appointment.scheduled"
  | "appointment.completed"
  | "appointment.cancelled"
  | "invoice.paid"
  | "invoice.overdue"
  | "email.opened"
  | "email.clicked"
  | "email.replied"
  | "sms.received"
  | "manual";

export type ActionType =
  | "send_email"
  | "send_sms"
  | "create_task"
  | "add_tag"
  | "remove_tag"
  | "update_field"
  | "move_deal"
  | "assign_user"
  | "create_deal"
  | "send_notification"
  | "webhook"
  | "wait";

export type ConditionOperator = "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty" | "in_list";

export interface WorkflowDefinition {
  id: string;
  name: string;
  tenantId: string;
  trigger: TriggerConfig;
  steps: WorkflowStep[];
  status: "active" | "paused" | "draft";
}

export interface TriggerConfig {
  type: TriggerType;
  filters?: TriggerFilter[]; // optional: only fire if these conditions match
}

export interface TriggerFilter {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface WorkflowStep {
  id: string;
  type: "action" | "condition" | "delay";
  config: ActionConfig | ConditionConfig | DelayConfig;
  onSuccess?: string; // next step ID
  onFailure?: string; // for conditions: step ID if false
}

export interface ActionConfig {
  actionType: ActionType;
  params: Record<string, any>;
}

export interface ConditionConfig {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface DelayConfig {
  duration: number;
  unit: "minutes" | "hours" | "days";
}

// ════════════════════════════════════════
// EXECUTION CONTEXT
// ════════════════════════════════════════

export interface ExecutionContext {
  tenantId: string;
  contactId?: string;
  dealId?: string;
  formSubmissionId?: string;
  appointmentId?: string;
  invoiceId?: string;
  triggerData: Record<string, any>; // the event payload that started this execution
  variables: Record<string, any>;   // accumulated state across steps
}

export interface StepResult {
  stepId: string;
  status: "completed" | "failed" | "skipped" | "delayed";
  output?: Record<string, any>;
  error?: string;
  nextStepId?: string;
  delayUntil?: Date;
}

export interface ExecutionResult {
  workflowId: string;
  status: "completed" | "failed" | "delayed" | "paused";
  stepsExecuted: StepResult[];
  totalSteps: number;
  error?: string;
}

// ════════════════════════════════════════
// TRIGGER MATCHING
// ════════════════════════════════════════

/**
 * Check if a trigger event matches a workflow's trigger config.
 */
export function matchesTrigger(
  eventType: TriggerType,
  eventData: Record<string, any>,
  trigger: TriggerConfig
): boolean {
  // Event type must match
  if (trigger.type !== eventType) return false;

  // Check trigger filters
  if (trigger.filters && trigger.filters.length > 0) {
    return trigger.filters.every((filter) =>
      evaluateCondition(eventData[filter.field], filter.operator, filter.value)
    );
  }

  return true;
}

/**
 * Given an event, find all active workflows that should fire.
 */
export function findMatchingWorkflows(
  eventType: TriggerType,
  eventData: Record<string, any>,
  workflows: WorkflowDefinition[]
): WorkflowDefinition[] {
  return workflows
    .filter((w) => w.status === "active")
    .filter((w) => matchesTrigger(eventType, eventData, w.trigger));
}

// ════════════════════════════════════════
// CONDITION EVALUATION
// ════════════════════════════════════════

/**
 * Evaluate a single condition.
 */
export function evaluateCondition(
  fieldValue: any,
  operator: ConditionOperator,
  compareValue: any
): boolean {
  switch (operator) {
    case "equals":
      return String(fieldValue).toLowerCase() === String(compareValue).toLowerCase();

    case "not_equals":
      return String(fieldValue).toLowerCase() !== String(compareValue).toLowerCase();

    case "contains":
      return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());

    case "not_contains":
      return !String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());

    case "greater_than":
      return Number(fieldValue) > Number(compareValue);

    case "less_than":
      return Number(fieldValue) < Number(compareValue);

    case "is_empty":
      return fieldValue === null || fieldValue === undefined || String(fieldValue).trim() === "";

    case "is_not_empty":
      return fieldValue !== null && fieldValue !== undefined && String(fieldValue).trim() !== "";

    case "in_list":
      const list = Array.isArray(compareValue) ? compareValue : String(compareValue).split(",").map((s: string) => s.trim());
      return list.some((item: string) => String(item).toLowerCase() === String(fieldValue).toLowerCase());

    default:
      console.warn(`[Automation] Unknown operator: ${operator}`);
      return false;
  }
}

// ════════════════════════════════════════
// STEP EXECUTION
// ════════════════════════════════════════

/** Action handlers — each returns a result or throws */
type ActionHandler = (params: Record<string, any>, context: ExecutionContext) => Promise<Record<string, any>>;

const actionHandlers: Record<ActionType, ActionHandler> = {
  send_email: async (params, ctx) => {
    // In production: call Resend API with rendered template
    console.log(`[Automation] Send email to ${params.to || ctx.contactId} — template: ${params.templateId}`);
    return { sent: true, messageId: `msg_${Date.now()}` };
  },

  send_sms: async (params, ctx) => {
    console.log(`[Automation] Send SMS to ${params.to || ctx.contactId} — body: ${params.body?.substring(0, 50)}`);
    return { sent: true, messageId: `sms_${Date.now()}` };
  },

  create_task: async (params, ctx) => {
    console.log(`[Automation] Create task: ${params.title} — assigned to: ${params.assignTo}`);
    return { taskId: `task_${Date.now()}` };
  },

  add_tag: async (params, ctx) => {
    console.log(`[Automation] Add tag "${params.tag}" to contact ${ctx.contactId}`);
    return { tagged: true };
  },

  remove_tag: async (params, ctx) => {
    console.log(`[Automation] Remove tag "${params.tag}" from contact ${ctx.contactId}`);
    return { untagged: true };
  },

  update_field: async (params, ctx) => {
    console.log(`[Automation] Update ${params.entity}.${params.field} = ${params.value}`);
    return { updated: true };
  },

  move_deal: async (params, ctx) => {
    console.log(`[Automation] Move deal ${ctx.dealId} to stage "${params.stage}"`);
    return { moved: true };
  },

  assign_user: async (params, ctx) => {
    console.log(`[Automation] Assign ${params.entity || "contact"} ${ctx.contactId} to user ${params.userId}`);
    return { assigned: true };
  },

  create_deal: async (params, ctx) => {
    console.log(`[Automation] Create deal: ${params.title} — value: ${params.value}`);
    return { dealId: `deal_${Date.now()}` };
  },

  send_notification: async (params, ctx) => {
    console.log(`[Automation] Notify user ${params.userId}: ${params.message}`);
    return { notified: true };
  },

  webhook: async (params, ctx) => {
    console.log(`[Automation] Fire webhook to ${params.url}`);
    // In production: fetch(params.url, { method: "POST", body: JSON.stringify({ ...ctx.triggerData, ...ctx.variables }) })
    return { webhookFired: true, statusCode: 200 };
  },

  wait: async (params) => {
    const { duration, unit } = params;
    const ms = duration * (unit === "days" ? 86400000 : unit === "hours" ? 3600000 : 60000);
    const resumeAt = new Date(Date.now() + ms);
    console.log(`[Automation] Wait ${duration} ${unit} — resume at ${resumeAt.toISOString()}`);
    return { delayed: true, resumeAt: resumeAt.toISOString() };
  },
};

/**
 * Execute a single workflow step.
 */
export async function executeStep(
  step: WorkflowStep,
  context: ExecutionContext
): Promise<StepResult> {
  try {
    switch (step.type) {
      case "action": {
        const config = step.config as ActionConfig;
        const handler = actionHandlers[config.actionType];
        if (!handler) {
          return { stepId: step.id, status: "failed", error: `Unknown action type: ${config.actionType}` };
        }

        // Resolve variable placeholders in params
        const resolvedParams = resolveParams(config.params, context);
        const output = await handler(resolvedParams, context);

        // If it's a wait action, mark as delayed
        if (config.actionType === "wait") {
          return {
            stepId: step.id,
            status: "delayed",
            output,
            delayUntil: new Date(output.resumeAt),
            nextStepId: step.onSuccess,
          };
        }

        return { stepId: step.id, status: "completed", output, nextStepId: step.onSuccess };
      }

      case "condition": {
        const config = step.config as ConditionConfig;
        const fieldValue = resolveVariable(config.field, context);
        const matches = evaluateCondition(fieldValue, config.operator, config.value);

        return {
          stepId: step.id,
          status: "completed",
          output: { conditionMet: matches },
          nextStepId: matches ? step.onSuccess : step.onFailure,
        };
      }

      case "delay": {
        const config = step.config as DelayConfig;
        const ms = config.duration * (config.unit === "days" ? 86400000 : config.unit === "hours" ? 3600000 : 60000);
        const resumeAt = new Date(Date.now() + ms);

        return {
          stepId: step.id,
          status: "delayed",
          output: { resumeAt: resumeAt.toISOString() },
          delayUntil: resumeAt,
          nextStepId: step.onSuccess,
        };
      }

      default:
        return { stepId: step.id, status: "failed", error: `Unknown step type: ${step.type}` };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { stepId: step.id, status: "failed", error: message };
  }
}

/**
 * Execute an entire workflow from start to finish (or until a delay).
 */
export async function executeWorkflow(
  workflow: WorkflowDefinition,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const results: StepResult[] = [];
  const stepsById = new Map(workflow.steps.map((s) => [s.id, s]));

  let currentStepId: string | undefined = workflow.steps[0]?.id;
  let iterations = 0;
  const maxIterations = 100; // safety limit

  while (currentStepId && iterations < maxIterations) {
    iterations++;
    const step = stepsById.get(currentStepId);
    if (!step) break;

    const result = await executeStep(step, context);
    results.push(result);

    // If delayed, pause execution (background job will resume later)
    if (result.status === "delayed") {
      return {
        workflowId: workflow.id,
        status: "delayed",
        stepsExecuted: results,
        totalSteps: workflow.steps.length,
      };
    }

    // If failed, stop execution
    if (result.status === "failed") {
      return {
        workflowId: workflow.id,
        status: "failed",
        stepsExecuted: results,
        totalSteps: workflow.steps.length,
        error: result.error,
      };
    }

    // Store output in context for next steps
    if (result.output) {
      context.variables = { ...context.variables, [`step_${step.id}`]: result.output };
    }

    currentStepId = result.nextStepId;
  }

  return {
    workflowId: workflow.id,
    status: "completed",
    stepsExecuted: results,
    totalSteps: workflow.steps.length,
  };
}

// ════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════

/**
 * Resolve {{variable}} placeholders in action params.
 */
function resolveParams(params: Record<string, any>, context: ExecutionContext): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.includes("{{")) {
      resolved[key] = value.replace(/\{\{(.+?)\}\}/g, (_, path) =>
        resolveVariable(path.trim(), context)
      );
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

/**
 * Resolve a dot-notation path from the execution context.
 */
function resolveVariable(path: string, context: ExecutionContext): string {
  const parts = path.split(".");
  let current: any = context;

  // Check triggerData first
  if (parts[0] === "trigger") {
    current = context.triggerData;
    parts.shift();
  } else if (parts[0] === "variables") {
    current = context.variables;
    parts.shift();
  }

  for (const part of parts) {
    if (current === null || current === undefined) return "";
    current = current[part];
  }

  return current !== null && current !== undefined ? String(current) : "";
}

// ════════════════════════════════════════
// PREBUILT WORKFLOW TEMPLATES
// ════════════════════════════════════════

export const WORKFLOW_TEMPLATES: Record<string, Omit<WorkflowDefinition, "id" | "tenantId" | "status">> = {
  new_lead_welcome: {
    name: "New Lead Welcome Sequence",
    trigger: { type: "form.submitted" },
    steps: [
      { id: "s1", type: "action", config: { actionType: "add_tag", params: { tag: "New Lead" } }, onSuccess: "s2" },
      { id: "s2", type: "action", config: { actionType: "send_email", params: { templateId: "tpl_welcome" } }, onSuccess: "s3" },
      { id: "s3", type: "action", config: { actionType: "create_task", params: { title: "Follow up with new lead: {{trigger.contactName}}", assignTo: "owner" } }, onSuccess: "s4" },
      { id: "s4", type: "action", config: { actionType: "send_notification", params: { userId: "owner", message: "New lead from intake form: {{trigger.contactName}}" } } },
    ],
  },

  deal_won_celebration: {
    name: "Deal Won Notification",
    trigger: { type: "deal.won" },
    steps: [
      { id: "s1", type: "action", config: { actionType: "send_notification", params: { userId: "all", message: "🎉 Deal won: {{trigger.dealTitle}} — ${{trigger.dealValue}}" } }, onSuccess: "s2" },
      { id: "s2", type: "action", config: { actionType: "send_email", params: { templateId: "tpl_welcome", to: "{{trigger.contactEmail}}" } }, onSuccess: "s3" },
      { id: "s3", type: "action", config: { actionType: "create_task", params: { title: "Begin onboarding for {{trigger.contactName}}", assignTo: "owner" } } },
    ],
  },

  inactive_reengagement: {
    name: "Inactive Contact Re-engagement",
    trigger: { type: "manual" },
    steps: [
      { id: "s1", type: "action", config: { actionType: "add_tag", params: { tag: "Re-engagement" } }, onSuccess: "s2" },
      { id: "s2", type: "action", config: { actionType: "send_email", params: { templateId: "tpl_nurture_1" } }, onSuccess: "s3" },
      { id: "s3", type: "delay", config: { duration: 3, unit: "days" } as DelayConfig, onSuccess: "s4" },
      { id: "s4", type: "condition", config: { field: "trigger.emailOpened", operator: "equals", value: "true" } as ConditionConfig, onSuccess: "s5", onFailure: "s6" },
      { id: "s5", type: "action", config: { actionType: "create_task", params: { title: "Call {{trigger.contactName}} — they opened re-engagement email" } } },
      { id: "s6", type: "action", config: { actionType: "send_sms", params: { body: "Hi {{trigger.contactFirstName}}, just checking in. Any questions about {{tenant.businessName}}?" } } },
    ],
  },

  appointment_reminder: {
    name: "Appointment Reminder (24hr)",
    trigger: { type: "appointment.scheduled" },
    steps: [
      { id: "s1", type: "delay", config: { duration: 24, unit: "hours" } as DelayConfig, onSuccess: "s2" },
      { id: "s2", type: "condition", config: { field: "trigger.appointmentStatus", operator: "equals", value: "scheduled" } as ConditionConfig, onSuccess: "s3", onFailure: "s4" },
      { id: "s3", type: "action", config: { actionType: "send_email", params: { templateId: "tpl_meeting_reminder" } } },
      { id: "s4", type: "action", config: { actionType: "send_notification", params: { userId: "owner", message: "Appointment was cancelled — reminder skipped" } } },
    ],
  },
};
