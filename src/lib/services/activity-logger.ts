import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";

export type ActivityAction =
  | "contact.created" | "contact.updated" | "contact.deleted" | "contact.imported"
  | "deal.created" | "deal.updated" | "deal.moved" | "deal.won" | "deal.lost"
  | "task.created" | "task.completed" | "task.assigned"
  | "meeting.scheduled" | "meeting.completed" | "meeting.cancelled"
  | "email.sent" | "sms.sent" | "campaign.sent"
  | "form.submitted"
  | "invoice.created" | "invoice.sent" | "invoice.paid"
  | "workflow.triggered" | "workflow.completed"
  | "note.added"
  | "user.invited" | "user.removed" | "user.role_changed"
  | "settings.updated" | "billing.updated"
  | "import.started" | "import.completed" | "export.started" | "export.completed";

interface LogActivityParams {
  tenantId: string;
  userId?: string;
  contactId?: string;
  action: ActivityAction;
  metadata?: Record<string, unknown>;
}

/**
 * Log an activity to the audit trail.
 * This is fire-and-forget — it should never block the main request.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await db.insert(activityLog).values({
      tenantId: params.tenantId,
      userId: params.userId || null,
      contactId: params.contactId || null,
      action: params.action,
      metadata: params.metadata || null,
    });
  } catch (err) {
    // Never let logging failures crash the main request
    console.error("[ActivityLog] Failed to log activity:", err);
  }
}

/**
 * Batch log multiple activities at once (e.g., bulk import).
 */
export async function logActivitiesBatch(entries: LogActivityParams[]): Promise<void> {
  if (entries.length === 0) return;
  try {
    await db.insert(activityLog).values(
      entries.map((e) => ({
        tenantId: e.tenantId,
        userId: e.userId || null,
        contactId: e.contactId || null,
        action: e.action,
        metadata: e.metadata || null,
      }))
    );
  } catch (err) {
    console.error("[ActivityLog] Batch insert failed:", err);
  }
}
