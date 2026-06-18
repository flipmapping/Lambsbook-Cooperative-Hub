import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

console.log('===== PROGRAM ELIGIBILITY PROBE =====');

const { data, error } = await supabase
  .from('program_eligibility')
  .select('*')
  .limit(50);

if (error) {
  console.error(error);
  process.exit(1);
}

console.log('COUNT=', data?.length ?? 0);

if (data?.length) {
  console.log(JSON.stringify(data, null, 2));
}

console.log('===== COMPLETE =====');
