# APP-COM-EXEC-001 — Implementation Context Manifest

## Implementation Authority

APP-COM-EXEC-001

## Outcome

APP-COM-EXEC-001 Communication Runtime materialization.

The execution outcome is bounded to establishing:
- APP-COM-001 CommunicationRecord persistence.
- APP-COM-004 immutable `trace_id` creation and propagation.
- Preservation of existing notification behavior.

## Execution Infrastructure

APP-EXEC-002A / certified Builder v1.2.

## Repository

Lambsbook Main Application Repository

## Repository Root

Repository root containing this manifest.

## Baseline

87beb2692cd2f55a2b8f22d1bbd02052a8052c1c

The baseline is immutable for this execution context. A baseline contradiction is a stop condition.

## Production Mutation / Creation Surface

Only these repository paths are authorized for production mutation or creation:

- `server/services/notifications.ts`
- `server/storage.ts`
- `shared/schema.ts`

No other production path is authorized by this manifest.

## Protected Surface

Everything outside the three explicitly authorized production paths is protected.

This includes, without limitation:
- client/UI surfaces;
- unrelated server routes and services;
- `server/messaging/interface.ts`;
- `server/integrations/zalo/adapter.ts`;
- unrelated database/schema surfaces;
- authentication, membership, invitation, navigation, and business-rule surfaces;
- concurrent work-in-progress;
- governance and execution-control artifacts except where explicitly required by this execution context.

## Existing Candidate Implementation

Prior Claude/Builder implementation material, where present in the repository, is candidate material for inspection, reconciliation, and reuse only.

Its existence does not establish correctness or authority.

The execution must not:
- recreate an implementation from memory;
- assume historical material is correct merely because it exists;
- discard or overwrite unrelated work;
- silently replace candidate material with a new architecture.

## Required Technical Outcome

### APP-COM-001

Materialize CommunicationRecord persistence within the authorized three-file mutation surface and conform to the established APP-COM-001 CommunicationRecord contract.

### APP-COM-004

Create one immutable `trace_id` and propagate that same identifier through the Communication Runtime execution path.

Trace creation shall use repository-supported native Node `crypto.randomUUID()` capability where required.

No replacement or secondary trace identifier is authorized.

## Implementation Context

The complete production mutation corridor is:

- `server/services/notifications.ts`
- `server/storage.ts`
- `shared/schema.ts`

These are the only production files included in the implementation context for mutation.

The implementation must reconcile the above files with the already-established APP-COM authority contracts and execution session before mutation.

## Required Authority Context

The implementation is governed by the existing APP-COM authority chain:

- APP-COM-001 CommunicationRecord persistence contract and boundary.
- APP-COM-002 dispatch boundary and dispatch-decision contract.
- APP-COM-003 resolution boundary and communication-resolution contract.
- APP-COM-004 CommunicationExecutionTrace contract and execution-trace boundary.
- APP-COM-EXEC-001 Communication Runtime Execution Session.

These artifacts provide normative requirements; this manifest does not replace or expand them.

## Recovery Boundary

STOP before production mutation if repository truth demonstrates that an additional production path is technically indispensable.

Return:
1. the exact additional repository-relative path;
2. the technical reason it is indispensable;
3. the repository evidence establishing that fact;
4. the APP-COM requirement that cannot otherwise be satisfied.

Do not infer, silently add, or expand the mutation surface.

## Certification

Repository Stewardship independently certifies repository and release compliance.

## Acceptance

Main App / Founder provides Founder Acceptance.

Authorization, validation, certification, and acceptance remain independent states.

## Builder Rule

Builder/Implementation Agent shall execute only within the authorized mutation surface above.

The manifest is execution context, not new normative authority.

Builder execution shall stop on any contradiction between this manifest and repository truth rather than resolving the contradiction by expanding authority.

## Out of Scope

The following remain outside this execution:
- retry-engine implementation;
- scheduling;
- multi-provider failover;
- commercial policy;
- monitoring dashboards;
- administrative UI;
- notification UI changes;
- Zalo/provider adapter modification;
- unrelated authentication, membership, invitation, navigation, or business-rule changes;
- deployment authorization;
- repository-wide cleanup or synchronization.

## Acceptance Evidence

Successful execution must establish evidence for:
- CommunicationRecord persistence;
- immutable `trace_id` creation;
- end-to-end `trace_id` propagation;
- preservation of existing notification behavior;
- applicable build/type/runtime validation;
- mutation confined to the authorized three-file surface;
- ending repository state suitable for independent Repository Stewardship certification.
