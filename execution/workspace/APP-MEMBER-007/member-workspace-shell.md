
# APP-MEMBER-007

Canonical Member Workspace Shell

Mission
-------

Materialize the authenticated Member Workspace as the composition shell
for all member-facing capabilities while keeping each capability in its
own bounded module.

Repository
----------

~/workspace

Architectural Principle
-----------------------

The Member Workspace is a composition shell.

It coordinates authenticated navigation and presentation but does not
own the business logic of its child workspaces.

Workspace Modules
-----------------

Core

• Member Identity
• Community Card

Operational

• Invitation Workspace
• Relationship Workspace
• Program Workspace
• Document Workspace
• Activity Timeline
• Notification Center

Member Journey
--------------

Provide a permanent participation timeline including:

• Joined cooperative
• Profile completed
• Programs joined
• Invitations issued
• Relationships established
• Documents submitted
• Certifications achieved
• Cooperative contributions

Invitation Workspace
--------------------

Retain:

• Canonical production invitation URL
• Clickable share link
• QR code
• Invitation status
• Delivery channel
• Share context (email, QR, copy link, Zalo, WhatsApp, etc.)
• Most recent share timestamp
• Editable member note
• Immutable system event history

Relationships
-------------

Display:

• Avatar
• Display name
• Email
• Membership status

Never expose internal UUIDs in the member-facing UI.

Deferred Handoff Items
----------------------

APP-HANDOFF-001
• Document persistence and lifecycle

APP-HANDOFF-002
• Admission Decision payload mapping correction

Acceptance Criteria
-------------------

✓ Member signs in successfully.
✓ Member Workspace shell loads.
✓ Child workspaces remain independently composable.
✓ Member Journey timeline is available.
✓ Invitation share context is retained.
✓ Community Card and Community Square consume the same Member Identity.
