-- =============================================================================
-- COMMUNITY-COMMUNICATION-001 — Canonical Community Communication Capability
-- =============================================================================
-- Authority:
--   COMMUNITY-MEMBERSHIP-001 = CANONICAL COMMUNITY AUTHORITY
--   COMMUNITY-COMMUNICATION-001 = AUTHORIZED
--
-- Scope:
--   Optional external communication capability for every canonical Community.
--
-- Matrix/Element is the Phase-1 communication provider.
-- Lambsbook remains authoritative for Community identity and membership.
--
-- Explicitly excluded:
--   Matrix room creation
--   Matrix messaging/provider implementation
--   Matrix account provisioning
--   Matrix membership synchronization
--   Element UI
--   Matrix credentials
-- =============================================================================

alter table meh.communities
  add column matrix_room_id text;

comment on column meh.communities.matrix_room_id is
  'COMMUNITY-COMMUNICATION-001: optional authoritative external Matrix room identifier for this Community.';
