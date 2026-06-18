import pg from 'pg';
import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const { Client } = pg;

async function run() {
  console.log('=== ENVIRONMENT ===');

  console.log('DATABASE_URL_PRESENT=' + Boolean(process.env.DATABASE_URL));
  console.log('SUPABASE_URL_PRESENT=' + Boolean(process.env.SUPABASE_URL));
  console.log('SUPABASE_SERVICE_ROLE_KEY_PRESENT=' + Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));

  console.log('\n=== DATABASE_URL TARGET ===');

  if (process.env.DATABASE_URL) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const db = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        version() AS version;
    `);

    console.log(JSON.stringify(db.rows, null, 2));

    const tables = await client.query(`
      SELECT count(*)::int AS table_count
      FROM information_schema.tables
      WHERE table_schema='public';
    `);

    console.log('PUBLIC_TABLE_COUNT=' + tables.rows[0].table_count);

    await client.end();
  }

  console.log('\n=== SUPABASE TARGET ===');

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    console.log('SUPABASE_USERS_QUERY_ERROR=' + Boolean(error));

    if (error) {
      console.log(JSON.stringify(error, null, 2));
    } else {
      console.log('SUPABASE_USERS_QUERY_OK=true');
      console.log('SUPABASE_USERS_ROWS=' + (data?.length ?? 0));
    }

    const { data: programsData, error: programsError } = await supabase
      .from('programs')
      .select('*')
      .limit(1);

    console.log('\nSUPABASE_PROGRAMS_QUERY_ERROR=' + Boolean(programsError));

    if (programsError) {
      console.log(JSON.stringify(programsError, null, 2));
    } else {
      console.log('SUPABASE_PROGRAMS_QUERY_OK=true');
      console.log('SUPABASE_PROGRAMS_ROWS=' + (programsData?.length ?? 0));
    }

  } catch (err) {
    console.log('SUPABASE_CLIENT_FAILURE=');
    console.log(String(err));
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
