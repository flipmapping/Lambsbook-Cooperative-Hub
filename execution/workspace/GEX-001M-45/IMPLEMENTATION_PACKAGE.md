# IMPLEMENTATION PACKAGE

Implementation Authority: GEX-001M-45

Repository Truth Status:
- CERTIFIED
- No repository inspection authorized.

Repository:
Lambsbook Cooperative Hub

Mutate EXACTLY ONE file:

server/imports/pipeline/persist.ts

Requirements:

1. Replace the stub implementation.

2. Import:
   - createProspectCore
   - mapImportRecordToRegistrationPayload

3. For every ProspectImportRecord:
   - Map to ProspectRegistrationPayload
   - await createProspectCore(...)
   - Continue after failures

4. Populate ImportResult using the existing repository contracts.

5. Do NOT modify any other repository file.

Acceptance Criteria:

✓ Stub removed
✓ Uses canonical mapper
✓ Uses canonical persistence primitive
✓ npm run build passes

DO NOT inspect the repository again.
Use the already certified repository truths.