# EOS-RMP-001D Execution Derivation

Status

DERIVED

Implementation Authority

EOS-RMP-001D

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
- EOS-RMP-001C — CERTIFIED

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

Extend the certified Builder to deterministically finalize Claude Packages.

The Builder SHALL:

- generate a ZIP archive of the materialized package;
- generate a SHA256 digest file;
- verify archive integrity after creation;
- emit a deterministic package finalization summary.

The Builder SHALL preserve all certified Sprint 1, Sprint 2 and Sprint 3 behaviour.

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
- package archive generation
- SHA256 digest generation
- package verification
- deterministic finalization

--------------------------------------------------

Current Status

READY FOR CIB GENERATION
