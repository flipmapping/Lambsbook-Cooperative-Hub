
# Runtime Transition Readiness
Implementation Authority: APP-READY-002

Repository
----------
~/workspace

Mission
-------
Prepare the Main App to become the exclusive runtime owner after
Founder acceptance without duplicating the remaining Growth Engine
implementation.

Scope
-----

AUTHORIZED

✓ Canonical admin sign-up/sign-in flow
✓ Temporary /hub/admin operational dashboard
✓ Member profile ↔ Member dashboard integration
✓ Invitation URL presentation using production domain
✓ Runtime review and operational readiness

NOT AUTHORIZED

✗ New onboarding features
✗ Import pipeline redesign
✗ Journey implementation
✗ Resend implementation
✗ Zalo implementation
✗ Duplicate GE runtime work

Admin Runtime Objectives
------------------------

1. Founder/Admin authenticates through the canonical identity flow.

2. Successful authentication routes to:

    /hub/admin

3. Dashboard presents operational information including:

    • Pending prospect admissions
    • Pending invitations
    • Member count
    • Recent onboarding activity

4. Invitation links are rendered using:

    https://lambsbookcoop.com/<invitation-link>

The rendered URL must be clickable by the frontend and must originate
from the canonical Invitation Delivery Adapter rather than being
constructed independently by each UI component.

Future Ownership
----------------

The temporary /hub/admin dashboard remains the operational surface until
the dedicated /admin experience reaches production parity.

Acceptance Criteria
-------------------

✓ Founder can sign up/sign in.
✓ Founder lands on /hub/admin.
✓ Member profile loads correctly.
✓ Invitation URLs render using the production domain.
✓ No duplication of the remaining GE onboarding corridor.
