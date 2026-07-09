# EOS-RMP-001E

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

Builder v1.0 — CERTIFIED

Type

BUILDER ENHANCEMENT

Production Surface

Implementation Context Manifest (ICM)

--------------------------------------------------

Purpose

Enhance the certified Claude Package Builder to consume a certified
Implementation Context Manifest (ICM).

The ICM SHALL explicitly enumerate the repository files comprising the
bounded repository mutation corridor for the work package.

The Builder SHALL include those files within the generated Claude Package.

--------------------------------------------------

Repository Mutation Authority

GRANTED

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

ADD

execution/builders/IMPLEMENTATION-CONTEXT-MANIFEST-SPEC.md

--------------------------------------------------

Implementation Constraints

The Builder SHALL:

- consume the certified Claude Instruction Brief;
- consume a certified Implementation Context Manifest;
- verify every listed file exists;
- copy listed files into:

  implementation-context/

- record copied files in PACKAGE-MANIFEST.md.

The Builder SHALL NOT:

- inspect the repository beyond the manifest;
- infer repository files;
- expand the mutation corridor;
- perform Repository Bootstrap.

--------------------------------------------------

Expected Outcome

Generated Claude Packages SHALL contain:

- governance artifacts;
- implementation-context/;
- START-HERE.md;
- PACKAGE-MANIFEST.md;
- ZIP archive;
- SHA256 digest.

--------------------------------------------------

Current Status

READY FOR EXECUTION DERIVATION
