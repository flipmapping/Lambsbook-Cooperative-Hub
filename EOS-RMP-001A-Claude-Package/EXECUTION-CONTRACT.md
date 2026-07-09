# EOS-RMP-001A Execution Contract

Status

MANDATORY

--------------------------------------------------

Implementation Authority

EOS-RMP-001A

Production Surface

Claude Package Builder Kernel

--------------------------------------------------

Package Is the Contract (PIC)

This package is the complete implementation contract.

No external chat instructions SHALL supersede this package.

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

--------------------------------------------------

Mutation Scope

Implement Builder Sprint 1 only.

The implementation SHALL:

- read the supplied Claude Instruction Brief;
- validate required fields;
- emit deterministic structured metadata.

The implementation SHALL NOT:

- perform Repository Bootstrap;
- assemble packages;
- generate ZIP archives;
- generate SHA256 digests;
- modify any other repository file.

--------------------------------------------------

Required Deliverables

1.

Updated

execution/builders/build_claude_package.py

2.

Verification Report

3.

Founder Execution Package

--------------------------------------------------

Completion Condition

Python compilation PASS.

Builder executes successfully.

Structured metadata emitted.

Deterministic behaviour preserved.
