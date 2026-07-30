
# APP-MEMBER-002

Canonical Member Dashboard

Mission
-------

Advance the Member Dashboard as the primary production experience while
keeping invitations and relationships centered on meaningful member
identity rather than internal identifiers.

Repository
----------

~/workspace

Execution Priorities
--------------------

Priority 1
~~~~~~~~~~

✓ Canonical member profile
✓ Member dashboard integration
✓ Avatar / profile image
✓ Profile completion workflow

Priority 2
~~~~~~~~~~

Invitation Workspace

Each invitation records:

• Canonical invitation URL
• Clickable production link
• QR code
• Current status
• Delivery channel
• Created / sent / accepted timestamps
• Editable member remark
• Copy/share actions

Invitation URLs are rendered using:

https://lambsbookcoop.com/<invitation-link>

The URL must originate from the canonical Invitation Delivery Adapter.

Priority 3
~~~~~~~~~~

Relationship Workspace

Display human-readable relationship information:

• Profile photo
• Display name
• Email address
• Membership status
• Invitation status
• Relationship timeline

Never expose internal UUIDs in the member UI except for debugging tools.

Priority 4
~~~~~~~~~~

Community Identity

Support:

• Avatar
• Biography
• Languages
• Skills
• Interests
• Contact methods
• Visibility controls
• QR codes for supported contact channels

Deferred
--------

Operational /hub/admin remains stable and receives maintenance only.
Dedicated /admin enhancements are deferred until after Member Dashboard
stabilization.

Acceptance Criteria
-------------------

✓ Member signs in successfully.
✓ Member dashboard loads canonical profile.
✓ Invitation history is available.
✓ Invitation links are clickable using the production domain.
✓ Invitation remarks are editable.
✓ Relationship workspace displays profile name and email instead of UUID.
✓ Dashboard is ready to power Community Square and future member experiences.
