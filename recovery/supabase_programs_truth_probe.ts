import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

async function run() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .limit(5);

  if (error) {
    console.error('PROGRAMS_ERROR=');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log('PROGRAM_ROWS=');
  console.log(JSON.stringify(data, null, 2));

  const first = data?.[0] || {};

  console.log('\nPROGRAM_COLUMNS=');
  console.log(JSON.stringify(Object.keys(first).sort(), null, 2));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
