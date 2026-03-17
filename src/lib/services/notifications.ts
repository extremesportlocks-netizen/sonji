/**
 * NOTIFICATION SERVICE
 *
 * Creates real notifications in the database.
 * Used by automation engine, webhooks, and CRM events.
 */

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

export type NotificationType =
  | "contact.created"
  | "deal.stage_changed"
  | "deal.won"
  | "deal.lost"
  | "task.assigned"
  | "task.due_soon"
  | "task.completed"
  | "form.submitted"
  | "meeting.reminder"
  | "invoice.paid"
  | "payment.received"
  | "payment.failed"
  | "workflow.completed"
  | "import.completed"
  | "team.invite"
  | "system.announcement";

interface SendNotificationParams {
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
}

/**
 * Send a notification to a specific user — writes to DB.
 */
export async function sendNotification(params: SendNotificationParams): Promise<void> {
  try {
    await db.insert(notifications).values({
      tenantId: params.tenantId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      actionUrl: params.actionUrl,
      read: false,
    });
  } catch (err) {
    console.error("[Notification] Failed to send:", err);
  }
}

/**
 * Send a notification to ALL users in a tenant.
 */
export async function broadcastNotification(
  params: Omit<SendNotificationParams, "userId"> & { userIds: string[] }
): Promise<void> {
  try {
    if (!params.userIds.length) return;
    await db.insert(notifications).values(
      params.userIds.map(userId => ({
        tenantId: params.tenantId,
        userId,
        type: params.type,
        title: params.title,
        body: params.body,
        actionUrl: params.actionUrl,
        read: false,
      }))
    );
  } catch (err) {
    console.error("[Notification] Broadcast failed:", err);
  }
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadCount(tenantId: string, userId: string): Promise<number> {
  try {
    const [{ total }] = await db.select({ total: count() }).from(notifications)
      .where(and(
        eq(notifications.tenantId, tenantId),
        eq(notifications.userId, userId),
        eq(notifications.read, false),
      ));
    return Number(total);
  } catch {
    return 0;
  }
}
