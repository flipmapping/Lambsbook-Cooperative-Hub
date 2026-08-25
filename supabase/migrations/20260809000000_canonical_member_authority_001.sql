-- =============================================================================
-- CANONICAL-MEMBER-AUTHORITY-001 — Canonical Cooperative Member Foundation
-- =============================================================================
-- Authority:
--   Canonical cooperative membership authority required by the application,
--   Community Membership, Financial Authority, and Member Experience.
--
-- Scope:
--   Canonical meh schema
--   Canonical meh.members cooperative membership entity
--
-- Explicitly excluded:
--   Legacy public.members
--   Community membership relationships
--   Community invitations
--   Notifications
--   Financial entitlements
--   Application/runtime mutation
--
-- meh.members is the canonical cooperative membership authority.
-- =============================================================================

create schema if not exists meh;

create table meh.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  member_type text not null,
  membership_status text not null default 'free'
    check (membership_status in ('free', 'paid')),
  subscription_price_at_signup numeric,
  subscription_renewal_date timestamptz,
  join_date timestamptz not null default now(),
  last_activity_at timestamptz,
  activity_status text not null default 'active'
    check (activity_status in ('active', 'inactive')),
  invitor_id uuid
    references meh.members(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_members_invitor_id
  on meh.members(invitor_id);

create index idx_members_membership_status
  on meh.members(membership_status);

create index idx_members_activity_status
  on meh.members(activity_status);

comment on table meh.members is
  'CANONICAL-MEMBER-AUTHORITY-001: canonical cooperative membership authority.';

comment on column meh.members.user_id is
  'CANONICAL-MEMBER-AUTHORITY-001: authenticated application user identity associated with the cooperative member.';

comment on column meh.members.member_type is
  'CANONICAL-MEMBER-AUTHORITY-001: canonical cooperative member type.';

comment on column meh.members.membership_status is
  'CANONICAL-MEMBER-AUTHORITY-001: cooperative membership tier: free or paid.';

comment on column meh.members.invitor_id is
  'CANONICAL-MEMBER-AUTHORITY-001: direct canonical member relationship identifying the member who invited this member.';
