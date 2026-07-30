# Claude Instruction Brief

Implementation Authority

EOS-RMP-001B-HF1

Repository

Lambsbook-Open-Brain

Development Repository

~/workspace

Authority Stream

EOS

Type

HOTFIX

Derived From

EOS-RMP-001B

Execution Derivation

governance/execution-derivation/FDR-EOS-001-EXECUTION-DERIVATION.md

Prerequisite

EOS-RMP-001A — CERTIFIED

Target Implementation

execution/builders/build_claude_package.py

Production Surface

Claude Package Builder Repository Truth Consumption

Status

Founder Authorized

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

--------------------------------------------------

Verified Founder Evidence

Founder Verification demonstrated that the Builder incorrectly derives the
Implementation Authority artifact path.

Observed lookup:

governance/<ImplementationAuthority>-IMPLEMENTATION-AUTHORITY.md

Certified repository location:

governance/rmp/<ImplementationAuthority>-IMPLEMENTATION-AUTHORITY.md

--------------------------------------------------

Implementation Objective

Correct deterministic Implementation Authority artifact discovery.

The Builder SHALL:

- derive the Implementation Authority artifact using the certified repository layout;
- preserve all EOS-RMP-001A behaviour;
- preserve all EOS-RMP-001B Repository Truth behaviour;
- preserve deterministic output.

The Builder SHALL NOT:

- perform Repository Bootstrap;
- assemble packages;
- generate package archives;
- generate SHA256 digests;
- modify any repository file other than:

  execution/builders/build_claude_package.py

--------------------------------------------------

Expected Verification

PASS

Founder Verification locates the Implementation Authority artifact without any
repository workaround.

Sprint 1 and Sprint 2 behaviour remain unchanged.
