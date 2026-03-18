import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function assertSupabaseEnvForUserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase user client is not properly configured. Missing SUPABASE_URL or SUPABASE_ANON_KEY."
    );
  }
}

function assertSupabaseEnvForServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase service client is not properly configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}

/**
 * Creates a Supabase client bound to the user's JWT.
 * This client respects RLS policies.
 */
export function getUserClient(jwt: string): SupabaseClient {
  if (!jwt) {
    throw new Error("Missing JWT for user client.");
  }

  assertSupabaseEnvForUserClient();

  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Internal-only service client.
 * Bypasses RLS. Must NEVER be exposed to route handlers directly.
 */
function createServiceClient(): SupabaseClient {
  assertSupabaseEnvForServiceClient();

  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Service client accessor.
 * This should ONLY be used inside controlled DAL modules,
 * never inside Express route files.
 */
export function getServiceClient(): SupabaseClient {
  return createServiceClient();
}

/**
 * Non-throwing diagnostics helper.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_ANON_KEY);
}