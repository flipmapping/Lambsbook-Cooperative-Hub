# APP-MEX-002A — IMPLEMENTATION CERTIFICATION

## Status

IMPLEMENTATION RETURNED

## Authority

APP-MEX-002A — Purpose & Identity Projection

## Constitutional Derivation

- APP-MEX-002X — Living Member Digital Twin Architecture
- EOS-SYNC-005 — Living Digital Twin Synchronization
- APP-PIVOT-001 — Return to Member Experience Delivery

## Mission

Implement the first certified semantic modules of the Living Member Digital Twin:

- Purpose Projection
- Identity Projection
- Purpose Card
- Identity Card
- MemberHub composition

## Implementation Boundary

The implementation is limited to the Main App Member Experience surface.

The Living Member Digital Twin remains a projection layer.

It does not become a second repository of business truth.

## Delivered Surfaces

- `types.ts`
- `purposeProjection.ts`
- `identityProjection.ts`
- `useMemberPurpose.ts`
- `PurposeCard.tsx`
- `IdentityCard.tsx`
- `MemberHub.tsx`

## Architectural Responsibility

Main App owns the following Digital Twin projections:

- Purpose Projection
- Identity Projection

These projections are intended to become reusable semantic modules for future Member Experience composition.

## Purpose Projection

The Purpose Projection represents the member's declared cooperative purpose and provides the semantic basis for answering:

> Why am I here?

## Identity Projection

The Identity Projection represents the member's certified identity context and provides the semantic basis for answering:

> Who am I becoming within the cooperative?

## UI Composition

The implementation integrates the Purpose and Identity modules into the existing MemberHub experience.

The implementation does not establish a new dashboard architecture and does not duplicate business ownership belonging to other streams.

## Explicit Non-Scope

The following remain outside APP-MEX-002A:

- Relationship Projection
- Community Projection
- Opportunity Projection
- Idea Projection
- Program Projection
- Contribution Projection
- Economic Projection
- Journey Projection
- Impact Projection
- Organization Studio semantic ownership
- Growth Engine semantic ownership
- Community Graph semantic ownership
- AI / Builder semantic ownership

These belong to later authorities in the Living Member Digital Twin roadmap.

## MVP Constraint

APP-MEX-002A is an incremental capability.

It must not delay the CTBC program launch or introduce unnecessary platform-wide dependencies.

The implementation therefore preserves the existing Member Experience while establishing the first reusable Digital Twin semantic modules.

## Repository Safety

The implementation must be materialized wholesale where a returned production surface is authoritative.

Returned files must not be reconstructed through textual patches against a divergent repository baseline.

Production identity must be verified against the implementation-return files before build or commit.

## Verification Requirement

Before commit, the execution stream must verify:

1. Returned production surfaces are byte-identical to the materialized production surfaces.
2. The declared Execution Surface Manifest is respected.
3. `npm run build` is executed as the canonical build command.
4. Verification evidence is captured under the active APP-MEX-002A authority.
5. Only explicitly reviewed APP-MEX-002A files are staged.
6. No unrelated repository changes are included in the commit.

## Repository Hygiene Constraint

The following certified repository rules remain in force:

- Do not recreate `.recovery`.
- Do not recreate `downloads`.
- Do not recreate `download`.
- Do not recreate `.tmp_founder_sample`.
- Do not use `execution/` as unrestricted scratch space.
- Do not use `git add .`.
- Do not perform broad reset, checkout, clean, or deletion operations.
- Preserve `execution/certification/GE-IMPORT-006/ctbc-import-test.xlsx`.
- Commit only explicitly reviewed files belonging to this authority.

## Build Authority

Canonical build:

```text
npm run build