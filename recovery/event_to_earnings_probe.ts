import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

const EVENT_ID = '0f022953-42ab-4858-83ca-e07633ed99cf';

console.log('===== EVENT -> EARNINGS PROBE =====');

const { data, error } = await supabase
  .from('earnings')
  .select('*')
  .eq('source_event_id', EVENT_ID);

if (error) {
  console.error(error);
  process.exit(1);
}

console.log('COUNT=', data?.length ?? 0);

if (data?.length) {
  console.log(JSON.stringify(data, null, 2));
}

console.log('===== COMPLETE =====');
