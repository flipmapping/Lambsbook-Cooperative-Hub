# APP-REC-ADM-001

Title:
Admission Decision Reviewer Identity Contract

Evidence:
- UI requests 'Decide by (email / name)'.
- Backend expects reviewer_id UUID.
- Runtime error:
  invalid input syntax for type uuid.

Scope:
- Remove free-text reviewer identity entry.
- Resolve reviewer from authenticated identity or an authorized reviewer selector.
- Align frontend and backend contract.
