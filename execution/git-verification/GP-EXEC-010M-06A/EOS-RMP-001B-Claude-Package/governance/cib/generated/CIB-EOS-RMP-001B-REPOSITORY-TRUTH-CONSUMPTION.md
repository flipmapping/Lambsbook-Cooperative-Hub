# Claude Instruction Brief

Implementation Authority

EOS-RMP-001B

Repository

Lambsbook-Open-Brain

Development Repository

~/workspace

Authority Stream

EOS

Derived From

FDR-EOS-001

Execution Derivation

governance/execution-derivation/FDR-EOS-001-EXECUTION-DERIVATION.md

Prerequisite

EOS-RMP-001A — CERTIFIED

Production Surface

Claude Package Builder Repository Truth Consumption

Status

Founder Authorized

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

--------------------------------------------------

Sprint Objective

Extend the Builder to consume certified Repository Truth.

The Builder SHALL:

- derive artifact locations from the certified CIB;
- verify required governance artifacts exist;
- verify authority consistency across certified artifacts;
- emit deterministic Repository Truth metadata.

The Builder SHALL NOT:

- perform Repository Bootstrap;
- inspect repository structure beyond deterministic artifact discovery;
- assemble packages;
- generate ZIP archives;
- generate SHA256 digests.

--------------------------------------------------

Expected Verification

PASS

Repository Truth metadata emitted.

Deterministic behaviour preserved.

Sprint 1 behaviour preserved.
