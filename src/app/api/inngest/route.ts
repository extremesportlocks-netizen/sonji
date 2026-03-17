import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { stripeSyncFunction } from "@/lib/inngest/functions/stripe-sync";
import { automationRunner, dailyTaskReminder } from "@/lib/inngest/functions/automation-runner";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [stripeSyncFunction, automationRunner, dailyTaskReminder],
});
