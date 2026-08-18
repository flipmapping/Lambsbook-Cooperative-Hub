# APP-INV-001 — CLAUDE EXECUTION BRIEF

## Authority

APP-INV-001

## Execution Contract

The supplied PIC package is the sole authoritative implementation contract.

Read the package in the order specified by README.md.

Synchronize with Repository Truth before mutation.

## Mission

Restore the canonical Invitation + Relationship journey:

Invitation URL
→ signup
→ account creation
→ authentication/session
→ canonical identity
→ invitation continuation/materialization
→ invitation acceptance
→ Member Dashboard invitation state
→ Relationship tab

## Mutation Discipline

- Mutate only the APP-INV-001 authorized production corridor.
- Make the minimum necessary mutation.
- Preserve authentication and identity resolution.
- Preserve canonical membership authority.
- Preserve authorization and RLS boundaries.
- Do not create duplicate authorities.
- Do not implement Matrix provider functionality.
- Do not perform unrelated cleanup or refactoring.

## Required Verification

Verify the complete journey using repository and runtime evidence.

Required evidence includes:

- invitation URL
- signup continuation
- authentication/session
- canonical identity
- invitation materialization
- invitation acceptance
- Member Dashboard invitation state
- trusted relationship API
- Relationship tab
- build
- production browser
- production SHA

## Stop Conditions

If a required authority, dependency, or contract is absent, stop and report it.

Do not invent or independently redefine a missing contract.

## Return

Return concise implementation evidence, including:

1. Files changed
2. Mutation summary
3. Build evidence
4. Runtime evidence
5. Invitation evidence
6. Relationship evidence
7. Production evidence
8. Remaining gap
