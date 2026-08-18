# APP-INV-001 — PIC Package Reading Guide

## Purpose

This package is the certified implementation contract for APP-INV-001 —
Invitation + Relationship Surface Restoration.

Claude must consume the package as the sole authoritative implementation
contract and must not infer implementation intent from conversational context.

## Required Reading Order

Read the package in this order:

1. `START-HERE.md`
2. `governance/cib/generated/APP-INV-001-CIB.md`
3. `governance/rmp/APP-INV-001-IMPLEMENTATION-AUTHORITY.md`
4. `governance/execution-derivation/APP-INV-001-EXECUTION-DERIVATION.md`
5. `governance/icm/generated/ICM-APP-INV-001.md`
6. `PACKAGE-MANIFEST.md`
7. `IMPLEMENT.md`
8. `CLAUDE.md`
9. remaining governance and synchronization artifacts
10. `implementation-context/` source files

## Execution Rule

Synchronize against repository truth before mutation.

Mutate only the surfaces authorized by APP-INV-001.

Do not create duplicate authorities, weaken authentication,
membership, authorization, RLS, or governance controls.

Do not implement Matrix provider functionality.

## Required Journey

Invitation URL
→ signup
→ account creation
→ authentication/session
→ canonical identity
→ invitation continuation/materialization
→ invitation acceptance
→ Member Dashboard invitation state
→ Relationship tab

## Required Evidence

Fresh invitation URL, signup continuation, authentication/session,
canonical identity resolution, invitation materialization, invitation
acceptance, Member Dashboard invitation state, Relationship tab state,
authenticated API evidence, build evidence, and production-browser evidence.

## Stop Condition

If a required authority or contract is absent, stop and report the gap.
Do not independently redefine the missing contract.
