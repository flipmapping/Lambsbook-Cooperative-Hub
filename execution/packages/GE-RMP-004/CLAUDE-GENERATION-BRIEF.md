# GE-RMP-004 Claude Generation Brief

Implementation Authority

GE-RMP-004

Repository

Main Repository

Authorized Mutation

File:
client/src/pages/ProspectRegistration.tsx

Read Only:
web/src/growth/registry/journey.json

Objective

Replace the static registration success panel with a runtime-driven
Release-1 applicant journey.

Requirements

- Read the journey from web/src/growth/registry/journey.json
- Preserve the existing heading
- Preserve the existing confirmation text
- Preserve the existing "Back to Growth" button
- Display the journey steps dynamically
- Mark "Prospect Registration" as the current completed step
- Display a "What happens next?" section

Forbidden

- Backend changes
- API changes
- Route changes
- Database changes
- Additional file modifications

Acceptance

- Only client/src/pages/ProspectRegistration.tsx modified
- Build succeeds
- Runtime succeeds
