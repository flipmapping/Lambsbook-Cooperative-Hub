# Implementation Context Manifest

Status

CERTIFIED

Implementation Authority

GE-RMP-006

Production Surface

Applicant Status Lookup

Implementation Context

client/src/App.tsx

client/src/pages/ApplicantJourneyStatus.tsx

web/src/growth/registry/journey.json

--------------------------------------------------

Repository Mutation Boundary

Materialize the first applicant-facing status lookup surface.

Permitted Repository Mutations

- Add ApplicantStatusLookup.tsx
- Register Applicant Status Lookup route in App.tsx
- Link lookup flow to the existing Applicant Journey Status page

Forbidden Repository Mutations

- Backend
- Database
- Admissions runtime
- Prospect persistence
- Authentication
