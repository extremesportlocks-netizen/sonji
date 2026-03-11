/**
 * CSV IMPORT ENGINE
 *
 * Handles CSV parsing, column auto-detection, field mapping,
 * validation, deduplication, and batch processing.
 * Pure logic — no database dependency.
 */

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  errors: ParseError[];
}

export interface ParseError {
  row: number;
  column?: string;
  message: string;
  severity: "error" | "warning";
}

export interface ColumnMapping {
  csvColumn: string;
  crmField: string | null; // null = skip
  confidence: number; // 0-1, how confident the auto-mapping is
}

export interface ValidationResult {
  valid: number;
  invalid: number;
  duplicates: number;
  warnings: number;
  errors: ParseError[];
  rows: ValidatedRow[];
}

export interface ValidatedRow {
  index: number;
  data: Record<string, string>;
  mapped: Record<string, string>;
  valid: boolean;
  errors: string[];
  isDuplicate: boolean;
}

// CRM fields we can map to
export const CRM_FIELDS = [
  { key: "firstName", label: "First Name", required: true },
  { key: "lastName", label: "Last Name", required: false },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "company", label: "Company", required: false },
  { key: "tags", label: "Tags", required: false },
  { key: "source", label: "Source", required: false },
  { key: "status", label: "Status", required: false },
  { key: "address", label: "Address", required: false },
  { key: "city", label: "City", required: false },
  { key: "state", label: "State", required: false },
  { key: "zip", label: "ZIP Code", required: false },
  { key: "notes", label: "Notes", required: false },
  { key: "dateOfBirth", label: "Date of Birth", required: false },
  { key: "website", label: "Website", required: false },
] as const;

export type CRMFieldKey = typeof CRM_FIELDS[number]["key"];

// ════════════════════════════════════════
// CSV PARSING
// ════════════════════════════════════════

/**
 * Parse a CSV string into headers and rows.
 * Handles quoted fields, escaped quotes, and different line endings.
 */
export function parseCSV(content: string, delimiter?: string): ParsedCSV {
  const errors: ParseError[] = [];

  // Auto-detect delimiter
  if (!delimiter) {
    const firstLine = content.split("\n")[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    delimiter = tabCount > commaCount ? "\t" : semicolonCount > commaCount ? ";" : ",";
  }

  const lines = splitCSVLines(content);
  if (lines.length < 2) {
    return { headers: [], rows: [], totalRows: 0, errors: [{ row: 0, message: "File is empty or has no data rows", severity: "error" }] };
  }

  const headers = parseCSVLine(lines[0], delimiter).map((h) => h.trim());

  // Check for duplicate headers
  const seen = new Set<string>();
  headers.forEach((h, i) => {
    if (seen.has(h.toLowerCase())) {
      errors.push({ row: 0, column: h, message: `Duplicate column header: "${h}"`, severity: "warning" });
      headers[i] = `${h}_${i}`; // deduplicate
    }
    seen.add(h.toLowerCase());
  });

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip empty lines

    const values = parseCSVLine(line, delimiter);

    if (values.length !== headers.length) {
      errors.push({
        row: i,
        message: `Row ${i} has ${values.length} columns, expected ${headers.length}`,
        severity: "warning",
      });
    }

    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = (values[j] || "").trim();
    });
    rows.push(row);
  }

  return { headers, rows, totalRows: rows.length, errors };
}

/**
 * Split CSV content into lines, respecting quoted fields.
 */
function splitCSVLines(content: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && content[i + 1] === "\n") i++; // skip \r\n
      lines.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);
  return lines;
}

/**
 * Parse a single CSV line into field values.
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

// ════════════════════════════════════════
// AUTO-MAPPING
// ════════════════════════════════════════

// Common aliases for CRM fields
const FIELD_ALIASES: Record<CRMFieldKey, string[]> = {
  firstName: ["first name", "first", "fname", "given name", "first_name", "firstname"],
  lastName: ["last name", "last", "lname", "surname", "family name", "last_name", "lastname"],
  email: ["email", "email address", "e-mail", "mail", "email_address"],
  phone: ["phone", "phone number", "mobile", "cell", "telephone", "tel", "phone_number"],
  company: ["company", "organization", "org", "business", "company name", "company_name"],
  tags: ["tags", "labels", "categories", "tag"],
  source: ["source", "lead source", "origin", "channel", "lead_source"],
  status: ["status", "contact status", "lead status", "contact_status"],
  address: ["address", "street", "street address", "address line 1", "address_line_1"],
  city: ["city", "town"],
  state: ["state", "province", "region"],
  zip: ["zip", "zip code", "postal code", "zipcode", "postal", "zip_code"],
  notes: ["notes", "comments", "description", "memo"],
  dateOfBirth: ["date of birth", "dob", "birthday", "birth date", "date_of_birth"],
  website: ["website", "url", "web", "site", "homepage"],
};

/**
 * Auto-detect column mappings based on header names.
 */
export function autoMapColumns(csvHeaders: string[]): ColumnMapping[] {
  return csvHeaders.map((header) => {
    const normalized = header.toLowerCase().trim();
    let bestMatch: string | null = null;
    let bestConfidence = 0;

    for (const [crmField, aliases] of Object.entries(FIELD_ALIASES)) {
      for (const alias of aliases) {
        if (normalized === alias) {
          bestMatch = crmField;
          bestConfidence = 1.0;
          break;
        }
        if (normalized.includes(alias) || alias.includes(normalized)) {
          const conf = Math.min(normalized.length, alias.length) / Math.max(normalized.length, alias.length);
          if (conf > bestConfidence) {
            bestMatch = crmField;
            bestConfidence = conf;
          }
        }
      }
      if (bestConfidence === 1.0) break;
    }

    return {
      csvColumn: header,
      crmField: bestConfidence >= 0.5 ? bestMatch : null,
      confidence: bestConfidence,
    };
  });
}

// ════════════════════════════════════════
// VALIDATION
// ════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)\.]{7,20}$/;

/**
 * Validate and transform mapped rows.
 */
export function validateRows(
  rows: Record<string, string>[],
  mappings: ColumnMapping[],
  existingEmails?: Set<string>
): ValidationResult {
  const emailSet = new Set(existingEmails || []);
  const importEmailSet = new Set<string>();
  const errors: ParseError[] = [];
  const validatedRows: ValidatedRow[] = [];
  let valid = 0, invalid = 0, duplicates = 0, warnings = 0;

  rows.forEach((row, index) => {
    const rowErrors: string[] = [];
    const mapped: Record<string, string> = {};
    let isDuplicate = false;

    // Apply mappings
    mappings.forEach((m) => {
      if (m.crmField && m.crmField !== "skip") {
        mapped[m.crmField] = row[m.csvColumn] || "";
      }
    });

    // Required field: firstName
    if (!mapped.firstName?.trim()) {
      rowErrors.push("First name is required");
    }

    // Email validation
    if (mapped.email) {
      const email = mapped.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        rowErrors.push(`Invalid email: ${mapped.email}`);
      } else {
        // Check duplicates
        if (emailSet.has(email) || importEmailSet.has(email)) {
          isDuplicate = true;
          duplicates++;
        }
        importEmailSet.add(email);
      }
    }

    // Phone normalization
    if (mapped.phone) {
      const phone = mapped.phone.replace(/[^\d\+]/g, "");
      if (phone && !PHONE_REGEX.test(mapped.phone)) {
        errors.push({ row: index + 1, column: "phone", message: `Unusual phone format: ${mapped.phone}`, severity: "warning" });
        warnings++;
      }
    }

    // Status normalization
    if (mapped.status) {
      const s = mapped.status.toLowerCase().trim();
      const statusMap: Record<string, string> = {
        active: "active", lead: "lead", inactive: "inactive", lost: "lost",
        new: "lead", prospect: "lead", customer: "active", client: "active",
        cold: "inactive", churned: "lost", closed: "lost",
      };
      mapped.status = statusMap[s] || "lead";
    }

    const isValid = rowErrors.length === 0;
    if (isValid) valid++; else invalid++;

    rowErrors.forEach((msg) => {
      errors.push({ row: index + 1, message: msg, severity: "error" });
    });

    validatedRows.push({
      index: index + 1,
      data: row,
      mapped,
      valid: isValid,
      errors: rowErrors,
      isDuplicate,
    });
  });

  return { valid, invalid, duplicates, warnings, errors, rows: validatedRows };
}

/**
 * Prepare validated rows for database insertion.
 */
export function prepareForInsert(
  validatedRows: ValidatedRow[],
  tenantId: string,
  options: { skipDuplicates?: boolean; defaultSource?: string; defaultStatus?: string } = {}
): Record<string, any>[] {
  return validatedRows
    .filter((r) => r.valid && (!options.skipDuplicates || !r.isDuplicate))
    .map((r) => ({
      tenantId,
      firstName: r.mapped.firstName?.trim(),
      lastName: r.mapped.lastName?.trim() || null,
      email: r.mapped.email?.trim().toLowerCase() || null,
      phone: r.mapped.phone?.trim() || null,
      company: r.mapped.company?.trim() || null,
      tags: r.mapped.tags ? r.mapped.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      source: r.mapped.source?.trim() || options.defaultSource || "csv_import",
      status: r.mapped.status || options.defaultStatus || "lead",
      customFields: {},
    }));
}
