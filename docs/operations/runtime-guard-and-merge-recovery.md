# Runtime Guard and Merge Recovery Operational Record

## Incident Summary

Runtime outage occurred due to:

- unresolved merge conflicts
- stale runtime guard assumptions
- probe endpoint drift

---

# Exact Failure Surfaces

## Merge Conflict Failures

Affected files:

- server/routes/member.ts
- client/src/pages/MemberDashboard.tsx

Failure mode:

- parser failure
- backend startup failure

---

# Runtime Guard Drift

Previous guard assumptions:

- localhost:3000
- /api/__probe

Actual runtime:

- localhost:5000
- /api/__probe removed

Effect:

runtime guard repeatedly killed healthy runtime.

---

# Recovery Actions

Recovery performed by:

- resolving conflict markers
- correcting runtime port assumptions
- replacing endpoint-specific probe checks
with generic HTTP reachability verification

---

# Permanent Prevention Rules

## 1. Conflict-Zero Runtime Rule

No runtime startup permitted with unresolved merge markers.

Mandatory scan patterns:

<<<<<<<
=======
>>>>>>>

---

## 2. Runtime Guard Independence Rule

Runtime readiness verification must not depend on removable debug endpoints.

Use:

- generic HTTP checks
- process readiness
- transport readiness

---

## 3. Operational Coupling Audit Rule

Route or infrastructure changes require synchronized inspection of:

- runtime guards
- deployment probes
- startup scripts
- CI health checks

---

## 4. Mandatory Post-Merge Runtime Verification

After merge/reconciliation:

- merge-marker scan
- runtime verification
- route continuity verification

required before stabilization acceptance.

---

# Strategic Operational Lesson

Infrastructure assumptions must remain synchronized with live runtime behavior.

Operational drift can invalidate healthy runtime continuity even when application logic is correct.
