# EOS-RMP-001A

Status

FOUNDER AUTHORIZED

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

Repository Mutation Authority

GRANTED

Canonical CIB

governance/cib/CIB-PROD-v1.0.md

--------------------------------------------------

Repository Mutation Corridor

MODIFY

- execution/builders/build_claude_package.py

--------------------------------------------------

Synchronization Baseline

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/startup/EXECUTION-STARTUP-SYNCHRONIZATION.md
- governance/startup/AUTHORITY-NAMESPACE-RULE-v1.0.md
- governance/startup/CLAUDE-NAMESPACE-SYNCHRONIZATION.md
- governance/BASELINE.md
- governance/execution/EXECUTION-PIPELINE.md
- governance/execution-derivation/FDR-EOS-001-EXECUTION-DERIVATION.md

--------------------------------------------------

Purpose

Authorize bounded implementation of the Claude Package Builder Kernel.

The implementation SHALL:

- consume a certified Claude Instruction Brief;
- consume certified Repository Truth;
- emit deterministic structured metadata;

The implementation SHALL NOT:

- perform Repository Bootstrap;
- assemble packages;
- generate archives;
- generate SHA256 digests.

--------------------------------------------------

Current Status

READY FOR CIB GENERATION
