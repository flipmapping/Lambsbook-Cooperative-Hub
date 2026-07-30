# Production Implementation Capsule (PIC)

Implementation Authority: GEX-001M-90

Repository:
~/workspace

Mutation Class:
Atomic Pipeline API Evolution

======================================================================
AUTHORIZED FILES
======================================================================

1. server/imports/pipeline/runImportPipeline.ts
2. server/imports/pipeline/smoke.ts
3. shared/imports/types.ts
   (ONLY if required to evolve ImportPipelineResult)

NO OTHER PRODUCTION FILES MAY BE MODIFIED.

======================================================================
OBJECTIVES
======================================================================

1. Convert runImportPipeline() into an async function.

2. Invoke:

    await persist(staging.accepted)

at the canonical orchestration point.

3. Preserve the existing reporting flow.

4. Introduce a stage-oriented ImportPipelineResult that separates:

    - Validation stage
    - Persistence stage
    - Reporting stage

5. Update smoke.ts to await the async API.

6. Preserve existing report generation behaviour.

======================================================================
POST-MUTATION VERIFICATION
======================================================================

Execute:

    npm run build

The implementation is complete only if:

- Runtime guards pass.
- Frontend builds.
- Backend builds.
- No TypeScript errors.
- No unauthorized file mutations.
