import type {
  ProspectImportRecord,
  ImportError,
} from "../../../shared/imports/types";

const PHONE_PATTERN = /^[0-9+()\-\s]{8,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProspect(
  record: ProspectImportRecord,
): ImportError[] {
  const errors: ImportError[] = [];

  if (!record.fullName.trim()) {
    errors.push({
      rowNumber: record.rowNumber,
      field: "fullName",
      message: "Full name is required.",
    });
  }

  if (!record.phone.trim()) {
    errors.push({
      rowNumber: record.rowNumber,
      field: "phone",
      message: "Phone is required.",
    });
  } else if (!PHONE_PATTERN.test(record.phone)) {
    errors.push({
      rowNumber: record.rowNumber,
      field: "phone",
      message: "Phone format is invalid.",
    });
  }

  if (
    record.email &&
    !EMAIL_PATTERN.test(record.email)
  ) {
    errors.push({
      rowNumber: record.rowNumber,
      field: "email",
      message: "Email format is invalid.",
    });
  }

  if (!record.source.trim()) {
    errors.push({
      rowNumber: record.rowNumber,
      field: "source",
      message: "Source is required.",
    });
  }

  if (record.rowNumber <= 0) {
    errors.push({
      rowNumber: record.rowNumber,
      field: "rowNumber",
      message: "Row number must be positive.",
    });
  }

  return errors;
}
