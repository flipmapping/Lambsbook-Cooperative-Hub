import type {
  ImportError,
  ImportWarning,
  ProspectImportRecord,
} from "../../../shared/imports/types";

export interface ImportReport {
  totalRows: number;
  acceptedRows: number;
  duplicateRows: number;
  errorCount: number;
  warningCount: number;

  accepted: ProspectImportRecord[];
  duplicates: ProspectImportRecord[];

  errors: ImportError[];
  warnings: ImportWarning[];
}

export function generateImportReport(args: {
  accepted: ProspectImportRecord[];
  duplicates: ProspectImportRecord[];
  errors?: ImportError[];
  warnings?: ImportWarning[];
}): ImportReport {

  const errors = args.errors ?? [];
  const warnings = args.warnings ?? [];

  return {
    totalRows:
      args.accepted.length +
      args.duplicates.length,

    acceptedRows: args.accepted.length,
    duplicateRows: args.duplicates.length,

    errorCount: errors.length,
    warningCount: warnings.length,

    accepted: args.accepted,
    duplicates: args.duplicates,

    errors,
    warnings,
  };
}
