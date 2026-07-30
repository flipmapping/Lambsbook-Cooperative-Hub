# Claude Instruction Brief

Implementation Authority

RMP-010E30A

Derived From

FDR-010E30

Execution Derivation

governance/execution-derivation/FDR-010E30-EXECUTION-DERIVATION.md

Prerequisite Infrastructure

INF-010E30A — CERTIFIED

Production Surface

Prospect Activity Kernel

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/FDR-010E30-EXECUTION-DERIVATION.md
- governance/infrastructure/certified/INF-010E30A-CERTIFICATION.md

Current Work Package

Prospect Activity Kernel

Authorized Repository Scope

MODIFY

- server/lib/supabase-types.ts
- server/lib/supabase-dal.ts
- server/services/admissions.ts
- server/routes.ts

Repository Mutation Objective

Implement the minimum backend repository mutation required to support immutable prospect activity recording and retrieval using the certified growth.prospect_activities infrastructure.

Repository Constraints

- Preserve all existing admissions runtime contracts.
- Preserve Prospect Timeline functionality.
- Preserve lifecycle event recording.
- Use only growth.prospect_activities.
- Do not modify any client files.
- Do not expand repository scope.

Repository Mutation Standards

Execution SHALL:

- verify repository anchors;
- verify dependencies;
- perform idempotency verification;
- mutate only the authorized repository corridor;
- perform post-mutation verification;
- verify runtime contract preservation.

Required Deliverables

Execution SHALL produce only:

1. Standalone executable Python Repository Mutation Package.
2. Corresponding Founder Execution Package.

EOS Materialization

Materialization is complete only when both deliverables have been produced.

Response Restriction

Repository assessment, planning, and reasoning are internal execution activities only.

Generate only the required deliverables.

Stop

Generate only:

1. Complete standalone executable Python Repository Mutation Package.

2. Corresponding Founder Execution Package.

Then stop.
