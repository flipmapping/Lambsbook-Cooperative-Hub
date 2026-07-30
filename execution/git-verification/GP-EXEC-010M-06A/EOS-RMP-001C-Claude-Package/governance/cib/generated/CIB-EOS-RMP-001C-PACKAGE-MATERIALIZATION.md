# Claude Instruction Brief

Implementation Authority

EOS-RMP-001C

Repository

Lambsbook-Open-Brain

Development Repository

~/workspace

Authority Stream

EOS

Derived From

FDR-EOS-001

Execution Derivation

governance/execution-derivation/EOS-RMP-001C-EXECUTION-DERIVATION.md

Prerequisites

- EOS-RMP-001A — CERTIFIED
- EOS-RMP-001B — CERTIFIED

Production Surface

Claude Package Builder Package Materialization

Status

Founder Authorized

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

--------------------------------------------------

Sprint Objective

Extend the certified Builder to deterministically materialize a Claude Package.

The Builder SHALL:

- create the package root directory;
- create governance/, execution/, and other required subdirectories;
- generate START-HERE.md;
- generate PACKAGE-MANIFEST.md;
- assemble required artifacts into the package directory;
- preserve all certified Sprint 1 and Sprint 2 behaviour.

The Builder SHALL NOT:

- perform Repository Bootstrap;
- generate ZIP archives;
- generate SHA256 digests.

--------------------------------------------------

Expected Verification

PASS

Package directory materialized.

START-HERE.md generated.

PACKAGE-MANIFEST.md generated.

Required artifacts assembled.

Deterministic behaviour preserved.
