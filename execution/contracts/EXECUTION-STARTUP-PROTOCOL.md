EXEC-010F01-WPXX
Execution Startup Protocol (ESP)

Status

Founder Approved

Purpose

The Execution Startup Protocol (ESP) is the single entry point for every EMP and RMP execution chat.

It prevents long startup prompts, removes ambiguity, and guarantees that every execution begins from the same verified repository truth.

Repository Scope

Create one file only.

execution/contracts/
EXECUTION-STARTUP-PROTOCOL.md
Required Content
# Execution Startup Protocol (ESP)

Version

0.1.0

Status

Approved

---

## Startup Sequence

Every execution SHALL execute the following sequence.

Step 1

Read Open Brain.

Step 2

Read Execution Doctrines.

Step 3

Read:

execution/contracts/
EXECUTION-CAPABILITY-CONTRACT.md

Step 4

Produce the Execution Capability Handshake.

Step 5

Determine the single highest implementation blocker.

Step 6

Produce exactly one bounded executable deliverable.

No implementation may begin before Step 4 completes successfully.

---

## Handshake

Execution SHALL report:

Implementation Authority

Current Work Package

ECC Version

Framework Version

Supported Capabilities

Unsupported Capabilities

Current Highest Blocker

Decision

READY

or

STOP

---

## READY

Proceed only when all required capabilities exist.

---

## STOP

If any required capability is unavailable:

Stop immediately.

Identify the missing capability.

Request exactly one bounded EMP.

Do not invent framework behaviour.

---

## Output Standard

Execution responses SHALL contain:

1. Current Implementation Authority

2. Repository Truth

3. Highest Blocker

4. One Bounded Deliverable

5. Required Evidence

6. Acceptance Gate

7. Stop

No roadmap.

No future work packages.

No implementation beyond the approved scope.