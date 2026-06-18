import pg from 'pg';

console.log('DATABASE_URL=');
console.log(process.env.DATABASE_URL || 'MISSING');

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const currentDb = await client.query(`
    SELECT
      current_database() AS database_name,
      current_user AS database_user,
      version() AS version;
  `);

  console.log('\nDATABASE_IDENTITY=');
  console.log(JSON.stringify(currentDb.rows, null, 2));

  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
