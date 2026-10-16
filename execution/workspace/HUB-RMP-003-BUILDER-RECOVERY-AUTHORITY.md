# One-Time Builder Recovery Authority — HUB-RMP-003

Status

FOUNDER APPROVED

Founder Approval

The Founder approved this exact recovery step in conversation on 2026-10-16.

Purpose

Authorize packaging the already implemented and founder-approved admin
dashboard restoration candidate for EOS and Repository Stewardship review.

Bound Candidate

Baseline: 90e044eb811b6370b1144833fd2b88cafd89aa02
Candidate: 68e6a3031c473404dc56299ec5d7386203ce871f
Authority: HUB-RMP-003
Founder Decision: FDR-HUB-001

Recovery Exception

For this candidate and this package-generation step only, BIS-001 invocation
is suspended. The installed command documented by BUILDER-v1.0-CERTIFICATION.md
may be invoked to materialize the review package.

This exception does not modify BIS-001, certify the installed Builder as
Builder v1.2, or authorize future Builder invocations.

Limits

- Package the existing candidate for review; perform no application-source
  mutation.
- Do not modify notification-template records or other database state.
- Do not commit, push, merge, publish, or deploy under this authority.
- Do not bypass the release gate or create a stewardship release contract.
- Stop if the Builder reports missing or inconsistent artifacts.
- The package output must be written outside the repository.

Termination

This authority expires after one Builder invocation for the bound candidate.
