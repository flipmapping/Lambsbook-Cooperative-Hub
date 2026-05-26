# Replit Runtime Environment — Canonical Setup

## Runtime Truth
- Node may detach → reinstall via Replit prompt
- runtime-guard.sh is REQUIRED
- Preview is abandoned (non-blocking)

## Execution Model
npm run dev → runtime-guard → backend → port 5000

## Testing Model
- curl + logs = source of truth
- UI is secondary validation layer

## URL Truth
- Replit + custom domain → deployed backend
- NOT connected to local dev runtime

## Recovery Protocol
If node missing:
→ trigger install prompt → accept

DO NOT:
- use nix develop
- modify runtime config
- reinstall manually

## Dev vs Deploy Separation
Dev:
  localhost:5000

Deploy:
  production domain

Never mix the two.

