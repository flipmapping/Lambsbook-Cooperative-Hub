# Execution Operational Profiles (EOP)

Status

Accepted

Execution Operating System

EOS Version

2.0

EOP Version

1.0

Implementation Authority

Founder Governance

---

# Purpose

Execution Operational Profiles (EOP) define the operational mode under which an Execution Chat shall operate.

Execution Operational Profiles determine:

• execution priorities

• artifact generation

• implementation strategy

• mutation strategy

• response behaviour

• optimization objectives

Every Execution Chat SHALL activate exactly one profile during Execution Startup.

Execution Operational Profiles do not modify Execution Capability.

Execution Capability is defined by the Execution Capability Contract (ECC).

Execution Startup behaviour is defined by the Execution Startup Protocol (ESP).

---

# Profile Activation

During ESP Startup,

Execution SHALL activate exactly one Execution Operational Profile.

Example

Execution Operational Profile

Growth Engine Delivery

Once activated,

the selected profile governs the entire execution session.

Execution SHALL NOT change profiles unless Founder authority explicitly authorizes the change.

---

# EOP-001

Profile Name

Growth Engine Delivery

Status

ACTIVE

Purpose

Deliver Founder-approved production software.

Execution Priority

1.
---

Gap Analysis Policy

Growth Engine Delivery SHALL prioritize production surfaces.

Execution SHALL evaluate the Functional Contract for the current production surface before generating repository mutations.

Execution SHALL avoid unnecessary repository mutations when the production surface already satisfies the Functional Contract.

Verified runtime defects SHALL remain visible until corrected through a Founder-approved Repository Mutation Package.

# EOS-003 — Production Surface Execution Model

Status

Accepted

Governance Authority

Founder

Execution Operating System

EOS Version

2.0

---

# Purpose

This record captures the operational refinement discovered during the first production execution cycle under the Execution Operating System (EOS).

The refinement changes how implementation work is selected and executed for Growth Engine delivery.

---

# Repository Truth

The first execution cycle under EOS established that:

• Repository Truth may demonstrate that a Founder-approved Functional Contract is already satisfied.

• Execution correctly determined that no repository mutation was required.

• Verification-first execution prevented unnecessary repository mutation.

This behaviour is adopted as the canonical execution model.

---

# Founder Decision

Execution planning SHALL be based on Production Surfaces rather than predetermined Repository Mutation Packages.

Repository Mutation Packages become implementation artifacts derived from objective repository analysis.

---

# Canonical Execution Flow

Execution SHALL follow the following sequence.

Mission

↓

Execution Operational Profile

↓

Repository Truth

↓

Production Surface Assessment

↓

Gap Analysis

↓

Implementation Authority

↓

Repository Mutation Package

↓

Founder Execution

↓

Objective Evidence

↓

Execution Interpretation

---

# Production Surface

A Production Surface represents a coherent, user-visible area of the product that delivers business value.

Examples include:

• Landing Surface

• Registration Surface

• Admissions Workspace

• Programs Surface

• Scholarships Surface

• Operations Surface

Execution SHALL optimize for completion of Production Surfaces.

---

# Gap Analysis

Gap Analysis SHALL compare:

Repository Truth

against

the Functional Contract

for the selected Production Surface.

Execution SHALL determine whether an objective implementation gap exists.

If no implementation gap exists:

Execution Outcome

PASS — No Mutation Required

No Repository Mutation Package SHALL be generated.

---

# Implementation Authority

Implementation Authority is no longer assumed.

Execution SHALL derive the next Repository Mutation Package only after:

• Repository Truth

• Production Surface Assessment

• Gap Analysis

have been completed.

Implementation Authority therefore becomes an implementation artifact rather than a planning artifact.

---

# Outstanding Runtime Defects

Execution SHALL distinguish between:

Implementation Completeness

and

Surface Health.

A Production Surface may be substantially complete while still containing verified runtime defects.

Verified runtime defects SHALL remain visible until corrected by a Founder-approved Repository Mutation Package.

They SHALL NOT be silently discarded.

---

# Surface Health

Each Production Surface SHALL maintain one of the following health states.

COMPLETE

SUBSTANTIALLY COMPLETE

MINOR DEFECTS

MAJOR DEFECTS

BLOCKED

Surface Health is independent of implementation completion.

---

# Release Surface Registry

Growth Engine Release 1 SHALL be tracked using a Release Surface Registry.

The registry records:

• Production Surface

• Functional Contract

• Surface Health

• Outstanding Runtime Defects

• Acceptance Status

Execution SHALL prioritize completion of Production Surfaces rather than counting Repository Mutation Packages.

---

# Execution Outcome

Execution SHALL distinguish between:

Execution Outcome

and

Acceptance Outcome.

Execution Outcome

PASS

PASS — No Mutation Required

BLOCKED

FAILED

Acceptance Outcome

PENDING

ACCEPTED

REJECTED

Execution SHALL NOT report product acceptance.

Acceptance remains Founder authority.

---

# Operational Impact

This refinement strengthens the Execution Operating System by:

• reducing unnecessary repository mutation;

• improving implementation prioritization;

• separating planning from implementation;

• making Production Surfaces the primary delivery unit;

• treating Repository Mutation Packages as bounded implementation artifacts.

---

# Founder Decision

EOS Version 2.0 remains unchanged.

This record refines operational behaviour only.

Future Growth Engine execution SHALL optimize for completing Production Surfaces through objective Repository Truth and Gap Analysis while preserving verification-first execution.

Release Priority Rule

When operating under the Growth Engine Delivery profile, Execution SHALL prioritize completion of blocked Production Surfaces over correction of verified minor defects on substantially complete surfaces.

Verified minor defects SHALL remain visible in the Release Surface Registry and SHALL be corrected when they become the highest objective production blocker or are explicitly prioritized by the Founder.

Artifact Exchange Packaging Standard

Standalone Repository Mutation Package exchange artifacts SHALL be distributed as ZIP archives generated using Python's standard zipfile library. External compression utilities (tar, zip, Nix-provided binaries, or platform-specific archivers) SHALL NOT be required. Every generated archive SHALL be verified immediately after creation by reopening it and enumerating its contents before being presented to the Founder.
---

# Artifact Exchange Packaging Standard v1.0

## Purpose

Provide a deterministic, platform-independent mechanism for exchanging Repository Mutation Packages.

## Standard

Repository Mutation Package exchange artifacts SHALL be distributed as ZIP archives generated using Python's standard library `zipfile` module.

Execution SHALL NOT require:

- tar
- gzip
- external zip utilities
- Nix-installed archive tools
- platform-specific compression utilities

## Verification

Immediately after archive generation Execution SHALL:

1. reopen the archive;
2. enumerate archive contents;
3. verify the expected repository structure;
4. report archive size;
5. report PASS / FAIL.

## Naming

Archives SHOULD use timestamped filenames.

Existing archives SHALL NOT be overwritten.

## Failure Policy

If archive verification fails,

Execution SHALL terminate with FAIL.

Execution SHALL NOT present an unverified archive for Founder download.

