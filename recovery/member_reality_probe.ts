import { supabaseDAL } from '../server/lib/index.ts';

console.log('===== MEMBER REALITY PROBE =====');

const members = await supabaseDAL.getAllMembers();

console.log(JSON.stringify(
  members.map(m => ({
    id: m.id,
    user_id: m.user_id,
    member_type: m.member_type,
    membership_status: m.membership_status,
    is_admin: m.is_admin,
    invitor_id: m.invitor_id,
    created_at: m.created_at
  })),
  null,
  2
));

console.log('===== COMPLETE =====');
