import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

const { data, error } = await supabase
  .from('programs')
  .select('*')
  .limit(1);

if (error) {
  console.error(error);
  process.exit(1);
}

const row = data?.[0] || {};

console.log('PROGRAM_COLUMNS=');
console.log(JSON.stringify(Object.keys(row).sort(), null, 2));

console.log('\nPROGRAM_ROW=');
console.log(JSON.stringify(row, null, 2));
