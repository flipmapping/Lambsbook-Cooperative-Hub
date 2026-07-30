# Production Implementation Capsule

Implementation Authority: GEX-001M-92F

Repository:
~/workspace

Mutation Type:
Single-File Contract Completion

AUTHORIZED FILES

Primary:
- server/imports/pipeline/runImportPipeline.ts

Conditional:
- server/imports/pipeline/smoke.ts (only if compilation requires)

OBJECTIVES

1. Extend the local ImportPipelineResult interface with:

    accepted: ProspectImportRecord[];

2. Ensure the return object exposes:

    accepted: staging.accepted

3. Preserve:

    - synchronous pipeline
    - stageProspects()
    - report generation
    - validation
    - no persist()
    - no orchestration changes

POST IMPLEMENTATION

Execute:

    npm run build

Return:

    git diff -- server/imports/pipeline/runImportPipeline.ts server/imports/pipeline/smoke.ts

    npm run build output

Acceptance:

- Local interface matches implementation.
- Build succeeds.
- GEX-001M-92 closed.
- GEX-001M-93 authorized.
