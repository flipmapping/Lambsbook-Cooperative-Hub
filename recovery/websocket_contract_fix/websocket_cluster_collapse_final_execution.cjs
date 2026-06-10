const fs = require('fs');

const FILES = [
  'server/lib/supabase-client.ts',
  'server/lib/supabase-member-client.ts',
  'server/lib/supabaseClients.ts',
  'server/middleware/requireSBURole.ts',
  'server/services/supabase-auth.ts',
  'server/services/supabase-hub.ts'
];

const EXPECTED_FILE_COUNT = 6;

const EXPECTED_PER_FILE = {
  'server/lib/supabase-client.ts': 1,
  'server/lib/supabase-member-client.ts': 2,
  'server/lib/supabaseClients.ts': 2,
  'server/middleware/requireSBURole.ts': 1,
  'server/services/supabase-auth.ts': 1,
  'server/services/supabase-hub.ts': 3
};

const EXPECTED_TOTAL_TARGET = 10;

const TARGET =
  'transport: ws,';

const REPLACEMENT =
  'transport: ws as unknown as WebSocketLikeConstructor,';

if (FILES.length !== EXPECTED_FILE_COUNT) {
  throw new Error(
    `FILE_SET_LOCK_FAILED=${FILES.length}`
  );
}

const MUTATED = new Map();
const ROLLBACK = new Map();

let totalTargetBefore = 0;
let totalReplacementBefore = 0;

/*
READ_FILES
FILE_SET_LOCK
PER_FILE_ASSERTIONS
TOTAL_ASSERTIONS
REPLACEMENT_ABSENCE_PROOF
*/

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    throw new Error(
      `FILE_MISSING=${file}`
    );
  }

  const source =
    fs.readFileSync(file, 'utf8');

  ROLLBACK.set(file, source);

  const targetCount =
    (source.match(
      /transport: ws,/g
    ) || []).length;

  const replacementCount =
    (
      source.match(
        /transport: ws as unknown as WebSocketLikeConstructor,/g
      ) || []
    ).length;

  const expected =
    EXPECTED_PER_FILE[file];

  if (targetCount !== expected) {
    throw new Error(
      `PER_FILE_TARGET_COUNT_MISMATCH=${file}:${targetCount}:${expected}`
    );
  }

  if (replacementCount !== 0) {
    throw new Error(
      `REPLACEMENT_ALREADY_PRESENT=${file}:${replacementCount}`
    );
  }

  totalTargetBefore += targetCount;
  totalReplacementBefore += replacementCount;

  MUTATED.set(
    file,
    source.split(TARGET).join(REPLACEMENT)
  );
}

if (
  totalTargetBefore !==
  EXPECTED_TOTAL_TARGET
) {
  throw new Error(
    `TOTAL_TARGET_COUNT_MISMATCH=${totalTargetBefore}`
  );
}

if (totalReplacementBefore !== 0) {
  throw new Error(
    `TOTAL_REPLACEMENT_BEFORE_MISMATCH=${totalReplacementBefore}`
  );
}

/*
BUILD_MUTATED_MAP
BUILD_ROLLBACK_MAP
*/

try {
  /*
  WRITE_PHASE
  */

  for (const [file, content] of MUTATED.entries()) {
    fs.writeFileSync(file, content);
  }

  let totalTargetAfter = 0;
  let totalReplacementAfter = 0;

  /*
  PER_FILE_POST_WRITE_PROOF
  TOTAL_POST_WRITE_PROOF
  */

  for (const file of FILES) {
    const source =
      fs.readFileSync(file, 'utf8');

    const targetAfter =
      (source.match(
        /transport: ws,/g
      ) || []).length;

    const replacementAfter =
      (
        source.match(
          /transport: ws as unknown as WebSocketLikeConstructor,/g
        ) || []
      ).length;

    const expected =
      EXPECTED_PER_FILE[file];

    if (targetAfter !== 0) {
      throw new Error(
        `PER_FILE_TARGET_AFTER_MISMATCH=${file}:${targetAfter}`
      );
    }

    if (replacementAfter !== expected) {
      throw new Error(
        `PER_FILE_REPLACEMENT_AFTER_MISMATCH=${file}:${replacementAfter}:${expected}`
      );
    }

    totalTargetAfter += targetAfter;
    totalReplacementAfter += replacementAfter;
  }

  if (totalTargetAfter !== 0) {
    throw new Error(
      `TOTAL_TARGET_AFTER_MISMATCH=${totalTargetAfter}`
    );
  }

  if (
    totalReplacementAfter !==
    EXPECTED_TOTAL_TARGET
  ) {
    throw new Error(
      `TOTAL_REPLACEMENT_AFTER_MISMATCH=${totalReplacementAfter}`
    );
  }

  /*
  ROLLBACK_PATH
  */

  console.log(
    'READY_FOR_EXECUTION_AUTHORIZATION=YES'
  );

} catch (error) {

  /*
  ROLLBACK_ON_FAILURE
  */

  for (const [file, original] of ROLLBACK.entries()) {
    try {
      fs.writeFileSync(file, original);
    } catch (_) {}
  }

  throw error;
}
