const { createClient } = require('@supabase/supabase-js');

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

(async () => {
  console.log('===== LIVE PROGRAM DATA PROBE =====');

  const programs = await supabase
    .from('programs')
    .select('*')
    .limit(20);

  console.log('\n=== PROGRAMS ===');
  console.log(JSON.stringify(programs, null, 2));

  const members = await supabase
    .schema('meh')
    .from('members')
    .select('id,user_id,member_type,membership_status')
    .limit(20);

  console.log('\n=== MEMBERS ===');
  console.log(JSON.stringify(members, null, 2));

  const eligibility = await supabase
    .from('program_eligibility')
    .select('*')
    .limit(20);

  console.log('\n=== PROGRAM ELIGIBILITY ===');
  console.log(JSON.stringify(eligibility, null, 2));

  console.log('\n===== PROBE COMPLETE =====');
})();
