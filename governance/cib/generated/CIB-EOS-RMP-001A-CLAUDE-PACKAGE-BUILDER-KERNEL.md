# Claude Instruction Brief

Implementation Authority

EOS-RMP-001A

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

Production Surface

Claude Package Builder Kernel

Status

Founder Authorized

Repository Authority

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/startup/EXECUTION-STARTUP-SYNCHRONIZATION.md
- governance/startup/AUTHORITY-NAMESPACE-RULE-v1.0.md
- governance/startup/CLAUDE-NAMESPACE-SYNCHRONIZATION.md
- governance/BASELINE.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/FDR-EOS-001-EXECUTION-DERIVATION.md
- governance/rmp/EOS-RMP-001A-IMPLEMENTATION-AUTHORITY.md

--------------------------------------------------

Current Work Package

Claude Package Builder Kernel

--------------------------------------------------

Repository Mutation Corridor

MODIFY

- execution/builders/build_claude_package.py

--------------------------------------------------

Execution Objective

Implement Builder Sprint 1 only.

The Builder SHALL:

- read the supplied Claude Instruction Brief;
- validate the CIB exists;
- extract:
  - Implementation Authority
  - Repository
  - Execution Derivation
  - Production Surface;
- verify each mandatory field exists exactly once;
- emit deterministic structured metadata.

--------------------------------------------------

Builder Constraints

The Builder SHALL NOT:

- perform Repository Bootstrap;
- inspect repository structure;
- assemble packages;
- generate package archives;
- generate SHA256 digests;
- modify any repository file other than:

  execution/builders/build_claude_package.py

--------------------------------------------------

Expected Verification

PASS

Structured metadata emitted.

Python compilation succeeds.

Namespace independence preserved.

Deterministic output preserved.
