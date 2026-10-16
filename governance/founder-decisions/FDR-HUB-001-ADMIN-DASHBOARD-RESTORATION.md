# Founder Decision Record — Admin Dashboard Restoration

Authority Identifier

FDR-HUB-001

Status

FOUNDER APPROVED

Repository

Lambsbook Cooperative Hub

Authority Stream

HUB

Derived From

HUB-RMP-003

Effective

2026-10-16

--------------------------------------------------

Decision

Restore the Prospects and Notification Templates tabs in the Hub admin
dashboard using the candidate implementation identified below.

Candidate Baseline

90e044eb811b6370b1144833fd2b88cafd89aa02

Candidate

68e6a3031c473404dc56299ec5d7386203ce871f

--------------------------------------------------

Purpose

Restore the founder-reviewed admin dashboard capabilities for prospect
browsing and notification-template management, including the existing
admin authorization boundary and preservation of untouched language fields.

--------------------------------------------------

Acceptance Boundary

The implementation must remain limited to the 11 paths enumerated in the
associated HUB-RMP-003 Repository Truth record. It must not add prospect
bulk-delete capability or alter notification-template data.

The supplied Replit report records successful build, runtime guard, targeted
API, and browser checks. It reports that all eight Development template rows
were unchanged and that type checking produced no errors beyond the 17 already
present at baseline. This is reported evidence pending independent
reproduction.

--------------------------------------------------

Release Boundary

This decision authorizes deriving the Hub implementation and release
authority for this exact candidate. It does not issue a stewardship release
contract or authorize merge, publication, or deployment.

Development-to-Production synchronization and redeployment may proceed only
after the required release authorization exists and the release gate passes.
