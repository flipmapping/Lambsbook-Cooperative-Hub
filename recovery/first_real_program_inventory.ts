import { getSupabaseAdmin } from '../server/lib/supabase-client.ts';

const supabase = getSupabaseAdmin();

console.log('===== FIRST REAL PROGRAM INVENTORY =====');

const programs =
  await supabase
    .from('programs')
    .select('*');

console.log('\n=== PROGRAMS ===');
console.log(JSON.stringify(programs.data, null, 2));

const eligibility =
  await supabase
    .from('program_eligibility')
    .select('*');

console.log('\n=== ELIGIBILITY ===');
console.log(JSON.stringify(eligibility.data, null, 2));

const members =
  await supabase
    .schema('meh')
    .from('members')
    .select('id,user_id,membership_status,is_admin');

console.log('\n=== MEMBERS ===');
console.log(JSON.stringify(members.data, null, 2));

console.log('\n===== COMPLETE =====');
