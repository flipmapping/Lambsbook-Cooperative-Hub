import type { ImportError } from "../../../shared/imports/types";
import {
  mapCsvRows,
  type CsvImportRow,
} from "../adapters/csv/adapter";
import { stageProspects } from "../staging/engine";
import { generateImportReport } from "../reporting/engine";

export interface ImportPipelineResult {
  report: ReturnType<typeof generateImportReport>;
  validationErrors: ImportError[];
}

export function runImportPipeline(
  rows: CsvImportRow[],
  batchId: string,
): ImportPipelineResult {
  const { records, validationErrors } = mapCsvRows(rows, batchId);

  const staging = stageProspects(records);

  const errors = validationErrors.flat();

  const report = generateImportReport({
    accepted: staging.accepted,
    duplicates: staging.duplicates,
    errors,
    warnings: [],
  });

  return {
    report,
    validationErrors: errors,
  };
}
