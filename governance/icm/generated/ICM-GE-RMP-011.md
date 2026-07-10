# Implementation Context Manifest

Status

CERTIFIED

Implementation Authority

GE-RMP-011

Production Surface

Applicant Activity Center

Implementation Context

client/src/App.tsx

client/src/pages/ApplicantJourneyStatus.tsx

client/src/pages/ApplicantLifecycleTimeline.tsx

--------------------------------------------------

Repository Mutation Boundary

Materialize the first applicant-facing activity center.

Permitted Repository Mutations

- Add ApplicantActivityCenter.tsx
- Register Applicant Activity Center route in App.tsx
- Link the Applicant Activity Center into the existing Applicant Journey Status and Applicant Lifecycle Timeline experience

Forbidden Repository Mutations

- Backend
- Database
- Admissions runtime
- Prospect persistence
- Authentication

