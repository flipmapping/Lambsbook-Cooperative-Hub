# EOS-RMP-001E Execution Derivation

Status

DERIVED

Implementation Authority

EOS-RMP-001E

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

Production Surface

Implementation Context Manifest (ICM)

--------------------------------------------------

Execution Objective

Enhance the certified Claude Package Builder to consume a certified
Implementation Context Manifest (ICM).

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

READ

execution/builders/IMPLEMENTATION-CONTEXT-MANIFEST-SPEC.md

--------------------------------------------------

Implementation Scope

The Builder SHALL:

- accept an Implementation Context Manifest;
- verify every listed repository-relative path exists;
- create:

  implementation-context/

inside the generated Claude Package;

- preserve repository-relative directory structure;
- copy every listed file;
- record copied files in PACKAGE-MANIFEST.md.

--------------------------------------------------

Implementation Constraints

The Builder SHALL NOT:

- perform Repository Bootstrap;
- inspect the repository outside the manifest;
- infer repository files;
- expand the mutation corridor.

--------------------------------------------------

Expected Verification

PASS

Builder-generated Claude Packages SHALL contain:

- governance/
- implementation-context/
- START-HERE.md
- PACKAGE-MANIFEST.md
- ZIP archive
- SHA256 digest

Current Status

READY FOR CIB GENERATION
