# GP-EXEC-009B-01
## Surface Materialization Manifest

Generated: 2026-07-25T09:01:49.985886

## Mission

Materialize the certified Communication Surface by extending its existing execution corridor with Zalo capability.

## Authorized Surface

- Communication Surface

## Current Repository Realization

- shared/schema.ts (PRESENT)
- client/src/components/notifications/ChannelSelector.tsx (PRESENT)
- client/src/components/notifications/NotificationPreferencesPanel.tsx (PRESENT)
- server/services/notifications.ts (PRESENT)
- server/messaging/interface.ts (PRESENT)
- server/integrations/zalo/adapter.ts (PRESENT)

## Work Packages

### WP-1 — Runtime Capability Extension

- Extend the existing Channel model with 'zalo'.
- Preserve backward compatibility.
- Do not redesign notification schema.

### WP-2 — Preference UI Materialization

- Extend ChannelSelector to expose Email, In-App, and Zalo.
- Preserve single-choice semantics.
- Preserve persistence behavior.

### WP-3 — Canonical Dispatch Extension

- Keep sendNotification() as the only dispatch authority.
- Dispatch according to the selected channel.
- Preserve existing Email and In-App behavior.

### WP-4 — Adapter Activation

- Reuse MessagingProvider.
- Route Zalo through the existing ZaloAdapter.
- Do not introduce a parallel communication subsystem.

## Surface Invariants

- One runtime selector.
- One dispatch authority.
- One provider abstraction.
- One adapter per communication channel.
- Notification persistence semantics remain unchanged.
- Communication channel failure must not bypass notification persistence.

## Mutation Boundaries

- Do not modify: Authentication Surface
- Do not modify: Invitation Acceptance Surface
- Do not modify: Dashboard Surface
- Do not modify: Member Context
- Do not modify: Runtime Recovery
- Do not modify: Prospect Journey orchestration beyond communication integration

## Acceptance Criteria

- Zalo appears as a selectable notification channel.
- Email behavior remains unchanged.
- In-App behavior remains unchanged.
- sendNotification() remains the sole dispatch entry point.
- MessagingProvider delegates to ZaloAdapter for Zalo.
- No duplicate communication architecture exists.

## Exit Authority

Upon satisfying all acceptance criteria, implementation authority transfers to GP-EXEC-010 — Prospect Dashboard Surface.
