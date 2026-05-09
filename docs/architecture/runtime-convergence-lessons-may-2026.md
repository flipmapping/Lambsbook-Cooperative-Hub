# Runtime Convergence Lessons — May 2026

## Canonical Runtime Ownership

Canonical runtime topology:

Replit Preview / Deployment
→ npm start
→ NODE_ENV=production node dist/index.js
→ Express runtime
→ serveStatic(dist/public)
→ Vite-built SPA frontend

Removed non-canonical ownership:
- Next.js deployment ownership
- .next runtime ownership
- split frontend serving topology
- stale deployment metadata ownership
- dist/index.cjs ownership

---

## Canonical Build Pipeline

Canonical production build pipeline:

npm run build
=
1. vite build → dist/public
2. esbuild backend bundle → dist/index.js

Production frontend assets MUST exist at:
- dist/public/index.html
- dist/public/assets/*

Production runtime MUST NOT use live Vite middleware.

---

## ESM Deployment Convergence

Node20 + top-level await required migration from:
- CommonJS output
TO:
- ESM output

Canonical backend artifact:
- dist/index.js

Deprecated artifact:
- dist/index.cjs

Canonical package.json start:
NODE_ENV=production node dist/index.js

---

## Replit Deployment Ownership Doctrine

Canonical .replit deployment block:

[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "start"]

Critical lesson:
Replit deployment metadata snapshots can preserve stale runtime ownership independently from repository code.

Deployment UI/runtime ownership must always be verified explicitly.

---

## Supabase Node20 Websocket Doctrine

Node20 lacks native WebSocket support required by @supabase/realtime-js.

ALL ACTIVE createClient(...) ownership boundaries MUST inject:

realtime: {
  transport: ws,
}

AND:

import ws from "ws";

This applies across:
- service clients
- anon clients
- middleware clients
- member clients
- token-scoped clients
- authenticated scoped clients

Strategic doctrine:
Never assume a single Supabase client singleton.
Always inspect ALL createClient(...) ownership boundaries project-wide.

---

## Canonical Execution Lessons

1. Hidden topology duplication is a primary convergence risk.

2. Deployment ownership can diverge from repository ownership.

3. Replit deployment metadata may preserve stale runtime contracts.

4. Runtime stabilization must precede application-layer debugging.

5. Websocket/runtime compatibility must be verified across ALL client factories.

6. ESM/CJS boundaries are architecture-level ownership decisions.

7. Production serving must use prebuilt frontend assets.

8. End-to-end runtime proof is mandatory:
- deployment boot
- frontend render
- route render
- websocket stability
- production asset serving

---

## Current Stable System State

Verified stable:
- deployment boot
- websocket transport
- Express runtime
- production asset serving
- homepage rendering
- production build pipeline
- Node20 compatibility
- deployment ownership convergence

Current active debug surface:
- frontend route-level rendering failure
- /sign-in blank white page
- async frontend runtime exception:
  Uncaught (in promise) {}
