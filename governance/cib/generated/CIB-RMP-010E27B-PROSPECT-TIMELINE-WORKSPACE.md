# Claude Instruction Brief

Implementation Authority

RMP-010E27B

Production Surface

Prospect Timeline Workspace

Status

Founder Approved

Repository Mutation Authority

GRANTED

---

# Repository Authority

Execution SHALL synchronize:

- governance/BASELINE.md
- governance/startup/EXECUTION-STARTUP-SYNCHRONIZATION.md
- governance/releases/RELEASE-1-MANIFEST.md
- governance/releases/RELEASE-1-BACKLOG.md
- governance/cib/CIB-PROD-v1.0.md

before Repository Truth is established.

---

# Repository Inspection Authority

Execution SHALL inspect only the minimum repository corridor required to establish Repository Truth for the authorized Production Surface.

---

# Repository Mutation Authority

Following successful Repository Truth and Dependency Verification,

Execution SHALL mutate only the minimum verified repository corridor required to satisfy the Functional Contract.

---

# Production Surface Boundary

Execution SHALL optimize only the Prospect Timeline Workspace.

Execution SHALL NOT improve adjacent Production Surfaces unless objectively required by the Functional Contract.

---

# Current Work Package

Implement the Prospect Timeline Workspace using the lifecycle event capability provided by RMP-010E27A.

---

# Authorized Repository Scope

Execution SHALL derive the minimum repository mutation corridor after repository inspection.

Execution SHALL NOT infer repository structure.

---

# Infrastructure Dependency Verification

Execution SHALL verify:

- growth.prospect_lifecycle_events
- lifecycle event repository capability
- GET /api/admissions/prospects/:id/events

Each dependency SHALL be classified as:

- VERIFIED
- BLOCKED

Repository mutation SHALL NOT assume infrastructure exists.

---

# Current Stage Source Verification

Execution SHALL verify the authoritative repository source of current_stage.

Execution SHALL NOT assume current_stage originates from any particular read model.

If the authoritative source cannot be verified,

Execution SHALL terminate with BLOCKED.

---

# Repository Dependency Verification

Execution SHALL enumerate every verified dependency consumed.

For every dependency report:

- dependency
- verification source
- verification result

Only VERIFIED dependencies may be consumed.

---

# Functional Contract

Execution SHALL implement a chronological Prospect Timeline Workspace using only verified immutable lifecycle events.

Execution SHALL NOT fabricate timeline history.

---

# Surface Dependency Matrix

Execution SHALL internally derive:

Consumes

- verified APIs
- verified components
- verified routes
- verified hooks

Produces

- Prospect Timeline Workspace

Mutates

- authorized repository files only

The dependency matrix is an internal execution artifact.

---

# Repository Preservation Verification

Execution SHALL verify that only authorized repository files were modified.

Execution SHALL verify that no writes occurred outside the mutation corridor.

---

# Runtime Contract Preservation

Execution SHALL preserve all runtime contracts consumed by adjacent certified Release 1 Production Surfaces.

---

# Artifact Requirement

Execution SHALL generate:

1. standalone executable Python Repository Mutation Package

2. Founder Execution Package

---

# Execution Reporting

Execution reporting SHALL include:

- Repository verification
- Infrastructure dependency verification
- Repository dependency verification
- Structural anchor verification
- Corridor verification
- Mutation summary
- Idempotency verification
- Repository preservation verification
- Post-mutation verification
- End-to-end functional verification
- PASS / FAIL certification

---

# Execution Outcome

Execution SHALL terminate with exactly one outcome:

PASS

PASS (Already Satisfied)

BLOCKED

FAIL

---

# Completion Rule

Execution SHALL NOT terminate after Repository Truth,

Gap Analysis,

Planning,

Dependency Analysis,

or Repository Assessment.

Execution SHALL terminate only after:

- complete standalone executable Python Repository Mutation Package;
- complete Founder Execution Package;

or BLOCKED has been objectively established.

---

# EOS Materialization

Materialization is complete only when both artifacts have been produced:

- Repository Mutation Package
- Founder Execution Package

---

# Response Restriction

Repository Truth,

Gap Analysis,

Planning,

Implementation reasoning,

Dependency analysis,

Repository assessment,

and mutation planning

are internal execution activities only.

No intermediate execution artifacts shall replace the required deliverables.

---

# Stop

Generate only:

1. complete standalone executable Python Repository Mutation Package

2. corresponding Founder Execution Package

Then stop.
