# APP-REC-INVITE-002 — CURRENT WORK-CYCLE BUILDER CIB

Implementation Authority

FAB-APP-REC-INVITE-002Q

Repository

.

Production Surface

Main App Member Dashboard — Invitation + Relationship Surface

Implementation Context Manifest

execution/builder/delivery/generated-cib/CIB-APP-REC-INVITE-002-CURRENT-WORK-CYCLE.md


This CIB is derived from the already-authorized current Builder Work Package.

## Founder-Authorized Current Fixes

### FIX-07 — Member Dashboard language selection

Provide an explicit Member Dashboard language selection menu with English, Vietnamese, and Chinese options. The selected language governs applicable Member Experience content and invitation sharing.

Invariant: English, Vietnamese, and Chinese are explicit supported language options without creating a second language authority.

### FIX-08 — Canonical Share Invitation message

When Share Invitation is selected, generate the canonical platform invitation message in the selected dashboard language, including the invitation link. Allow the member to personalize the generated message before sending.

Canonical English message:

I'd like to invite you to join me on Lambsbook Cooperative as a member.

I'm inviting you because I trust you and think you may be interested in what we're building together.

Join through my invitation:

[Invitation Link]

Invariant: The generated message is the canonical starting message; member personalization occurs before sending and must not change invitation identity or link semantics.


It does not expand or reinterpret Founder authority.

## Authorized Mutation Boundary

- `server/services/invitation-delivery.ts`
- `server/routes/member.ts`
- `client/src/pages/MemberHub.tsx`

## Required Deliverables

- Invitation Delivery Adapter
- InvitationSharePayload
- Route Integration
- Frontend Migration
- Build Verification
- Runtime Verification
- Invitation Delete Bug Fix — use the authoritative gateway_invitations surface; preserve authenticated inviter ownership and pending-status constraints; do not infer undocumented schema; runtime-test successful deletion and verify the invitation is no longer retrievable.

## First-Principles Work Matrix

The complete current-cycle matrix is mandatory implementation scope.

```json
[
  {
    "id": "01",
    "workstream": "Cycle authority",
    "required_outcome": "Establish one authoritative cycle identity",
    "required_mutation": "Consume one certified authority object",
    "invariant": "No inferred authority; no manual scope expansion",
    "acceptance_evidence": "Authority passes deterministic validation"
  },
  {
    "id": "02",
    "workstream": "Baseline",
    "required_outcome": "Establish exact starting revision",
    "required_mutation": "Record certified baseline SHA",
    "invariant": "No reset/rebase/discard of protected WIP",
    "acceptance_evidence": "SHA + worktree proof"
  },
  {
    "id": "03",
    "workstream": "Protected WIP",
    "required_outcome": "Preserve pre-existing work",
    "required_mutation": "Deliberately classify each pre-existing delta",
    "invariant": "Never overwrite or silently absorb",
    "acceptance_evidence": "Before/after lineage"
  },
  {
    "id": "04",
    "workstream": "Member Dashboard",
    "required_outcome": "Complete the specifically authorized Dashboard work",
    "required_mutation": "Implement only documented requirements",
    "invariant": "No unrelated Dashboard redesign",
    "acceptance_evidence": "Targeted acceptance evidence"
  },
  {
    "id": "05",
    "workstream": "Canonical membership",
    "required_outcome": "Preserve platform-member identity semantics",
    "required_mutation": "Modify only where required",
    "invariant": "Community membership must not become canonical membership",
    "acceptance_evidence": "Membership tests"
  },
  {
    "id": "06",
    "workstream": "Community capability",
    "required_outcome": "Make Community a first-class capability",
    "required_mutation": "Implement required Community creation/management/join flows",
    "invariant": "Server remains authoritative",
    "acceptance_evidence": "Functional acceptance"
  },
  {
    "id": "07",
    "workstream": "Community ownership",
    "required_outcome": "Tie Community ownership to canonical member identity",
    "required_mutation": "Implement/repair ownership resolution",
    "invariant": "Non-members cannot acquire organizer authority through inference",
    "acceptance_evidence": "Authorization tests"
  },
  {
    "id": "08",
    "workstream": "Invitation domain separation",
    "required_outcome": "Maintain two distinct invitation domains",
    "required_mutation": "Preserve/implement separate routes/services/UI",
    "invariant": "Member invitation ≠ Community invitation",
    "acceptance_evidence": "Semantic/API/UI verification"
  },
  {
    "id": "09",
    "workstream": "Community invitation",
    "required_outcome": "Permit invitation to a specific Community",
    "required_mutation": "Implement Community-specific invitation flow",
    "invariant": "Acceptance does not silently redefine canonical membership",
    "acceptance_evidence": "Member + non-member acceptance tests"
  },
  {
    "id": "10",
    "workstream": "Workspace",
    "required_outcome": "Provide Community-oriented action surface",
    "required_mutation": "Implement required navigation/actions",
    "invariant": "Existing Workspace semantics preserved",
    "acceptance_evidence": "UI verification"
  },
  {
    "id": "11",
    "workstream": "Discovery",
    "required_outcome": "Enable Community discovery",
    "required_mutation": "Implement Explore Communities",
    "invariant": "Discovery ≠ membership",
    "acceptance_evidence": "Query/UI evidence"
  },
  {
    "id": "12",
    "workstream": "Joined Communities",
    "required_outcome": "Show actual participation",
    "required_mutation": "Implement membership view",
    "invariant": "Participation remains Community-scoped",
    "acceptance_evidence": "Data/UI evidence"
  },
  {
    "id": "13",
    "workstream": "Community link",
    "required_outcome": "Enable Community-specific sharing",
    "required_mutation": "Implement invitation-link mechanism",
    "invariant": "Link resolves to Community participation",
    "acceptance_evidence": "Link acceptance proof"
  },
  {
    "id": "14",
    "workstream": "Community content model",
    "required_outcome": "Support required Community information",
    "required_mutation": "Implement description/category/audience/etc. where contract requires",
    "invariant": "No speculative schema expansion",
    "acceptance_evidence": "Persistence/API/UI evidence"
  },
  {
    "id": "15",
    "workstream": "Community rules",
    "required_outcome": "Provide reusable starting rules",
    "required_mutation": "Implement defaults + editable rules",
    "invariant": "Organizer can modify; model remains extensible",
    "acceptance_evidence": "Create/edit/persist proof"
  },
  {
    "id": "16",
    "workstream": "Language selection",
    "required_outcome": "Dashboard selects active language",
    "required_mutation": "Implement EN/VI/ZH selector",
    "invariant": "Architecture remains extensible",
    "acceptance_evidence": "UI/state evidence"
  },
  {
    "id": "17",
    "workstream": "Language propagation",
    "required_outcome": "Carry selected language into Community creation",
    "required_mutation": "Implement authoritative propagation",
    "invariant": "No contradictory second language authority",
    "acceptance_evidence": "Creation-flow proof"
  },
  {
    "id": "18",
    "workstream": "Community default language",
    "required_outcome": "Persist creation language",
    "required_mutation": "Store/synchronize default language",
    "invariant": "EN/VI/ZH initial set only; model extensible",
    "acceptance_evidence": "Persistence proof"
  },
  {
    "id": "19",
    "workstream": "Multilingual UI",
    "required_outcome": "Support required languages",
    "required_mutation": "Localize required surfaces",
    "invariant": "Avoid English-only architectural assumptions",
    "acceptance_evidence": "EN/VI/ZH acceptance"
  },
  {
    "id": "20",
    "workstream": "Schema / migration",
    "required_outcome": "Persist the approved product model",
    "required_mutation": "Modify schema only where required",
    "invariant": "Protected migration WIP requires explicit classification",
    "acceptance_evidence": "Migration + schema proof"
  },
  {
    "id": "21",
    "workstream": "Server/API",
    "required_outcome": "Make backend behavior authoritative",
    "required_mutation": "Implement required routes/services",
    "invariant": "Authorization cannot depend on frontend",
    "acceptance_evidence": "API tests"
  },
  {
    "id": "22",
    "workstream": "Frontend",
    "required_outcome": "Materialize complete user corridor",
    "required_mutation": "Dashboard → Workspace → Community → invitation/language",
    "invariant": "No unrelated UI mutation",
    "acceptance_evidence": "Build + targeted flow"
  },
  {
    "id": "23",
    "workstream": "Regression tests",
    "required_outcome": "Protect existing behavior",
    "required_mutation": "Add/update targeted tests",
    "invariant": "Tests must encode domain separation",
    "acceptance_evidence": "Test evidence"
  },
  {
    "id": "24",
    "workstream": "Runtime governance",
    "required_outcome": "Preserve release control plane",
    "required_mutation": "Modify guards only if contractually necessary",
    "invariant": "Implementation authority ≠ deployment authority",
    "acceptance_evidence": "Guard evidence"
  },
  {
    "id": "25",
    "workstream": "Builder package",
    "required_outcome": "Materialize one complete implementation package",
    "required_mutation": "Builder v1.2 produces PIC",
    "invariant": "No commit/push/deploy by Builder",
    "acceptance_evidence": "Package manifest + digest"
  },
  {
    "id": "26",
    "workstream": "Implementation verification",
    "required_outcome": "Prove matrix completion",
    "required_mutation": "Verify every required row",
    "invariant": "No 'looks complete' classification",
    "acceptance_evidence": "Matrix PASS/FAIL"
  },
  {
    "id": "27",
    "workstream": "Release preparation",
    "required_outcome": "Establish exact release candidate",
    "required_mutation": "Validate approved release surface",
    "invariant": "No unapproved WIP admission",
    "acceptance_evidence": "Release-candidate proof"
  },
  {
    "id": "28",
    "workstream": "Commit synchronization",
    "required_outcome": "Establish immutable release identity",
    "required_mutation": "Commit + synchronize exact SHA",
    "invariant": "Local/remote SHA must agree",
    "acceptance_evidence": "SHA equality"
  },
  {
    "id": "29",
    "workstream": "Build",
    "required_outcome": "Materialize certified artifact",
    "required_mutation": "Builder/build process",
    "invariant": "Artifact must correspond to release SHA",
    "acceptance_evidence": "Build evidence"
  },
  {
    "id": "30",
    "workstream": "Deployment",
    "required_outcome": "Publish the certified candidate",
    "required_mutation": "Replit deployment",
    "invariant": "Deployment target must match contract",
    "acceptance_evidence": "Deployment provenance"
  },
  {
    "id": "31",
    "workstream": "Founder runtime verification",
    "required_outcome": "Prove production actually serves intended revision",
    "required_mutation": "Read production health/runtime identity",
    "invariant": "No inference from deployment UI alone",
    "acceptance_evidence": "HTTP/runtime revision evidence"
  },
  {
    "id": "32",
    "workstream": "Final provenance",
    "required_outcome": "Establish deployment-to-runtime chain",
    "required_mutation": "Record verified deployment/runtime identity",
    "invariant": "runtime_revision must equal intended release revision",
    "acceptance_evidence": "Provenance PASS"
  },
  {
    "id": "33",
    "workstream": "Final release decision",
    "required_outcome": "Close the corridor deterministically",
    "required_mutation": "Gate evaluates complete evidence",
    "invariant": "No release if any provenance element is pending",
    "acceptance_evidence": "Final gate PASS"
  }
]
```

## Founder-Authorized Known Fix Register

These fixes are mandatory scope in addition to the first-principles matrix.

```json
{
  "authority": "FOUNDER",
  "status": "REQUIRED_FOR_IMPLEMENTATION",
  "instruction": "These fixes are explicit founder-authorized scope and must be implemented and verified together with the first-principles work matrix. Historical artifacts are supporting evidence and do not remove founder-authorized requirements.",
  "items": [
    {
      "id": "FIX-01",
      "title": "Invitation deletion",
      "required_outcome": "Delete only the authenticated inviter's eligible pending gateway invitation.",
      "required_behavior": "Use the authoritative gateway_invitations surface; preserve authenticated inviter ownership and pending-status constraints; verify successful deletion and non-retrievability.",
      "invariant": "Do not infer undocumented invitation schema or broaden deletion authority."
    },
    {
      "id": "FIX-02",
      "title": "Earning naming correction",
      "required_outcome": "Use the founder-authorized Credit terminology instead of Earning where the affected product concept is presented.",
      "required_behavior": "Update the affected product-facing naming consistently without changing the underlying economic semantics unless separately authorized.",
      "invariant": "Do not invent a second economic model."
    },
    {
      "id": "FIX-03",
      "title": "Social-media QR-code upload",
      "required_outcome": "Allow the member's approved social/contact QR code to be uploaded and persisted for the intended profile/contact surface.",
      "required_behavior": "Use the existing authorized asset/storage and profile persistence mechanisms where applicable.",
      "invariant": "Do not expose private contact information or create an undocumented storage authority."
    },
    {
      "id": "FIX-04",
      "title": "Invitee email and invitation details",
      "required_outcome": "Preserve and present the invitee email and other founder-authorized invitation details in the Sent Invitations and relationship experience.",
      "required_behavior": "Carry the approved invitee email, note, and related invitation metadata through persistence, API, and UI where required by the product contract.",
      "invariant": "Invitation details must remain associated with the correct invitation/relationship and must not be fabricated."
    },
    {
      "id": "FIX-05",
      "title": "Invitation notes",
      "required_outcome": "Support the founder-authorized invitation note through the invitation lifecycle and relevant relationship/sent-invitation surfaces.",
      "required_behavior": "Persist, retrieve, and display the note where the contract requires.",
      "invariant": "Do not silently repurpose or overwrite invitation notes."
    },
    {
      "id": "FIX-06",
      "title": "Invitation and relationship detail completeness",
      "required_outcome": "Ensure the Sent Invitations and Relationship surfaces expose the approved invitation context and relationship details needed by the member experience.",
      "required_behavior": "Reconcile the already-authorized invitation/relationship requirements into the single implementation package.",
      "invariant": "Maintain separation between invitation state, canonical membership identity, and trusted relationship state."
    }
  ]
}
```

The Implementation Agent must therefore preserve the Founder-authorized
requirements represented by this register, including the recorded invitation
deletion correction, credit terminology correction, social-media QR upload
requirement, invitee email/details, notes, and the authorized invitation and
relationship-surface details. No undocumented schema or behavior may be
invented to satisfy a requirement.

## Builder Instructions

1. Consume this CIB as the current-cycle contract.
2. Preserve all 33 first-principles matrix rows.
3. Preserve all 6 Founder-authorized fix records.
4. Do not omit isolated fixes merely because they are separate from the matrix.
5. Do not expand scope beyond the package contract.
6. Materialize the canonical PIC for the Implementation Agent.
7. Do not commit, push, deploy, or perform release synchronization.

## Expected Builder Output

- Certified PIC
- PACKAGE-MANIFEST.md
- IMPLEMENT.md
- Builder evidence/report
- Implementation-Agent package suitable for handoff

## Contract Boundary

The Builder materializes the implementation package.
The Implementation Agent performs the authorized repository implementation.
Release and deployment remain outside Builder authority.
