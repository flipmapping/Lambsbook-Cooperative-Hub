
# APP-MEMBER-001

Canonical Member Experience

Mission
-------

Reprioritize the Main App toward the Member Dashboard as the primary
production surface following successful completion of the onboarding
registration corridor.

Repository
----------

~/workspace

Execution Priorities
--------------------

Priority 1
~~~~~~~~~~

✓ Canonical member profile
✓ Member dashboard integration
✓ Avatar / profile image
✓ Profile completion workflow

Priority 2
~~~~~~~~~~

✓ Contact Visibility Registry

Each contact method supports independent visibility:

• Private
• Members Only
• Connections Only
• Public

Supported methods include:

• Zalo
• WhatsApp
• Messenger
• Telegram
• WeChat
• LINE
• Email
• Phone

QR codes are generated or stored per contact method and inherit the
selected visibility.

Priority 3
~~~~~~~~~~

✓ Community profile card
✓ Community Square integration
✓ Invitation sharing using the canonical production URL

Invitation URLs must be rendered using:

https://lambsbookcoop.com/<invitation-link>

The URL displayed by the UI must originate from the canonical Invitation
Delivery Adapter.

Deferred
--------

The operational /hub/admin dashboard remains stable and receives only
maintenance until the dedicated /admin workspace is prioritized.

Carry-forward Items
-------------------

High
• Update CTBC program list.
• Improve duplicate registration user messaging.

Medium
• Prospect document workspace.
• Runtime guard startup timing.

Acceptance Criteria
-------------------

✓ Member signs in successfully.
✓ Canonical profile loads.
✓ Avatar is supported.
✓ Contact methods respect visibility settings.
✓ Invitation URL is clickable and uses the production domain.
✓ Community profile is ready for Community Square consumption.
