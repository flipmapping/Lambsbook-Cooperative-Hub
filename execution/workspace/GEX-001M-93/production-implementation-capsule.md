# Production Implementation Capsule

Implementation Authority: GEX-001M-93

Repository:
~/workspace

Mutation Type:
Persistence Stage Integration

AUTHORIZED FILES

Primary:
- server/imports/pipeline/runImportPipeline.ts

Conditional:
- server/imports/pipeline/persist.ts (only if compiler requires)

OBJECTIVES

1. Invoke persist() exactly once.

2. Persist only:

    staging.accepted

3. Preserve:

    - mapCsvRows()
    - stageProspects()
    - report generation
    - validation
    - duplicate handling

4. Do not redesign the pipeline.

5. Do not change persistence semantics.

POST IMPLEMENTATION

Execute:

    npm run build

Return:

    git diff -- server/imports/pipeline/runImportPipeline.ts                 server/imports/pipeline/persist.ts

    npm run build output

Acceptance:

- persist() called exactly once.
- Input is staging.accepted.
- Report generation unchanged.
- Runtime guards pass.
- Build succeeds.
- GEX-001M-93 certified.
