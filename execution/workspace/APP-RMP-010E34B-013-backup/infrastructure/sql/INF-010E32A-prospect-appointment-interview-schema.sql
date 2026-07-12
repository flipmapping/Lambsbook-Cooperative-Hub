-- ==========================================================
-- INF-010E32A
-- Prospect Appointment & Interview Infrastructure
--
-- Status:
-- DERIVED FROM VERIFIED REPOSITORY TRUTH
--
-- Derived From:
-- FDR-010E32
--
-- Repository Truth:
--   growth.prospects
--   growth.prospect_lifecycle_events
--   growth.prospect_activities
--   growth.prospect_followup_tasks
--
-- Verified Gap:
--   No canonical appointment/interview infrastructure exists.
-- ==========================================================

CREATE TABLE IF NOT EXISTS growth.prospect_appointments (

    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    prospect_id uuid NOT NULL
        REFERENCES growth.prospects(id)
        ON DELETE CASCADE,

    appointment_type text NOT NULL,

    title text NOT NULL,

    description text,

    scheduled_at timestamptz NOT NULL,

    duration_minutes integer,

    location text,

    meeting_url text,

    assigned_to uuid,

    status text NOT NULL DEFAULT 'scheduled',

    outcome text,

    completed_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS
idx_prospect_appointments_prospect
ON growth.prospect_appointments
(
    prospect_id,
    scheduled_at
);

COMMENT ON TABLE growth.prospect_appointments IS
'INF-010E32A: Canonical prospect appointment and interview scheduling infrastructure.';
