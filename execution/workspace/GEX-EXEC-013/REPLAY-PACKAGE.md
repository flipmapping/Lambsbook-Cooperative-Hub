# GEX-EXEC-013

Replay Package Certification

Purpose
-------

Package the certified NM-001 replay as a self-contained execution authority.

Certified Repository Surfaces
-----------------------------

1. server/routes.ts

   Hunk A
   - Extend notifications import to include sendNotification.

   Hunk B
   - After successful stage persistence and lifecycle event recording,
     publish exactly one AdmissionsStageTransitionEvent using
     sendNotification().
   - Publication must remain non-blocking.

2. server/services/notifications.ts

   Hunk C
   - Extend the notification type union with:
       "stage_transition"

Acceptance Criteria
-------------------

- Exactly two repository files modified.
- Exactly three certified hunks applied.
- No unrelated repository surfaces changed.
- Build succeeds.
- Repository ready for push and deployment.