# REP-STEWARD-020 Builder Output Lifecycle Review

- Review time (UTC): `2026-10-15T08:44:37.332138+00:00`
- Branch and revision: `rep-steward-020-builder-output-governance` / `a4b5865453eec9503dfe3bbe6a22f11f75f56e30`
- Review status: **Founder review required**
- Builder scripts run: **No**
- Package artifacts changed: **No**
- Cleanup authority: **Not granted**

## Finding

The evidence does not establish a single, unambiguous lifecycle contract for Builder outputs. Builder v1.2 is certified and frozen, while three documents marked ACTIVE describe overlapping but differing input and packaging requirements. The certified runtime contract still leaves its canonical invocation and qualification evidence to be recorded. The reviewed sources do not establish which ACTIVE document supersedes the others.

The lifecycle conformance specification refers to a separate Open Brain / Builder Repository. It is comparative evidence only, not controlling authority for this repository.

## LEAP-002 case

The generated and materialized ZIPs are byte-identical and each contains the same single 820-byte PIC file. The delivery registry lists both paths with the same SHA-256, empty builder evidence, and score zero. The generated archive’s qualification record says `NOT_QUALIFIED`. The artifact classification says `AWAITING_DERIVED_ARTIFACT_CLASSIFICATION` and explicitly requires a lifecycle decision.

**Disposition: REVIEW.** Matching content does not establish that either path is redundant. Retain both until an authoritative lifecycle decision exists. No cleanup recommendation is made.

## Decisions for founder review

1. Which Builder contract or specification governs when the ACTIVE documents differ?
2. What is the authoritative transition from generated to materialized?
3. What evidence is required before an output is qualified and listed as a delivery candidate?
4. Should a materialized copy be retained when it is byte-identical to its generated source?

## Evidence and limits

The evidence register records source paths, SHA-256 hashes, status/scope, and findings. This is a documentation review, not runtime certification. No Builder or cleanup scripts were executed, and no package was changed. Any Builder control change or cleanup requires separate, bounded authority.
