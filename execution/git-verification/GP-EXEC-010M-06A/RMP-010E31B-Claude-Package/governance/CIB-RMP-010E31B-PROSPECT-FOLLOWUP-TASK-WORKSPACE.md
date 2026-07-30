# Claude Instruction Brief

Implementation Authority

RMP-010E31B

Derived From

FDR-010E31

Execution Derivation

governance/execution-derivation/RMP-010E31B-EXECUTION-DERIVATION.md

Prerequisites

- INF-010E31A — CERTIFIED
- RMP-010E31A — CERTIFIED

Production Surface

Prospect Follow-up Task Workspace

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/RMP-010E31B-EXECUTION-DERIVATION.md
- governance/rmp/certified/RMP-010E31A-CERTIFICATION.md

Current Work Package

Prospect Follow-up Task Workspace

Authorized Repository Scope

Execution SHALL mutate only:

- CREATE client/src/components/admissions/ProspectFollowupTaskWorkspace.tsx
- MODIFY client/src/pages/ProspectDetailWorkspace.tsx

Repository Mutation Objective

Implement the canonical Prospect Follow-up Task Workspace that consumes the certified follow-up task API.

Execution SHALL:

- consume GET /api/admissions/prospects/:id/followup-tasks;
- display follow-up tasks chronologically;
- support creation of new follow-up tasks;
- support updating existing tasks;
- support completing follow-up tasks;
- preserve Prospect Timeline Workspace;
- preserve Prospect Activity Workspace;
- preserve Prospect Detail Workspace;
- preserve all certified Release 1 runtime contracts.

Repository Constraints

Execution SHALL:

- mutate only the authorized client corridor;
- consume only certified APIs;
- introduce no schema mutation;
- preserve all previously certified production surfaces.

Quality Gate

Execution SHALL:

- verify unique repository anchors before mutation;
- produce an idempotent mutation script;
- preserve bounded mutation;
- emit PASS, PASS (Already Satisfied), BLOCKED, or FAIL.

Required Deliverables

Execution SHALL produce only:

1. Standalone executable Python Repository Mutation Package.
2. Corresponding Founder Execution Package.

EOS Materialization

Materialization is complete only when both deliverables have been produced.

Response Restriction

No intermediate execution artifacts.

Stop

Generate only the two required deliverables, then stop.

