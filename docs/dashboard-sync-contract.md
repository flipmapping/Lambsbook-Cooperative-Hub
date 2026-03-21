# Dashboard Sync Contract

**Scope:** Internal alignment document for Hub admin dashboard and onboarding/member dashboard.
**Last updated:** March 2026

---

## 1. Purpose

The Hub admin dashboard (`HubAdminDashboard`) is the **source of truth** for all enrollment workflow behavior, domain terminology, and backend API boundaries.

The onboarding/member dashboard must mirror the same UX logic in a simplified, member-facing form. It must not invent parallel behavior, duplicate backend logic, or introduce terminology that drifts from the terms defined here.

Any change to the enrollment workflow sequence, API contract, or eligibility model must be reflected in **both** surfaces before shipping.

---

## 2. Shared Domain Terms

Use these terms exactly, in code identifiers, UI labels, and documentation. Do not introduce synonyms.

| Term | Definition |
|------|------------|
| **member** | A registered user in the Lambsbook Hub system. Identified by UUID. Has a `membership_status` (free/paid) and `activity_status` (active/inactive). |
| **program** | A structured earning/learning arrangement in the Hub. Has a `sbu` (strategic business unit), `revenue_base`, `trigger_condition`, and an `is_active` flag. |
| **eligibility** | A recorded relationship between a member and a program granting permission to enroll. Stored server-side. Cannot be assumed client-side. |
| **enrollment** | The act of a member entering a program. Requires confirmed eligibility. Initiated by creating an enrollment payment draft event. |
| **enrollment payment draft** | The backend economic event created by `POST /api/admin/enrollment-payment`. It is a **draft** — not a confirmed payment, not an accrued earning, not a payout. The word "draft" must remain visible to the admin. |
| **invitation** | A permanent invitor–invitee collaboration link. Set once, never changed. Distinct from referrals (purchase attribution). Do not conflate with enrollment. |
| **incentive** | A financial reward earned by an invitor when their invitee completes a qualifying economic event (e.g., enrollment payment). Triggered server-side via `execute_inviter_incentive_payout`. Never computed or approximated client-side. |

---

## 3. Enrollment Workflow Contract

The following sequence is the canonical enrollment workflow. Both admin and member surfaces must follow this sequence in spirit, diverging only in role-gated steps noted below.

```
1. SELECT CONTEXT
   Admin:  select a member + select a program
   Member: context is the member themselves + the program in view

2. CHECK ELIGIBILITY
   Query: GET /api/admin/program-eligibility?member_id={id}
   Find:  does a record exist where program_id matches AND eligible = true?
   State: eligible | not eligible | checking | missing selection

3. ASSIGN ELIGIBILITY (admin only)
   If not eligible, admin may assign via POST /api/admin/program-eligibility
   Member UI must NOT expose an assign eligibility action

4. CREATE ENROLLMENT PAYMENT DRAFT
   Requires: member selected, program selected, amount > 0, eligibility confirmed
   Route:    POST /api/admin/enrollment-payment
   Payload:  { member_id, program_id, amount, reference? }

5. DISPLAY RETURNED RESULT TRUTHFULLY
   Admin:  show full returned object key/value pairs as returned by the backend
   Member: show a simplified pending/draft confirmation ("Your enrollment is pending confirmation")
   Neither surface must imply approval, accrual, or payout at this step

6. NO FURTHER ACTION IN THIS WORKFLOW
   The draft result is the terminal state of this workflow
   Approval, payout, and earning accrual are separate server-side workflows
```

---

## 4. Shared UI States

Both admin and member surfaces must conceptually support these states for the enrollment workflow. Implementation details may differ; the named states must not.

| State name | Trigger | Required visual signal |
|---|---|---|
| `idle` | No member or program selected | Neutral — no eligibility badge |
| `missing-selection` | One of member/program not yet chosen | Informational badge: "Select member and program first" |
| `checking-eligibility` | Query in-flight | Loading badge: "Checking..." |
| `eligible` | Record found with `eligible = true` | Success indicator (e.g. green badge) |
| `not-eligible` | No matching eligible record | Warning indicator; admin sees assign button |
| `assigning-eligibility` | POST /api/admin/program-eligibility in-flight | Spinner on assign button; button disabled |
| `creating-draft` | POST /api/admin/enrollment-payment in-flight | Spinner on submit button; button disabled |
| `success` | Draft created; backend returned result | Show result; do not imply payment confirmed |
| `error` | Any API call failed | Toast notification with error message; do not silently swallow |

---

## 5. Role Split

### Admin UI (HubAdminDashboard / EnrollmentWorkflow)

- Can select any member from the full member list
- Can assign eligibility via `POST /api/admin/program-eligibility`
- Sees raw key/value pairs of the returned draft event object
- Sees draft result immediately inline (no redirect)

### Member UI (onboarding/member dashboard)

- Context is the authenticated member — no member selector
- Cannot assign their own eligibility — the assign action is hidden entirely
- Sees a simplified human-readable confirmation message, not the raw event object
- Must still gate the submit action on confirmed eligibility (queried from backend, not assumed)

### Shared constraint (both surfaces)

- Neither surface writes directly to Supabase from the client
- Neither surface computes or caches eligibility locally — always read from backend
- Neither surface implies payment completion, earning accrual, or inviter payout from the draft result

---

## 6. Current Implementation Anchors

These are the current canonical implementation files. Update this section if files are renamed or routes change.

| Anchor | Location |
|--------|----------|
| Enrollment UI component | `client/src/components/admin/EnrollmentWorkflow.tsx` |
| Admin dashboard host | `client/src/pages/HubAdminDashboard.tsx` |
| Create enrollment payment draft | `POST /api/admin/enrollment-payment` |
| Get member eligibility | `GET /api/admin/program-eligibility?member_id={id}` |
| Assign eligibility | `POST /api/admin/program-eligibility` |
| Admin routes file | `server/routes/admin.ts` |
| Supabase RPC (draft creation) | `create_program_enrollment_payment_event(p_member_id, p_program_id, p_amount, p_reference)` |
| Supabase RPC (incentive payout) | `execute_inviter_incentive_payout(p_earning_id)` |

---

## 7. Rules to Prevent Drift

The following rules must be enforced whenever the enrollment workflow is extended or the member-facing surface is built.

1. **No direct client Supabase writes.** All mutations go through Express API routes. `supabase.from(...).insert(...)` must not appear in any client-side enrollment code.

2. **No duplicate eligibility logic.** Do not compute eligibility on the client by inspecting member or program data. Always query `GET /api/admin/program-eligibility` (or a member-scoped equivalent) and treat the response as authoritative.

3. **No alternate enrollment terminology.** Do not use "register," "sign up for a program," "join program," or "activate" in place of "enroll" or "enrollment." Do not use "approved" or "confirmed" for a draft result.

4. **No bypass of backend route boundaries.** The member-facing surface must use its own scoped routes (e.g. `POST /api/member/enrollment-payment`) rather than calling admin routes directly. Admin routes assume admin JWT context.

5. **No implied payout from draft result.** The enrollment payment draft is an economic event in draft state. It does not confirm a payment, trigger an earning, or initiate an inviter incentive. These are separate server-side processes.

6. **Eligibility assignment is admin-only.** The member surface must never expose a UI path that allows a member to self-assign eligibility, even if the underlying API theoretically permits it.

7. **UI states must be named consistently.** When implementing the member-facing enrollment flow, use the state names from Section 4 in code comments and PR descriptions to make cross-surface reviews tractable.
