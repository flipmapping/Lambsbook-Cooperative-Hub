import type { ProspectImportRecord } from "../../../shared/imports/types";
import type { ProspectRegistrationPayload } from "../../services/admissions";

/**
 * Canonical Import → Domain mapper.
 * Pure transformation with no persistence or side effects.
 */
export function mapImportRecordToRegistrationPayload(
  record: ProspectImportRecord,
): ProspectRegistrationPayload {
  return {
    fullName: record.fullName,
    email: record.email ?? "",
    phone: record.phone,
    country: record.province ?? "",
    programOfInterest: record.program ?? "",
  };
}
