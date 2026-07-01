# CAD-WP2 — Delegation Contract Certification

## Status

Founder-approved implementation authority.

Design certification only.

No runtime authority delegated.

---

# Completion Authorities

The following components are the only certified authentication completion authorities:

- HubAuth.tsx
- HubAuthCallback.tsx

No additional completion authority may delegate to the continuation authority
without explicit architectural approval.

---

# Canonical Continuation Authority

The single continuation authority is:

postAuthenticationContinuation(context: ContinuationContext)

This authority is the sole producer of canonical RuntimeState.

---

# Delegation Inputs

## HubAuth.tsx

Delegates a ContinuationContext containing:

- accessToken
- refreshToken (optional)
- inviteToken (optional)
- authenticationMode:
  - signup
  - login

## HubAuthCallback.tsx

Delegates a ContinuationContext containing:

- accessToken
- refreshToken (optional)
- inviteToken (optional)
- authenticationMode:
  - callback
  - oauth
  - session_restore (when applicable)

---

# Delegation Output

Both completion authorities consume:

RuntimeState

No completion authority derives runtime state independently.

---

# Canonical Sequencing

Authentication Success
        ↓
Continuation Authority
        ↓
RuntimeState
        ↓
Navigation

Navigation SHALL NOT occur before continuation completes.

Navigation SHALL consume RuntimeState.

Navigation SHALL NOT determine continuation behaviour.

---

# Authentication Mode Matrix

| Mode | Delegates | RuntimeState Required |
|------|-----------|-----------------------|
| signup | Yes | Yes |
| login | Yes | Yes |
| callback | Yes | Yes |
| session_restore | Yes | Yes |
| oauth | Yes | Yes |

---

# Exported Contract Certification

The existing exported contracts are sufficient for delegation.

No exported interface requires modification before Work Package 2 implementation.

Specifically:

- AuthenticationMode
- ContinuationContext
- RuntimeState
- RuntimePublication
- postAuthenticationContinuation()

remain architecturally approved.

---

# Governance Certification

This document establishes the implementation authority for
Phase 5 Work Package 2 delegation.

It does not authorize runtime integration.

Runtime delegation shall occur only through subsequent
bounded implementation work packages.
