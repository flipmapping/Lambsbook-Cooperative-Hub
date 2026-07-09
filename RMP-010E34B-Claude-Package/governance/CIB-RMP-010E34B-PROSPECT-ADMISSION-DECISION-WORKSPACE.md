# Claude Instruction Brief

Implementation Authority

RMP-010E34B

Derived From

FDR-010E34

Execution Derivation

governance/execution-derivation/RMP-010E34B-EXECUTION-DERIVATION.md

Prerequisites

- INF-010E34A — CERTIFIED
- RMP-010E34A — CERTIFIED

Production Surface

Prospect Admission Decision Workspace

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/RMP-010E34B-EXECUTION-DERIVATION.md
- governance/rmp/certified/RMP-010E34A-CERTIFICATION.md

Current Work Package

Prospect Admission Decision Workspace

Repository Truth

Execution SHALL verify before repository mutation:

- GET /api/admissions/prospects/:id/decisions
- POST /api/admissions/prospects/:id/decisions

Authorized Repository Scope

CREATE

- client/src/components/admissions/ProspectAdmissionDecisionWorkspace.tsx

MODIFY

- client/src/pages/ProspectDetailWorkspace.tsx

Repository Constraints

Execution SHALL mutate ONLY the authorized repository corridor.

Execution SHALL NOT modify server files.

Execution SHALL preserve every previously certified Release 1 runtime contract.

Execution Objective

Materialize the Prospect Admission Decision Workspace that consumes the certified admission decision API.

The workspace SHALL be appended beneath the Prospect Document Workspace inside ProspectDetailWorkspace.

Generation Requirement

Generate one complete Python repository mutation script.

The script SHALL:

- verify repository truth
- verify idempotency
- verify structural anchors
- mutate only the authorized corridor
- perform complete post-verification
- support second execution (Already Satisfied)
- preserve all previously certified runtime contracts

