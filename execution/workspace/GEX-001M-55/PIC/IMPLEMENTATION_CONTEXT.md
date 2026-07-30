# Production Implementation Capsule (PIC)

Generated:
2026-07-28T03:07:29.112207Z

Implementation Authority:
GEX-001M-55

Mission
-------

Replace the stub implementation in:

server/imports/pipeline/persist.ts

Repository Truth
----------------

- Repository inspection complete
- Architecture certified
- Dependency resolution complete
- Canonical mapper certified
- createProspectCore location certified
- Build previously verified

Authorized Mutation
-------------------

Modify ONLY:

server/imports/pipeline/persist.ts

Acceptance Criteria
-------------------

- Stub removed
- Uses mapImportRecordToRegistrationPayload()
- Uses createProspectCore()
- Sequential processing
- Per-record error isolation
- ImportResult populated
- npm run build passes

Next Sprint
-----------

Integrate persist() into runImportPipeline()

Then verify:

CSV Import
    ->
Canonical Prospect
    ->
Resend / Zalo onboarding