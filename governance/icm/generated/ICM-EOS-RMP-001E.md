# Implementation Context Manifest

Status

CERTIFIED INPUT

Implementation Authority

EOS-RMP-001E

Repository

Lambsbook-Open-Brain

Development Repository

~/workspace

--------------------------------------------------

Implementation Context

execution/builders/build_claude_package.py

execution/builders/IMPLEMENTATION-CONTEXT-MANIFEST-SPEC.md

--------------------------------------------------

Builder Rule

The Builder SHALL:

- verify every listed path exists;
- preserve repository-relative paths;
- copy each listed file into:

  implementation-context/

- record each copied file in PACKAGE-MANIFEST.md.

The Builder SHALL NOT infer additional repository files.

--------------------------------------------------

Current Status

READY FOR BUILDER CONSUMPTION
