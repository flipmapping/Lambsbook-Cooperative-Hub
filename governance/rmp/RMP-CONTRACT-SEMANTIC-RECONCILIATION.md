# Repository Mutation Authority

Status

AUTHORIZED

Authority

RMP-CONTRACT-SEMANTIC-RECONCILIATION

Derived From

DISC-CONTRACT-SEMANTIC-MIGRATION-GAP

Repository Truth

The canonical service contract is:

- Appointment / Document field: notes
- Follow-up Task deadline field: due_date

Repository inspection confirms a partial semantic migration to:

- description
- due_at

This partial migration is not governed by any certified implementation authority.

Repository Mutation Objective

Reconcile every affected repository layer to the canonical service contract.

Execution Boundary

Exactly one bounded repository mutation.

Permitted Repository Mutations

- server/lib/supabase-dal.ts
- client/src/components/admissions/ProspectAppointmentWorkspace.tsx
- client/src/components/admissions/ProspectDocumentWorkspace.tsx
- client/src/components/admissions/ProspectFollowupTaskWorkspace.tsx
- client/src/pages/ApplicantAppointmentCenter.tsx
- client/src/pages/ApplicantDocumentCenter.tsx
- client/src/pages/ApplicantFollowupTaskCenter.tsx

Not Authorized

- Backend capability changes
- Database schema changes
- API contract redesign
- New Growth Engine features
