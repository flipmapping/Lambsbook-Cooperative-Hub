# Claude Instruction Brief

Implementation Authority

RMP-010E33B

Derived From

FDR-010E33

Execution Derivation

governance/execution-derivation/RMP-010E33B-EXECUTION-DERIVATION.md

Prerequisites

- INF-010E33A — CERTIFIED
- RMP-010E33A — CERTIFIED

Production Surface

Prospect Document Management Workspace

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/RMP-010E33B-EXECUTION-DERIVATION.md
- governance/rmp/certified/RMP-010E33A-CERTIFICATION.md

Current Work Package

Prospect Document Management Workspace

Repository Mutation Authority

Execution SHALL mutate ONLY:

CREATE

- client/src/components/admissions/ProspectDocumentWorkspace.tsx

MODIFY

- client/src/pages/ProspectDetailWorkspace.tsx

Repository Truth

Execution SHALL verify before mutation:

- GET /api/admissions/prospects/:id/documents
- POST /api/admissions/prospects/:id/documents
- PATCH /api/admissions/prospects/:id/documents/:documentId
- POST /api/admissions/prospects/:id/documents/:documentId/archive

Execution Objective

Consume the certified Prospect Document Management API and embed the Document Workspace immediately after the Prospect Appointment Workspace while preserving every previously certified Release 1 runtime contract.

Execution Deliverable

Generate one complete idempotent repository mutation script:

execution/scripts/RMP-010E33B_prospect_document_workspace.py

The script SHALL follow the canonical mutation architecture established by:

- RMP-010E30B
- RMP-010E31B
- RMP-010E32B

