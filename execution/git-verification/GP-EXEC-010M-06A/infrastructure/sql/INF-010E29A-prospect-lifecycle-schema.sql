-- ==========================================================
-- INF-010E29A
-- Prospect Lifecycle Infrastructure
--
-- Status:
-- DERIVED FROM VERIFIED REPOSITORY TRUTH
--
-- Purpose
--
-- Establish immutable lifecycle history for prospects.
--
-- Derived From
--
-- FDR-010E29
--
-- Repository Truth
--
-- growth.prospects
-- growth.prospect_journeys
--
-- Verified Gap
--
-- No append-only lifecycle history exists.
--
-- ==========================================================

CREATE TABLE IF NOT EXISTS growth.prospect_lifecycle_events (

    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    prospect_id uuid NOT NULL
        REFERENCES growth.prospects(id)
        ON DELETE CASCADE,

    from_stage text,

    to_stage text NOT NULL,

    recorded_at timestamptz NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS
idx_prospect_lifecycle_events_prospect
ON growth.prospect_lifecycle_events
(
    prospect_id,
    recorded_at
);
