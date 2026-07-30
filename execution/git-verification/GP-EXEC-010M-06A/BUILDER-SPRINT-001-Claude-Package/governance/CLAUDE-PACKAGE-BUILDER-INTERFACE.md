# Claude Package Builder Interface

Status

ACTIVE

Purpose

Define the canonical invocation interface for the Claude Package Builder.

--------------------------------------------------

Invocation

The builder SHALL accept exactly one required argument.

Required

Claude Instruction Brief

Example

build_claude_package \
    governance/cib/generated/CIB-GE-RMP-002-PUBLIC-EXPERIENCE-LANDING-PAGE.md

--------------------------------------------------

Discovery

All remaining artifacts SHALL be derived from Repository Truth.

The caller SHALL NOT provide:

- Implementation Authority
- Founder Decision
- Execution Derivation
- Repository
- Authority Stream
- Synchronization Set

--------------------------------------------------

Outputs

The builder SHALL produce:

Package Directory

Package Manifest

ZIP Archive

SHA256 Digest

PASS / FAIL Report

--------------------------------------------------

Exit Codes

0

Package generated successfully.

1

Repository Truth insufficient.

2

Missing required artifact.

3

Authority inconsistency detected.

4

Synchronization verification failed.

5

Package verification failed.

--------------------------------------------------

Compatibility

The interface SHALL remain stable across all authority streams.

No interface changes SHALL be required when introducing future authority namespaces.
