import pg from 'pg';

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const columns = await client.query(`
    SELECT
      ordinal_position,
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='programs'
    ORDER BY ordinal_position;
  `);

  console.log('PROGRAMS_COLUMNS=');
  console.log(JSON.stringify(columns.rows, null, 2));

  const pk = await client.query(`
    SELECT
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public'
      AND tc.table_name='programs'
      AND tc.constraint_type='PRIMARY KEY'
    ORDER BY kcu.ordinal_position;
  `);

  console.log('\nPROGRAMS_PRIMARY_KEY=');
  console.log(JSON.stringify(pk.rows, null, 2));

  const constraints = await client.query(`
    SELECT
      tc.constraint_name,
      tc.constraint_type,
      string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public'
      AND tc.table_name='programs'
    GROUP BY tc.constraint_name, tc.constraint_type
    ORDER BY tc.constraint_type, tc.constraint_name;
  `);

  console.log('\nPROGRAMS_CONSTRAINTS=');
  console.log(JSON.stringify(constraints.rows, null, 2));

  await client.end();
}

run().catch((err) => {
  console.error('CERTIFICATION_ERROR=');
  console.error(err);
  process.exit(1);
});
