# GP-EXEC-010M-09
Founder Evidence Defect Report

Generated:
2026-07-26T04:11:01.009436 UTC

---

## Certified

- Evidence Presence
- Evidence Discovery
- Authentication Helper
- Notification Corridor
- Evidence Cross-Consistency

---

## Not Certified

Canonical Patch

Reason:

The supplied patch does not completely represent the certified implementation.

Observed findings:

- Missing diff --git header
- Missing new file mode
- Missing --- /dev/null
- Missing server/integrations/zalo/auth.ts
- Only notifications.ts represented

---

## Founder Decision

Implementation Correctness:
CERTIFIED

Evidence Integrity:
PARTIALLY CERTIFIED

Canonical Patch:
NOT CERTIFIED

Repository Materialization:
DEFERRED

---

## Required Builder Action

Regenerate a canonical Git patch representing:

CREATE
server/integrations/zalo/auth.ts

MODIFY
server/services/notifications.ts

No additional repository mutations are authorized.
