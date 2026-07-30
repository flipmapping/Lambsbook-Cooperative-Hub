# Production Implementation Capsule

Implementation Authority: GEX-001M-92C

Repository:
~/workspace

Mutation Type:
Contract Completion

AUTHORIZED FILES

- shared/imports/types.ts
- server/imports/pipeline/smoke.ts (only if required)

OBJECTIVE

Complete the ImportPipelineResult contract by adding:

    accepted: ProspectImportRecord[];

Do not modify:

- stageProspects()
- persist()
- report generation
- orchestration

POST IMPLEMENTATION

Execute:

    npm run build

Acceptance:

- ImportPipelineResult matches the implementation.
- Build succeeds.
- GEX-001M-92 is closed.
- GEX-001M-93 becomes authorized.
