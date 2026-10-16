# HUB-RMP-003 Implementation Authority

## 1. Authority Identification

Implementation Authority

HUB-RMP-003

Founder Decision

FDR-HUB-001

Recovery Authority

execution/workspace/HUB-RMP-003-BUILDER-RECOVERY-AUTHORITY.md

Authority Stream

HUB

Status

FOUNDER APPROVED FOR CANDIDATE PACKAGING AND REVIEW

## 2. Repository

Lambsbook Cooperative Hub

## 3. Mission

Materialize a review package for the existing admin dashboard restoration
candidate. This is a packaging and review task; it does not authorize additional
application implementation.

## 4. Repository Truth

Consume:

execution/repository-truth/HUB-RMP-003-REPOSITORY-TRUTH.md

The record identifies the baseline, candidate commit, exact 11 changed paths,
and reported qualification evidence.

## 5. Implementation Context

Consume:

governance/implementation-context/HUB-RMP-003-IMPLEMENTATION-CONTEXT-MANIFEST.md

The package is bound to candidate 68e6a3031c473404dc56299ec5d7386203ce871f
with baseline 90e044eb811b6370b1144833fd2b88cafd89aa02.

## 6. Repository Mutation Boundary

No application-source or database mutation is authorized.

The candidate's 11 paths are included as review context only. This authority
permits one package-generation operation into /tmp and no repository output
from the Builder.

## 7. Acceptance Criteria

- The Builder accepts the CIB, authority, context manifest, and synchronization
  artifacts.
- The generated package identifies the bound candidate and review context.
- The candidate source and database records remain unchanged.
- Any Builder failure stops this work cycle.

## 8. Qualification Evidence

Record the Builder output, package path, digest, and exit status. Existing
build, runtime, API, browser, and template-fingerprint results are reported
from the supplied Replit report and are not represented as independently
rerun here.

## 9. Invocation

The installed Builder v1.0 command is permitted once under the one-time,
Founder-approved recovery authority. This exception suspends BIS-001 only for
that invocation and does not authorize release or deployment.
