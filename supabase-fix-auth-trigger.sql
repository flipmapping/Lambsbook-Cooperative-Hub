-- ============================================================
-- FIX FOR SUPABASE AUTH TRIGGER ISSUE
-- ============================================================
-- The auth.users trigger is failing because it's trying to insert
-- into user_statuses without proper permissions.
-- 
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================================

-- OPTION 1: Disable the problematic trigger (recommended if you don't need user_statuses)
-- ============================================================

-- First, find all triggers on auth.users
SELECT 
    tgname AS trigger_name,
    tgrelid::regclass AS table_name,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- To disable a specific trigger (replace 'trigger_name' with actual name):
-- ALTER TABLE auth.users DISABLE TRIGGER trigger_name;

-- To drop the trigger entirely:
-- DROP TRIGGER IF EXISTS trigger_name ON auth.users;

-- ============================================================
-- OPTION 2: Fix the user_statuses table permissions
-- ============================================================

-- If you need the user_statuses table, ensure it exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant necessary permissions to the service role
GRANT ALL ON public.user_statuses TO service_role;
GRANT ALL ON public.user_statuses TO postgres;

-- Enable RLS but allow service_role to bypass
ALTER TABLE public.user_statuses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service_role to insert
CREATE POLICY "Service role can manage user_statuses" ON public.user_statuses
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- OPTION 3: Fix the trigger function to handle errors gracefully
-- ============================================================

-- Replace the existing trigger function with a safer version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Safely insert into user_statuses, ignoring errors
    BEGIN
        INSERT INTO public.user_statuses (user_id, status)
        VALUES (NEW.id, 'active')
        ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- Log but don't fail the signup
        RAISE WARNING 'Could not create user_status for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- ============================================================
-- RECOMMENDED QUICK FIX: Disable all triggers on auth.users
-- ============================================================
-- Run this to temporarily disable ALL triggers to confirm it's the issue:

-- ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- After testing, you can re-enable specific triggers:
-- ALTER TABLE auth.users ENABLE TRIGGER ALL;

-- ============================================================
-- DIAGNOSTIC QUERIES
-- ============================================================

-- Check if user_statuses table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_statuses'
) as user_statuses_exists;

-- Check user_statuses permissions
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'user_statuses';

-- List all triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- Check recent auth logs (if available in your Supabase plan)
-- Go to: Dashboard > Authentication > Logs
