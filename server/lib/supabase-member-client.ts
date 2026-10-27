import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from "ws";
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  console.warn('[Supabase Member] SUPABASE_URL not configured');
}

if (!supabasePublishableKey) {
  console.warn('[Supabase Member] SUPABASE_PUBLISHABLE_KEY not configured - member operations will be disabled');
}

let supabaseMember: SupabaseClient | null = null;

if (supabaseUrl && supabasePublishableKey) {
  supabaseMember = createClient(supabaseUrl, supabasePublishableKey, {
    realtime: {
      transport: ws as unknown as WebSocketLikeConstructor,
    },
  });
}

export function getSupabaseMember(): SupabaseClient {
  if (!supabaseMember) {
    throw new Error('Supabase member client not configured. Ensure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are set.');
  }
  return supabaseMember;
}

export function isSupabaseMemberConfigured(): boolean {
  return supabaseMember !== null;
}

export function createAuthenticatedClient(accessToken: string, schema?: string): SupabaseClient<any, any, any> {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase not configured');
  }
  
  return createClient(supabaseUrl, supabasePublishableKey, {
    db: { schema: schema || 'public' },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    realtime: {
      transport: ws as unknown as WebSocketLikeConstructor,
    },
  });
}
