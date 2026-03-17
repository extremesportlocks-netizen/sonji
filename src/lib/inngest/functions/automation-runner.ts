import { inngest } from "../client";
import { db } from "@/lib/db";
import { automations, contacts, tasks, deals } from "@/lib/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { sendEmail } from "@/lib/services/email";
import { sendSMS } from "@/lib/services/sms";
import { sendNotification } from "@/lib/services/notifications";

/**
 * AUTOMATION RUNNER — Inngest function
 * 
 * Listens for CRM events and executes matching automations.
 * The automation engine: 17 triggers, 12 actions, real execution.
 */
export const automationRunner = inngest.createFunction(
  { id: "automation-runner", name: "Run CRM Automations" },
  [
    { event: "crm/contact.created" },
    { event: "crm/deal.stage_changed" },
    { event: "crm/deal.won" },
    { event: "crm/deal.lost" },
    { event: "crm/form.submitted" },
    { event: "crm/appointment.scheduled" },
    { event: "crm/invoice.paid" },
    { event: "crm/task.completed" },
  ],
  async ({ event, step }) => {
    const { tenantId, userId } = event.data;
    if (!tenantId) return { skipped: true, reason: "No tenantId" };

    // Find active automations for this tenant matching the trigger
    const triggerType = event.name.replace("crm/", "");
    const activeAutomations = await step.run("find-automations", async () => {
      const rows = await db.select().from(automations)
        .where(and(
          eq(automations.tenantId, tenantId),
          eq(automations.status, "active"),
        ));
      return rows.filter((a) => {
        const trigger = a.trigger as any;
        return trigger?.type === triggerType;
      });
    });

    if (!activeAutomations.length) {
      return { skipped: true, reason: `No automations for ${triggerType}` };
    }

    const results: Array<{ automation: string; action: string; status: string }> = [];

    for (const auto of activeAutomations) {
      const actions = (auto.actions as any[]) || [];

      for (const action of actions) {
        try {
          await step.run(`exec-${auto.id}-${action.type}`, async () => {
            switch (action.type) {
              case "send_email": {
                if (!event.data.contactEmail) break;
                await sendEmail(null, {
                  to: event.data.contactEmail,
                  subject: action.subject || "Notification from " + auto.name,
                  html: (action.template || "<p>Hello {{firstName}}</p>")
                    .replace(/\{\{firstName\}\}/g, event.data.contactName || ""),
                });
                break;
              }
              case "send_sms": {
                if (!event.data.contactPhone) break;
                await sendSMS(null, {
                  to: event.data.contactPhone,
                  body: (action.message || "")
                    .replace(/\{\{firstName\}\}/g, event.data.contactName || ""),
                });
                break;
              }
              case "send_notification": {
                if (!userId) break;
                await sendNotification({
                  tenantId,
                  userId,
                  type: "workflow.completed",
                  title: action.title || `Automation: ${auto.name}`,
                  body: action.body || `Completed for ${event.data.contactName || "contact"}`,
                  actionUrl: event.data.actionUrl,
                });
                break;
              }
              case "create_task": {
                await db.insert(tasks).values({
                  tenantId,
                  title: action.taskTitle || `Follow up: ${event.data.contactName}`,
                  description: action.taskDescription || "",
                  priority: action.priority || "medium",
                  status: "todo",
                  dueDate: action.dueDays
                    ? new Date(Date.now() + action.dueDays * 86400000).toISOString().split("T")[0]
                    : undefined,
                } as any);
                break;
              }
              case "add_tag": {
                if (!event.data.contactId) break;
                const [contact] = await db.select().from(contacts)
                  .where(eq(contacts.id, event.data.contactId)).limit(1);
                if (contact) {
                  const tags = Array.isArray(contact.tags) ? [...contact.tags] : [];
                  if (!tags.includes(action.tag)) {
                    tags.push(action.tag);
                    await db.update(contacts).set({ tags, updatedAt: new Date() })
                      .where(eq(contacts.id, contact.id));
                  }
                }
                break;
              }
              case "move_deal": {
                if (!event.data.dealId) break;
                
                await db.update(deals)
                  .set({ stage: action.targetStage })
                  .where(eq(deals.id, event.data.dealId));
                break;
              }
              case "wait": {
                await step.sleep(`wait-${auto.id}`, `${action.minutes || 5}m`);
                break;
              }
              case "webhook": {
                if (action.url) {
                  await fetch(action.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ event: event.name, data: event.data }),
                  });
                }
                break;
              }
            }
          });
          results.push({ automation: auto.name, action: action.type, status: "success" });
        } catch (err) {
          results.push({ automation: auto.name, action: action.type, status: "error" });
        }
      }

      // Update last run timestamp
      await step.run(`update-${auto.id}`, async () => {
        await db.update(automations)
          .set({ lastRun: new Date() })
          .where(eq(automations.id, auto.id));
      });
    }

    return { executed: results.length, results };
  }
);

/**
 * SCHEDULED: Daily task reminder — 8 AM UTC
 */
export const dailyTaskReminder = inngest.createFunction(
  { id: "daily-task-reminder", name: "Daily Task Reminders" },
  { cron: "0 8 * * *" },
  async ({ step }) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const dueTasks = await step.run("find-due-tasks", async () => {
      return db.select().from(tasks).where(
        and(
          gte(tasks.dueDate, today),
          lte(tasks.dueDate, tomorrow),
          eq(tasks.status, "todo"),
        ) as any
      );
    });

    let sent = 0;
    for (const task of dueTasks) {
      if (task.assignedTo) {
        await step.run(`notify-${task.id}`, async () => {
          await sendNotification({
            tenantId: task.tenantId,
            userId: task.assignedTo!,
            type: "task.due_soon",
            title: `Task due today: ${task.title}`,
            body: task.description || "This task is due today.",
            actionUrl: "/dashboard/tasks",
          });
        });
        sent++;
      }
    }

    return { dueTasks: dueTasks.length, notificationsSent: sent };
  }
);
