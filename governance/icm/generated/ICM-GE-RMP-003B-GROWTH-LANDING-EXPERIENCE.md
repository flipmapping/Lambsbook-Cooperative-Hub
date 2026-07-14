# Implementation Context

client/src/pages/ScholarshipsPage.tsx
client/src/pages/ProspectRegistration.tsx
client/src/components/HeroSection.tsx
client/src/pages/HubLanding.tsx
web/src/growth/registry/programs.json
web/src/growth/registry/scholarships.json

Repository Mutation Boundary

Materialize the Founder-ready Growth Landing experience.

Objectives

- Replace the text-only /growth page with a visual landing experience.
- Introduce CTBC as the featured Growth experience.
- Integrate:
  Home
  → Growth
  → Scholarships
  → Prospect Registration.
- Provide a coherent landing experience leading to Scholarships and Prospect Registration.
- Preserve APIs.
- Preserve runtime contracts.
- Preserve Builder.
- Preserve CMA.


Implementation Surface

client/src/pages/HubLanding.tsx
client/src/components/admin/LandingPagesManagement.tsx
