import { supabaseDAL } from '../server/lib/index.ts';

console.log('===== PROGRAM CREATION AUTHORITY =====');

console.log('Program creation currently flows through:');
console.log('admin route -> supabaseDAL.createProgram()');

const programs = await supabaseDAL.getAllPrograms();

console.log('\nEXISTING_PROGRAM_COUNT=', programs.length);

console.log('\nEXISTING_PROGRAMS=');
console.log(JSON.stringify(
  programs.map(p => ({
    id: p.id,
    name: p.name,
    is_active: p.is_active
  })),
  null,
  2
));

console.log('\n===== COMPLETE =====');
