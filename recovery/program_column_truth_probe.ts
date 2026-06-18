import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

console.log('===== PROGRAM COLUMN TRUTH =====');

const { data, error } = await supabase
  .from('programs')
  .select('*')
  .limit(1);

if (error) {
  console.error(error);
  process.exit(1);
}

if (data?.length) {
  console.log(Object.keys(data[0]));
}

console.log('===== COMPLETE =====');
