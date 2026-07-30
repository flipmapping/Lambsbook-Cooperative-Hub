# GEX-NOTIFY-001

## Admin Surface Integration Plan

Implementation Target

/hub/admin

---

## Sprint Scope

The existing Admin surface becomes the operational workspace
for multilingual prospect communications.

No new admin application is introduced.

---

## Workflow

CSV Upload

↓

Validate CSV

↓

Display Prospect Preview

↓

Resolve Preferred Language

↓

Generate Localized Messages

↓

Preview Email (Resend)

↓

Preview Zalo Template

↓

Bulk Send

↓

Persist Delivery Results

---

## Admin Components

1. CSV Upload Panel

2. Validation Results Grid

3. Prospect Preview Table

4. Language Resolution Column

5. Email Preview Panel

6. Zalo Preview Panel

7. Bulk Send Button

8. Delivery Status Grid

---

## Runtime Dependencies

Input

- notification-payload.contract.json
- prospects-sample.csv

Output

- Resend
- Zalo
- Delivery Log

---

## Acceptance Criteria

PASS when:

✓ CSV imports successfully

✓ Invalid rows are reported

✓ Preferred language is resolved correctly

✓ English messages render correctly

✓ Vietnamese messages render correctly

✓ Traditional Chinese messages render correctly

✓ Resend payloads generated

✓ Zalo payloads generated

✓ Bulk send succeeds

✓ Delivery status stored
