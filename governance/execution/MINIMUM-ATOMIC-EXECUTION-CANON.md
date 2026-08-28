# Minimum Atomic Execution & Release Canon

Status: Proposed Canonical Execution Doctrine
Origin: APP-MEMBER-DASH-001 Cycle 2
Owner: Strategic Architecture / Governance

## Purpose

Reduce repetitive inspection while preserving authority, provenance,
mutation isolation, package integrity, and release integrity.

## Canonical Corridor

AUTHORITATIVE CONTRACT
→ CONTRACT GATE
→ PRE-MUTATION BOUNDARY GATE
→ MUTATION
→ LOCAL VALIDATION
→ PACKAGE MATERIALIZATION
→ PACKAGE CONTRACT GATE
→ EXACT RELEASE SURFACE GATE
→ COMMIT
→ REMOTE SYNCHRONIZATION
→ FINAL CLEAN/SHA GATE

## Core Rules

1. Resolve authoritative contract once.
2. Inspect the mutation/release boundary once.
3. Mutate only the approved surface.
4. Validate the mutation once at the appropriate layer.
5. Materialize the package once.
6. Validate package contract, not incidental ZIP metadata.
7. Stage only the exact release surface.
8. Verify staged paths once.
9. Commit once.
10. Synchronize the exact commit SHA.
11. Verify local SHA equals remote SHA.
12. Verify final worktree cleanliness.

## Evidence Doctrine

Every inspection must establish a new invariant.

If it proves no new invariant, it is unnecessary.

A failed gate stops the corridor at that gate.

The next action addresses only the failed invariant.

No automatic recursive discovery is permitted.

## Authority Doctrine

Correlation is not authority.

An existing artifact is not automatically authoritative.

Historical restoration requires:

- exact provenance;
- exact object identity where available;
- explicit authority.

Missing authority must be escalated.

Inference is forbidden where authority is required.

## Builder Doctrine

The certified Builder is:

execution/builders/build_claude_package.py

The Builder consumes the authoritative CIB and repository truth.

A generated package is output, never authority.

Isolated Builder certification is conditional on:

- Builder changes;
- CIB schema changes;
- package generation changes;
- authority-resolution changes;
- package contract changes;
- failed package validation.

## Package Doctrine

Required package validation covers:

- required entries;
- current task identity;
- current authority;
- stale identity absence;
- artifact inventory;
- root-contract content;
- ZIP self-digest.

Independent ZIP byte equality is not a required reproducibility criterion
unless deterministic Builder output is explicitly part of the contract.

## Temporary Artifact Doctrine

Prefer /tmp for temporary Builder and inspection output.

Repository-local temporary artifacts must not enter the release surface.

## Release Doctrine

Release surface is explicitly enumerated.

Only the exact release surface may be staged.

After commit:

LOCAL_HEAD_SHA == REMOTE_BRANCH_SHA

Final state:

WORKTREE_CLEAN=YES

## Ownership

Strategic Architecture / Governance owns the cross-stream execution doctrine.

Individual execution streams consume the doctrine.

They do not redesign it while performing application work.
