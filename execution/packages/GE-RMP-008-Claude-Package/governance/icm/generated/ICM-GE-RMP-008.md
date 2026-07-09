# Implementation Context Manifest

Status

CERTIFIED

Implementation Authority

GE-RMP-008

Production Surface

Applicant Appointment Center

Implementation Context

client/src/App.tsx

client/src/pages/ApplicantJourneyStatus.tsx

client/src/pages/ApplicantDocumentCenter.tsx

--------------------------------------------------

Repository Mutation Boundary

Materialize the first applicant-facing appointment center.

Permitted Repository Mutations

- Add ApplicantAppointmentCenter.tsx
- Register Applicant Appointment Center route in App.tsx
- Link the Applicant Appointment Center into the existing Applicant Journey Status and Applicant Document Center experience

Forbidden Repository Mutations

- Backend
- Database
- Admissions runtime
- Prospect persistence
- Authentication

