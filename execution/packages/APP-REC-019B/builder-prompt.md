# Foundation Architecture Brief (FAB)

## APP-REC-019B — Builder Activation for Targeted Semantic Repair

Execution Operating System
EOS v2.2

Builder
Builder v1.2 (Certified)

Execution Mode
Implementation Package Generation

Repository
Lambsbook-Cooperative-Hub

Repository Mutation
Single Surface Mutation

Implementation Surface

server/middleware/attachUserContext.ts

----------------------------------------------------------------

Mission

Generate a Production Implementation Contract (PIC).

This invocation SHALL NOT implement.

This invocation SHALL ONLY generate the PIC.

----------------------------------------------------------------

Certified Evidence

Compiler certification:

• TS2304
Cannot find name 'userId'

• TS2448
Block-scoped variable used before declaration

Materialized implementation confirms:

• userId assignment is absent.

• AUTH_CONTEXT logging executes before profile
  and hasProfile are initialized.

No additional semantic defects have been certified.

----------------------------------------------------------------

Authorized Mutation Scope

Exactly one repository file:

server/middleware/attachUserContext.ts

----------------------------------------------------------------

Authorized Builder Authority

Builder SHALL authorize ONLY:

1.

Restore

const userId = userData.user.id;

immediately after successful auth.getUser()
validation.

2.

Relocate the AUTH_CONTEXT logging block
to execute immediately after

const { data: profile, error: profileError }

and

const hasProfile = ...

3.

Preserve every other middleware behavior.

----------------------------------------------------------------

Forbidden Builder Authority

Builder SHALL NOT authorize:

• refactoring

• formatting cleanup

• optimization

• variable renaming

• import modification

• interface modification

• request model modification

• response model modification

• middleware signature modification

• authentication flow modification

• profile lookup modification

• identityTrace modification

• catch block modification

• authorization logic modification

• esModuleInterop changes

• changes outside

server/middleware/attachUserContext.ts

----------------------------------------------------------------

Required PIC Sections

1.
Implementation Authority

2.
Execution Derivation

3.
Repository Mutation

4.
Mutation Boundary

5.
Implementation Context Manifest

6.
Implementation Constraints

7.
Explicit Invariants

8.
Forbidden Mutations

9.
Acceptance Criteria

10.
Required Evidence

11.
Rollback Strategy

12.
Founder Certification Gate

----------------------------------------------------------------

Required Evidence

Implementation agent SHALL provide:

• unified diff

• tsc --noEmit output

• npm run build output

• GET /api/member/me runtime evidence

• implementation notes

----------------------------------------------------------------

Builder Output Contract

Output ONLY the Production
Implementation Contract.

Do NOT implement.

Do NOT emit source code.

Do NOT emit patches.

Do NOT extend scope.

Founder retains certification authority.
