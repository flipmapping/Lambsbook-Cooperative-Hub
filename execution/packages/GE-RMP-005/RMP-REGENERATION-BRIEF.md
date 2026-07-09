# FDR-GE-005A — Repository Mutation Package Regeneration

## Authority

GE-RMP-005

## Scope

Regenerate ONLY:

execution/scripts/GE-RMP-005_applicant_journey_status.py

Do NOT regenerate:

- Claude Package
- Builder artifacts
- Governance artifacts
- CIB
- ICM

## Repository Truth

Current repository state:

✓ ApplicantJourneyStatus.tsx exists

✗ ApplicantJourneyStatus lazy import absent

✗ Applicant status route absent

✗ journey.json admissions path absent

## Execution Defect

The previous Repository Mutation Package aborts on partial repository state.

Implement resumable mutation semantics.

Already satisfied mutations SHALL:

- verify
- report satisfied
- continue

Unsatisfied mutations SHALL:

- apply mutation
- verify
- continue

Abort ONLY if:

- anchor missing
- anchor ambiguous
- verification fails
- forbidden mutation required

## Acceptance Criteria

First execution:

PASS

Second execution:

PASS (Already Satisfied)

Partial repository state:

PASS

Manual repository edits:

NOT REQUIRED

## Deliverable

execution/scripts/GE-RMP-005_applicant_journey_status.py
