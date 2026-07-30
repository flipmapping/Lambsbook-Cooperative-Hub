
# APP-MEMBER-003

Canonical Relationship Workspace

Mission
-------

Elevate the Member Dashboard into the primary production experience by
making Relationships the organizing concept for invitations, community,
and future member interactions.

Repository
----------

~/workspace

Execution Priorities
--------------------

Priority 1
~~~~~~~~~~

Canonical Member Profile

• Profile photo / avatar
• Display name
• Biography
• Languages
• Skills
• Interests
• Contact visibility
• QR codes for supported contact methods

Priority 2
~~~~~~~~~~

Relationship Workspace

Display meaningful identity instead of internal identifiers:

• Profile photo
• Display name
• Email address
• Membership status
• Relationship status
• Relationship timeline

Priority 3
~~~~~~~~~~

Invitation Workspace

Each invitation contains:

• Canonical production invitation URL
• Clickable share link
• QR code
• Invitation status
• Delivery channel
• Created / sent / accepted timestamps
• Editable member note
• Immutable system event history
• Copy/share actions

Production links are rendered as:

https://lambsbookcoop.com/<invitation-link>

The URL must originate from the canonical Invitation Delivery Adapter.

Priority 4
~~~~~~~~~~

Community Identity

Community Square consumes the canonical Member Profile and Relationship
Workspace without duplicating identity information.

Deferred
--------

The operational /hub/admin dashboard remains available for operational
tasks only. Feature expansion is deferred until after Member Dashboard
stabilization.

Acceptance Criteria
-------------------

✓ Member signs in successfully.
✓ Canonical profile loads.
✓ Relationship workspace displays human-readable identity.
✓ Invitation history retains lifecycle records.
✓ Member notes remain editable.
✓ System event history remains immutable.
✓ Invitation URLs use the canonical production domain.
✓ Community Square can consume the same profile and relationship model.
