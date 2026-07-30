# Claude Instruction Brief

Implementation Authority

RMP-010E29B

Derived From

FDR-010E29

Execution Derivation

governance/execution-derivation/RMP-010E29B-EXECUTION-DERIVATION.md

Prerequisites

- INF-010E29A — CERTIFIED
- RMP-010E29A — CERTIFIED

Production Surface

Prospect Timeline Workspace

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/BASELINE.md
- governance/releases/RELEASE-1-STATUS.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/RMP-010E29B-EXECUTION-DERIVATION.md
- governance/cib/CIB-PROD-v1.0.md

before Repository Truth is established.

---

Repository Inspection Authority

Execution SHALL inspect only the minimum repository corridor required to establish Repository Truth.

---

Repository Mutation Authority

Execution SHALL mutate only the minimum verified repository corridor required to satisfy the Functional Contract.

---

Production Surface Boundary

Execution SHALL optimize only the Prospect Timeline Workspace.

Execution SHALL NOT improve adjacent Production Surfaces unless objectively required.

---

Infrastructure Dependency Verification

Execution SHALL verify:

- INF-010E29A remains CERTIFIED.

---

Repository Dependency Verification

Execution SHALL verify:

- RMP-010E29A remains CERTIFIED.
- GET /api/admissions/prospects/:id/events exists.
- Prospect Detail Workspace exists.

---

Functional Contract

Execution SHALL:

- consume the certified lifecycle event API;
- render the complete chronological prospect timeline;
- preserve the Prospect Detail Workspace;
- preserve all previously certified runtime contracts;
- preserve all previously certified Production Surfaces.

---

Surface Dependency Matrix

Consumes

- GET /api/admissions/prospects/:id/events
- Prospect Detail Workspace

Produces

- Prospect Timeline Workspace

Mutates

CREATE

- client/src/components/admissions/ProspectTimeline.tsx

MODIFY

- client/src/pages/ProspectDetailWorkspace.tsx

---

Repository Preservation Verification

Execution SHALL verify that no files outside the authorized mutation corridor were modified.

---

Runtime Contract Preservation

Execution SHALL preserve all existing runtime contracts consumed by previously certified Production Surfaces.

---

Execution Outcome

PASS

PASS (Already Satisfied)

BLOCKED

FAIL

---

EOS Materialization

Materialization is complete only when both artifacts exist:

1. Standalone executable Python Repository Mutation Package

2. Founder Execution Package

---

Completion Rule

Execution SHALL terminate only after:

- Repository Mutation Package;
- Founder Execution Package;

or

- BLOCKED has been objectively established.

---

Response Restriction

Repository Truth,

Gap Analysis,

Dependency analysis,

Repository assessment,

and mutation planning

are internal execution activities only.

No intermediate execution artifacts shall replace the required deliverables.

---

Stop

Generate only:

1. complete standalone executable Python Repository Mutation Package

2. corresponding Founder Execution Package

Then stop.
