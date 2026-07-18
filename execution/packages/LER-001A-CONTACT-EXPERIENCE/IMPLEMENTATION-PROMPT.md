# LER-001A Repository Mutation

## Objective

Implement the Contact Experience for the Growth Landing page.

## Authorized Repository Mutations

CREATE

web/src/growth/components/Sections/ContactSection.tsx

MODIFY

web/src/growth/pages/Landing/LandingSections.tsx

## Requirements

Create a production-ready React/TypeScript component that:

- Matches the existing Growth component conventions.
- Uses the project's existing UI primitives and styling approach.
- Renders:

  - Connect With Us
  - WhatsApp button
  - Zalo button
  - Messenger button
  - Email row
  - Scan to Connect
  - WhatsApp QR image
  - Zalo QR image

- Uses the approved QR assets.
- Is responsive.
- Does not introduce backend dependencies.
- Does not modify any existing business logic.

LandingSections.tsx must be modified only to:

1. Import ContactSection.
2. Render <ContactSection /> immediately before <CallToActionSection />.

No other repository files may be modified.
