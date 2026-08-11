-- =============================================================================
-- COMMUNITY-MEMBERSHIP-001 — Canonical Community Membership Foundation
-- =============================================================================
-- Authority:
--   BAAAS-ARCH-002  = FROZEN / CERTIFIED
--   INV-ARCH-001    = APPROVED
--   COMMUNITY-MEMBERSHIP-001 = AUTHORIZED
--
-- Scope:
--   Canonical Community entity
--   Canonical Community Membership relationship
--
-- Explicitly excluded:
--   Community invitations
--   Invitation links / tokens
--   Notifications
--   Media / storage
--   Delivery adapters
--   Community / Trust / Contribution graphs
--   Cooperative membership mutation
--   Application/runtime mutation
--
-- Community membership is independent from cooperative membership.
-- meh.members remains the canonical cooperative membership authority.
-- =============================================================================

create table meh.communities (
  id uuid primary key default gen_random_uuid(),
  owner_member_id uuid not null
    references meh.members(id)
    on delete restrict,
  name text not null,
  description text,
  visibility text not null default 'private'
    check (visibility in ('public', 'private')),
  status text not null default 'active'
    check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table meh.community_memberships (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null
    references meh.communities(id)
    on delete cascade,
  member_id uuid not null
    references meh.members(id)
    on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (community_id, member_id)
);

create index idx_communities_owner_member_id
  on meh.communities(owner_member_id);

create index idx_communities_visibility_status
  on meh.communities(visibility, status);

create index idx_community_memberships_member_id
  on meh.community_memberships(member_id);

create index idx_community_memberships_community_id
  on meh.community_memberships(community_id);

alter table meh.communities enable row level security;

alter table meh.community_memberships enable row level security;

comment on table meh.communities is
  'COMMUNITY-MEMBERSHIP-001: canonical Community entity independent of cooperative membership.';

comment on table meh.community_memberships is
  'COMMUNITY-MEMBERSHIP-001: canonical relationship between a Community and meh.members.';

comment on column meh.communities.owner_member_id is
  'COMMUNITY-MEMBERSHIP-001: cooperative member identity holding Community ownership/administrative authority.';

comment on column meh.communities.visibility is
  'COMMUNITY-MEMBERSHIP-001: Community discoverability/admission policy: public or private.';

comment on column meh.communities.status is
  'COMMUNITY-MEMBERSHIP-001: Community lifecycle state: active or archived.';
