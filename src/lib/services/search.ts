import { db } from "@/lib/db";
import { contacts, deals } from "@/lib/db/schema";
import { and, eq, ilike, or, sql } from "drizzle-orm";

/**
 * SEARCH SERVICE
 *
 * Provides full-text search across CRM entities.
 * Uses PostgreSQL ILIKE for now. Will migrate to pg_trgm + GIN indexes
 * or Typesense when we need to scale.
 */

export interface SearchResult {
  id: string;
  type: "contact" | "deal" | "company" | "task";
  title: string;
  subtitle: string;
  url: string;
  score?: number;
}

interface SearchOptions {
  tenantId: string;
  query: string;
  types?: ("contact" | "deal" | "company" | "task")[];
  limit?: number;
}

/**
 * Global search across all entity types.
 */
export async function globalSearch(opts: SearchOptions): Promise<SearchResult[]> {
  const { tenantId, query, types, limit = 20 } = opts;
  if (!query || query.trim().length < 2) return [];

  const q = `%${query.trim()}%`;
  const results: SearchResult[] = [];
  const searchTypes = types || ["contact", "deal", "company", "task"];

  // ── Search Contacts ──
  if (searchTypes.includes("contact")) {
    const contactResults = await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        company: contacts.company,
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.tenantId, tenantId),
          or(
            ilike(contacts.firstName, q),
            ilike(contacts.lastName || "", q),
            ilike(contacts.email || "", q),
            ilike(contacts.company || "", q),
            ilike(contacts.phone || "", q)
          )
        )
      )
      .limit(limit);

    contactResults.forEach((c) => {
      results.push({
        id: c.id,
        type: "contact",
        title: `${c.firstName} ${c.lastName || ""}`.trim(),
        subtitle: [c.email, c.company].filter(Boolean).join(" · "),
        url: `/dashboard/contacts/${c.id}`,
      });
    });
  }

  // ── Search Deals ──
  if (searchTypes.includes("deal")) {
    const dealResults = await db
      .select({
        id: deals.id,
        title: deals.title,
        stage: deals.stage,
        value: deals.value,
      })
      .from(deals)
      .where(
        and(
          eq(deals.tenantId, tenantId),
          or(
            ilike(deals.title, q),
            ilike(deals.notes || "", q)
          )
        )
      )
      .limit(limit);

    dealResults.forEach((d) => {
      results.push({
        id: d.id,
        type: "deal",
        title: d.title,
        subtitle: `${d.stage} · ${d.value ? `$${d.value}` : "No value"}`,
        url: `/dashboard/deals?highlight=${d.id}`,
      });
    });
  }

  return results.slice(0, limit);
}

/**
 * Search contacts specifically (used by contact picker, mention autocomplete, etc.)
 */
export async function searchContacts(
  tenantId: string,
  query: string,
  limit = 10
): Promise<{ id: string; name: string; email: string | null; company: string | null }[]> {
  if (!query || query.trim().length < 1) return [];
  const q = `%${query.trim()}%`;

  return await db
    .select({
      id: contacts.id,
      name: sql<string>`CONCAT(${contacts.firstName}, ' ', COALESCE(${contacts.lastName}, ''))`,
      email: contacts.email,
      company: contacts.company,
    })
    .from(contacts)
    .where(
      and(
        eq(contacts.tenantId, tenantId),
        or(
          ilike(contacts.firstName, q),
          ilike(contacts.lastName || "", q),
          ilike(contacts.email || "", q)
        )
      )
    )
    .limit(limit);
}
