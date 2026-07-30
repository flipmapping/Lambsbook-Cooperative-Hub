# EOS-RMP-001C

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

Prerequisite

EOS-RMP-001A — CERTIFIED

EOS-RMP-001B — CERTIFIED

Production Surface

Claude Package Builder Package Materialization

Repository Mutation Authority

GRANTED

--------------------------------------------------

Repository Mutation Corridor

MODIFY

- execution/builders/build_claude_package.py

--------------------------------------------------

Purpose

Extend the certified Claude Package Builder to deterministically materialize
a Claude Package from:

- the certified Claude Instruction Brief; and
- certified Repository Truth.

The Builder SHALL:

- create the package directory;
- generate START-HERE.md;
- generate PACKAGE-MANIFEST.md;
- assemble all required package artifacts;
- preserve deterministic output.

The Builder SHALL NOT:

- perform Repository Bootstrap;
- generate ZIP archives;
- generate SHA256 digests.

--------------------------------------------------

Acceptance Criteria

PASS

The Builder materializes a complete package directory using only certified
inputs while preserving Sprint 1 and Sprint 2 behaviour.

Current Status

READY FOR EXECUTION DERIVATION
