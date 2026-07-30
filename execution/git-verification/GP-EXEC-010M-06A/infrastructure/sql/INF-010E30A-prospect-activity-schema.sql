-- ==========================================================
-- INF-010E30A
-- Prospect Activity Infrastructure
--
-- Status:
-- DERIVED FROM VERIFIED REPOSITORY TRUTH
--
-- Derived From:
-- FDR-010E30
--
-- Repository Truth:
--   growth.prospects
--   growth.prospect_lifecycle_events
--
-- Verified Gap:
--   No immutable prospect activity infrastructure exists.
--
-- ==========================================================

CREATE TABLE IF NOT EXISTS growth.prospect_activities (

    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    prospect_id uuid NOT NULL
        REFERENCES growth.prospects(id)
        ON DELETE CASCADE,

    activity_type text NOT NULL,

    subject text NOT NULL,

    notes text,

    performed_by uuid,

    occurred_at timestamptz NOT NULL DEFAULT now(),

    created_at timestamptz NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS
idx_prospect_activities_prospect
ON growth.prospect_activities
(
    prospect_id,
    occurred_at
);

COMMENT ON TABLE growth.prospect_activities IS
'Immutable operational prospect interaction history established by INF-010E30A.';
