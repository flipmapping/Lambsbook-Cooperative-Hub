# Implementation Context Manifest

Status

CERTIFIED

Implementation Authority

GE-RMP-007

Production Surface

Applicant Document Center

Implementation Context

client/src/App.tsx

client/src/pages/ApplicantJourneyStatus.tsx

client/src/pages/ApplicantStatusLookup.tsx

--------------------------------------------------

Repository Mutation Boundary

Materialize the first applicant-facing document center.

Permitted Repository Mutations

- Add ApplicantDocumentCenter.tsx
- Register Applicant Document Center route in App.tsx
- Link the Applicant Document Center into the existing applicant journey

Forbidden Repository Mutations

- Backend
- Database
- Admissions runtime
- Prospect persistence
- Authentication
