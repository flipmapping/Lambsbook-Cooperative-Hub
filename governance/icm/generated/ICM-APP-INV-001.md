# ICM — APP-INV-001

## Authority

APP-INV-001

## Production Surface

Invitation + Relationship Surface

## Mission

Restore the complete canonical invitation and relationship journey as one governed
production surface. The implementation agent must inspect the full authentication,
identity, membership, invitation, dashboard, and relationship dependency corridor
before making the minimum necessary mutations.

## Repository Mutation Corridor

Claude may mutate only the following production surfaces:

client/src/pages/dashboard/InvitationAcceptancePage.tsx
client/src/pages/HubAuth.tsx
client/src/pages/HubAuthCallback.tsx
client/src/App.tsx
web/src/components/dashboard/RelationshipTrustSection.tsx
server/routes/member.ts
server/routes.ts
server/services/supabase-hub.ts

## Authentication And Identity Inspection Context

client/src/pages/HubAuth.tsx
client/src/pages/HubAuthCallback.tsx
client/src/lib/auth/PostAuthenticationContinuation.ts
client/src/lib/auth/NavigationConsumptionAuthority.ts
client/src/lib/auth/RuntimeNavigationPolicy.ts
server/routes.ts
server/services/supabase-hub.ts
server/services/supabase-auth.ts
server/middleware/attachUserContext.ts
server/types/requestContext.ts

## Invitation Inspection Context

client/src/pages/dashboard/InvitationAcceptancePage.tsx
client/src/pages/HubAuth.tsx
client/src/App.tsx
server/routes/member.ts
server/services/supabase-hub.ts

Required invitation endpoints:

GET /api/member/pending-invitation
POST /api/member/onboarding/materialize-invitation
POST /api/member/accept-invitation

Invitation acceptance remains the canonical membership creation path.

## Membership And Dashboard Inspection Context

client/src/pages/dashboard/InvitationAcceptancePage.tsx
server/routes/member.ts
server/middleware/attachUserContext.ts

Canonical identity must resolve before membership/dashboard state is published.

## Relationship Inspection Context

web/src/components/dashboard/RelationshipTrustSection.tsx
server/routes/member.ts

Required relationship endpoint:

GET /api/member/trusted-relationships

The existing trusted-relationship authority must be reused. Do not create a
second relationship model or relationship authority.

## Routing Inspection Context

client/src/App.tsx
client/src/pages/HubAuth.tsx
client/src/pages/HubAuthCallback.tsx
client/src/lib/auth/PostAuthenticationContinuation.ts
client/src/lib/auth/NavigationConsumptionAuthority.ts
client/src/lib/auth/RuntimeNavigationPolicy.ts

## Authentication API Inspection Context

server/routes.ts
server/services/supabase-hub.ts
server/services/supabase-auth.ts

Required authentication paths:

POST /api/hub/auth/login
POST /api/hub/auth/signup

The implementation must preserve the existing authentication provider and session
model while repairing the invitation continuation corridor.

## Shared Contract Inspection Context

shared/schema.ts

Use only to understand existing repository contracts. Do not redesign unrelated
schema contracts.

## Governed Dependencies

### OS-MATRIX-001D

Existing Community authority owns the Community → Matrix contract:

community.id
→ nullable canonical matrix_room_id

matrix_room_url is derived presentation data unless persistence is independently
proven necessary.

Do not create a duplicate Community authority.
Do not implement Matrix provider functionality.
Do not modify OS files.

### Existing Canonical Authorities

- Canonical authentication/session handling
- attachUserContext identity resolution
- canonical membership authority
- canonical invitation acceptance path
- existing trusted-relationship authority
- existing Member Dashboard

## Required Journey

Invitation URL
→ signup continuation
→ account creation
→ authentication/session
→ canonical identity
→ invitation materialization/continuation
→ invitation acceptance
→ Member Dashboard invitation state
→ Relationship tab

## Required Behaviour

1. A fresh invitation URL must preserve its invitation token into signup.
2. A new invitee must be able to create an account from that invitation.
3. Authentication must succeed with the newly created account.
4. The invitation token must survive the authentication continuation.
5. Invitation materialization must occur only in an authenticated identity context.
6. Existing-member and new-invitee cases must not be conflated.
7. Invitation acceptance must resolve the correct invitation for the authenticated user.
8. Successful acceptance must enter the canonical membership path.
9. Member Dashboard must expose the resulting invitation state.
10. Relationship tab must consume the existing trusted-relationship surface.
11. Existing authenticated-member behaviour must remain intact.
12. No stale invitation token may contaminate later authentication sessions.

## Mutation Rules

- Mutate the minimum production files necessary.
- One bounded surface implementation, not feature-by-feature repairs.
- Preserve authentication and authorization semantics.
- Preserve RLS boundaries.
- Preserve canonical identity resolution.
- Preserve canonical membership authority.
- Do not create duplicate APIs or authorities.
- Do not weaken security checks.
- Do not redesign the database.
- Do not implement Matrix infrastructure.
- Do not perform unrelated cleanup.

## Required Runtime Evidence

Fresh invitation:

Invitation URL

Signup:

/hub/signup?invite=<token>

Authentication:

POST /api/hub/auth/signup
POST /api/hub/auth/login

Identity:

GET /api/member/me

Invitation:

GET /api/member/pending-invitation
POST /api/member/onboarding/materialize-invitation
POST /api/member/accept-invitation

Relationship:

GET /api/member/trusted-relationships

Dashboard:

Member Dashboard invitation state

Relationship:

Relationship tab rendered from canonical relationship data

## Required Acceptance Evidence

- Fresh invitation URL
- Signup continuation
- New account creation
- Successful authentication/session
- Canonical identity
- Invitation materialization
- Invitation acceptance
- Member Dashboard invitation state
- Trusted relationship API response
- Relationship tab state
- Authenticated API response
- Build result
- Production-browser result

## Out Of Scope

- Matrix provider implementation
- Matrix credentials
- Duplicate Community authority
- Duplicate invitation authority
- Duplicate relationship authority
- Database redesign
- RLS changes
- Authentication-provider replacement
- Unrelated UI or backend cleanup

## Implementation Context

client/src/pages/dashboard/InvitationAcceptancePage.tsx
client/src/pages/HubAuth.tsx
client/src/pages/HubAuthCallback.tsx
client/src/App.tsx
web/src/components/dashboard/RelationshipTrustSection.tsx
client/src/lib/auth/PostAuthenticationContinuation.ts
client/src/lib/auth/NavigationConsumptionAuthority.ts
client/src/lib/auth/RuntimeNavigationPolicy.ts
server/routes/member.ts
server/routes.ts
server/services/supabase-hub.ts
server/services/supabase-auth.ts
server/middleware/attachUserContext.ts
server/types/requestContext.ts
shared/schema.ts

Builder Rule

The listed files constitute the complete implementation inspection context for
APP-INV-001. Claude may mutate only the Repository Mutation Corridor declared
above. All other listed files are inspection context unless independently
authorized by the implementation contract.
