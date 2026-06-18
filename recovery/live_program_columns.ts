import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

const { data, error } = await supabase
  .from('programs')
  .select('*')
  .limit(1);

if (error) {
  console.error('ERROR=', error);
  process.exit(1);
}

if (!data || data.length === 0) {
  console.log('NO_ROWS_FOUND');
  process.exit(0);
}

console.log(
  JSON.stringify(
    Object.keys(data[0]).sort(),
    null,
    2
  )
);
