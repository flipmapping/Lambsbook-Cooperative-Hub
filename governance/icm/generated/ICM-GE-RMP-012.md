# Implementation Context Manifest

Status

CERTIFIED

Implementation Authority

GE-RMP-012

Production Surface

Applicant Follow-up Task Center

Implementation Context

client/src/App.tsx

client/src/pages/ApplicantJourneyStatus.tsx

client/src/pages/ApplicantActivityCenter.tsx

--------------------------------------------------

Repository Mutation Boundary

Materialize the first applicant-facing follow-up task center.

Permitted Repository Mutations

- Add ApplicantFollowupTaskCenter.tsx
- Register Applicant Follow-up Task Center route in App.tsx
- Link the Applicant Follow-up Task Center into the existing Applicant Journey Status and Applicant Activity Center experience

Forbidden Repository Mutations

- Backend
- Database
- Admissions runtime
- Prospect persistence
- Authentication

