
# APP-MEMBER-011

Runtime Surface Backlog

Mission
-------

Begin implementation by identifying and materializing one runtime surface
per sprint. Every sprint must correspond to concrete repository surfaces
that can be inspected, mutated, built, and verified.

Repository
----------

~/workspace

Sprint 1
--------

Runtime Surface: Member Workspace Entry

Inspect

• Authenticated route registration
• Member Workspace shell component
• Navigation composition
• Member context provider
• Current member API consumption

Deliver

• Stable workspace layout
• Left navigation
• Read-only profile card
• Invitation summary
• Relationship summary

Verification

□ npm run build
□ Authenticated sign-in succeeds
□ Member lands in the workspace
□ Canonical identity is displayed
□ Loading, empty, and error states verified

Sprint 2
--------

Runtime Surface: Member Profile

Deliver

• Read-only profile projection
• Avatar display
• Profile completeness indicator

Verification

□ Existing member data renders correctly
□ No duplicate identity logic introduced

Sprint 3
--------

Runtime Surface: Invitation & Relationship

Deliver

• Invitation history
• Canonical production invitation URL
• Human-readable relationship list
• Editable invitation remarks
• Immutable invitation event history

Verification

□ Production invitation links are clickable
□ UUIDs are not displayed in member-facing views

Deferred
--------

APP-HANDOFF-001
• Documents Workspace

APP-HANDOFF-002
• Admission Decision payload mapping

Execution Rule
--------------

Each sprint shall identify:

1. Repository surfaces
2. Runtime mutation
3. Build verification
4. Runtime verification
5. Founder acceptance

No additional architectural planning documents are created unless a
runtime finding reveals a genuine architectural gap.
