# RDM-AUTH-001 IMPLEMENTATION ENGINE

STATUS

EXECUTE NOW

EXECUTION MODE

Rapid Delivery Mode (DDOM-001)

INPUTS

- execution/rapid-delivery/RDM-AUTH-001-IMPLEMENTATION-PACKAGE.json
- execution/rapid-delivery/RDM-AUTH-001-IMPLEMENT.md
- execution/rapid-delivery/RDM-AUTH-001-HANDOFF.json

REPOSITORY SYNCHRONIZATION

Synchronize with the repository baseline recorded in the implementation package.

If Repository Truth has diverged, STOP and report the divergence with objective repository evidence.

OBJECTIVE

Implement runtime identity resolution before RuntimeState publication so that:

- Founder → Founder Administration
- Platform Admin → Platform Administration
- SBU Admin → SBU Administration
- Member → Member Dashboard
- Pending Invitation → Existing invitation journey
- Anonymous → Existing anonymous journey

IMPLEMENTATION RULES

- Mutate only the authorized repository surfaces.
- Minimize the number of modified files.
- Preserve authentication providers.
- Preserve authorization.
- Preserve JWT/session handling.
- Preserve database schema.
- Preserve RLS.
- Preserve invitation semantics.

VALIDATION

Where supported by the repository:

1. npm run build
2. TypeScript validation
3. Runtime startup
4. Founder sign-in
5. Platform Admin sign-in
6. SBU Admin sign-in
7. Member sign-in
8. Invitation flow verification
9. Regression verification

RETURN ONLY

1. Repository mutation summary
2. Files modified
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
Do not generate additional governance artifacts, implementation authorities,
planning documents, JSON contracts, or execution packages.
