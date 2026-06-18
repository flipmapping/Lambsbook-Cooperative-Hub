import { supabaseDAL } from '../server/lib/index.ts';

console.log('===== ADMIN MEMBER PROBE =====');

const members = await supabaseDAL.getAllMembers();

const admins = members.filter(m =>
  m.is_admin === true ||
  m.member_type === 'admin'
);

console.log('ADMIN_COUNT=', admins.length);

if (admins.length) {
  console.log(JSON.stringify(admins, null, 2));
}

console.log('===== COMPLETE =====');
