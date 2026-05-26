# TRUTH SYNCHRONIZATION PROTOCOL — LAMBSBOOK

## PURPOSE
This document defines how approved truth is synchronized across documentation, memory, code history, and live system authorities.

---

## CORE PRINCIPLE
No AI tool, working session, or code mutation may become project truth by itself.

Project truth becomes authoritative only after:
1. verification
2. review and approval
3. synchronization to the correct systems of record

---

## SYSTEMS OF RECORD

### 1. docs/ai
Purpose:
- canonical human-readable project governance
- architecture rules
- runtime contracts
- execution protocols
- review rules

Authority:
- primary readable specification layer

---

### 2. Open Brain
Purpose:
- reusable verified memory
- cross-session retrieval
- stable project context
- approved definitions, rules, tables, and reusable patterns

Authority:
- synchronized memory layer for verified truth only

---

### 3. GitHub
Purpose:
- versioned checkpoint history
- accepted code and document states
- recovery and audit trail

Authority:
- source-of-record for accepted repository state

---

### 4. Supabase
Purpose:
- live backend and data truth
- canonical schema, policies, RPCs, and persisted runtime data

Authority:
- source-of-record for live backend and database truth

---

### 5. Replit workspace
Purpose:
- working mutation and verification environment

Authority:
- temporary execution surface only
- NOT a final truth authority by itself

---

## TRUTH CLASSES

### A. Architecture truth
Examples:
- authority boundaries
- canonical request identity rules
- Gateway vs Hub separation
- invitation and membership doctrine

Primary home:
- docs/ai
- Open Brain

Secondary checkpoint:
- GitHub

---

### B. Runtime contract truth
Examples:
- endpoint contracts
- request/response shapes
- auth expectations
- state transitions
- caller restrictions

Primary home:
- docs/ai

Secondary homes:
- Open Brain
- GitHub

Live validation source when applicable:
- backend implementation
- Supabase RPC or policy truth

---

### C. Backend/data truth
Examples:
- schema facts
- RPC signatures
- policy behavior
- table ownership
- canonical stored data rules

Primary home:
- Supabase

Secondary homes:
- docs/ai
- Open Brain
- GitHub for SQL or migration artifacts

---

### D. Code truth
Examples:
- accepted implementation state
- approved UI behavior in code
- verified route wiring

Primary home:
- GitHub

Secondary home:
- Replit working tree during active execution

---

### E. Memory truth
Examples:
- stable definitions of terms
- authority tables
- function tables
- approved process rules
- reusable implementation patterns
- approved revisions and clarifications

Primary home:
- Open Brain

Secondary home:
- docs/ai when the truth is operationally important

---

## SYNCHRONIZATION ORDER

For any approved meaningful change, apply this order:

1. inspect and verify live result
2. review and approve the change
3. update docs/ai if canonical wording or rules changed
4. capture approved reusable truth into Open Brain
5. commit accepted repository state to GitHub
6. sync schema-related truth when database truth changed

This order is mandatory unless a specific task explicitly requires a narrower subset.

---

## CAPTURE CRITERIA FOR OPEN BRAIN

Capture to Open Brain only if the item is:
- verified
- approved
- reusable across future sessions
- stable enough to guide future implementation or review

Capture categories include:
- context
- definitions of terms
- authority tables
- function tables
- canonical rules
- system specifications
- approved revisions
- verified reusable implementation patterns

---

## DO NOT CAPTURE TO OPEN BRAIN

Never capture:
- temporary debugging output
- speculative ideas
- unapproved redesigns
- contradictory drafts
- raw noisy shell logs
- partial mutations
- unverified assumptions
- stale implementation chatter

---

## REVISION HANDLING

If an approved truth changes later:
1. update the relevant docs/ai file
2. capture the revised truth to Open Brain
3. ensure old wording is no longer treated as current authority
4. commit the updated document/code state to GitHub
5. if backend truth changed, sync the relevant schema truth

Revisions must replace outdated authority, not accumulate as parallel truths.

---

## REMINDER RULE

Before any substantial architecture, UI/UX, system design, or coding task:
1. search Open Brain first
2. inspect local canonical docs
3. inspect live truth when needed
4. execute only after context is confirmed
5. capture approved reusable truth after completion

---

## DRIFT PREVENTION RULE

If any tool output conflicts with:
- docs/ai
- verified Open Brain truth
- accepted GitHub state
- live Supabase truth

then STOP and resolve the conflict before proceeding.

No tool may silently reconcile conflicting truths by guessing.

---

## CANONICAL OPERATING LAW

ChatGPT defines and reviews truth.
Claude executes only bounded approved work.
Open Brain stores verified reusable truth.
GitHub preserves accepted repository history.
Supabase remains canonical for live backend and data truth.
Replit is the controlled working environment.

