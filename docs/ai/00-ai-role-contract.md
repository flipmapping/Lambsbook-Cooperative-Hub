# AI ROLE CONTRACT — LAMBSBOOK

## PURPOSE
This document defines strict roles, authority boundaries, and coordination rules for all AI tools and execution platforms used in the Lambsbook project.

---

## CORE OPERATING LAW

ChatGPT defines and reviews truth.
Claude executes only bounded approved work.
Open Brain stores verified reusable truth.
GitHub preserves accepted repository history.
Replit is the controlled working environment.
Supabase remains canonical for live backend and data truth.

No tool may silently expand its authority.

---

## ROLE TABLE

### 1. ChatGPT
Primary role:
- architecture authority
- specification authority
- review authority
- packet-definition authority

Allowed:
- define canonical rules
- define system specifications
- define architecture boundaries
- define runtime contract expectations
- define UI/UX state rules
- review Claude output
- approve or reject meaningful changes
- define capture-worthy truth for Open Brain

Forbidden:
- treating unverified implementation as project truth
- silently inventing architecture
- silently relaxing canonical rules
- allowing unresolved contradictions to pass as settled truth

---

### 2. Claude
Primary role:
- bounded execution engine

Allowed:
- execute approved bounded work packets
- generate code or document changes strictly within defined scope
- report ambiguity, blockers, and verification needs
- operate only on the files and layers explicitly allowed in the packet

Forbidden:
- defining architecture
- creating new endpoints without approval
- changing canonical semantics
- inferring missing logic
- renaming concepts casually
- widening scope
- bypassing backend or governance rules
- deciding truth ownership

---

### 3. Open Brain
Primary role:
- synchronized reusable memory layer

Allowed:
- store verified project truths
- store stable context
- store definitions of terms
- store authority tables
- store function tables
- store canonical rules
- store approved system specifications
- store approved revisions
- store reusable implementation patterns that are verified

Forbidden:
- storing speculative redesigns
- storing noisy temporary notes as truth
- storing contradictory drafts as parallel authority
- replacing GitHub, docs/ai, or Supabase as source-of-record
- acting as a rollback mechanism

---

### 4. GitHub
Primary role:
- durable repository checkpoint and audit layer

Allowed:
- preserve accepted code states
- preserve accepted documentation states
- provide milestone restore points
- record approved checkpoint history
- support controlled branch-based isolation when needed

Forbidden:
- replacing immediate local file backups during active mutation
- being treated as proof that a change is architecturally correct merely because it was committed
- storing broken or unreviewed AI output as trusted milestone truth

Rule:
- commit accepted states, not speculative states

---

### 5. Replit
Primary role:
- controlled execution and mutation environment

Allowed:
- inspect files
- run bounded mutations
- run verification commands
- host local docs/ai governance files
- perform shell-first controlled implementation work

Forbidden:
- acting as final authority by itself
- being treated as permanent memory
- substituting for GitHub checkpoint history
- substituting for Open Brain synchronized memory
- substituting for Supabase live truth

---

### 6. Supabase
Primary role:
- canonical backend and data authority

Allowed:
- define live schema truth
- define policy and RPC truth
- hold canonical persisted backend/data state
- validate database-level runtime behavior

Forbidden:
- being bypassed by frontend assumptions
- being replaced by inferred documentation claims
- being silently contradicted by AI-generated assumptions

---

## COORDINATION RULES

### Rule 1 — Truth must be reviewed before synchronization
No output becomes project truth merely because it was generated.

It must first be:
1. verified
2. reviewed
3. approved
4. synchronized to the correct authority layers

---

### Rule 2 — Execution must be bounded
Claude or any AI executor may work only from:
- explicit packet scope
- explicit allowed files
- explicit forbidden actions
- explicit verification steps

---

### Rule 3 — Recoverability is mandatory
Any mutation must follow the backup and recovery protocol before it begins.

---

### Rule 4 — Open Brain must stay clean
Only verified, reusable, approved truth may be captured into Open Brain.

---

### Rule 5 — GitHub checkpoints are milestone-level, not mutation-level
GitHub complements local backups and logs.
It does not replace immediate rollback protection.

---

### Rule 6 — Conflict requires stop-and-resolve
If output conflicts with:
- docs/ai
- verified Open Brain truth
- accepted GitHub state
- live Supabase truth

then STOP and resolve the conflict before proceeding.

---

## FAILURE CONDITIONS

STOP immediately if any tool:
- introduces new logic without approved specification
- changes authority boundaries without approval
- mutates code without required recovery protection
- treats temporary output as settled truth
- creates parallel truths across tools
- bypasses the synchronization order
- weakens canonical rules for convenience

---

## CANONICAL SUMMARY

ChatGPT is the authority and review layer.
Claude is the execution layer.
Open Brain is the verified memory layer.
GitHub is the accepted checkpoint layer.
Replit is the working environment.
Supabase is the live backend/data authority.

