/**
 * NOTIFICATION SERVICE
 *
 * Handles in-app notifications (bell icon), email notifications,
 * and the weekly digest system.
 *
 * Schema note: notifications table doesn't exist yet in the Drizzle schema.
 * We'll add it as part of the next schema migration.
 * For now, this defines the interface and types.
 */

export type NotificationType =
  | "contact.created"
  | "deal.stage_changed"
  | "deal.won"
  | "deal.lost"
  | "task.assigned"
  | "task.due_soon"
  | "form.submitted"
  | "meeting.reminder"
  | "invoice.paid"
  | "workflow.completed"
  | "import.completed"
  | "team.invite"
  | "system.announcement";

export type NotificationChannel = "in_app" | "email" | "both";

export interface Notification {
  id: string;
  tenantId: string;
  userId: string; // recipient
  type: NotificationType;
  title: string;
  body: string;
  channel: NotificationChannel;
  read: boolean;
  actionUrl?: string; // deep link into the CRM (e.g., /dashboard/contacts/abc123)
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

interface SendNotificationParams {
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  channel?: NotificationChannel;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send a notification to a specific user.
 *
 * This will:
 * 1. Check user's notification preferences
 * 2. Insert into notifications table (in-app)
 * 3. Queue email delivery if preferences allow
 */
export async function sendNotification(params: SendNotificationParams): Promise<void> {
  const channel = params.channel || "in_app";

  try {
    // TODO: Insert into notifications table when schema exists
    // TODO: Check user preferences from user_settings table
    // TODO: Queue email via Resend if channel is "email" or "both"

    console.log(`[Notification] ${params.type} → ${params.userId}: ${params.title}`);
  } catch (err) {
    // Never let notification failures crash the main request
    console.error("[Notification] Failed to send:", err);
  }
}

/**
 * Send a notification to ALL users in a tenant with a specific role or above.
 */
export async function broadcastNotification(
  params: Omit<SendNotificationParams, "userId"> & { minRole?: string }
): Promise<void> {
  try {
    // TODO: Query users table for all users in tenant with role >= minRole
    // TODO: Loop and send to each user
    console.log(`[Notification] Broadcast ${params.type} to tenant ${params.tenantId}`);
  } catch (err) {
    console.error("[Notification] Broadcast failed:", err);
  }
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  // TODO: UPDATE notifications SET read = true WHERE id = notificationId AND user_id = userId
  console.log(`[Notification] Marked ${notificationId} as read`);
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(tenantId: string, userId: string): Promise<void> {
  // TODO: UPDATE notifications SET read = true WHERE tenant_id = tenantId AND user_id = userId AND read = false
  console.log(`[Notification] Marked all as read for ${userId}`);
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadCount(tenantId: string, userId: string): Promise<number> {
  // TODO: SELECT COUNT(*) FROM notifications WHERE tenant_id = tenantId AND user_id = userId AND read = false
  return 0;
}
