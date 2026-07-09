# EOS-RMP-001C Execution Derivation

Status

DERIVED

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

Prerequisites

- EOS-RMP-001A — CERTIFIED
- EOS-RMP-001B — CERTIFIED

--------------------------------------------------

Execution Operating System

SYNCHRONIZED

Repository Truth

CERTIFIED

--------------------------------------------------

Repository Truth Rule

Execution SHALL consume only certified Repository Truth.

Execution SHALL NOT perform Repository Bootstrap.

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

--------------------------------------------------

Execution Objective

Materialize a deterministic Claude Package from:

- certified Claude Instruction Brief; and
- certified Repository Truth.

The Builder SHALL:

- create the package directory;
- generate START-HERE.md;
- generate PACKAGE-MANIFEST.md;
- assemble required package artifacts.

The Builder SHALL preserve all certified Sprint 1 and Sprint 2 behaviour.

--------------------------------------------------

Artifact Boundary

Execution owns:

- Repository Truth
- Founder Decision
- Execution Derivation
- Claude Instruction Brief
- Implementation Authority

Builder owns:

- package materialization
- package manifest generation
- deterministic package assembly

--------------------------------------------------

Current Status

READY FOR CIB GENERATION
