# FAB-ZALO-FOUNDATION-003A
## Founder Implementation Authority

### Mission
Materialize the minimum Zalo Integration Foundation required for webhook verification and OAuth callback registration.

### Authorized Mutation
Only the following changes are authorized:

1. Create:
   - server/integrations/zalo/webhook.ts
   - server/integrations/zalo/oauth.ts

2. Modify only:
   - server/routes.ts

### Required Routes
POST /api/integrations/zalo/webhook

GET /api/integrations/zalo/oauth/callback

### Webhook Handler
- Return HTTP 200
- Return JSON:
  {
    "success": true
  }
- No database access
- No Supabase
- No outbound API calls
- No signature verification (future phase)

### OAuth Callback Handler
- Read query parameters:
  - code
  - state
- Log receipt
- Return HTTP 200
- Do NOT exchange tokens

### Acceptance Criteria
After implementation:

- server/integrations/zalo/webhook.ts exists
- server/integrations/zalo/oauth.ts exists
- server/routes.ts registers both endpoints
- npm run build succeeds

### Explicitly Out of Scope
- OAuth token exchange
- Zalo API integration
- Database mutations
- Growth Engine integration
- Authentication changes
- Refactoring
