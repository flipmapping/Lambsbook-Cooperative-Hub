import pg from 'pg';

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public'
    ORDER BY table_name;
  `);

  console.log('LIVE_TABLES=');
  console.log(JSON.stringify(tables.rows, null, 2));

  const programs = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public'
      AND table_name='programs';
  `);

  console.log('\nPROGRAMS_TABLE_EXISTS=');
  console.log(programs.rows.length > 0 ? 'YES' : 'NO');

  if (programs.rows.length > 0) {
    const columns = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema='public'
        AND table_name='programs'
      ORDER BY ordinal_position;
    `);

    console.log('\nPROGRAMS_COLUMNS=');
    console.log(JSON.stringify(columns.rows, null, 2));
  }

  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
