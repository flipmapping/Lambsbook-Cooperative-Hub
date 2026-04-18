# Notification Cross-Surface Contract

## Purpose

This document defines the canonical notification meaning that must remain identical across Lambsbook surfaces.

It is derived from:

- `docs/ai/system-control-plane.md`
- `docs/ai/notification-experience-contract.md`

It does not define backend storage, schema, RPCs, or delivery infrastructure.
It defines only cross-surface meaning and experience consistency.

---

## Core Rule

Gateway and Main Hub must share identical notification meaning wherever notification meaning is already defined.

No surface may redefine notification purpose, tone, or category semantics.

---

## Shared Canonical Meaning

Notifications in Lambsbook are:

- relationship-aligned
- participation-oriented
- minimal
- non-manipulative
- secondary to primary workflow
- never gamified
- never engagement-driven

Notifications inform users of meaningful state.
They do not push, pressure, or optimize retention.

---

## Shared Canonical Categories

The following categories are fixed across all surfaces.

### 1. Relationship

Meaning:
- a trust relationship event is being surfaced

Examples:
- invitation received
- invitation accepted by someone you invited

### 2. Invitation

Meaning:
- an invitation lifecycle state is being surfaced

Examples:
- invitation pending
- invitation accepted
- invitation no longer available

### 3. Participation

Meaning:
- a user is being informed about readiness or availability for participation

Examples:
- a pathway is now available
- participation can now begin

### 4. System

Meaning:
- a neutral system condition must be surfaced to the user

Examples:
- something could not be loaded
- temporary issue occurred

---

## Fixed Across Surfaces

The following are fixed and must not vary between Gateway and Main Hub.

### Fixed Meaning

- category names and semantic meaning
- trust-first philosophy
- no gamification
- no urgency mechanics
- no behavioral pressure
- no promotional framing
- no reward framing
- no engagement optimization

### Fixed Interaction Constraints

- notifications remain secondary UI
- notifications must not dominate dashboard purpose
- no notification may mutate canonical backend truth directly from the notification surface unless backend authority later explicitly defines such behavior
- no surface may invent local notification meaning not grounded in canonical contract

### Fixed Empty-State Philosophy

Empty state must remain neutral.

Allowed pattern:
- “You have no notifications.”
- “Notifications will appear here when there is something meaningful to show.”

Forbidden pattern:
- anything that pressures user to generate activity
- anything that frames absence of notifications as a problem

---

## Flexible Across Surfaces

The following may vary by surface without violating the contract.

### Visual Shell

- icon style
- panel width
- border treatment
- spacing
- typography scale
- placement details within local layout

### Rendering Format

- dropdown
- side panel
- inline list
- compact tray

### Density

- number of visible items
- truncation length
- whether descriptions are collapsed by default

### Local Interaction Presentation

- mark-as-read visual affordance
- dismiss affordance
- expand/collapse affordance

These may vary only if canonical meaning remains unchanged.

---

## Surface-Specific Constraints

### Gateway

Gateway may:
- render notification UI
- use local-only mock or placeholder notification state
- preserve canonical meaning

Gateway must not:
- define backend truth
- invent new notification categories
- imply backend event guarantees
- imply storage semantics

### Main Hub

Main Hub may:
- define canonical backend meaning later
- integrate real notification truth later
- remain authority for data-backed notification semantics

Main Hub must not:
- violate trust-first doctrine
- introduce engagement-centered notification behavior
- create meaning divergence from Gateway

---

## Cross-Surface Consistency Rule

If a notification appears on more than one Lambsbook surface, the following must remain identical:

- category meaning
- user-facing intent
- moral framing
- trust/relationship interpretation

Visual treatment may differ.
Meaning may not.

---

## Prohibited Divergence

The following are forbidden:

- Gateway uses “relationship” while Main Hub uses “growth”
- Gateway uses neutral copy while Main Hub uses urgent engagement copy
- one surface treats notifications as informational while another treats them as conversion prompts
- one surface introduces incentives through notifications

---

## Alignment Test

A cross-surface notification implementation is valid only if all are true:

1. same category means the same thing everywhere
2. tone remains trust-first
3. absence of notifications remains neutral
4. no surface introduces engagement mechanics
5. no surface invents backend guarantees

---

## Final Contract Summary

Gateway and Main Hub may differ in presentation,
but they must not differ in notification meaning.

Meaning is fixed.
Presentation is flexible.
Doctrine is shared.
Authority remains with Main Hub for future backend truth.
