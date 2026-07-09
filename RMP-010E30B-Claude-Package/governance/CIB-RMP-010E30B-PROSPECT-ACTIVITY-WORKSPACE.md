# Claude Instruction Brief

Implementation Authority

RMP-010E30B

Derived From

FDR-010E30

Execution Derivation

governance/execution-derivation/RMP-010E30B-EXECUTION-DERIVATION.md

Prerequisites

- INF-010E30A — CERTIFIED
- RMP-010E30A — CERTIFIED

Production Surface

Prospect Activity Workspace

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/RMP-010E30B-EXECUTION-DERIVATION.md

Current Work Package

Prospect Activity Workspace

Authorized Repository Scope

CREATE

- client/src/components/admissions/ProspectActivityWorkspace.tsx

MODIFY

- client/src/pages/ProspectDetailWorkspace.tsx

Repository Mutation Objective

Implement the minimum frontend repository mutation required to present an immutable Prospect Activity Workspace using the certified GET /api/admissions/prospects/:id/activities endpoint.

Repository Constraints

- Consume only GET /api/admissions/prospects/:id/activities.
- Preserve Prospect Timeline Workspace.
- Preserve Lifecycle Progression.
- Preserve all previously certified Release 1 production surfaces.
- No backend mutation.
- No database mutation.
- No API mutation.
- Mutate only the authorized client repository corridor.

Repository Mutation Standards

Execution SHALL:

- verify repository anchors;
- verify dependencies;
- verify idempotency;
- mutate only the authorized repository corridor;
- perform post-mutation verification;
- verify runtime preservation.

Required Deliverables

Execution SHALL produce only:

1. Standalone executable Python Repository Mutation Package.
2. Corresponding Founder Execution Package.

EOS Materialization

Materialization is complete only when both deliverables have been produced.

Response Restriction

Do not generate implementation commentary.

Generate only the required deliverables.

Stop

Generate only:

1. Complete standalone executable Python Repository Mutation Package.

2. Corresponding Founder Execution Package.

Then stop.
