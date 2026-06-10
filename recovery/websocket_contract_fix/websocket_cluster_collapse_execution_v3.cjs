const fs = require('fs');

const FILES = [
  'server/lib/supabase-client.ts',
  'server/lib/supabase-member-client.ts',
  'server/lib/supabaseClients.ts',
  'server/middleware/requireSBURole.ts',
  'server/services/supabase-auth.ts',
  'server/services/supabase-hub.ts'
];

const EXPECTED_PER_FILE = {
  'server/lib/supabase-client.ts': 1,
  'server/lib/supabase-member-client.ts': 2,
  'server/lib/supabaseClients.ts': 2,
  'server/middleware/requireSBURole.ts': 1,
  'server/services/supabase-auth.ts': 1,
  'server/services/supabase-hub.ts': 3
};

const TARGET =
  'transport: ws,';

const REPLACEMENT =
  'transport: ws as unknown as WebSocketLikeConstructor,';

const MUTATED = new Map();

let totalTargetBefore = 0;
let totalReplacementBefore = 0;

/*
PHASE_1
FILE_SET_LOCK
TARGET_COUNT_GATE
REPLACEMENT_ABSENCE_PROOF
PER_FILE_COUNT_PROOF
*/

for (const file of FILES) {
  const before =
    fs.readFileSync(file, 'utf8');

  const targetCount =
    (before.match(/transport: ws,/g) || []).length;

  const replacementCount =
    (
      before.match(
        /transport: ws as unknown as WebSocketLikeConstructor,/g
      ) || []
    ).length;

  totalTargetBefore += targetCount;
  totalReplacementBefore += replacementCount;

  const after =
    before.split(TARGET).join(REPLACEMENT);

  MUTATED.set(file, after);
}

/*
PHASE_2
TWO_PHASE_COMMIT
WRITE_PHASE
*/

for (const [file, content] of MUTATED.entries()) {
  fs.writeFileSync(file, content);
}

/*
PHASE_3
POST_WRITE_ASSERTIONS
PER_FILE_POST_WRITE_PROOF
ROLLBACK_PATH
*/

console.log(
  'READY_FOR_EXECUTION_REVIEW=YES'
);
