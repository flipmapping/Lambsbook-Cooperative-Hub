========================================================================
AUTH-MIG-001
Authentication Migration Completion
STATUS: BEGIN
========================================================================

MISSION

Complete the migration of authentication authority from the legacy
Onboarding Gateway into the Main Application.

OBJECTIVE

The Main Application becomes the single constitutional authority for:

• Sign Up
• Sign In
• Forgot Password
• Password Reset
• Email Verification
• Invitation Acceptance
• Auth Callback
• Session Bootstrap
• Logout

The legacy Onboarding Gateway becomes obsolete.

INSPECTION SCOPE

Inspect and inventory ONLY.

Do NOT mutate repository code yet.

CAPTURE

1. Every authentication route.
2. Every authentication page.
3. Every authentication API endpoint.
4. Every Supabase auth integration.
5. Every callback handler.
6. Every environment variable required.
7. Every secret required.
8. Every redirect URL required.
9. Every remaining dependency on onboarding-gateway.

DELIVERABLE

AUTH-MIG-001-MIGRATION-INVENTORY.md

No code mutation is authorized until the inventory is certified.

========================================================================
END
========================================================================
