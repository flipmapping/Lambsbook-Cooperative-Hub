import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

console.log('===== ENROLLMENT EVENT PROBE =====');

const { data, error } = await supabase
  .from('economic_events')
  .select('*')
  .eq('event_type', 'program_enrollment_payment')
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
