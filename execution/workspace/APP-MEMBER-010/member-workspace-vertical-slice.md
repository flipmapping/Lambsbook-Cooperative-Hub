
# APP-MEMBER-010

Member Workspace Vertical Slice

Mission
-------

Deliver the first production-ready Member Workspace using a vertical
slice approach rather than implementing isolated infrastructure layers.

Repository
----------

~/workspace

Execution Doctrine
------------------

Deliver a usable authenticated experience in every sprint.

Each sprint must expose real runtime data instead of placeholder-only
modules.

Sprint 1
--------

Vertical Slice

Deliver:

• Canonical authenticated workspace
• Stable left navigation
• My Profile (read-only)
• Profile Completeness indicator
• My Invitations (history)
• My Relationships (display name, avatar, email)

Modules not yet implemented shall render a consistent "Coming Soon"
state without breaking navigation.

Canonical Navigation
--------------------

The workspace navigation is stable and becomes the long-term contract.

Sections:

• My Profile
• My Journey
• My Invitations
• My Relationships
• My Community Card
• Community Square
• My Programs
• My Documents
• Notifications
• Settings

Runtime Readiness Checklist
---------------------------

For each visible section verify:

□ Route exists
□ Navigation entry exists
□ Runtime data source identified
□ Loading state
□ Empty state
□ Error state
□ Authenticated access verified

Deferred
--------

APP-HANDOFF-001
• Documents Workspace implementation

APP-HANDOFF-002
• Admission Decision payload mapping correction

Acceptance Criteria
-------------------

✓ Member signs in successfully.
✓ Member reaches the workspace.
✓ Navigation is stable.
✓ Profile is populated from canonical identity.
✓ Invitations and relationships display live runtime data.
✓ Remaining modules integrate incrementally without changing navigation.
