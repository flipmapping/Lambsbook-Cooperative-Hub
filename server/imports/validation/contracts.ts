import type { ProspectImportRecord } from "../../../shared/imports/types";

export interface ProspectValidator {
  validate(row: ProspectImportRecord): Promise<void>;
}
