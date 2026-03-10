import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Connection pool for serverless environment
const client = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

/**
 * Set the current tenant for RLS policies.
 * Must be called at the start of every tenant-scoped request.
 */
export async function setTenantContext(tenantId: string) {
  await client`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
}

export { client };
