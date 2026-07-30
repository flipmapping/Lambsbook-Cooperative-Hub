# Claude Package Builder Specification

Status

ACTIVE

Purpose

Materialize a canonical Claude Package from certified implementation artifacts.

--------------------------------------------------

Execution Preconditions

The builder SHALL execute only after:

- Repository Bootstrap has completed.
- Repository Truth Summary has been approved.
- Claude Instruction Brief has been materialized.

The builder SHALL NOT perform repository inspection.

--------------------------------------------------

Input

Exactly one required input.

Path to a materialized Claude Instruction Brief.

Example

build_claude_package \
governance/cib/generated/CIB-GE-WEB-RMP-010E33A-PUBLIC-EXPERIENCE-INTEGRATION.md

--------------------------------------------------

Repository Truth

Repository Truth is immutable builder input.

The builder SHALL consume Repository Truth.

The builder SHALL NOT discover Repository Truth.

--------------------------------------------------

Discovery

From the CIB and certified Repository Truth, derive:

- Implementation Authority
- Founder Decision
- Execution Derivation
- Repository
- Synchronization Set
- Required Governance Artifacts
- Package Manifest

The builder SHALL NOT infer naming conventions.

The builder SHALL NOT contain hard-coded authority prefixes.

--------------------------------------------------

Materialization

The builder SHALL produce:

- Claude Package directory
- Package Manifest
- ZIP archive
- SHA256 digest
- PASS / FAIL report

--------------------------------------------------

Determinism

Given identical:

- Repository Truth
- Claude Instruction Brief
- Synchronization artifacts

the builder SHALL produce byte-identical:

- package contents
- package manifest
- ZIP archive
- SHA256 digest

--------------------------------------------------

Failure Conditions

Abort immediately if:

- Repository Truth missing
- Repository Truth not approved
- CIB missing
- duplicate authority detected
- authority inconsistency detected
- synchronization artifact missing
- package verification fails

--------------------------------------------------

Compatibility

The builder SHALL remain namespace independent.

Support for future authority streams SHALL require no source-code modification.
