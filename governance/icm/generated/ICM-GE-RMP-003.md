# Implementation Context Manifest

Status

CERTIFIED INPUT

Implementation Authority

GE-RMP-003

Repository

Growth Engine

Development Repository

~/workspace

--------------------------------------------------

Implementation Context

client/src/pages/ProspectRegistration.tsx

server/services/admissions.ts

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
