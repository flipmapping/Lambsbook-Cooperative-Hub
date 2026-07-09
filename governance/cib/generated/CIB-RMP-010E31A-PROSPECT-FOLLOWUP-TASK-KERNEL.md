# Claude Instruction Brief

Implementation Authority

RMP-010E31A

Derived From

FDR-010E31

Execution Derivation

governance/execution-derivation/FDR-010E31-EXECUTION-DERIVATION.md

Prerequisite Infrastructure

INF-010E31A — CERTIFIED

Production Surface

Prospect Follow-up Task Kernel

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/FDR-010E31-EXECUTION-DERIVATION.md
- governance/infrastructure/certified/INF-010E31A-CERTIFICATION.md

Current Work Package

Prospect Follow-up Task Kernel

Authorized Repository Scope

Execution SHALL mutate only:

- server/lib/supabase-types.ts
- server/lib/supabase-dal.ts
- server/services/admissions.ts
- server/routes.ts

Repository Mutation Objective

Implement the canonical backend support for prospect follow-up tasks using the certified `growth.prospect_followup_tasks` infrastructure.

Execution SHALL:

- extend Supabase type definitions;
- implement DAL methods for create, update, list, and complete follow-up tasks;
- expose service-layer operations;
- add REST endpoints for task management;
- preserve all certified Release 1 runtime contracts.

Repository Constraints

Execution SHALL:

- preserve all existing admissions APIs;
- preserve lifecycle event functionality;
- preserve activity logging functionality;
- use the existing `growth.prospect_followup_tasks` table;
- avoid schema mutation.

Quality Gate

Execution SHALL:

- verify unique repository anchors before mutation;
- produce an idempotent mutation script;
- preserve bounded mutation within the authorized corridor;
- emit PASS, PASS (Already Satisfied), BLOCKED, or FAIL.

Required Deliverables

Execution SHALL produce only:

1. Standalone executable Python Repository Mutation Package.
2. Corresponding Founder Execution Package.

EOS Materialization

Materialization is complete only when both deliverables have been produced.

Response Restriction

No intermediate implementation artifacts.

Stop after producing the two required deliverables.
