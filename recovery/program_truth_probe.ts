import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

console.log('===== PROGRAM TRUTH PROBE =====');

const { data, error } = await supabase
  .from('programs')
  .select('*')
  .order('created_at');

if (error) {
  console.error(error);
  process.exit(1);
}

console.log('PROGRAM_COUNT=', data?.length ?? 0);

console.log(JSON.stringify(data, null, 2));

console.log('===== COMPLETE =====');
