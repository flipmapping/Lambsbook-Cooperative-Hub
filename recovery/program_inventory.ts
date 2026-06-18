import { supabaseDAL } from '../server/lib/index.ts';

console.log('===== PROGRAM INVENTORY =====');

const programs = await supabaseDAL.getAllPrograms();

console.log(JSON.stringify(programs, null, 2));

console.log('===== COMPLETE =====');
