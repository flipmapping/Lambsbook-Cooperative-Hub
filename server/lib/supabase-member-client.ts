import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('[Supabase Member] SUPABASE_URL not configured');
}

if (!supabaseAnonKey) {
  console.warn('[Supabase Member] SUPABASE_ANON_KEY not configured - member operations will be disabled');
}

let supabaseMember: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseMember = createClient(supabaseUrl, supabaseAnonKey);
  console.log('[Supabase Member] Client initialized with anon key');
}

export function getSupabaseMember(): SupabaseClient {
  if (!supabaseMember) {
    throw new Error('Supabase member client not configured. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.');
  }
  return supabaseMember;
}

export function isSupabaseMemberConfigured(): boolean {
  return supabaseMember !== null;
}

export function createAuthenticatedClient(accessToken: string, schema?: string): SupabaseClient<any, any, any> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase not configured');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: schema || 'public' },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
