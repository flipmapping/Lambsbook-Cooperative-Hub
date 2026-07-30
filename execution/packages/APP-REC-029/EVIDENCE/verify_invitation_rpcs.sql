SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE p.proname IN (
    'materialize_member_invitation_from_link',
    'accept_member_invitation'
)
ORDER BY 1,2;
