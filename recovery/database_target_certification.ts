import pg from 'pg';

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const db = await client.query(`
    SELECT
      current_database() as database_name,
      current_schema() as schema_name;
  `);

  console.log('DATABASE_TARGET=');
  console.log(JSON.stringify(db.rows, null, 2));

  const tables = await client.query(`
    SELECT
      table_schema,
      table_name
    FROM information_schema.tables
    WHERE table_type='BASE TABLE'
    ORDER BY table_schema, table_name;
  `);

  console.log('\nALL_TABLES=');
  console.log(JSON.stringify(tables.rows, null, 2));

  const programTables = await client.query(`
    SELECT
      table_schema,
      table_name
    FROM information_schema.tables
    WHERE lower(table_name) LIKE '%program%'
    ORDER BY table_schema, table_name;
  `);

  console.log('\nPROGRAM_RELATED_TABLES=');
  console.log(JSON.stringify(programTables.rows, null, 2));

  await client.end();
}

run().catch((err) => {
  console.error('CERTIFICATION_ERROR=');
  console.error(err);
  process.exit(1);
});
