# Notification Experience Contract

## Purpose

Notifications are a secondary awareness surface that help users notice meaningful cooperative or dashboard-relevant changes without interrupting the main experience flow.

Notifications must not become the primary way users understand the system.
Notifications must not pressure, gamify, or manipulate attention.

They exist to support awareness, not urgency.

---

## Allowed Categories

Only categories that align with current system doctrine may be used.

Allowed categories must remain meaning-preserving and non-gamified. These may include:

- invitation-related status awareness
- dashboard-relevant system status messages
- cooperative participation updates that reflect already-approved system meaning
- read-only awareness of relevant user-facing changes already represented elsewhere in the product

Notifications must NOT introduce new meaning that does not already exist in the approved experience model.

Notifications must NOT introduce:
- rewards
- streaks
- growth prompts
- referral framing
- incentive framing
- competitive ranking
- social pressure mechanics

---

## Tone and Behavior Rules

Notifications must be:

- neutral
- trust-first
- non-gamified
- non-intrusive
- concise
- readable without backend jargon

Notifications must NOT use:

- urgency pressure
- reward framing
- manipulative CTA language
- exaggerated importance
- backend or system-failure jargon exposed directly to users unless already approved as experience-layer wording

Examples of prohibited tone:
- “Act now”
- “Don’t miss this”
- “Claim your reward”
- “You are falling behind”
- “Your RPC failed”
- “System sync error”
- “Upgrade now”

---

## UI Role

Notifications are a secondary surface only.

They must remain subordinate to:

1. entry-state rendering
2. dashboard primary content
3. approved canonical experience layers

Notifications must not replace:
- entry-state meaning
- invitation routing
- dashboard explanation surfaces
- activity feed context

Notifications are a supporting attention layer, not a narrative layer.

---

## Interaction Model

The default interaction model is minimal and presentation-led.

Allowed interaction behavior:
- open / close panel
- passive viewing
- optional dismiss of individual notifications if the implementation later supports it
- optional mark-as-read only if introduced later without changing meaning

Notifications must NOT require immediate user action.

Notifications must NOT:
- block the dashboard
- force modal interruption
- become a required workflow gate
- invent task-management semantics unless separately approved

Current contract preference:
- presentation-first
- read-only by default
- dismissible only if later explicitly approved
- mark-as-read is not required by this contract

---

## Empty State Behavior

When there are no notifications, the notification surface must show a neutral empty state.

The empty state must be:
- calm
- non-urgent
- non-judgmental
- brief

Example acceptable empty-state style:
- “No notifications yet.”

The empty state must NOT:
- encourage compulsive checking
- imply the user is missing out
- create urgency
- invent system claims

---

## Strict Boundaries

This contract does NOT define:

- backend schema
- database tables
- event architecture
- API shape
- polling or push design
- persistence model
- read/unread storage design
- notification delivery system
- ordering guarantees from backend
- event sourcing model

This contract is experience-only.

All future implementation must remain:

- frontend-safe until backend truth is explicitly defined
- faithful to system doctrine
- free of backend assumptions
- free of invented semantics

---

## Relationship to Other Surfaces

Notifications must remain distinct from:

### Entry-State Layer
Entry-state defines access and dashboard boundary meaning.
Notifications must not override or substitute for entry-state.

### Activity Feed
Activity feed is passive contextual history.
Notifications are a secondary attention surface.
These two surfaces must not collapse into one another.

### Dashboard Primary Content
Dashboard cards, guidance, and explanatory blocks remain primary.
Notifications remain supporting only.

---

## Approval Boundary

Any future notification UI or implementation work must follow this order:

1. experience contract approved
2. presentation scope defined
3. implementation inspected against doctrine
4. no backend assumptions introduced

No notification implementation should proceed by inventing data meaning beyond this contract.
