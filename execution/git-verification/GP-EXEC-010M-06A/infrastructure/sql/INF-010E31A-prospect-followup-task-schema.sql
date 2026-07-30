-- ==========================================================
-- INF-010E31A
-- Prospect Follow-up Task Infrastructure
--
-- Status:
-- DERIVED FROM VERIFIED REPOSITORY TRUTH
--
-- Derived From:
-- FDR-010E31
--
-- Repository Truth:
--   growth.prospects
--   growth.prospect_lifecycle_events
--   growth.prospect_activities
--
-- Verified Gap:
--   No canonical follow-up task infrastructure exists.
-- ==========================================================

CREATE TABLE IF NOT EXISTS growth.prospect_followup_tasks (

    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    prospect_id uuid NOT NULL
        REFERENCES growth.prospects(id)
        ON DELETE CASCADE,

    title text NOT NULL,

    description text,

    assigned_to uuid,

    due_at timestamptz,

    status text NOT NULL DEFAULT 'pending',

    completed_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS
idx_prospect_followup_tasks_prospect
ON growth.prospect_followup_tasks
(
    prospect_id,
    created_at
);

COMMENT ON TABLE growth.prospect_followup_tasks IS
'INF-010E31A: Canonical immutable follow-up task infrastructure.';
