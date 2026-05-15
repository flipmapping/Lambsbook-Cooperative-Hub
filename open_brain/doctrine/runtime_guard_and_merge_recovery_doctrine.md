# Runtime Guard + Merge Recovery Doctrine

## Verified Operational Failure Event

A runtime outage occurred due to:

1. unresolved merge conflict markers
2. stale runtime-guard assumptions
3. infrastructure coupling drift

---

# Exact Failure Chain

## Failure #1 — Unresolved Merge Conflicts

Files:

- server/routes/member.ts
- client/src/pages/MemberDashboard.tsx

Observed markers:

<<<<<<<
=======
>>>>>>>

Effect:

- esbuild parse failure
- tsx parse failure
- backend startup failure

---

# Failure #2 — Runtime Guard Drift

runtime-guard.sh expected:

localhost:3000/api/__probe

Actual runtime:

- server running on 5000
- /api/__probe previously removed

Effect:

- false-negative readiness detection
- runtime guard killed healthy backend

---

# Verified Recovery

Recovery succeeded by:

- resolving merge conflicts
- correcting runtime-guard port
- replacing endpoint-specific probe logic
with generic HTTP reachability verification

---

# Permanent Operational Doctrine

## Conflict-Zero Runtime Rule

Before runtime start:

- no unresolved merge markers allowed

Mandatory scan patterns:

<<<<<<<
=======
>>>>>>>

---

# Runtime Guard Independence Rule

Runtime guards must NOT depend on:

- temporary probe routes
- removable debug endpoints
- feature-owned endpoints

Preferred:

- generic HTTP reachability
- transport-level readiness
- process-level verification

---

# Operational Coupling Audit Rule

Whenever:

- routes change
- auth endpoints change
- infrastructure scripts change

must inspect:

- runtime guards
- deployment probes
- startup scripts
- CI checks
- watchdog scripts

for stale assumptions.

---

# Merge Recovery Discipline

After:

- merge
- reconciliation
- rebase
- AI-assisted conflict resolution

mandatory:

- merge-marker scan
- runtime verification
- route continuity verification

before operational acceptance.

---

# Strategic Doctrine

Operational infrastructure assumptions must remain synchronized with live runtime behavior.

Infrastructure drift can silently destroy healthy runtime continuity.

This doctrine is now canonical project operational memory.
