-- COMMUNITY-LOCATION-001
-- Community-owned geographic location for MVP.
-- Location is intentionally represented directly on meh.communities.
-- No external geographic master-data authority or foreign keys are introduced.

alter table meh.communities
  add column country text,
  add column state_province text,
  add column city text,
  add column district_area text,
  add column goal text,
  add column description text,
  add column category text,
  add column audience text,
  add column cover_image_url text;

comment on column meh.communities.country is
  'COMMUNITY-LOCATION-001: country in which the Community is geographically based.';

comment on column meh.communities.state_province is
  'COMMUNITY-LOCATION-001: state or province within the Community country, when applicable.';

comment on column meh.communities.city is
  'COMMUNITY-LOCATION-001: city in which the Community is geographically based.';

comment on column meh.communities.district_area is
  'COMMUNITY-LOCATION-001: district or local area within the Community city, when applicable.';
