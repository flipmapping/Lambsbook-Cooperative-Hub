# GEX-EXEC-012

Certified Mutation Replay

Mission
-------

Replay the previously certified NM-001 implementation into the canonical
repository.

This authority is derived from:

- GEX-EXEC-008B Repository Delivery Certification
- GEX-REC-001 Trust Chain Reconciliation
- EOS-CRSG-001 Canonical Deployment Synchronization Gate

Authorized Repository Surfaces
------------------------------

- server/routes.ts
- server/services/notifications.ts

Mutation Rules
--------------

1. Replay ONLY the three certified NM-001 hunks.
2. Do NOT modify any additional files.
3. Build immediately after replay.
4. Verify exactly two modified files before commit.
5. Commit with the NM-001 delivery message.
6. Push to origin.
7. Restart the runtime.
8. Execute Founder Runtime Verification.
9. Produce the Operational Certification Report.

Success Criteria
----------------

- Exactly two repository files modified.
- Clean build.
- Commit created.
- Push succeeds.
- Runtime verified.
- Notification publication observed.
- NM-001 operationally certified.