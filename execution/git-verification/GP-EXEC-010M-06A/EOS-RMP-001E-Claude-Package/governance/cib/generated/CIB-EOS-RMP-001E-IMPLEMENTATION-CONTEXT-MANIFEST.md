# Claude Instruction Brief

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

Execution Derivation

governance/execution-derivation/EOS-RMP-001E-EXECUTION-DERIVATION.md

Implementation Context Manifest

governance/icm/generated/ICM-EOS-RMP-001E.md

Production Surface

Implementation Context Manifest (ICM)

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

READ

execution/builders/IMPLEMENTATION-CONTEXT-MANIFEST-SPEC.md

READ

governance/icm/generated/ICM-EOS-RMP-001E.md

--------------------------------------------------

Implementation Objective

Enhance the certified Claude Package Builder to consume a certified
Implementation Context Manifest (ICM).

The Builder SHALL:

- accept an ICM;
- verify each listed repository-relative path exists;
- create:

  implementation-context/

inside the generated Claude Package;

- preserve repository-relative directory structure;
- copy every listed file into the package;
- record each copied file in PACKAGE-MANIFEST.md.

--------------------------------------------------

Builder Constraints

The Builder SHALL NOT:

- perform Repository Bootstrap;
- inspect repository files not listed in the ICM;
- infer additional repository files;
- expand the bounded mutation corridor.

--------------------------------------------------

Expected Verification

PASS

The generated Claude Package SHALL contain:

- governance/
- implementation-context/
- START-HERE.md
- PACKAGE-MANIFEST.md
- ZIP archive
- SHA256 digest

Current Status

READY FOR BUILDER PACKAGE GENERATION
