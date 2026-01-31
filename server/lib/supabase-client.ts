import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('[Supabase] SUPABASE_URL not configured');
}

if (!supabaseServiceRoleKey) {
  console.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY not configured - backend operations will be disabled');
}

let supabaseAdmin: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('[Supabase] Admin client initialized with service role key');
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  }
  return supabaseAdmin;
}

export function isSupabaseConfigured(): boolean {
  return supabaseAdmin !== null;
}
