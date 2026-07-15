# BLD-PIC-001 Builder Runtime Implementation Plan

Status

ACTIVE

Implementation Authority

BLD-PIC-001

Mission

Introduce Package Is the Contract (PIC) emission into the Builder
runtime while preserving BOQ-001 certification.

Mutation Corridor

execution/builders/build_claude_package.py

Implementation Sequence

Phase 1
- Resolve Certified Builder Input Set (CBIS)

Phase 2
- Resolve declared constitutional authorities

Phase 3
- Assemble deterministic package

Phase 4
- Inject execution/templates/CLAUDE.md

Phase 5
- Generate IMPLEMENT.md

Phase 6
- Generate PACKAGE-MANIFEST.md

Phase 7
- Validate execution/schemas/PIC.schema.yaml

Phase 8
- Execute Package Integrity Service

Phase 9
- Emit deterministic PIC ZIP

Phase 10
- Return emitted PIC as Builder output

Qualification Gates

PASS
- Existing Builder behaviour preserved

PASS
- Existing Builder tests continue to pass

PASS
- PIC schema validation passes

PASS
- Package Integrity passes

PASS
- Deterministic PIC ZIP emitted

PASS
- LEAP-PREP consumes emitted PIC without manual packaging

Constitutional Constraints

Builder SHALL remain deterministic.

Builder SHALL remain interpretation-free.

Builder SHALL NOT infer authority.

Builder SHALL NOT consume conversational context.

BOQ-001 remains preserved.
