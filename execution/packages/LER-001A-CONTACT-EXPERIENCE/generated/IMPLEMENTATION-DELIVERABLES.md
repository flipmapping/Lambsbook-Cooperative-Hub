# LER-001A Implementation Deliverables

## Repository Files

1. web/src/growth/components/Sections/ContactSection.tsx
   Status: FULL IMPLEMENTATION REQUIRED

2. web/src/growth/pages/Landing/LandingSections.tsx
   Status: MINIMAL PATCH REQUIRED

## Acceptance Criteria

- Contact section inserted immediately before CallToActionSection.
- Existing homepage section order preserved.
- Connect With Us heading displayed.
- WhatsApp, Zalo and Messenger actions displayed.
- Email row displayed.
- "Scan to Connect" heading displayed.
- Two QR cards use the approved assets.
- Responsive desktop/tablet/mobile layout.
- No backend, routing, API, schema or authentication changes.

## Repository Mutation Boundary

Allowed:
- web/src/growth/components/Sections/ContactSection.tsx
- web/src/growth/pages/Landing/LandingSections.tsx

Prohibited:
- Any other repository files.
