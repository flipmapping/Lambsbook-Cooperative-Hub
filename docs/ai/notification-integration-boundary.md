# Notification Integration Boundary

## Purpose

This document defines the safe backend integration boundary for Lambsbook notifications.

It is derived from:

- `docs/ai/system-control-plane.md`
- `docs/ai/notification-experience-contract.md`

It does not define schema, RPCs, triggers, storage models, or event infrastructure.
It defines only the boundary between frontend notification experience and future backend truth.

---

## Core Boundary Rule

Frontend may define notification experience.

Frontend may not define notification backend truth.

Main Hub remains authority for any future backend-backed notification semantics.

---

## What Is Already Defined

The following are already defined and fixed at the experience layer:

- trust-first notification philosophy
- allowed categories:
  - relationship
  - invitation
  - participation
  - system
- neutral empty-state behavior
- no gamification
- no urgency mechanics
- no retention optimization
- notifications remain secondary UI

These are safe and canonical at the frontend contract level.

---

## What Is Not Defined

The following are intentionally undefined:

- persistence model
- read-state storage
- event generation
- delivery channels
- ordering guarantees
- deduplication
- retention policy
- server ownership model
- real-time transport
- notification lifecycle engine

No surface may imply that these are already designed.

---

## Backend Integration Boundary

Future backend work may define:

- which canonical events deserve notification representation
- which notification states are persisted
- which surfaces receive backend-driven notifications
- how read state is reconciled
- how notifications are ordered and filtered

Future backend work may not violate:

- trust-first doctrine
- category meanings
- no-gamification doctrine
- no engagement-pressure doctrine

---

## Frontend Safe Zone

The frontend safe zone includes only:

- icon / panel rendering
- display grouping by already-approved categories
- local-only visual read/dismiss affordances
- empty states
- mock or placeholder display states that do not imply backend truth
- visual organization of already-approved meanings

The frontend safe zone excludes:

- storage assumptions
- delivery assumptions
- backend state assumptions
- event guarantees
- inferred canonical unread counts

---

## Main Hub Authority Boundary

Main Hub alone may later define:

- real notification semantics tied to backend truth
- canonical state transitions
- authoritative integration rules between notification meaning and domain events

Until that happens, no surface may claim backend-backed notification correctness.

---

## Fail-Closed Rule

If a proposed notification feature requires any of the following, it is blocked unless Main Hub backend truth is explicitly defined:

- persistence
- server synchronization
- cross-session state
- delivery guarantees
- canonical unread counts
- domain-event mapping

If required backend truth is missing, stop and escalate.

---

## Safe Questions vs Unsafe Questions

### Safe Questions

- How should notification meaning appear in UI?
- Which category does this experience belong to?
- Where should the notification panel live visually?
- How should empty state feel?

### Unsafe Questions

- What table will store notifications?
- What event creates a notification?
- How do read/unread sync across devices?
- What ordering logic should the backend use?
- Which trigger or RPC should create notifications?

Unsafe questions cross the integration boundary and require backend authority.

---

## Integration Readiness Rule

A notification feature is safe for frontend work only if all are true:

1. it can be implemented without backend truth assumptions
2. it does not imply persistence
3. it does not imply event generation
4. it does not alter canonical domain semantics
5. it remains inside the experience contract

If any condition fails, the feature is outside the safe boundary.

---

## Allowed Future Handoff

When backend truth becomes available, the handoff from frontend contract to backend design must preserve:

- category meaning
- trust doctrine
- neutral tone
- non-manipulative behavior
- secondary UI role

Backend integration may deepen truth.
It may not redefine meaning.

---

## Final Boundary Summary

Frontend owns experience shape.
Main Hub owns future backend truth.
No schema, event system, or delivery design is implied by the current notification contract.
Any move beyond experience-only behavior requires explicit backend authority.
