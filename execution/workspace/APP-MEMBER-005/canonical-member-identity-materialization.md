
# APP-MEMBER-005

Canonical Member Identity Materialization

Mission
-------

Materialize the canonical Member Identity as the primary runtime surface
from which all authenticated member experiences are derived.

Repository
----------

~/workspace

Execution Scope
---------------

Priority 1
~~~~~~~~~~

Canonical Member Identity

Core identity:

• Authentication identity
• Display name
• Profile photo / avatar
• Biography
• Languages
• Skills
• Interests
• Preferred communication methods
• Per-channel visibility policy

Priority 2
~~~~~~~~~~

Member Dashboard

The authenticated landing experience shall present:

• Profile completeness
• Community card preview
• Invitations
• Relationships
• Programs
• Recent activity
• Notifications

Priority 3
~~~~~~~~~~

Invitation & Relationship Workspace

Invitation history shall include:

• Canonical production invitation URL
• Clickable share link
• Share status
• Invitation lifecycle
• Editable member remark
• Immutable system timeline

Relationships shall display:

• Profile photo
• Display name
• Email
• Membership status

Never display internal UUIDs in the member UI.

Production invitation links shall be rendered as:

https://lambsbookcoop.com/<invitation-link>

Links must originate from the canonical Invitation Delivery Adapter.

Deferred Handoff Items
----------------------

APP-HANDOFF-001
~~~~~~~~~~~~~~~

Documents Workspace

Scope after member foundation:

• Materialize document persistence
• Upload API
• Document listing
• Lifecycle management
• Storage integration

APP-HANDOFF-002
~~~~~~~~~~~~~~~

Admission Decisions

Inspect only:

POST /api/admissions/prospects/:id/decisions

Correct request payload mapping.

Do not redesign the schema.

Acceptance Criteria
-------------------

✓ Canonical member identity loads after sign-in.
✓ Member dashboard uses canonical identity.
✓ Invitation URLs are production-ready and clickable.
✓ Invitation history preserves lifecycle.
✓ Relationship views display meaningful identity.
✓ Deferred handoff items remain isolated from the member foundation.
