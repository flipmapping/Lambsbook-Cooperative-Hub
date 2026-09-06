# APP-COM-EXEC-001 — Communication Runtime Builder Instruction Brief

Implementation Authority

APP-COM-EXEC-001

FPWM-001 FINAL BOUNDARY DETERMINATION:
BOUNDARY SUFFICIENT.

Execution infrastructure:
Certified Builder v1.2 under APP-EXEC-002A.

Immutable pre-mutation Truth Gate baseline:
87beb2692cd2f55a2b8f22d1bbd02052a8052c1c

## Execution Mode

Bounded Production Implementation Context generation.

Builder v1.2 SHALL materialize exactly one implementation package for
APP-COM-EXEC-001. Builder SHALL NOT mutate production repository surfaces.

## Purpose

Materialize the bounded implementation package required to implement the
Communication Runtime Foundation within the explicitly authorized
three-file production boundary.

The implementation target is:

1. APP-COM-001 CommunicationRecord persistence.
2. APP-COM-004 immutable trace_id creation and propagation.

## Source Authority

APP-COM-EXEC-001
APP-COM-IMP-001
APP-COM-IMP-001A
APP-COM-001
APP-COM-002
APP-COM-003
APP-COM-004
COMM-RUNTIME-WORKPACKAGE-001

FPWM-001 establishes that the three-file boundary is technically sufficient.

Node's existing native crypto.randomUUID() capability is sufficient for
trace_id creation. No additional production infrastructure or mutation
surface is authorized for UUID generation.

Repository

Lambsbook Main Application Repository

Required immutable execution baseline:

87beb2692cd2f55a2b8f22d1bbd02052a8052c1c

The Builder/Implementation Agent MUST preserve all concurrent unrelated WIP.

No reset, clean, stash, revert, overwrite, or destructive repository
operation is permitted.

Production Surface

server/services/notifications.ts; server/storage.ts; shared/schema.ts

### Authorized mutation / creation surface

Exactly:

- server/services/notifications.ts
- server/storage.ts
- shared/schema.ts

### Protected surface

Everything outside those three paths.

Explicitly protected includes:

- server/services/admissions.ts
- server/messaging/interface.ts
- server/integrations/zalo/adapter.ts
- client/UI surfaces
- unrelated models
- unrelated services
- unrelated routes
- authentication/membership/invitation authority
- concurrent unrelated WIP

No additional production path is authorized by this CIB.

Implementation Context Manifest

governance/icm/generated/ICM-APP-COM-EXEC-001.md

## Builder Instructions

Inspect the existing implementation on the authorized surfaces and reconcile
it with APP-COM-EXEC-001.

Prior Claude/Builder implementation material, if encountered, is candidate
material only. Reuse it only where technically valid against the source
authorities and current repository truth.

Do not recreate prior implementation from memory.

Do not infer additional business logic.

Do not introduce a parallel communication runtime.

Do not redesign provider architecture.

Do not modify Zalo/provider adapter surfaces.

Do not modify admissions callers merely because they invoke sendNotification().

### Required bounded outcome

Within the three authorized files:

- establish CommunicationRecord persistence consistent with APP-COM-001;
- create one immutable trace_id at the communication execution boundary;
- propagate that same trace_id through the notification operation;
- represent the trace-bearing persistence field through the applicable schema/type;
- preserve existing notification behavior.

The trace_id MUST NOT be regenerated or replaced during the operation.

The implementation MUST use the repository's existing native
crypto.randomUUID() capability rather than introducing new UUID infrastructure.

If the Builder determines that an additional production path is
indispensable, it MUST NOT create or modify that path. It MUST STOP and
return:

1. exact additional path;
2. technical reason it is indispensable;
3. exact APP-COM-EXEC-001 requirement that cannot otherwise be satisfied;
4. repository evidence supporting the determination.

## Expected Output

Exactly one Production Implementation Context (PIC) package suitable for
the subsequent Implementation Agent.

The package MUST contain sufficient bounded context to execute only within
the authorized three-file production surface and must preserve the
constraints and verification requirements in this CIB.

## Verification Plan

The eventual implementation must establish evidence for:

- Truth Gate / baseline integrity;
- exclusive mutation-surface compliance;
- CommunicationRecord persistence;
- one immutable trace_id created at the communication execution boundary;
- propagation of the same trace_id through the communication operation;
- preservation of existing notification behavior;
- applicable build/type/static validation;
- runtime persistence verification;
- runtime trace verification;
- complete implementation diff;
- ending Git SHA.

Founder Acceptance is required before operational baseline certification.

Repository Stewardship independently certifies repository/release state.

No deployment authority is granted by APP-COM-EXEC-001.

## Success Criteria

The bounded implementation package is successful only if it enables an
Implementation Agent to materialize the APP-COM-EXEC-001 outcome without
expanding the authorized production surface or inventing missing business
logic.

The three-file boundary remains absolute unless separately authorized.

