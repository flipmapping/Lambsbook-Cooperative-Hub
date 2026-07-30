
# APP-MEMBER-006

Canonical Member Workspace Foundation

Mission
-------

Establish the Member Workspace as the primary authenticated production
experience. All member-facing capabilities shall be composed from the
canonical Member Identity while presenting a cohesive operational
workspace.

Repository
----------

~/workspace

Workspace Composition
---------------------

The Member Workspace shall include:

• My Profile
• My Community Card
• My Relationships
• My Invitations
• My Programs
• My Documents
• My Activities
• My Notifications
• My Cooperative Journey

Canonical Member Identity
-------------------------

The workspace consumes a single Member Identity containing:

• Authentication identity
• Display name
• Avatar / profile photo
• Biography
• Languages
• Skills
• Interests
• Communication channels
• Per-channel visibility policy

Profile Completion Journey
--------------------------

Introduce a Profile Completeness Index to guide members through
progressive onboarding.

Suggested milestones:

1. Account created
2. Basic profile completed
3. Avatar uploaded
4. Communication preferences configured
5. Community Card published
6. First invitation sent
7. First relationship established
8. First program joined

Invitation & Relationship Workspace
-----------------------------------

Present:

• Canonical production invitation URL
• Clickable share link
• Share status
• Invitation lifecycle
• Editable member note
• Immutable system event history

Relationships display:

• Profile photo
• Display name
• Email address
• Membership status

Internal identifiers remain internal and are not displayed in the member
experience.

Deferred Items
--------------

APP-HANDOFF-001
• Documents Workspace implementation

APP-HANDOFF-002
• Admission Decision payload mapping correction

Acceptance Criteria
-------------------

✓ Member signs in successfully.
✓ Member Workspace loads.
✓ Profile Completeness Index is available.
✓ Invitation history is retained.
✓ Relationships display meaningful identity.
✓ Community Card derives from the canonical Member Identity.
✓ Community Square consumes the same canonical model.
