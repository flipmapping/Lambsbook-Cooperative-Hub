import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL as string
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables are not properly configured.')
}

/**
 * Creates a Supabase client bound to the user's JWT.
 * This client respects RLS policies.
 */
export function getUserClient(jwt: string): SupabaseClient {
  if (!jwt) {
    throw new Error('Missing JWT for user client.')
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Internal-only service client.
 * Bypasses RLS. Must NEVER be exposed to route handlers directly.
 */
function createServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Service client accessor.
 * This should ONLY be used inside controlled DAL modules,
 * never inside Express route files.
 */
export function getServiceClient(): SupabaseClient {
  return createServiceClient()
}
