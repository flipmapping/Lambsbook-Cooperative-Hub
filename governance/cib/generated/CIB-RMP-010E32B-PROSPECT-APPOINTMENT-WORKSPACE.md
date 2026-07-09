# Claude Instruction Brief

Implementation Authority

RMP-010E32B

Derived From

FDR-010E32

Execution Derivation

governance/execution-derivation/RMP-010E32B-EXECUTION-DERIVATION.md

Prerequisites

- INF-010E32A — CERTIFIED
- RMP-010E32A — CERTIFIED

Production Surface

Prospect Appointment & Interview Workspace

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/RMP-010E32B-EXECUTION-DERIVATION.md
- governance/rmp/certified/RMP-010E32A-CERTIFICATION.md

Current Work Package

Prospect Appointment & Interview Workspace

Authorized Repository Scope

CREATE

- client/src/components/admissions/ProspectAppointmentWorkspace.tsx

MODIFY

- client/src/pages/ProspectDetailWorkspace.tsx

Repository Mutation Objective

Materialize a read/write Prospect Appointment & Interview Workspace that consumes only the certified appointment endpoints:

- GET    /api/admissions/prospects/:id/appointments
- POST   /api/admissions/prospects/:id/appointments
- PATCH  /api/admissions/prospects/:id/appointments/:appointmentId
- POST   /api/admissions/prospects/:id/appointments/:appointmentId/cancel
- POST   /api/admissions/prospects/:id/appointments/:appointmentId/complete

Repository Constraints

- Do not modify any server files.
- Do not modify SQL.
- Do not alter existing runtime contracts.
- Preserve Prospect Timeline.
- Preserve Prospect Activity Workspace.
- Preserve Prospect Follow-up Task Workspace.
- Embed the Appointment Workspace immediately after the Follow-up Task Workspace.

Generation Requirement

Generate one complete executable Python repository mutation script named:

execution/scripts/RMP-010E32B_prospect_appointment_workspace.py

The script SHALL be idempotent and follow the canonical repository mutation pattern established by RMP-010E29B through RMP-010E31B.

