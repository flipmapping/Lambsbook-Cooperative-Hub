# Claude Production Implementation Contract (PIC)

## Mission

Implement LER-001A Contact Experience.

You are implementing code only.

Do NOT redesign.

Do NOT refactor.

Do NOT inspect unrelated repository areas.

---

## Authorized Repository Mutations

CREATE

web/src/growth/components/Sections/ContactSection.tsx

MODIFY

web/src/growth/pages/Landing/LandingSections.tsx

Only:

1. Import ContactSection.

2. Insert:

<ContactSection />

immediately before:

<CallToActionSection />

No other repository mutations are authorized.

---

## Contact Section

Implement a production-ready React + TypeScript component.

Render:

- Connect With Us
- WhatsApp action
- Zalo action
- Messenger action
- Email row
- Scan to Connect
- WhatsApp QR
- Zalo QR

Use the approved QR assets supplied in this package.

Follow the existing Growth component conventions.

Do not introduce backend logic.

Do not introduce routing.

Do not introduce APIs.

Do not introduce state management.

---

## Acceptance Criteria

- Builds successfully.
- Responsive.
- Contact section appears immediately before CallToActionSection.
- Existing landing flow preserved.
