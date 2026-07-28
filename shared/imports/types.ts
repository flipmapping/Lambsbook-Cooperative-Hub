export type ConsentStatus =
  | "unknown"
  | "granted"
  | "revoked";

export interface ProspectImportRecord {
  fullName: string;
  phone: string;
  email?: string;

  school?: string;
  province?: string;
  program?: string;

  consentStatus: ConsentStatus;

  source: string;
  externalId?: string;

  batchId: string;
  rowNumber: number;

  metadata?: Record<string, unknown>;
}

export interface ImportBatch {
  id: string;
  source: string;
  filename: string;
  importedAt: Date;

  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
}

export interface ImportError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ImportWarning {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ImportResult {
  batch: ImportBatch;

  imported: number;
  skipped: number;

  errors: ImportError[];
  warnings: ImportWarning[];
}
