======================================================================
FIP-001
APP-REC-003
Password Recovery Corridor Mutation
STATUS: BEGIN
======================================================================

MISSION

Repair the Supabase password recovery lifecycle.

CERTIFIED FRACTURE

The repository already contains:

- ResetPassword.tsx
- /auth/reset
- backend password update endpoint

However, the application does not establish a valid recovery session
before rendering the reset page.

MUTATION SCOPE

ONLY inspect and modify:

client/src/pages/ResetPassword.tsx

client/src/App.tsx

client/src/pages/AuthCallback.tsx (only if required)

DO NOT MODIFY

- database
- Supabase schema
- RLS
- member lifecycle
- invitation flow
- dashboard

IMPLEMENTATION GOALS

1. Verify ResetPassword.tsx correctly parses both hash and query
   parameters.

2. Verify it establishes the recovery session using the current
   Supabase client before allowing password submission.

3. Verify successful password submission redirects to login.

4. Verify expired or invalid recovery tokens display a controlled
   error instead of silently continuing.

SUCCESS CRITERIA

Forgot Password

↓

Email

↓

Click Recovery Link

↓

/auth/reset

↓

Enter New Password

↓

Password Updated

↓

Redirect to Login

======================================================================
END
======================================================================
