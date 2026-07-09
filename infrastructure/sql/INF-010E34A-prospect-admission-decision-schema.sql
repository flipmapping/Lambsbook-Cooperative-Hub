-- ==========================================================
-- INF-010E34A
-- Prospect Admission Decision Infrastructure
--
-- Status:
-- DERIVED FROM VERIFIED REPOSITORY TRUTH
--
-- Derived From:
--   FDR-010E34
--
-- Repository Truth:
--   growth.prospects
--   growth.prospect_lifecycle_events
--   growth.prospect_activities
--   growth.prospect_followup_tasks
--   growth.prospect_appointments
--   growth.prospect_documents
--
-- Verified Gap:
--   No canonical prospect admission decision infrastructure exists.
-- ==========================================================

CREATE TABLE IF NOT EXISTS growth.prospect_admission_decisions (

    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    prospect_id uuid NOT NULL
        REFERENCES growth.prospects(id)
        ON DELETE CASCADE,

    decision text NOT NULL,

    rationale text,

    decided_by uuid,

    decided_at timestamptz NOT NULL DEFAULT now(),

    offer_ready boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS
idx_prospect_admission_decisions_prospect
ON growth.prospect_admission_decisions
(
    prospect_id,
    decided_at
);

COMMENT ON TABLE growth.prospect_admission_decisions IS
'INF-010E34A: Canonical prospect admission decision infrastructure.';
