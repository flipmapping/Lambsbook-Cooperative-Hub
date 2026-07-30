
# APP-MEMBER-009

Member Workspace Runtime Materialization

Mission
-------

Transition from planning artifacts to executable runtime implementation
of the Member Workspace using independently composable modules.

Repository
----------

~/workspace

Execution Doctrine
------------------

This sprint begins runtime materialization.

No new architectural concepts are introduced.

Each sprint shall:

• Materialize one runtime module.
• Verify runtime behavior.
• Integrate into the Member Workspace shell.
• Preserve a single canonical Member Identity.

Implementation Sequence
-----------------------

Sprint 1
~~~~~~~~

Workspace Shell

Deliver:

• Authenticated layout
• Navigation
• Route composition
• Module placeholders
• Loading / empty / error states

Acceptance:

✓ Member reaches the authenticated workspace.

Sprint 2
~~~~~~~~

Member Identity Read Model

Deliver:

• Read-only profile projection
• Avatar display
• Membership information
• Profile completeness indicator

Acceptance:

✓ Existing member data is rendered correctly.

Sprint 3
~~~~~~~~

Invitation & Relationship Workspace

Deliver:

• Invitation history
• Canonical production invitation URL
• Invitation lifecycle
• Share status
• Editable member remark
• Relationship cards with profile name, avatar, and email

Acceptance:

✓ Invitation and relationship data are navigable without exposing UUIDs.

Sprint 4
~~~~~~~~

Profile Editing

Deliver:

• Avatar upload
• Biography
• Languages
• Skills
• Interests
• Communication channels
• Per-channel visibility

Acceptance:

✓ Member profile updates persist correctly.

Sprint 5
~~~~~~~~

Member Journey

Deliver:

• Timeline
• Cooperative milestones
• Profile completion progress

Acceptance:

✓ Journey reflects authenticated member activity.

Sprint 6
~~~~~~~~

Community Card

Deliver:

• Public profile projection
• Contact visibility
• QR codes

Acceptance:

✓ Community Card derives exclusively from Member Identity.

Sprint 7
~~~~~~~~

Community Square

Deliver:

• Consume Community Card
• Search and discovery
• Visibility enforcement

Acceptance:

✓ No duplicate identity model exists.

Runtime Readiness Checklist
---------------------------

For every module verify:

□ Data source identified
□ API available
□ Loading state
□ Empty state
□ Error state
□ Runtime verified

Deferred
--------

APP-HANDOFF-001
• Documents Workspace

APP-HANDOFF-002
• Admission Decision payload mapping

Completion Gate
---------------

The Member Workspace is production-ready when all modules are
independently verifiable, compose within the authenticated workspace,
and consume the single canonical Member Identity.
