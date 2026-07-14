# Implementation Context

client/src/pages/ScholarshipsPage.tsx
client/src/pages/ProspectRegistration.tsx
client/src/components/HeroSection.tsx
client/src/pages/HubLanding.tsx
web/src/growth/registry/programs.json
web/src/growth/registry/scholarships.json

Repository Mutation Boundary

Repair the runtime only.

Objectives

- Restore /growth visual rendering.
- Remove CTBC 'Coming Soon'.
- Integrate:
  Home
  → Growth
  → Scholarships
  → Prospect Registration.
- Correct scholarship page layout.
- Preserve APIs.
- Preserve runtime contracts.
- Preserve Builder.
- Preserve CMA.


Implementation Surface

client/src/pages/HubLanding.tsx
client/src/components/admin/LandingPagesManagement.tsx
