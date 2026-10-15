# REP-STEWARD-019 Duplicate Package Validation Report

- Audit timestamp: `2026-10-15T08:25:06.530478+00:00`
- Branch and revision: `rep-steward-019-duplicate-package-validation` / `0373f4b4b33291ab5615e52493cc4b8fab9a6fdd`
- Tracked paths in selected package locations: 1554
- Package roots assessed: 49
- Archives assessed: 61
- Manifest files found: 67

## Findings

No package-directory content-identity groups were found.

One unique archive pair matched both the byte-for-byte SHA-256 check and the ZIP member-content check. These are two matching signals for **one pair**, not two separate duplicate groups:

- `execution/packages/LEAP-002/generated/LEAP-IMPLEMENT-001-SLICE-001-PIC.zip`
- `execution/packages/LEAP-002/materialized/LEAP-IMPLEMENT-001-SLICE-001-PIC.zip`

Both archives have SHA-256 `1c2e619e8ce40dd23ca2ea30253e58358b29cdfce184d267f38f3c2c322ce057` and contain the same single 820-byte `LEAP-IMPLEMENT-001-SLICE-001-PIC.md` member. Git history records the same last-change commit for both paths.

## Lifecycle and reference evidence

- `execution/builder/delivery/candidate-packages.json` lists both archives with the same hash. Both entries show empty builder evidence and score 0.
- `execution/packages/LEAP-002/generated/LEAP-IMPLEMENT-001-SLICE-001-PIC-QUALIFICATION.json` marks the generated archive `NOT_QUALIFIED`.
- `execution/packages/LEAP-PKG-001/builder-review/LEAP-002-ARTIFACT-CLASSIFICATION.json` says derived-artifact lifecycle is unresolved and requires a decision.
- The `generated` and `materialized` path names suggest different lifecycle roles, but that interpretation is not established by the available authority evidence.

**Disposition: REVIEW.** The content is identical, but the artifacts’ lifecycle purpose is unresolved. This audit makes no cleanup recommendation and authorizes no removal.

## Scope and limitations

Cleanup was not performed or authorized. Cleanup and package-building scripts were not executed. Secret-named directory files were excluded from per-file tree fingerprints. Secret-named ZIP members were not extracted or individually hashed; raw archive hashes cover the complete archive byte streams, including compressed member data, without exposing member plaintext.

Hash equality establishes content identity only. It does not establish redundant purpose, ownership, lifecycle status, external references, or recovery value. Any cleanup requires a separate itemized WCS and authority.
