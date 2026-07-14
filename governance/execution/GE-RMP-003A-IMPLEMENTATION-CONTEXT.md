# GE-RMP-003A

Status

ACTIVE

Repository

APP-001

Execution Standard

BIS-001

Implementation Standard

IAS-001

Purpose

Converge the existing Growth Engine runtime into a coherent Founder-ready
experience without introducing new product capabilities.

Repository Truth

Builder v1.2 is certified.
Content Materialization Authority is certified.
All multilingual runtime content exists.

Implementation Context

client/src/pages/GrowthPlatform.tsx
client/src/pages/ScholarshipsPage.tsx
client/src/pages/ProspectRegistration.tsx
client/src/components/HeroSection.tsx
web/src/growth/registry/programs.json
web/src/growth/registry/scholarships.json
web/src/growth/content/en/programs.json
web/src/growth/content/en/scholarships.json
web/src/growth/content/en/admissions.json
web/src/growth/content/vi/programs.json
web/src/growth/content/vi/scholarships.json
web/src/growth/content/vi/admissions.json
web/src/growth/content/zh/programs.json
web/src/growth/content/zh/scholarships.json
web/src/growth/content/zh/admissions.json

Repository Mutation Boundary

Objectives

1. Repair /growth runtime rendering.
2. Remove CTBC "Coming Soon" status.
3. Integrate:
   Home
   → Growth
   → Scholarships
   → Prospect Registration
4. Correct scholarship page layout.
5. Preserve existing APIs.
6. Preserve runtime contracts.
7. Preserve Builder.
8. Preserve CMA.
9. Preserve database.

Out of Scope

• New business features
• New APIs
• Database mutations
• Builder changes
• CMA changes
• Governance changes

Founder Acceptance

FRAT-001
