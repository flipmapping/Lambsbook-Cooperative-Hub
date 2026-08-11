import type { ProspectImportRecord } from "../../../../shared/imports/types";
import { validateProspect } from "../../validation/engine";

export interface CsvImportRow {
  [key: string]: string | undefined;
}

export interface CsvImportResult {
  records: ProspectImportRecord[];
  validationErrors: ReturnType<typeof validateProspect>[];
}

export function mapCsvRows(
  rows: CsvImportRow[],
  batchId: string,
  source = "csv",
): CsvImportResult {
  const records: ProspectImportRecord[] = [];
  const validationErrors: ReturnType<typeof validateProspect>[] = [];

  rows.forEach((row, index) => {
    const record: ProspectImportRecord = {
      fullName: row["Name"]?.trim() ?? "",
      phone: row["Phone"]?.trim() ?? "",
      email: row["Email"]?.trim() || undefined,
      studentNumber: row["Student Number"]?.trim() || undefined,
      school: row["School"]?.trim() || undefined,
      province: row["Province"]?.trim() || undefined,
      program: row["Program of interest"]?.trim() || undefined,
      consentStatus:
        row["Consent/status"] === "granted"
          ? "granted"
          : row["Consent/status"] === "revoked"
          ? "revoked"
          : "unknown",
      source,
      externalId: undefined,
      batchId,
      rowNumber: index + 1,
      metadata: {},
    };

    records.push(record);
    validationErrors.push(validateProspect(record));
  });

  return {
    records,
    validationErrors,
  };
}
