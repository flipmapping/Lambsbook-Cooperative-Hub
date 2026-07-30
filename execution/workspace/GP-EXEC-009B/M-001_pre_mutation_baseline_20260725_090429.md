# M-001 Pre-Mutation Baseline

Generated: 2026-07-25T09:04:29.310783

Surface: shared/schema.ts
Lines: 353
SHA256: a72e271840697ce1a8f764c070deef6797f28041865c17206d8c081870610011

## Mutation Objective

Extend the existing Channel model to support 'zalo' while preserving backward compatibility.

## Required Invariants

- Existing channel values remain valid.
- Existing type compatibility is preserved.
- No unrelated schema definitions are modified.
- No notification persistence redesign occurs.
