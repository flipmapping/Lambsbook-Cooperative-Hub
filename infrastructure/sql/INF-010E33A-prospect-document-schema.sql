-- ==========================================================
-- INF-010E33A
-- Prospect Document Management Infrastructure
--
-- Status:
-- DERIVED FROM VERIFIED REPOSITORY TRUTH
--
-- Derived From:
--   FDR-010E33
--
-- Repository Truth:
--   growth.prospects
--   growth.prospect_lifecycle_events
--   growth.prospect_activities
--   growth.prospect_followup_tasks
--   growth.prospect_appointments
--
-- Verified Gap:
--   No canonical prospect document infrastructure exists.
-- ==========================================================

CREATE TABLE IF NOT EXISTS growth.prospect_documents (

    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    prospect_id uuid NOT NULL
        REFERENCES growth.prospects(id)
        ON DELETE CASCADE,

    document_type text NOT NULL,

    title text NOT NULL,

    description text,

    file_name text NOT NULL,

    mime_type text,

    storage_path text,

    file_size_bytes bigint,

    status text NOT NULL DEFAULT 'pending',

    uploaded_by uuid,

    uploaded_at timestamptz NOT NULL DEFAULT now(),

    created_at timestamptz NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS
idx_prospect_documents_prospect
ON growth.prospect_documents
(
    prospect_id,
    created_at
);

COMMENT ON TABLE growth.prospect_documents IS
'INF-010E33A: Canonical prospect document metadata infrastructure.';
