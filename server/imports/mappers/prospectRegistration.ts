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
    studentNumber: record.studentNumber,
    email: record.email ?? "",
    phone: record.phone,
    externalReference: record.externalId,
    country: record.province ?? "",
    programOfInterest: record.program ?? "",
    school: record.school,
    province: record.province,
    notes: record.notes,
    campaignSource: record.source,
  };
}
