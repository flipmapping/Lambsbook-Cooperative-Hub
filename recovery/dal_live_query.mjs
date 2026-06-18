import { supabaseDAL } from '../server/lib/index.js';

console.log('===== DAL LIVE QUERY =====');

try {
  const programs = await supabaseDAL.getAllPrograms();

  console.log('\n=== PROGRAMS ===');
  console.log('COUNT=', programs.length);

  if (programs.length > 0) {
    console.log(JSON.stringify(programs.slice(0, 10), null, 2));
  }

  const members = await supabaseDAL.getAllMembers();

  console.log('\n=== MEMBERS ===');
  console.log('COUNT=', members.length);

  if (members.length > 0) {
    console.log(JSON.stringify(members.slice(0, 10), null, 2));
  }

  console.log('\n===== COMPLETE =====');
} catch (err) {
  console.error('\nERROR:');
  console.error(err);
}
