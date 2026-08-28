# APP-MEMBER-DASH-001 — Member Dashboard MVP Completion

## Mission

Complete the existing Member Dashboard MVP as one bounded,
production-safe implementation surface.

This is a repair/completion cycle, not a dashboard rewrite.

## Authority

MAIN_APP

## Task

APP-MEMBER-DASH-001

## Cycle

2

## Repository

Main Application / Execution Runtime Repository (APP-RUNTIME-01)

## Production Surface

client/src/pages/MemberHub.tsx

## Canonical Surface

/hub/dashboard
→ client/src/pages/MemberHub.tsx

## Authorized Mutation Surface

client/src/pages/MemberHub.tsx

Only directly coupled files proven necessary by the frozen
APP-MEMBER-DASH-001 Cycle-2 implementation contract may be added
to the mutation set.

## Protected Surfaces

client/src/App.tsx
server/routes/member.ts
server/routes/member (copy).ts
client/src/pages/member/MemberDashboard.tsx
client/src/pages/MemberDashboard.tsx

No backend mutation is authorized by this authority.

## Implementation Boundary

The implementation is limited to the Founder-approved
APP-MEMBER-DASH-001 Cycle-2 mutation contract and established
Repository Truth.

No scope expansion, invented contracts, backend redesign,
routing redesign, legacy dashboard replacement, or unrelated
cleanup is authorized.

## Governance

This authority materializes the Founder-designated MAIN_APP
implementation authority required for APP-MEMBER-DASH-001 Cycle 2.

Implementation shall proceed through Builder V1.2 and the
authorized Claude implementation workflow.

Established in-scope MVP fractures must be resolved in the
single authorized implementation cycle unless blocked by an
authoritative contradiction, protected/concurrent WIP collision,
genuinely missing required authority/contract, or explicit
out-of-scope status.
