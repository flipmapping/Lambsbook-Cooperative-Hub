# Claude Instruction Brief

Implementation Authority

RMP-010E34A

Derived From

FDR-010E34

Execution Derivation

governance/execution-derivation/FDR-010E34-EXECUTION-DERIVATION.md

Prerequisite Infrastructure

INF-010E34A — CERTIFIED

Production Surface

Prospect Admission Decision Kernel

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/FDR-010E34-EXECUTION-DERIVATION.md
- governance/infrastructure/certified/INF-010E34A-CERTIFICATION.md

Current Work Package

Prospect Admission Decision Kernel

Authorized Repository Corridor

MODIFY

- server/lib/supabase-types.ts
- server/lib/supabase-dal.ts
- server/services/admissions.ts
- server/routes.ts

Repository Mutation Objective

Execution SHALL implement ONLY the backend repository mutation required to consume the certified growth.prospect_admission_decisions infrastructure.

Execution SHALL preserve ALL previously certified Release 1 runtime contracts.

Repository Mutation Standards

- Repository Truth MUST be established before mutation.
- Structural anchors MUST be verified before mutation.
- Mutation MUST be idempotent.
- Existing admissions runtime contracts MUST remain unchanged.
- Only the authorized repository corridor may be modified.

Generation Requirement

Generate ONE complete idempotent Python EOS repository mutation script implementing RMP-010E34A.

The script SHALL:

- verify repository truth
- verify corridor anchors
- verify idempotency
- mutate only the authorized corridor
- perform post-mutation verification
- verify runtime contract preservation
- support second execution returning PASS (Already Satisfied)

Do NOT generate partial implementations.

Do NOT broaden repository scope.

Required Founder Evidence

- python -m py_compile passes
- Repository mutation reports ══ RESULT: PASS ══
- npm run build passes
- Runtime contracts preserved
- Second execution returns PASS (Already Satisfied)
