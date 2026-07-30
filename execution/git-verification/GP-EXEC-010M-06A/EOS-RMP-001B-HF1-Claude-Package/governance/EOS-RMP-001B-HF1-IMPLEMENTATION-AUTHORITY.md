# EOS-RMP-001B-HF1

Status

FOUNDER AUTHORIZED

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

Prerequisite

EOS-RMP-001A — CERTIFIED

Production Surface

Claude Package Builder Repository Truth Consumption

Repository Mutation Authority

GRANTED

--------------------------------------------------

Repository Mutation Corridor

MODIFY

- execution/builders/build_claude_package.py

--------------------------------------------------

Verified Founder Evidence

Founder Verification identified a deterministic implementation defect.

Observed Failure

The Builder searched for the Implementation Authority artifact at:

governance/EOS-RMP-001B-IMPLEMENTATION-AUTHORITY.md

The certified repository stores the artifact at:

governance/rmp/EOS-RMP-001B-IMPLEMENTATION-AUTHORITY.md

--------------------------------------------------

Implementation Objective

Correct deterministic discovery of the Implementation Authority artifact.

The Builder SHALL:

- locate the Implementation Authority artifact using the certified repository layout;
- preserve all Sprint 1 behaviour;
- preserve all Sprint 2 Repository Truth behaviour;
- preserve deterministic output.

The Builder SHALL NOT:

- perform Repository Bootstrap;
- assemble packages;
- generate ZIP archives;
- generate SHA256 digests;
- modify any repository file other than:

  execution/builders/build_claude_package.py

--------------------------------------------------

Acceptance Criteria

PASS

Founder Verification succeeds without repository workarounds.

Current Status

READY FOR HOTFIX CIB
