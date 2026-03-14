import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { stripeSyncFunction } from "@/lib/inngest/functions/stripe-sync";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [stripeSyncFunction],
});
