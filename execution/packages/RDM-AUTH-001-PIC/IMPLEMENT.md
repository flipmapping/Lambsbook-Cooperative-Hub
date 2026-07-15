# RDM-AUTH-001 IMPLEMENTATION REQUEST

STATUS

EXECUTE IMMEDIATELY

EXECUTION MODE

Rapid Delivery Mode (DDOM-001)

INPUT PACKAGE

execution/rapid-delivery/RDM-AUTH-001-IMPLEMENTATION-PACKAGE.json

REPOSITORY BASELINE

Use the baseline recorded in the implementation package.

Synchronize with Repository Truth before mutation.

If Repository Truth has diverged, STOP and report the divergence.

AUTHORIZED MUTATION SURFACES

- client/src/lib/auth/PostAuthenticationContinuation.ts
- client/src/lib/auth/NavigationConsumptionAuthority.ts
- client/src/lib/auth/RuntimeNavigationPolicy.ts
- client/src/pages/HubAuth.tsx
- client/src/pages/HubAuthCallback.tsx

OBJECTIVE

Implement runtime identity resolution before RuntimeState publication so that:

- Founder is routed to the Founder Administration surface.
- Platform Admin is routed to the Platform Administration surface.
- SBU Admin is routed to the SBU Administration surface.
- Member is routed to the Member Dashboard.
- Invitation and Anonymous journeys remain unchanged.

EXECUTION RULES

- Mutate the minimum number of repository files required.
- Do not change authentication providers.
- Do not change authorization.
- Do not change JWT/session handling.
- Do not change database schema.
- Do not change RLS.
- Do not broaden the mutation scope.

VALIDATION

Execute where supported by the repository environment:

1. npm run build
2. TypeScript validation
3. Runtime startup
4. Founder sign-in
5. Admin sign-in
6. Member sign-in
7. Invitation flow verification
8. Regression verification

RETURN ONLY

1. Repository mutation summary
2. Files changed
3. Unified diff summary
4. Commands executed
5. Exit codes
6. Build evidence
7. Runtime evidence
8. Authentication evidence
9. Regression assessment
10. Remaining implementation gap (if any)

EVIDENCE CLASSIFICATION

- VERIFIED
- NOT VERIFIED
- BLOCKED

STOP CONDITION

Stop immediately after returning implementation evidence.
Do not generate additional governance artifacts, implementation authorities, JSON planning artifacts, or execution contracts.
