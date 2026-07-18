# Repository Mutation Plan

## Repository Surface

web/src/growth

---

## File 1 (NEW)

web/src/growth/components/Sections/ContactSection.tsx

Purpose:
Implement the Contact Experience section.

Contents:

- Connect With Us heading
- WhatsApp action
- Zalo action
- Messenger action
- Email row
- Scan to Connect heading
- WhatsApp QR card
- Zalo QR card

---

## File 2 (MODIFIED)

web/src/growth/pages/Landing/LandingSections.tsx

Mutation:

Before:

<FAQSection />

<CallToActionSection />

After:

<FAQSection />

<ContactSection />

<CallToActionSection />

---

## Assets

QR code/Whatsapp.jpg

QR code/zalo.jpg

---

## Prohibited

No routing

No API

No backend

No schema

No authentication

No Hero mutation

No Journey mutation

No Membership mutation

