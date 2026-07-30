# Claude Instruction Brief

Implementation Authority

RMP-010E32A

Derived From

FDR-010E32

Execution Derivation

governance/execution-derivation/FDR-010E32-EXECUTION-DERIVATION.md

Prerequisite Infrastructure

INF-010E32A — CERTIFIED

Production Surface

Prospect Appointment & Interview Kernel

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/FDR-010E32-EXECUTION-DERIVATION.md
- governance/infrastructure/certified/INF-010E32A-CERTIFICATION.md

Current Work Package

Prospect Appointment & Interview Kernel

Authorized Repository Scope

Execution SHALL mutate only:

- server/lib/supabase-types.ts
- server/lib/supabase-dal.ts
- server/services/admissions.ts
- server/routes.ts

Repository Mutation Objective

Implement the canonical backend kernel that consumes the certified
growth.prospect_appointments infrastructure.

Execution SHALL:

- create appointments;
- list appointments;
- update appointments;
- cancel appointments;
- complete appointments;
- record appointment outcomes;
- preserve all certified Release 1 runtime contracts.

Repository Constraints

Execution SHALL:

- consume only certified infrastructure;
- perform bounded repository mutation;
- remain idempotent;
- preserve all previously certified production surfaces.

Quality Gate

Execution SHALL:

- verify unique repository anchors before mutation;
- produce PASS, PASS (Already Satisfied), BLOCKED or FAIL;
- verify all runtime contracts after mutation.

Required Deliverables

Execution SHALL produce only:

1. Standalone executable Python Repository Mutation Package.
2. Corresponding Founder Execution Package.

EOS Materialization

Materialization is complete only when both deliverables have been produced.

Response Restriction

No intermediate execution artifacts.

Stop

Generate only:

1. complete standalone executable Python Repository Mutation Package

2. corresponding Founder Execution Package

Then stop.

