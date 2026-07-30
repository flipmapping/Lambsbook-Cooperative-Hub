# Builder Sprint 1 — Implementation Specification

Status

ACTIVE

Authority

Repository Builder Sprint 1

Repository

Growth Engine

--------------------------------------------------

Objective

Extend the canonical Claude Package Builder from FOUNDATION to deterministic
Claude Instruction Brief (CIB) parsing.

--------------------------------------------------

Repository Mutation Corridor

MODIFY ONLY

execution/builders/build_claude_package.py

DO NOT MODIFY

- governance/
- execution/contracts/
- execution/framework/
- execution/scripts/
- server/
- client/
- web/

--------------------------------------------------

Verified Repository Truth

Builder exists.

Python compilation PASS.

Canonical invocation established.

Builder interface established.

Builder contract established.

Builder specification established.

--------------------------------------------------

Implementation Requirements

The builder SHALL:

1. Accept exactly one positional argument.

2. Verify the supplied CIB exists.

3. Parse the CIB without mutating the repository.

4. Extract structured metadata including:

- Implementation Authority
- Derived From
- Execution Derivation
- Repository Authority
- Current Work Package
- Authorized Repository Scope

5. Emit deterministic structured output.

6. Return PASS on successful parsing.

--------------------------------------------------

Builder Constraints

The builder SHALL NOT:

- inspect repository contents;
- assemble packages;
- generate ZIP archives;
- generate SHA256 digests;
- derive Repository Truth;
- contain hard-coded authority prefixes.

--------------------------------------------------

Determinism Rule

Given:

- identical builder version;
- identical certified CIB;

the builder SHALL produce identical structured output.

--------------------------------------------------

Verification

Successful execution against:

governance/cib/generated/CIB-GE-RMP-002-PUBLIC-EXPERIENCE-LANDING-PAGE.md

without repository mutation.

--------------------------------------------------

Quality Gates

✓ Python compilation

✓ Namespace independence

✓ Deterministic output

✓ Read-only execution

✓ Zero repository mutation

--------------------------------------------------

Deliverable

Claude SHALL generate only:

1. Standalone executable Python Repository Mutation Package.

2. Corresponding Founder Execution Package.

Stop after generation.
