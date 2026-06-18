import { supabaseDAL } from '../server/lib/index.ts';

async function main() {
  console.log('===== DAL LIVE QUERY =====');

  const programs = await supabaseDAL.getAllPrograms();

  console.log('\n=== PROGRAMS ===');
  console.log('COUNT=', programs.length);
  console.log(JSON.stringify(programs.slice(0, 10), null, 2));

  const members = await supabaseDAL.getAllMembers();

  console.log('\n=== MEMBERS ===');
  console.log('COUNT=', members.length);
  console.log(JSON.stringify(members.slice(0, 10), null, 2));

  console.log('\n===== COMPLETE =====');
}

main().catch(err => {
  console.error('\nERROR');
  console.error(err);
  process.exit(1);
});
