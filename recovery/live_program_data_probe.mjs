import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('===== LIVE PROGRAM DATA PROBE =====');

const programs = await supabase
  .from('programs')
  .select('*')
  .limit(10);

console.log('\n=== PROGRAMS ===');
console.log(JSON.stringify(programs.data, null, 2));
console.log('ERROR=', programs.error?.message ?? null);

const members = await supabase
  .schema('meh')
  .from('members')
  .select('id,user_id,member_type,membership_status')
  .limit(10);

console.log('\n=== MEMBERS ===');
console.log(JSON.stringify(members.data, null, 2));
console.log('ERROR=', members.error?.message ?? null);

const eligibility = await supabase
  .from('program_eligibility')
  .select('*')
  .limit(10);

console.log('\n=== PROGRAM_ELIGIBILITY ===');
console.log(JSON.stringify(eligibility.data, null, 2));
console.log('ERROR=', eligibility.error?.message ?? null);

console.log('\n===== PROBE COMPLETE =====');
