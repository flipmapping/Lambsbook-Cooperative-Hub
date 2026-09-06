# OS-CYCLE-004 — CLAUDE INSTRUCTION BRIEF

Implementation Authority

OS-CYCLE-004

Repository

.

Production Surface

Organization Studio — Community Creation / Navigation Corridor

Implementation Context Manifest

execution/workspace/OS-EXEC-004/ICM-OS-CYCLE-004.md

## 1. Implementation Authority

OS-CYCLE-004

Derived from the Founder-approved OS-EXEC-HANDOFF-001 execution authority.

## 2. Production Surface

Organization Studio — Community Creation / Navigation Corridor

## 3. Cycle Objective

Materialize:

CommunityIntent
→ POST /api/communities
→ canonical Community ID
→ deterministic navigation
→ GET /api/communities/:id
→ CommunityPage

## 4. Exact Authorized Mutation Boundary

ONLY:

- client/src/pages/CommunityIntent.tsx
- client/src/pages/CommunityPage.tsx

Do not modify App.tsx unless a later authority explicitly expands
this boundary.

## 5. Existing Contracts

Consume:

- POST /api/communities
- GET /api/communities/:id

The server remains authoritative.

## 6. Data Ownership

Organization Studio owns presentation, creation intent, navigation,
and Community presentation.

Main App owns canonical Community identity and all membership,
invitation, participation, relationship, and member-state authority.

Do not duplicate persistence authority.

## 7. Main App Dependency Boundary

Consume Main App contracts.

Do not modify:

- Main App backend
- canonical membership
- invitations
- relationships
- participation
- member-state transitions

## 8. Security / Authorization Boundary

Do not infer authorization from frontend state.

Do not manufacture Community identity.

Do not allow frontend behavior to become a substitute for Main App
authorization.

## 9. Error / Edge Cases

Handle:

- failed creation request
- non-success response
- malformed or missing returned Community ID
- navigation failure
- Community retrieval failure
- missing Community data
- unconfigured communication destination

Never substitute a fabricated Community ID.

Never hard-code a Matrix room.

## 10. Regression Constraints

Preserve existing CommunityIntent fields and behavior except where
required for the authorized corridor.

Preserve existing CommunityPage presentation and communication behavior.

No unrelated UI redesign.

## 11. Build Validation

Run applicable repository type/build validation after implementation.

Do not weaken release guards.

## 12. Runtime Validation

Prove the integrated corridor:

1. enter Community creation;
2. submit valid creation;
3. receive canonical Community;
4. consume returned canonical ID;
5. navigate deterministically;
6. retrieve canonical Community;
7. render CommunityPage;
8. confirm existing communication presentation remains intact.

Static inspection is not runtime proof.

## 13. Release Boundary

Implementation does not authorize release.

Release remains:

implementation
→ validation
→ canonical repository release guard
→ DEPLOYABLE
→ Replit Publish

Repository Stewardship remains the final release/recovery gate.

## 14. Completion Evidence

Required:

- authority identity
- exact changed files
- creation API evidence
- returned Community ID
- navigation evidence
- canonical GET evidence
- CommunityPage evidence
- error-path evidence
- build evidence
- runtime evidence
- release-boundary evidence

## 15. First-Principles Matrix

| # | Workstream | Required Outcome | Invariant |
|---|---|---|---|
| 01 | Authority | One OS-CYCLE-004 authority | No Main App substitution |
| 02 | Baseline | Preserve starting revision | No reset/rebase/discard |
| 03 | Protected WIP | Preserve unrelated work | No overwrite/absorption |
| 04 | Corridor | Establish exact OS corridor | Only authorized surfaces |
| 05 | Cycle Objective | Complete creation-to-page flow | No scope expansion |
| 06 | Target Surfaces | Mutate only two OS files | No convenience mutation |
| 07 | Existing Contracts | Consume canonical APIs | No duplicate contracts |
| 08 | Data Ownership | Keep identity in Main App | No second authority |
| 09 | Dependencies | Consume Main App contracts | No Main App mutation |
| 10 | Backend/API | Use existing POST/GET | No new backend authority |
| 11 | Frontend | Complete user corridor | No unrelated redesign |
| 12 | Schema/Migration | No schema changes | No speculative persistence |
| 13 | Error/Edge Cases | Handle failure states | No synthetic identity |
| 14 | Security | Preserve server authority | No frontend authorization |
| 15 | Regression | Preserve existing behavior | No unrelated regression |
| 16 | Build | Pass applicable build checks | No guard weakening |
| 17 | Runtime | Prove integrated flow | Static checks insufficient |
| 18 | Release Boundary | Preserve release control | No Builder/release authority |
| 19 | Founder Runtime Discovery | Founder verifies real flow | No fabricated proof |
| 20 | Completion Evidence | Produce deterministic evidence | Evidence matches implementation |

## Execution Constraint

This CIB authorizes no Builder invocation during derivation.

Builder v1.2 may consume this CIB only after Founder validation.

No Main App mutation is authorized.
No activation.json mutation is authorized.
No EOS authority mutation is authorized.
