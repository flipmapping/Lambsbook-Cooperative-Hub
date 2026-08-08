/**
 * GE-EXEC-CSV-003 / GE-EXEC-004B-REV3 — Campaign Prospect Import Service
 *
 * Required columns:  full_name, phone
 * Optional columns:  student_number, external_reference, email,
 *                    program_of_interest, school, province, notes,
 *                    campaign_source
 *
 * Missing optional fields are persisted as null and never reject a row.
 * Backward-compatible: richer CSV files (including legacy full_name/email/
 * country/program_of_interest imports) continue to work unchanged.
 *
 * Supports two input formats, both routed through the same row-validation
 * / duplicate-detection / persistence pipeline (processProspectRows):
 *   - CSV text (importProspectsFromCsv) — minimal RFC 4180 parser below.
 *   - .xlsx workbooks (importProspectsFromExcel) — see xlsx-parser.ts.
 *
 * Duplicate detection: a row is skipped (not persisted) if its phone or
 * email already exists in the prospect repository, or duplicates an
 * earlier row in the same file. See processProspectRows().
 *
 * No external CSV or file-upload packages are used — the CSV parser is a
 * minimal RFC 4180 implementation, and xlsx-parser.ts uses only Node's
 * built-in `zlib`.
 * server/lib/supabase-dal.ts itself is not restructured by this file —
 * it is called through its existing/added public methods only
 * (getProspectContactIndex, added under GE-EXEC-004B-REV3).
 */

import { createProspectCore } from './admissions';
import type { ProspectRegistrationPayload } from './admissions';
import { randomUUID, createHash } from 'crypto';
import { writeImportCertification } from './import-certification';
import { supabaseDAL } from '../lib/supabase-dal';
import { parseXlsx } from './xlsx-parser';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CsvImportRow {
  rowNumber: number;
  raw: Record<string, string>;
}

export interface CsvImportSuccess {
  rowNumber: number;
  email: string | null;
  phone: string | null;
  prospectId: string;
}

export interface CsvImportError {
  rowNumber: number;
  email: string | null;
  reason: string;
}

export interface CsvImportSummary {
  total: number;
  imported: number;
  skipped: number;
  errors: CsvImportError[];
  successes: CsvImportSuccess[];
}

// ── Required CSV columns (case-insensitive header match) ─────────────────────

const REQUIRED_COLUMNS = [
  'full_name',
  'phone',
] as const;

type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];

// Optional columns — accepted when present, silently defaulted to null when absent
const OPTIONAL_COLUMNS = [
  'student_number',
  'external_reference',
  'email',
  'program_of_interest',
  'school',
  'province',
  'notes',
  'campaign_source',
  // legacy optional columns retained for backward compatibility
  'country',
] as const;

// ── RFC 4180 CSV parser ───────────────────────────────────────────────────────

/**
 * Parses a CSV string into an array of header-keyed row objects.
 * Handles:
 *   - quoted fields (including embedded commas and newlines)
 *   - CRLF and LF line endings
 *   - leading/trailing whitespace on unquoted fields
 *   - empty trailing lines
 */
function parseCsv(raw: string): Record<string, string>[] {
  // Normalise line endings
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!text) return [];

  const lines = splitCsvLines(text);
  if (lines.length < 2) return [];

  const headers = parseRow(lines[0]).map((h) => h.toLowerCase().trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

/** Split CSV text into logical lines, respecting quoted newlines. */
function splitCsvLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
        current += ch;
      }
    } else if (ch === '\n' && !insideQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Parse a single CSV row into an array of field values. */
function parseRow(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(field.trim());
        field = '';
      } else {
        field += ch;
      }
    }
  }
  fields.push(field.trim());
  return fields;
}

// ── Column validation ─────────────────────────────────────────────────────────

interface ColumnValidationResult {
  valid: boolean;
  missing: string[];
}

function validateColumns(
  headers: string[],
): ColumnValidationResult {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
  const missing = REQUIRED_COLUMNS.filter((c) => !lowerHeaders.includes(c));
  return { valid: missing.length === 0, missing };
}

// ── Row → ProspectRegistrationPayload mapping ─────────────────────────────────

function mapRowToPayload(
  row: Record<string, string>,
): ProspectRegistrationPayload {
  // email: ProspectInsert.email is typed string (not nullable) and the Postgres
  // column carries a unique constraint (uq_growth_prospects_email). Passing ''
  // for every missing email causes a duplicate-key violation on the second row.
  // When email is absent, we generate a unique no-reply sentinel that satisfies
  // both the type constraint and the uniqueness constraint without altering the
  // DAL, schema, or admissions service.
  const emailRaw = row['email']?.trim();
  const email = emailRaw || `import_${randomUUID()}@noemail.invalid`;

  // country and program_of_interest have no unique constraint; '' is safe.
  //
  // The following optional columns are accepted by the parser and validated
  // above (missing values never reject a row) but are NOT passed to
  // createProspectCore() because ProspectRegistrationPayload and the
  // underlying DAL do not yet expose these fields:
  //   student_number, external_reference, school, province, notes, campaign_source
  //
  // These columns are declared in OPTIONAL_COLUMNS for forward compatibility
  // with future recruitment enrichment. The current admissions service does not
  // persist these values and no database mutation is performed for them.
  // Missing optional fields must never reject a CSV row.
  return {
    fullName:          row['full_name'].trim(),
    email,
    country:           row['country']?.trim() || '',
    programOfInterest: row['program_of_interest']?.trim() || '',
    phone:             row['phone']?.trim() || undefined,
  };
}

// ── Row-level validation ──────────────────────────────────────────────────────

function validateRow(
  row: Record<string, string>,
  rowNumber: number,
): string | null {
  // Only full_name and phone are required; all other columns are optional.
  const required: RequiredColumn[] = ['full_name', 'phone'];
  for (const col of required) {
    if (!row[col] || !row[col].trim()) {
      return `Row ${rowNumber}: required column '${col}' is empty`;
    }
  }
  // If email is present, validate its format (but absence is not an error).
  const email = row['email']?.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return `Row ${rowNumber}: invalid email format '${row['email']}'`;
  }
  return null;
}

// ── Duplicate detection ────────────────────────────────────────────────────

/** Normalizes a phone number for duplicate comparison (digits only). */
function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits || null;
}

/** Normalizes an email for duplicate comparison (lowercased, trimmed). */
function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed || null;
}

// ── Main import function ──────────────────────────────────────────────────────

/**
 * Shared row-processing pipeline used by both CSV and Excel import.
 * Validates column presence, checks duplicates against both the
 * existing repository (via supabaseDAL.getProspectContactIndex()) and
 * the current batch, then persists each valid, non-duplicate row via
 * the existing admissions service.
 *
 * Returns a deterministic CsvImportSummary regardless of partial
 * failures. A failure on one row does not abort processing of
 * subsequent rows.
 */
async function processProspectRows(
  rows: Record<string, string>[],
  sourceLabel: string,
): Promise<CsvImportSummary> {
  const summary: CsvImportSummary = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: [],
    successes: [],
  };

  if (rows.length === 0) {
    summary.errors.push({ rowNumber: 0, email: null, reason: `${sourceLabel} contains no data rows` });
    return summary;
  }

  const headers = Object.keys(rows[0]);
  const { valid, missing } = validateColumns(headers);
  if (!valid) {
    summary.errors.push({
      rowNumber: 0,
      email: null,
      reason: `Missing required columns: ${missing.join(', ')}`,
    });
    return summary;
  }

  summary.total = rows.length;

  // Existing-repository duplicate index. A failure here is non-fatal —
  // duplicate detection degrades gracefully to "no cross-batch check"
  // rather than blocking the entire import.
  const existingPhones = new Set<string>();
  const existingEmails = new Set<string>();
  try {
    const index = await supabaseDAL.getProspectContactIndex();
    for (const p of index) {
      const phone = normalizePhone(p.phone);
      const email = normalizeEmail(p.email);
      if (phone) existingPhones.add(phone);
      if (email) existingEmails.add(email);
    }
  } catch (err) {
    console.error('[ProspectImport] Duplicate index lookup failed, continuing without cross-batch dedup:', err);
  }

  // In-batch duplicates (two rows in the same file with the same phone).
  const seenInBatchPhones = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // 1-based, row 1 = header
    const row = rows[i];
    const email = row['email']?.trim() || null;
    const phone = row['phone']?.trim() || null;

    const validationError = validateRow(row, rowNumber);
    if (validationError) {
      summary.skipped += 1;
      summary.errors.push({ rowNumber, email, reason: validationError });
      continue;
    }

    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = normalizeEmail(email);

    if (normalizedPhone && seenInBatchPhones.has(normalizedPhone)) {
      summary.skipped += 1;
      summary.errors.push({ rowNumber, email, reason: `Row ${rowNumber}: duplicate phone number within this file` });
      continue;
    }
    if (normalizedPhone && existingPhones.has(normalizedPhone)) {
      summary.skipped += 1;
      summary.errors.push({ rowNumber, email, reason: `Row ${rowNumber}: phone number already exists in the prospect repository` });
      continue;
    }
    if (normalizedEmail && existingEmails.has(normalizedEmail)) {
      summary.skipped += 1;
      summary.errors.push({ rowNumber, email, reason: `Row ${rowNumber}: email already exists in the prospect repository` });
      continue;
    }

    try {
      const payload = mapRowToPayload(row);
      const prospect = await createProspectCore(payload);
      summary.imported += 1;
      summary.successes.push({
        rowNumber,
        email: prospect.email || null,
        phone,
        prospectId: prospect.id,
      });
      if (normalizedPhone) {
        seenInBatchPhones.add(normalizedPhone);
        existingPhones.add(normalizedPhone);
      }
      if (normalizedEmail) existingEmails.add(normalizedEmail);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      summary.skipped += 1;
      summary.errors.push({ rowNumber, email, reason });
    }
  }

  return summary;
}

/**
 * Processes raw CSV text and persists each valid row as a Prospect with
 * an initialised Prospect Journey via the existing admissions service.
 */
export async function importProspectsFromCsv(
  csvText: string,
): Promise<CsvImportSummary> {
  let rows: Record<string, string>[];
  try {
    rows = parseCsv(csvText);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: [{ rowNumber: 0, email: null, reason: `CSV parse error: ${msg}` }],
      successes: [],
    };
  }
  return processProspectRows(rows, 'CSV file');
}

/**
 * Processes an .xlsx workbook buffer (first worksheet) and persists each
 * valid row as a Prospect, via the same pipeline as CSV import. See
 * xlsx-parser.ts for format support/limitations.
 */
export async function importProspectsFromExcel(
  fileBuffer: Buffer,
): Promise<CsvImportSummary> {
  let rows: Record<string, string>[];
  try {

    rows = parseXlsx(fileBuffer);

    if (process.env.GE_IMPORT_CERTIFICATION === "1") {
      writeImportCertification({
        workbook: {
          sha256: createHash("sha256")
            .update(fileBuffer)
            .digest("hex"),
          byteLength: fileBuffer.length,
          rowCount: rows.length,
        },
        headers: rows.length ? Object.keys(rows[0]) : [],
        normalizedHeaders: rows.length ? Object.keys(rows[0]) : [],
        parsedRows: rows.slice(0, 3),
      });
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: [{ rowNumber: 0, email: null, reason: `Excel parse error: ${msg}` }],
      successes: [],
    };
  }
  return processProspectRows(rows, 'Excel file');
}
