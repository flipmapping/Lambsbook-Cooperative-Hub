import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

async function run() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('programs')
    .select('*');

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const first = data?.[0] || {};

  console.log('ROW_COUNT=' + data.length);

  console.log('\nCOLUMNS=');
  console.log(JSON.stringify(Object.keys(first).sort(), null, 2));

  console.log('\nSAMPLE_ROWS=');
  console.log(JSON.stringify(data, null, 2));
}

run().catch(console.error);
