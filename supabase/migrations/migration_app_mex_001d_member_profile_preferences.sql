-- =============================================================================
-- Migration: APP-MEX-001D — Member Profile Preferences
-- =============================================================================
-- Adds three columns to meh.members for backend-backed profile persistence.
-- Matches the updateMember() DAL pattern: JSON column for structured data,
-- text for simple scalars.
-- =============================================================================

-- avatar_reference: stores a reference key or URL to the uploaded image,
-- not the image data itself. Frontend stores the data URL in localStorage
-- as a compatibility fallback when this is null.
alter table meh.members
  add column if not exists avatar_reference   text         default null,

-- profile_visibility: the certified two-value preference ('private'|'public').
-- Default 'private' matches the frontend default.
  add column if not exists profile_visibility text         not null default 'private'
    check (profile_visibility in ('private', 'public')),

-- contact_methods: up to two preferred messenger contact methods.
-- Stored as JSONB array: [{ "id": "...", "platform": "WhatsApp", "handle": "..." }]
-- The handle is stored server-side; the frontend public preview never exposes it.
  add column if not exists contact_methods    jsonb        not null default '[]'::jsonb;

-- Simple check: contact_methods must be a JSON array
alter table meh.members
  add constraint if not exists chk_contact_methods_is_array
    check (jsonb_typeof(contact_methods) = 'array');

comment on column meh.members.avatar_reference is
  'APP-MEX-001D: Reference key or URL for the member profile avatar.';
comment on column meh.members.profile_visibility is
  'APP-MEX-001D: Profile visibility preference. Values: private | public. Default: private.';
comment on column meh.members.contact_methods is
  'APP-MEX-001D: Preferred contact methods (max 2). Array of {id, platform, handle}.';
