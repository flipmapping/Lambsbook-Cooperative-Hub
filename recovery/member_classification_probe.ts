import { supabaseDAL } from '../server/lib/index.ts';

console.log('===== MEMBER CLASSIFICATION PROBE =====');

const members = await supabaseDAL.getAllMembers();

const summary = {
  total: members.length,
  paid: members.filter(m => m.membership_status === 'paid').length,
  free: members.filter(m => m.membership_status === 'free').length,
  admins: members.filter(m => m.is_admin === true).length
};

console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));

console.log('\n=== MEMBERS ===');
console.log(JSON.stringify(
  members.map(m => ({
    id: m.id,
    member_type: m.member_type,
    membership_status: m.membership_status,
    is_admin: m.is_admin,
    created_at: m.created_at
  })),
  null,
  2
));

console.log('\n===== COMPLETE =====');
