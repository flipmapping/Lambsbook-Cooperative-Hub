# Claude Instruction Brief

Status

CERTIFIED

Authority Stream

HUB

Implementation Authority

HUB-RMP-002

Execution Derivation

governance/execution-derivation/HUB-RMP-002-EXECUTION-DERIVATION.md

Production Surface

client/src/lib/auth/PostAuthenticationContinuation.ts

Implementation Context Manifest

governance/implementation-context/HUB-RMP-002-IMPLEMENTATION-CONTEXT-MANIFEST.md

Repository

Lambsbook Cooperative Hub

Objective

Materialize Stage 1 of the Canonical Authentication Continuation Authority by replacing the Stage 1 normalization stub with its deterministic implementation.

Repository Truth

The bounded mutation corridor is limited to:

client/src/lib/auth/PostAuthenticationContinuation.ts

Bounded Mutation

Implement:

_normalizeAuthentication()

Implementation Requirements

- Accept ContinuationContext.
- Verify accessToken is present.
- Preserve authenticationMode.
- Normalize refreshToken.
- Normalize inviteToken by trimming whitespace and converting empty strings to undefined.
- Return _NormalizedAuthentication.
- Perform no navigation.
- Perform no API calls.
- Perform no repository mutation outside the target function.
- Preserve all downstream continuation stages unchanged.

Execution Constraints

- One bounded mutation.
- Atomic repository mutation.
- Abort on repository mismatch.
- Preserve RuntimeState contract.
- Preserve NavigationConsumptionAuthority.
- Preserve RuntimeNavigationPolicy.

Builder

execution/builders/build_claude_package.py
