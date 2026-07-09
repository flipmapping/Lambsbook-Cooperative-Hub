# Implementation Context Manifest

Status

CERTIFIED

Implementation Authority

GE-RMP-005

Production Surface

Applicant Journey Status

Implementation Context

client/src/App.tsx

web/src/growth/registry/journey.json

--------------------------------------------------

Repository Mutation Boundary

Materialize the first applicant-facing application status journey.

Permitted Repository Mutations

- Add ApplicantJourneyStatus.tsx
- Register applicant status route in App.tsx
- Extend journey.json for applicant status progression

Forbidden Repository Mutations

- Backend
- Database
- Admissions runtime
- Prospect persistence
- Authentication
