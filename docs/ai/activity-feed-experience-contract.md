# Activity Feed Experience Contract

## Purpose

The Activity Feed is a persistent, read-only context layer that allows users to understand what has happened within the cooperative experience over time.

It is not a notification system.
It does not interrupt the user.
It does not require action.

It exists to provide continuity and awareness.

---

## Core Characteristics

The Activity Feed must be:

- read-only
- timeline-style (ordered visually, not by guaranteed backend time)
- non-interruptive
- always accessible as a contextual layer
- consistent across surfaces

---

## Allowed Categories

Only categories already present in the current frontend model may be used.

These include:

- idea activity (e.g. idea submitted)
- discussion activity (e.g. joined discussion)
- support activity (e.g. support expressed)
- refinement / workflow activity (from existing mock or UI flow)

No new categories may be introduced.

---

## Frontend Data Shape (Non-Canonical)

The Activity Feed uses a frontend-only shape.

Example structure:

- id (string)
- type (string, category label)
- title (string)
- summary (string)
- timestampLabel (string, human-readable only)

Constraints:

- no database assumptions
- no timestamps required beyond display labels
- no ordering guarantees from backend
- no identity or membership inference

---

## UI Structure

The Activity Feed must be presented as a vertical list or timeline.

Each item should include:

- title
- short summary
- timestamp label (e.g. "Just now", "Earlier")

Ordering is visual only and based on local/frontend state.

No claim of real-time accuracy or system ordering should be made.

---

## Interaction Rules

The Activity Feed is strictly read-only.

Users must NOT be able to:

- click to trigger backend actions
- mutate data
- acknowledge or dismiss items
- respond within the feed

Optional:

- items may be expandable for more detail (frontend-only)

---

## Empty State

When no activity exists, display a neutral empty state.

Example:

"No activity yet."

Constraints:

- no urgency
- no prompts to act
- no guidance implying required behavior

---

## Strict Boundary

The Activity Feed must NOT:

- assume database schema
- assume event system or event sourcing
- call or depend on RPC
- imply persistence guarantees
- imply ordering guarantees
- overlap with notification system behavior
- introduce alerts, badges, or urgency
- imply backend truth not present in the current phase

It remains a frontend-only, display-only experience layer.

---

## Relationship to Notifications

The Activity Feed is NOT a notification system.

- notifications = interruptive / attention layer
- activity feed = passive / contextual layer

These must remain separate.

---

## Implementation Boundary

- frontend-only
- display-only
- no backend assumptions
- no system claims
- no logic coupling with notifications
