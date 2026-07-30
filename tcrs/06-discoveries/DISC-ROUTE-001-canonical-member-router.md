# DISC-ROUTE-001 — Canonical Member Router

Status: Certified

## Certified Finding

The canonical runtime authority for all `/api/member/*` endpoints is:

    server/routes/member.ts

This router is mounted from:

    server/routes.ts

using:

    app.use("/api/member", memberRoutes);

## Historical Surface

The file:

    server/routes.ts

contains a historical implementation beginning with:

    PHASE 1 CONTAINMENT — HUB MEMBER ROUTES DISABLED

including the historical endpoint:

    /api/hub/member/accept-invitation

This implementation is inside a commented containment block and is **not**
part of the active runtime request path.

## APP-REC Execution Authority

Effective immediately:

- Treat `server/routes/member.ts` as the sole implementation authority for
  `/api/member/*`.

- Ignore the historical hub implementation unless a future certified truth
  explicitly supersedes this certification.

## Certification Reason

This certification establishes a single canonical HTTP authority for member
endpoints and prevents duplicated repository inspections across execution
streams.
