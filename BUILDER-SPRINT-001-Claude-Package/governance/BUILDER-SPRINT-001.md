# Claude Package Builder

Implementation Sprint 1

Status

ACTIVE

--------------------------------------------------

Objective

Extend the canonical Claude Package Builder from FOUNDATION to CIB parsing.

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

--------------------------------------------------

Deliverables

The builder SHALL:

✓ Read the supplied Claude Instruction Brief.

✓ Validate that the file exists.

✓ Parse and extract:

- Implementation Authority
- Repository
- Execution Derivation
- Production Surface

✓ Verify that each required field exists.

✓ Abort with FAIL if any mandatory field is absent.

✓ Emit structured metadata to stdout.

--------------------------------------------------

Verification

The builder SHALL successfully process:

governance/cib/generated/CIB-GE-RMP-002-PUBLIC-EXPERIENCE-LANDING-PAGE.md

without requiring any repository mutation.

--------------------------------------------------

Quality Gates

- Python compilation PASS
- Deterministic output
- No hard-coded namespaces
- No repository inspection
- No package generation yet

--------------------------------------------------

Next Sprint

Sprint 2

Consume certified Repository Truth.
