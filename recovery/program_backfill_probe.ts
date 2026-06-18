import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

const { data, error } = await supabase
  .from('programs')
  .select('*')
  .limit(20);

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
