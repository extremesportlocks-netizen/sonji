import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { Sql } from "postgres";
import * as schema from "./schema";

/**
 * Lazy database connection.
 * Only creates the pool on first actual query, not at import/build time.
 * This allows the app to build and deploy without a DATABASE_URL (e.g., during CI).
 */

let _client: Sql | null = null;
let _db: PostgresJsDatabase<typeof schema> | null = null;

function getClient(): Sql {
  if (!_client) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    _client = postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return _client;
}

/** Database instance. Lazily initialized on first use. */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

/**
 * Convenience: direct db access (most common usage).
 * Uses a Proxy to lazily initialize on first property access.
 */
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

/**
 * Set the current tenant for RLS policies.
 * Must be called at the start of every tenant-scoped request.
 */
export async function setTenantContext(tenantId: string) {
  // RLS is disabled — all queries use explicit WHERE tenant_id = ...
  // This was running SELECT set_config() on every API call for no reason.
  // Re-enable when RLS is turned back on.
}

/** Get the raw postgres client (for custom queries). */
export function getClient_raw(): Sql {
  return getClient();
}
