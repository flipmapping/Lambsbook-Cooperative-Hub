# Claude Instruction Brief

Implementation Authority

RMP-010E33A

Derived From

FDR-010E33

Execution Derivation

governance/execution-derivation/FDR-010E33-EXECUTION-DERIVATION.md

Prerequisite Infrastructure

INF-010E33A — CERTIFIED

Production Surface

Prospect Document Management Kernel

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/FDR-010E33-EXECUTION-DERIVATION.md
- governance/infrastructure/certified/INF-010E33A-CERTIFICATION.md

Current Work Package

Prospect Document Management Kernel

Repository Mutation Authority

Execution SHALL mutate ONLY:

- server/lib/supabase-types.ts
- server/lib/supabase-dal.ts
- server/services/admissions.ts
- server/routes.ts

Repository Truth

Execution SHALL verify before mutation:

- growth.prospect_documents exists.
- RMP-010E32A appointment endpoints exist.
- RMP-010E31A follow-up task endpoints exist.
- RMP-010E30A activity endpoints exist.
- No existing document management kernel already exists.

Repository Mutation Objective

Materialize the canonical backend kernel for Prospect Document Management using ONLY the certified:

growth.prospect_documents

infrastructure.

Execution SHALL implement the minimum repository mutation required to support:

- Create document metadata
- List prospect documents
- Update document metadata
- Archive document metadata

Execution SHALL preserve every previously certified Release 1 runtime contract.

Execution Deliverable

Generate one complete idempotent repository mutation script:

execution/scripts/RMP-010E33A_prospect_document_kernel.py

The script SHALL follow the same canonical mutation architecture established by:

- RMP-010E29A
- RMP-010E30A
- RMP-010E31A
- RMP-010E32A

