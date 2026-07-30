# Production Implementation Capsule (PIC)

Implementation Authority: GEX-001M-55
Execution Operating System: EOS v2.2
Execution Mode: Repository Materialization

## Constitutional Directive

Repository inspection, architectural certification, dependency resolution,
and mutation authorization are complete.

Do NOT repeat repository inspection.
Do NOT redesign the architecture.
Do NOT broaden the mutation scope.

## Mission

Implement ONLY:

    server/imports/pipeline/persist.ts

## Certified Repository Truth

- Repository builds successfully before this mutation.
- persist.ts is currently a stub.
- mapImportRecordToRegistrationPayload() is the canonical mapper.
- createProspectCore() is the canonical persistence primitive.
- createProspectCore() is located in:
  server/services/admissions.ts

## Authorized Mutation

Modify ONLY:

    server/imports/pipeline/persist.ts

## Forbidden Mutations

Do NOT modify:
- server/imports/pipeline/contracts.ts
- server/imports/mappers/prospectRegistration.ts
- server/services/admissions.ts
- server/imports/pipeline/runImportPipeline.ts

Unless a minimal import correction is required for compilation.

## Required Behaviour

- Remove the stub implementation.
- Import createProspectCore().
- Import mapImportRecordToRegistrationPayload().
- Process ProspectImportRecord values sequentially.
- Continue after per-record failures.
- Populate ImportResult using the existing repository contract.

## Deliverables

1. Completed persist.ts
2. Build results
3. Brief implementation summary
4. Any unavoidable implementation deviations

## Acceptance Criteria

- Stub removed
- Uses createProspectCore()
- Uses mapImportRecordToRegistrationPayload()
- ImportResult populated
- npm run build succeeds

## Out of Scope

Do NOT implement runImportPipeline() integration.
That is the next execution sprint after this mutation is accepted.