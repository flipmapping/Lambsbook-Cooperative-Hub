# Production Verification Capsule

Implementation Authority: GEX-001M-93A

Repository:
~/workspace

Execution Scope

Mutate only:

- server/imports/pipeline/runImportPipeline.ts

Modify persist.ts only if a compiler error requires it.

Implementation Rules

1. Invoke persist() exactly once.
2. Pass only:

       staging.accepted

3. Preserve:

   - mapCsvRows()
   - stageProspects()
   - generateImportReport()
   - duplicate handling
   - validation
   - ImportPipelineResult contract

4. Do not redesign orchestration.

Certification Checklist

After implementation execute:

    git diff -- server/imports/pipeline/runImportPipeline.ts                 server/imports/pipeline/persist.ts

    npm run build

Certification passes only if:

- persist() is called exactly once.
- staging.accepted is the only persistence input.
- Runtime guards pass.
- Production build succeeds.
