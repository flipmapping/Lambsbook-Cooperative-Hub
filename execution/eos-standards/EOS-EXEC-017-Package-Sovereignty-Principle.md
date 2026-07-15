# EOS-EXEC-017 — Package Sovereignty Principle

Status

Founder Approved

Purpose

Establish the certified Package Is the Contract (PIC) as the sole authoritative execution input for implementation agents.

## Core Principles

1. Certified PICs are the exclusive execution contract.
2. Execution agents shall not rely on conversational context.
3. Execution agents shall not infer undeclared authority.
4. Builder shall inject the standard CLAUDE.md into every certified PIC.
5. CLAUDE.md remains generic, deterministic, and reusable.
6. IMPLEMENT.md contains all package-specific implementation rules.
7. PACKAGE-MANIFEST.md defines the repository baseline and package contents.
8. Qualification requirements are defined by the PIC.
9. A certified PIC SHALL be complete and self-sufficient for execution within its authorized mutation boundary.

## Standard PIC Structure

PIC/
├── CLAUDE.md
├── IMPLEMENT.md
├── PACKAGE-MANIFEST.md
├── package.json
├── authorities/
├── repository/
├── evidence/
└── assets/ (optional)

## Builder Responsibilities

Builder SHALL:

- resolve the Certified Builder Input Set (CBIS);
- resolve all declared constitutional authorities;
- resolve the certified repository baseline;
- materialize a complete PIC;
- inject the standard CLAUDE.md;
- verify package completeness before publication.

## Execution Stack

Founder
        │
        ▼
Constitutional Authorities
        │
        ▼
CBIS
        │
        ▼
Builder
        │
        ▼
Certified Package Is the Contract (PIC)
        │
        ▼
Execution Agent
        │
        ▼
Qualification
        │
        ▼
Evidence
        │
        ▼
Open Brain
