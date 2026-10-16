# Founder Decision — Restoration Runner Authority

Decision ID

FDR-HUB-002

Status

FOUNDER APPROVED

Effective

2026-10-16

Repository

Lambsbook Cooperative Hub

Decision

Supersede REP-STEWARD-028 as the active mutation authority when the
HUB-RESTORE-AUTO-001-WCS-003 authority is merged to main.

REP-STEWARD-028 disposition

PR #3 merged its planning-only WCS. That WCS did not authorize hygiene
implementation or cleanup and defines no completion state. This decision
records the planning result without claiming implementation or cleanup occurred.

Successor authority

Authorize only implementation and qualification of the restoration runner on
baseline 1f066d56cccd715de91f069d2a1ef04a83d29a6e, within the exact paths listed in WCS-003.

Limits

- Dashboard restoration requires a separate active release contract.
- The runner must stop if required release authority is missing.
- No application merge, publication, deployment, or database change is authorized.
- Cleanup is limited to temporary worktrees and files created by the runner.
- Founder verification is required before this cycle closes.
