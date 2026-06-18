import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

await client.connect();

const result = await client.query(`
SELECT
  ordinal_position,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='programs'
ORDER BY ordinal_position;
`);

console.log('PROGRAMS_COLUMNS=');
console.log(JSON.stringify(result.rows, null, 2));

const pk = await client.query(`
SELECT
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name='programs'
  AND tc.constraint_type='PRIMARY KEY';
`);

console.log('\nPROGRAMS_PRIMARY_KEY=');
console.log(JSON.stringify(pk.rows, null, 2));

await client.end();
