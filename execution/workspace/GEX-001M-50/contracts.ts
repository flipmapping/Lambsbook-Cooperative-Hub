import type {
  ProspectImportRecord,
  ImportResult,
} from "../../../shared/imports/types";

export interface ProspectImportPipeline {
  normalize(rows: unknown[]): Promise<ProspectImportRecord[]>;
  validate(rows: ProspectImportRecord[]): Promise<ImportResult>;
  detectDuplicates(rows: ProspectImportRecord[]): Promise<ImportResult>;
  persist(rows: ProspectImportRecord[]): Promise<ImportResult>;
  generateReport(batchId: string): Promise<ImportResult>;
}
