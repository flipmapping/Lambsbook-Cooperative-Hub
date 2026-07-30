# APP-REC-DOC-001

Title:
Restore Prospect Documents Workspace

Evidence:
- GET /api/admissions/prospects/:id/documents returns HTTP 500.
- Backend reports:
  Could not find table growth.prospect_documents.

Scope:
- Verify schema.
- Restore database object or migration.
- Validate document listing and creation.
