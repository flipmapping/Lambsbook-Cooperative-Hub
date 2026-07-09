# RMP-010E31B Execution Derivation

Status: DERIVED

Implementation Authority

RMP-010E31B

Derived From

FDR-010E31

Prerequisites

- INF-010E31A — CERTIFIED
- RMP-010E31A — CERTIFIED

Release

Growth Engine Release 1 MVP

--------------------------------------------------

Repository Truth

Execution SHALL establish Repository Truth before repository mutation.

Execution SHALL verify:

- GET /api/admissions/prospects/:id/followup-tasks exists.
- Prospect Detail Workspace exists.
- Prospect Timeline Workspace exists.
- Prospect Activity Workspace exists.
- Existing Follow-up Task Workspace does not already exist.

--------------------------------------------------

Authorized Repository Scope

Execution SHALL mutate only the minimum client repository corridor required to realize the Prospect Follow-up Task Workspace.

--------------------------------------------------

Founder Intent Preservation

Execution SHALL preserve without modification:

- Prospect Detail Workspace
- Prospect Timeline Workspace
- Prospect Activity Workspace
- all certified admissions runtime contracts
- all previously certified Release 1 production surfaces

--------------------------------------------------

Execution Objective

Realize the Founder Decision by introducing the Prospect Follow-up Task Workspace that consumes the certified follow-up task API.

--------------------------------------------------

Expected Deliverables

Execution SHALL produce only:

1. Claude Instruction Brief (CIB)
2. Standalone executable Python Repository Mutation Package
3. Founder Execution Package

