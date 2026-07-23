# Builder Sprint 1 Implementation

Status

ACTIVE

Implementation Target

execution/builders/build_claude_package.py

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

--------------------------------------------------

Sprint Objective

Implement deterministic parsing of the certified Claude Instruction Brief.

--------------------------------------------------

Required Capabilities

1.

Read the CIB supplied on the command line.

2.

Verify the file exists.

3.

Extract:

- Implementation Authority
- Repository
- Execution Derivation
- Production Surface

4.

Verify each field exists exactly once.

5.

Emit structured metadata:

Implementation Authority:
Repository:
Execution Derivation:
Production Surface:

6.

Exit PASS.

--------------------------------------------------

Failure Conditions

Abort immediately if:

- CIB missing
- duplicate mandatory field
- missing mandatory field
- unreadable file

--------------------------------------------------

Constraints

No Repository Bootstrap.

No repository inspection.

No package assembly.

No ZIP generation.

No SHA256 generation.

No repository mutation outside this file.

--------------------------------------------------

Verification

python3 -m py_compile execution/builders/build_claude_package.py

python3 -m execution.builders.build_claude_package \
governance/cib/generated/CIB-GE-RMP-002-PUBLIC-EXPERIENCE-LANDING-PAGE.md

Expected

PASS

Structured metadata emitted.

--------------------------------------------------

Next Sprint

Sprint 2

Consume certified Repository Truth.
