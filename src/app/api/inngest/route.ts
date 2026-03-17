import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { stripeSyncFunction } from "@/lib/inngest/functions/stripe-sync";
import { automationRunner, dailyTaskReminder } from "@/lib/inngest/functions/automation-runner";
import { campaignSender } from "@/lib/inngest/functions/campaign-sender";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [stripeSyncFunction, automationRunner, dailyTaskReminder, campaignSender],
});
