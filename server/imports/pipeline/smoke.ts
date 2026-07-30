import { runImportPipeline } from "./runImportPipeline";

const result = runImportPipeline(
  [
    {
      Name: "Alice Example",
      Phone: "+84901234567",
      Email: "alice@example.com",
      School: "CTBC University",
      Province: "Son La",
      "Program of interest": "Business",
      "Consent/status": "granted",
    },
    {
      Name: "Bob Example",
      Phone: "+84901234567",
      Email: "bob@example.com",
      School: "CTBC University",
      Province: "Son La",
      "Program of interest": "Engineering",
      "Consent/status": "granted",
    },
  ],
  "SMOKE-BATCH",
);

console.log({
  accepted: result.report.acceptedRows,
  duplicates: result.report.duplicateRows,
  errors: result.report.errorCount,
});
