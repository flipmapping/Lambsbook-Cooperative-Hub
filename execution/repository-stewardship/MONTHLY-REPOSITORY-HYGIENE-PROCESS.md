# Monthly Repository Hygiene Process

Status
------
Founder-approved process under REP-STEWARD-025-WCS-001.

## Cadence and ownership

Run one review each month. The Repository Steward initiates the cycle, records
the repository branch and revision, and presents the report and candidate
register for founder review.

This process performs inventory and review. It does not grant standing
permission to delete, move, rename, or archive files.

## Monthly cycle

1. Start from a clean, identified repository revision.
2. Review current tracked, untracked, and ignored inventories separately.
3. Supply an itemized candidate list derived from current evidence. Do not infer
   candidates from filenames alone.
4. Run the read-only inventory tool from the repository root. Keep its output
   with the cycle record under a separately authorized monthly work cycle.
5. Review each candidate's existence, Git status, history, references, owner,
   and recovery value. Record evidence and confidence.
6. Classify candidates using the Builder Output Lifecycle Standard and the
   approved repository stewardship dispositions. Uncertain items remain REVIEW
   or UNKNOWN.
7. Submit the report and register for founder review. Record decisions and
   close the monthly review cycle.
8. If a specific item is approved for cleanup, create a separate itemized WCS
   that lists exact paths and evidence. Wait for that WCS and its authority to
   pass before performing any cleanup.

## Safety boundaries

- The inventory tool never changes repository files.
- Do not read secret values. Record metadata only for secret-related paths.
- Do not follow symlinks or inspect paths outside the repository root.
- Do not inspect `.git` internals.
- Do not execute the existing broad cleanup scripts.
- A missing, tracked, active, protected, uncertain, or recovery-relevant item is
  not eligible for automatic removal.
- Identical content does not establish redundant purpose.
- Monthly process approval is not blanket cleanup authority.

## Cycle evidence

Each monthly cycle should record its timestamp, branch and revision, inventory
counts, candidate dispositions, evidence sources, reviewer decisions, and any
separate cleanup WCS reference. Preserve the report and machine-readable
register according to their own approved cycle scope.
