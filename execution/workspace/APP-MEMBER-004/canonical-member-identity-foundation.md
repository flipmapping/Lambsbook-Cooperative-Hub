
# APP-MEMBER-004

Canonical Member Identity Foundation

Mission
-------

Establish Member Identity as the single canonical runtime object from
which the Member Dashboard, Relationships, Invitations, Community
Square, and future member experiences are derived.

Repository
----------

~/workspace

Execution Priorities
--------------------

Priority 1
~~~~~~~~~~

Canonical Member Identity

• Authentication identity
• Display name
• Avatar / profile photo
• Biography
• Languages
• Skills
• Interests
• Preferred communication apps
• Contact visibility policy

Priority 2
~~~~~~~~~~

Profile Completion Journey

Guide every newly registered member through a structured profile
completion experience before encouraging participation in the community.

Suggested completion flow:

1. Upload avatar.
2. Complete biography.
3. Select languages.
4. Add skills and interests.
5. Configure communication channels.
6. Choose visibility for each channel.
7. Review Community Card.

Priority 3
~~~~~~~~~~

Relationship Model

Relationships derive from the canonical member identity.

Relationship views should display:

• Profile photo
• Display name
• Email
• Relationship status
• Invitation history
• Member-authored notes
• Immutable system timeline

Priority 4
~~~~~~~~~~

Invitation Workspace

Maintain invitation lifecycle history with:

• Canonical production invitation URL
• Clickable share link
• QR code
• Status history
• Delivery channels
• Editable notes
• Immutable system events

Production links are displayed using:

https://lambsbookcoop.com/<invitation-link>

Links must originate from the canonical Invitation Delivery Adapter.

Priority 5
~~~~~~~~~~

Community Square

Consume canonical member identities and relationship information
without introducing duplicate profile models.

Deferred
--------

Operational /hub/admin remains available for maintenance and operational
tasks only. Feature expansion is deferred until the Member Identity
foundation is complete.

Acceptance Criteria
-------------------

✓ Founder signs in successfully.
✓ Member identity loads correctly.
✓ Profile completion journey is available.
✓ Communication channels support per-channel visibility.
✓ Relationship views show meaningful identity.
✓ Invitation history is retained.
✓ Community Square consumes canonical member identity.
