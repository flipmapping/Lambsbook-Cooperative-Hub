import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

async function run() {
  const supabase = getSupabaseAdmin();

  const { data, error, count } = await supabase
    .from('programs')
    .select('*', { count: 'exact' })
    .limit(5);

  if (error) {
    console.error('ERROR=');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }

  const first = data?.[0] || {};
  const columns = Object.keys(first).sort();

  const firstWaveFields = [
    'program_id',
    'program_type',
    'description'
  ];

  const missing = firstWaveFields.filter(
    field => !columns.includes(field)
  );

  console.log('RUNTIME_COLUMNS=');
  console.log(JSON.stringify(columns, null, 2));

  console.log('\nMISSING_FIRST_WAVE_FIELDS=');
  console.log(JSON.stringify(missing, null, 2));

  console.log('\nROW_COUNT=');
  console.log(count ?? data?.length ?? 0);

  console.log('\nREADY_FOR_SQL=');
  console.log(
    missing.length === firstWaveFields.length
      ? 'YES'
      : 'REQUIRES_REVIEW'
  );
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
