# ERROR HANDLING AND GUARDRAILS — LAMBSBOOK

## PURPOSE
This document defines how errors, ambiguity, exceptions, and guardrail violations must be handled during design, implementation, review, and automation.

The goal is fail-closed behavior: no silent drift, no convenience shortcuts, no false success.

---

## CORE RULE

When truth is unclear, STOP.
When contracts conflict, STOP.
When execution exceeds scope, STOP.
When backend/domain truth is not confirmed, do not simulate certainty.

---

## ERROR CLASSES

### Class 1 — Contract error
Definition:
- request/response shape mismatch
- route semantics unclear
- caller expectations inconsistent
- state interpretation ambiguous

Required action:
- stop implementation
- inspect contract source
- update canonical docs if truth changed

Forbidden response:
- silent inference
- “best guess” contract completion

---

### Class 2 — Authority error
Definition:
- Gateway attempts to own domain truth
- frontend invents backend truth
- execution layer alters architecture
- parallel truth owner appears

Required action:
- stop immediately
- restore canonical owner model
- escalate to architecture review if needed

Forbidden response:
- compensating locally for structural drift

---

### Class 3 — Identity/auth error
Definition:
- identity resolution ambiguity
- unauthorized access path
- auth requirement weakened by convenience
- email/member identity confusion

Required action:
- stop
- inspect identity path and auth assumptions
- restore canonical identity discipline

Forbidden response:
- route-local identity reconstruction
- convenience widening of identity shape

---

### Class 4 — State-flow error
Definition:
- user state inferred without canonical route confirmation
- UI shows member/final state prematurely
- materialization confused with acceptance
- 404 semantics flattened incorrectly

Required action:
- stop
- compare against state machine and runtime contracts
- correct interpretation before proceeding

Forbidden response:
- optimistic UI truth creation
- collapsing multiple states into one vague state

---

### Class 5 — Execution-scope error
Definition:
- packet touches files outside scope
- implementation widens beyond objective
- AI proposes adjacent refactors not requested
- unrelated cleanup is bundled into a bounded task

Required action:
- reject or trim back to scope
- reissue bounded packet if needed

Forbidden response:
- “while I was here” mutation expansion

---

### Class 6 — Verification error
Definition:
- no output
- ambiguous shell output
- partial output
- build/check not run
- diff not inspected

Required action:
- inspect before rerun
- confirm actual file state
- re-establish known-good state before continuing

Forbidden response:
- blind rerun
- assuming success from silence

---

## GUARDRAIL RULES

### Guardrail 1 — No silent inference
If a required truth is missing, it must be made explicit or inspected.

---

### Guardrail 2 — No second truth system
No feature, UI flow, or execution packet may create a parallel authority for:
- identity
- membership
- invitation
- contract meaning
- backend truth
- architecture rules

---

### Guardrail 3 — No optimistic domain completion
Token presence, partial route success, or UI state does not equal domain completion.

Only governed backend/domain success counts as completion.

---

### Guardrail 4 — No mixed-scope changes
Foundational docs, runtime contracts, state flows, and code changes must not be bundled casually.

---

### Guardrail 5 — No unverified memory capture
Open Brain may store only:
- verified
- approved
- reusable truth

Never noisy, partial, or contradictory output.

---

### Guardrail 6 — No unsafe push
Do not push when local history includes:
- mixed unpublished commits
- backup artifacts
- unreviewed changes
- unrelated local mutations

---

## ERROR RESPONSE RULES

### If a route contract is unclear
1. stop
2. inspect current implementation truth
3. inspect canonical docs
4. update docs first if needed
5. only then continue

---

### If a shell command gives no output
1. do not rerun blindly
2. inspect repo/file state
3. inspect logs if relevant
4. determine whether mutation already occurred
5. only then retry or rollback

---

### If a file appears unexpectedly
1. inspect exact name and content
2. determine whether accidental shell artifact
3. remove only after confirmation
4. verify repo state again

---

### If local branch is ahead unexpectedly
1. inspect unpublished commits
2. inspect changed files per commit
3. decide keep / isolate / reset
4. do not push until scope is understood

---

### If working tree is dirty before history rewrite/reset
1. create safety branch if needed
2. stash tracked + untracked working tree
3. verify protections exist
4. only then reset or cherry-pick

---

## MANDATORY STOP CONDITIONS

STOP if any proposed action would:
- weaken canonical identity path
- create parallel membership truth
- redefine invitation semantics without approval
- push mixed local history without inspection
- capture unverified truth to Open Brain
- commit or mutate beyond bounded scope
- proceed after ambiguous output without inspection

---

## CANONICAL SUMMARY

The system must fail closed.

When in doubt:
- inspect
- verify
- bound scope
- preserve recoverability
- update truth layers in order

Never trade safety for speed in authority, contract, or domain-truth layers.

