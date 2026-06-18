import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

async function run() {
  const queries = [
    {
      name: 'columns',
      sql: `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'programs'
        ORDER BY ordinal_position;
      `
    },
    {
      name: 'constraints',
      sql: `
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'programs'
        ORDER BY tc.constraint_type, tc.constraint_name;
      `
    },
    {
      name: 'indexes',
      sql: `
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename = 'programs'
        ORDER BY indexname;
      `
    }
  ];

  for (const q of queries) {
    const { data, error } = await supabase.rpc(
      'exec_sql',
      { sql: q.sql }
    );

    console.log(`\n===== ${q.name.toUpperCase()} =====`);

    if (error) {
      console.error(error);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
