# Next Frontend Experience Packet

## Packet Name
Shared Dashboard Entry-State Alignment Packet

## Objective
Advance shared dashboard and system alignment by defining and implementing a contract-safe frontend experience layer for dashboard entry states only, without backend invention and without changing notification scaffolding.

## Why This Is The Next Packet
This packet most directly improves shared dashboard coherence across surfaces during the Supabase block. It strengthens entry-state meaning, reduces UI drift, and prepares later real integration work without assuming unavailable backend truth.

## Allowed Scope
- dashboard entry-state UX structure only
- loading state presentation
- error state presentation
- empty or no-data presentation where already contract-safe
- member versus non-member display framing only where already locked by existing contract meaning
- section ordering and visual consistency inside dashboard entry-state rendering
- copy cleanup for state clarity
- display-only placeholders where clearly non-authoritative
- route and surface alignment review for dashboard entry-state experience only

## Forbidden Scope
- no Supabase access
- no schema assumptions
- no backend mutation
- no RPC invention
- no API-route creation
- no notification rework
- no persistence semantics
- no unread or action authority expansion
- no new domain logic
- no invented membership or invitation behavior beyond already locked runtime meaning
- no fake completion of backend-dependent truth

## Required Files Or Surfaces To Inspect
- `docs/ai/system-control-plane.md`
- `docs/ai/supabase-block-containment.md`
- `docs/ai/automation-execution-registry.md`
- `docs/ai/automation-task-router.md`
- `web/src/app/(protected)/dashboard/page.tsx`
- any already-existing shared dashboard display components directly used by the dashboard entry surface
- any already-existing onboarding-side dashboard entry rendering that could drift from Main Hub meaning

## Exact Deliverables
1. A concise dashboard entry-state experience contract document for current blocked phase
2. A bounded implementation packet for Main Hub dashboard entry-state cleanup or alignment
3. A coordination note stating what Tier-2 may mirror later and what it must not infer now

## Acceptance Criteria
- entry states are explicitly named and clearly separated
- dashboard entry-state meaning is readable without backend invention
- no notification scaffold behavior is modified or expanded
- no backend integration is implied by frontend copy or UI states
- no schema, API, or persistence claims appear
- Main Hub authority remains primary
- Tier-2 dependency remains preserved
- resulting packet is execution-oriented and safe under Supabase-block containment

## Cross-Surface Coordination Note
Main Hub remains the authority for dashboard entry-state meaning. Any Tier-2 or Onboarding alignment must mirror only the approved experience contract and must not infer backend truth, membership semantics, invitation semantics, notification semantics, or integration behavior not already locked by existing system doctrine.

## Dashboard Entry-State Copy & Clarity Completion Note

Status: completed during Supabase Block — Dashboard Copy & Clarity Phase.

Confirmed scope completed in Main Hub dashboard entry surface:
- loading copy refined
- invited pending acceptance redirect copy refined
- error fallback copy refined
- member capability explanation refined
- non-member capability explanation refined
- non-member display explanation refined
- programs explanation refined

Constraints preserved:
- no state logic changes
- no backend mutation
- no notification changes
- no invitation semantic changes

Implementation boundary:
- copy-only adjustments in `web/src/app/(protected)/dashboard/page.tsx`
- deterministic entry-state rendering unchanged
- Main Hub remains authority for meaning and Tier-2 must mirror only approved experience-layer wording where explicitly instructed
