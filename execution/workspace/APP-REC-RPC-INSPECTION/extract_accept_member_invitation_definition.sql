-- APP-REC Repository Truth Closure
-- Execute against the LIVE Supabase database.

SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n
  ON n.oid = p.pronamespace
WHERE p.proname = 'accept_member_invitation';
