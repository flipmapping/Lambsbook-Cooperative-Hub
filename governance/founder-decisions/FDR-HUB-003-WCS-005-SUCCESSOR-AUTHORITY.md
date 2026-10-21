# FDR-HUB-003 — WCS-005 Successor Authority

**Decision status:** FOUNDER_APPROVED_IN_CONVERSATION; SUCCESSOR AUTHORITY NOT ACTIVE
**Recorded:** 2026-10-21
**Work cycle:** `HUB-RESTORE-AUTO-001-WCS-005`

## Approved scope

The Founder approved the WCS-005 scope and a one-calendar-month term. The scope is bounded to restoration-runner safeguards, exact-candidate isolated-preview qualification, and subsequent governed restoration of the approved 11-path dashboard candidate.

## Activation boundary

1. The authority PR requires steward approval of its exact commit and Founder merge.
2. Merging that PR does **not** activate WCS-005.
3. A separate activation record must be reviewed and committed with the actual activation timestamp and exact expiry one calendar month later.
4. The runner must enforce the activation and expiry gates, with regression tests, before any governed restoration or manifest rebinding.

## Limits

- WCS-004 remains authoritative until its recorded expiry; it must not be treated as valid after expiry.
- No restoration, manifest rebinding, or preview execution under WCS-005 before its separate activation and applicable runner qualification.
- No database writes or record edits.
- No publication or deployment.
- Do not merge PR #16 or the restoration PR.
- Preserve `execution/repository-stewardship/RELEASE-CONTRACT.json` byte-for-byte.
- Restrict application changes to the exact 11 approved candidate paths.
- Founder runtime verification is required before any separate release decision.

This decision records the Founder-approved scope and term. It is not an activation record and grants no execution authority before the separate activation gate is satisfied.
