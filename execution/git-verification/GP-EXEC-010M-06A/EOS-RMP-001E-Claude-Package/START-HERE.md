# START HERE

Implementation Authority

EOS-RMP-001E

--------------------------------------------------

Purpose

This package contains a single bounded mutation to the certified
Claude Package Builder.

--------------------------------------------------

Execution Order

1. Read:

governance/cib/generated/CIB-EOS-RMP-001E-IMPLEMENTATION-CONTEXT-MANIFEST.md

2. Read:

EXECUTION-CONTRACT-EOS-RMP-001E.md

3. Read:

execution/builders/IMPLEMENTATION-CONTEXT-MANIFEST-SPEC.md

4. Modify ONLY:

execution/builders/build_claude_package.py

--------------------------------------------------

Mutation Objective

Enhance the certified Builder to consume an explicit
Implementation Context Manifest (ICM).

Do not modify any Builder behaviour outside the bounded mutation
defined by the Execution Contract.

--------------------------------------------------

Deliverable

Return the updated:

execution/builders/build_claude_package.py

together with a verification report demonstrating that:

- existing Builder behaviour is preserved;
- ICM support is operational;
- Package Manifest includes implementation-context artifacts.

