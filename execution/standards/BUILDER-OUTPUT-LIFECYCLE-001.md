# Builder Output Lifecycle and Qualification Standard

Status
------
Repository lifecycle standard materialized under REP-STEWARD-022-WCS-001.

## Purpose and authority

This standard defines repository labels and evidence for Builder outputs. It does
not change Builder v1.2 behavior, supersede its frozen operational qualification,
or authorize package cleanup.

PIC-001 states that the certified package is the execution contract consumed by
implementation engines. The active Builder contract and specifications describe
Builder inputs and process. This standard records their relationship for output
lifecycle purposes; it does not silently repeal or rewrite those documents.
Where their requirements conflict, record the conflict and obtain an explicit
authority decision before changing Builder behavior.

BOQ-001 certifies Builder v1.2 as frozen. Any Builder implementation change
requires a separate bounded authority.

## Lifecycle states

- **Generated:** output produced by a Builder run. Record the Builder identity and
  version, invocation evidence, source authority/input identities, timestamp,
  output path, and content hash.
- **Materialized:** an output persisted at a repository path. Record its source
  generated output or inputs, destination path, content hash, and manifest. A
  materialized artifact is not automatically qualified.
- **Qualified:** an artifact that passed its declared package profile. Record the
  profile, required-content results, integrity checks, validator result, and
  qualification timestamp. Missing evidence or a failed check means
  `NOT_QUALIFIED`.
- **Delivery candidate:** a qualified artifact registered for delivery with its
  path, hash, manifest, qualification record, and Builder lineage. A candidate
  label alone is not a certification or delivery approval.
- **Rejected:** an artifact that fails its declared profile. Preserve its
  evidence and do not represent it as qualified or delivery-ready.

## Allowed transitions

1. Builder output may be recorded as **Generated** only with run and input lineage.
2. A generated output may become **Materialized** when persisted with its path,
   integrity hash, manifest, and lineage.
3. Generated or materialized output may become **Qualified** only after a
   passing result against its declared package profile.
4. A qualified artifact may enter the **Delivery candidate** registry only when
   the registry references its passing qualification record and matching hash.
5. A failed or incomplete qualification remains `NOT_QUALIFIED` or becomes
   **Rejected**. Do not infer a pass from a filename, directory name, score, or
   matching hash.

## Minimum qualification and lineage record

A qualification record should identify the artifact and profile, source authority
and CIB (where applicable), Builder identity/version and run evidence, required
package contents, package manifest, archive and content hashes, validation result,
and any exceptions. For a package governed by PIC-001, check the required
`PACKAGE-MANIFEST.md`, `IMPLEMENT.md`, `Authorities/`, Repository Mutation
Corridor, and standard `CLAUDE.md` contents against the applicable approved
profile.

A delivery registry entry must point to the same artifact hash and a passing
qualification record. Ranking or scoring fields do not replace qualification.

## Identical content and retention

Identical hashes establish content identity only. They do not establish that two
paths have the same lifecycle role, owner, retention purpose, or external use.
Do not automatically collapse or remove generated and materialized copies. Keep
an identical pair under `REVIEW` until an authoritative lifecycle record explains
the roles and any retention decision.

Any deletion, movement, rename, or archive requires a separate itemized WCS and
authority.

## LEAP-002 case

The generated and materialized LEAP-002 archives are byte-identical. The generated
archive is recorded as `NOT_QUALIFIED`; the delivery entries have empty Builder
evidence and score zero; and the artifact classification leaves lifecycle
unresolved. The pair therefore remains `REVIEW`. See the REP-STEWARD-022 case
record. This standard authorizes no change to either archive.

## Change control

This is repository documentation. Amend it only through a reviewed, bounded WCS.
Builder runtime changes, package changes, and cleanup require their own explicit
authorities.
