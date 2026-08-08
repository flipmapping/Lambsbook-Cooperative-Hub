import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

export interface WorkbookFingerprint {
  sha256: string;
  byteLength: number;
  rowCount: number;
}

export interface ImportCertification {
  workbook: WorkbookFingerprint;
  headers: string[];
  normalizedHeaders: string[];
  parsedRows: unknown[];
  validationRow?: unknown;
  mappedPayload?: unknown;
}

export function writeImportCertification(data: ImportCertification): void {
  if (process.env.GE_IMPORT_CERTIFICATION !== "1") {
    return;
  }

  const out =
    "execution/certification/GE-REC-002A/workbook-contract.json";

  mkdirSync(dirname(out), { recursive: true });

  writeFileSync(
    out,
    JSON.stringify(data, null, 2),
    "utf8",
  );
}
