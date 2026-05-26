# Notification Transition Protocol

## Purpose

This document defines the safe transition path from mock / frontend-only notification experience to future real backend-backed notification behavior.

Derived from:
- system-control-plane.md
- notification-experience-contract.md

This document defines transition protocol only.
It does not define backend schema, RPCs, or event infrastructure.

---

## Core Transition Rule

Transition must replace **source of truth**, not **meaning**.

Meaning remains fixed.
Backend truth replaces provisional UI state.

---

## Immutable During Transition

The following must NOT change:

- trust-first philosophy
- allowed categories (relationship, invitation, participation, system)
- no gamification
- no urgency mechanics
- no engagement pressure
- notification as secondary UI
- neutral empty state

---

## Current State

- frontend-only
- display-only
- no persistence
- no backend guarantees

---

## Transition Goal

Move from:

frontend-only provisional experience

to:

backend-backed canonical truth

without changing meaning.

---

## Safe Transition Sequence

1. Preserve experience contract
2. Retrieve doctrine and constraints
3. Inspect live backend truth (when available)
4. Define one bounded integration slice
5. Replace data source only (not meaning)
6. Verify cross-surface consistency
7. Capture verified truth

---

## Transition Prohibitions

- no redesign during integration
- no new categories
- no engagement mechanics
- no urgency language
- no backend assumptions
- no schema inference
- no mixing mock + real semantics

---

## Safe Mock-to-Real Mapping Rule

A notification may transition only if:

- category already exists
- meaning does not change
- backend truth is verified
- no engagement logic is introduced

Otherwise:

STOP and escalate.

---

## Completion Criteria

Transition is complete only when:

- meaning unchanged
- backend is actual source
- no provisional assumptions remain
- cross-surface meaning is consistent
- doctrine fully preserved

---

## Final Rule

Change the source of truth.
Do not change the meaning.
