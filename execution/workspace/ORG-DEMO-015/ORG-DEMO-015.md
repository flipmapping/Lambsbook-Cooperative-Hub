# ORG-DEMO-015

Builder Session Persistence

Authority
---------

COM-ARCH-001
ORG-DEMO-014
EOS-CRSG-001

Execution Mode
--------------

Founder Experience Vertical Slice

Mission
-------

Persist the Builder Session locally so the founder can resume the
generated Builder Workspace without rerunning the demonstration.

Repository
----------

client/src/organization/

    BuilderSessionStore.ts
    BuilderSessionSerializer.ts
    BuilderWorkspace.tsx
    FounderDemoConsole.tsx
    ExecutionEvidencePanel.tsx

Founder Journey
---------------

Founder
    ↓
Describe Organization
    ↓
Builder Workspace Generated
    ↓
Session Saved
    ↓
Refresh / Return
    ↓
Workspace Restored
    ↓
Continue Exploring

Session Contents
----------------

Persist:

- Founder conversation
- Builder Plan
- Builder Session state
- Capability card states
- Execution evidence
- Completion status

EOS Alignment
-------------

Record:

- Implementation Authority
- Builder Session version
- Demonstration timestamp
- Execution phase
- Session integrity status

Acceptance Criteria
-------------------

- Builder Session restores after refresh.
- Capability cards restore correctly.
- Execution Evidence restores consistently.
- Demo remains deterministic and frontend-only.