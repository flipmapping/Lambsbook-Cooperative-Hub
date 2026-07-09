# Implementation Context Manifest (ICM) Specification

Status

DRAFT

Repository

Lambsbook-Open-Brain

Authority Stream

EOS

Type

Builder Input

--------------------------------------------------

Purpose

Define the canonical Implementation Context Manifest (ICM)
consumed by the Claude Package Builder.

--------------------------------------------------

Responsibilities

The ICM SHALL explicitly enumerate the repository files
authorized for inclusion in a Claude Package.

The ICM SHALL NOT:

- infer repository files;
- discover repository structure;
- expand the mutation corridor.

--------------------------------------------------

Canonical Structure

Implementation Authority

Repository

Repository Root

Implementation Context

Each entry SHALL be a repository-relative file path.

Example

client/src/pages/ProspectRegistration.tsx

server/routes.ts

server/lib/supabase-dal.ts

server/services/admissions.ts

--------------------------------------------------

Builder Contract

Builder SHALL:

- verify every listed file exists;
- preserve directory structure;
- copy each file into:

  implementation-context/

- record every copied file in PACKAGE-MANIFEST.md.

--------------------------------------------------

Determinism Rule

Given an identical:

- Claude Instruction Brief;
- Implementation Context Manifest;
- repository state; and
- Builder version,

the generated implementation-context SHALL be functionally equivalent.

--------------------------------------------------

Current Status

READY FOR IMPLEMENTATION
