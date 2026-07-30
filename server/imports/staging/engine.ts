import type { ProspectImportRecord } from "../../../shared/imports/types";

export interface StagingResult {
  accepted: ProspectImportRecord[];
  duplicates: ProspectImportRecord[];
}

export function stageProspects(
  records: ProspectImportRecord[],
): StagingResult {
  const accepted: ProspectImportRecord[] = [];
  const duplicates: ProspectImportRecord[] = [];

  const phones = new Set<string>();
  const emails = new Set<string>();

  for (const record of records) {
    const phoneKey = record.phone.trim();
    const emailKey = record.email?.trim().toLowerCase();

    const duplicatePhone =
      phoneKey.length > 0 && phones.has(phoneKey);

    const duplicateEmail =
      !!emailKey && emails.has(emailKey);

    if (duplicatePhone || duplicateEmail) {
      duplicates.push(record);
      continue;
    }

    if (phoneKey.length > 0) {
      phones.add(phoneKey);
    }

    if (emailKey) {
      emails.add(emailKey);
    }

    accepted.push(record);
  }

  return {
    accepted,
    duplicates,
  };
}
