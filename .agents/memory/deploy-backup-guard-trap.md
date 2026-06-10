---
name: Deploy fails on .bak files in runtime roots
description: Why "deployment build failed to publish" recurs even though backups are gitignored
---

# Deploy build fails on backup artifacts in runtime roots

`npm run build` runs `prebuild` → `guard:all`, whose last step
`scripts/runtime-guards/detect-runtime-backups.cjs` walks the runtime roots
`client/src`, `server`, `scripts`, `shared` and calls `process.exit(1)` if ANY
file name contains `.bak`, `.backup`, `.phase`, or `.before_`. A non-zero exit
aborts the prebuild chain before `vite build`/esbuild ever run, so the
deployment build fails and the previous artifact stays live.

**Why it recurs:** these backup files ARE correctly gitignored (`*.bak*`,
`*.before_*`, `runtime-convergence-phase*/` in `.gitignore`; `git ls-files`
shows zero tracked). But the deploy build runs the guard against the **live
workspace filesystem**, not the git tree — gitignore does not protect it.
Any cleanup/mutation pass that edits `member.ts`, `routes.ts`, or
`MemberHub.tsx` drops fresh `.bak*` siblings, and the next publish dies on them.

**Immediate fix:** `rm` the offending files in the runtime roots, then
`npm run build` is green again.

**Durable fix (proposed, not yet applied):** make the guard self-healing —
delete the matching files and exit 0 — since deleting them fully satisfies the
guard's "don't ship backups" intent. Alternative: an `rm` step in
`scripts/build-server.mjs` before the guard runs.

**How to apply:** when the user reports "deployment build failed to publish,"
reproduce locally with `npm run build`; if it stops after
"=== RUNTIME BACKUP FILES ===" with a non-zero count, this is the cause.
