import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

console.log('===== PROGRAM INSERT MAPPING PROBE =====');

const { data, error } = await supabase
  .from('programs')
  .select('*')
  .eq('id', '2ccb0de4-06dd-4b24-b83a-fc401220de88')
  .single();

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));

console.log('===== COMPLETE =====');
