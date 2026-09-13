-- =============================================================================
-- APP-COM-EXEC-002 — Communication Runtime Persistence
-- =============================================================================
-- Establishes the six persistence surfaces required by the bounded
-- Communication Intent -> Resolution -> Dispatch -> CommunicationRecord
-- -> DeliveryAttempt -> ExecutionTrace corridor.
--
-- organization_id is intentionally nullable. NULL means that no canonical
-- application organization context is established/applicable.
--
-- No foreign keys, provider redesign, queue, retry, recovery subsystem,
-- or RLS policy is introduced by this migration.
-- =============================================================================

create table communication_intents (
  intent_id varchar primary key default gen_random_uuid(),
  trace_id varchar not null unique,
  organization_id text,
  recipient_id text not null,
  recipient_type text not null,
  invitation_id text not null,
  requested_language text not null,
  created_at timestamp not null default now()
);

create table communication_resolutions (
  resolution_id varchar primary key default gen_random_uuid(),
  intent_id text not null,
  trace_id text not null,
  organization_id text,
  communication_profile_id text,
  communication_policy_id text,
  template_key text not null,
  template_version text not null,
  resolved_channel text not null,
  resolved_provider text not null,
  resolved_language text not null,
  resolved_at timestamp not null default now()
);

create table communication_dispatches (
  dispatch_id varchar primary key default gen_random_uuid(),
  record_id text not null,
  resolution_id text not null,
  trace_id text not null,
  organization_id text,
  approved_channel text not null,
  approved_provider text not null,
  dispatch_after timestamp,
  priority integer not null default 0,
  decision_reason text,
  created_at timestamp not null default now()
);

create table communication_records (
  record_id varchar primary key default gen_random_uuid(),
  intent_id text not null,
  dispatch_id text not null,
  trace_id text not null,
  organization_id text,
  communication_profile_id text,
  template_key text not null,
  template_version text not null,
  selected_provider text not null,
  selected_channel text not null,
  runtime_status text not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table delivery_attempts (
  attempt_id varchar primary key default gen_random_uuid(),
  record_id text not null,
  trace_id text not null,
  selected_provider text not null,
  selected_channel text not null,
  status text not null,
  error text,
  attempted_at timestamp not null default now()
);

create table execution_traces (
  trace_id varchar primary key,
  intent_id text not null,
  resolution_id text not null,
  dispatch_id text not null,
  record_id text not null,
  delivery_attempt_ids text[] not null,
  organization_id text,
  created_at timestamp not null default now()
);
