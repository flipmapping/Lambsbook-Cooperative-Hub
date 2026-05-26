# Notification Presentation Specification

## Role of This Document

This document defines the **visual and interaction presentation** of notifications.

It must strictly follow:
- Notification Experience Contract
- System doctrine (non-gamified, trust-first)

This document does NOT define:
- backend behavior
- data structures
- event systems
- API or transport mechanisms

---

## 1. Bell Placement

### Position
- Top-right of dashboard surface
- Within existing header/utility zone
- Must not displace primary content

### Behavior
- Always visible on authenticated dashboard
- Must remain visually secondary

### Constraints
- Must not dominate header space
- Must not animate aggressively
- Must not demand attention

---

## 2. Notification Panel Structure

### Opening Behavior
- Opens on bell interaction
- Overlays or dropdown anchored to bell
- Must not block entire dashboard

### Panel Layout

Top → Bottom structure:

1. Header
   - Title: "Notifications"
   - Optional subtle divider

2. Content Area
   - List of notification items (scrollable)

3. Footer (optional)
   - May include "View more" or "Clear" only if later approved

### Constraints
- Panel must remain compact
- Must not become full-page takeover
- Must not contain complex navigation

---

## 3. Notification Item Structure

Each item must contain:

### Required Elements
- Primary text (message)
- Timestamp (relative or simple)

### Optional Elements (only if already meaningful elsewhere)
- context label (e.g., invitation-related)
- subtle icon (non-gamified)

### Layout

- Vertical stack:
  - Message (primary)
  - Metadata (secondary: timestamp)

### Constraints
- No badges implying rewards
- No ranking indicators
- No gamified visuals

---

## 4. Unread / Read Visual Distinction

### Unread State
- Slight emphasis only:
  - stronger text contrast OR
  - subtle background tint

### Read State
- Reduced contrast
- visually calmer

### Constraints
- No aggressive highlighting
- No blinking, pulsing, or urgency effects
- No numeric pressure indicators required by this spec

---

## 5. Empty State Presentation

### Content
- Simple neutral message:
  - "No notifications yet."

### Visual Style
- centered or padded within panel
- low contrast
- calm tone

### Constraints
- Must not imply urgency
- Must not encourage compulsive checking
- Must not suggest missing out

---

## 6. Interaction Affordances (UI Only)

Allowed UI interactions:

- open panel (click bell)
- close panel
- scroll through items
- optional hover states

Optional (only if later approved):
- dismiss individual item
- mark-as-read (visual only)

### Constraints

Must NOT:
- force user interaction
- interrupt dashboard flow
- require confirmation flows
- introduce task semantics

---

## 7. Fixed vs Flexible Presentation Rules

### Fixed (must not change across surfaces)

- Bell placement: top-right utility area
- Panel anchored to bell
- Item structure (message + timestamp)
- non-gamified visual language
- neutral tone

### Flexible (may adapt per surface)

- panel width
- spacing scale
- typography sizing
- color tokens (must remain within design system)

### Constraints

Flexibility must NOT:
- alter meaning
- introduce urgency
- create new interaction patterns
- diverge from experience contract

---

## 8. Relationship to Other UI Layers

Notifications must remain distinct from:

### Entry-State Layer
- Entry-state defines access meaning
- Notifications must not override or replace it

### Dashboard Content
- Dashboard remains primary
- Notifications are secondary

### Activity Feed
- Activity feed = passive history
- Notifications = attention surface
- Must not merge these two

---

## 9. Global Constraints

Notifications must:

- remain secondary UI
- remain non-intrusive
- remain meaning-preserving
- avoid gamification completely

Notifications must NOT:

- introduce rewards
- introduce urgency pressure
- introduce behavioral nudges
- introduce growth mechanics
- override existing UX flows

---

## Approval Boundary

No implementation should proceed until:

1. Experience Contract (approved) ✔
2. Presentation Spec (this document) ✔
3. Implementation inspection approved

