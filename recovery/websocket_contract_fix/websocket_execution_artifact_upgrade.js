const fs = require('fs');

const ARTIFACT =
  '/tmp/websocket_contract_fix_execution_reconstructed.js';

if (!fs.existsSync(ARTIFACT)) {
  console.error('ARTIFACT_MISSING');
  process.exit(1);
}

const source =
  fs.readFileSync(ARTIFACT, 'utf8');

if (
  !source.includes(
    'SIMULATION_ARTIFACT_READY_FOR_REVIEW=YES'
  )
) {
  console.error(
    'SIMULATION_STAGE_MARKER_MISSING'
  );
  process.exit(1);
}

if (
  source.includes(
    'EXECUTION_ARTIFACT_READY_FOR_REVIEW=YES'
  )
) {
  console.error(
    'EXECUTION_STAGE_ALREADY_PRESENT'
  );
  process.exit(1);
}

if (
  !source.includes(
    'TOTAL_REPLACEMENT_AFTER_MISMATCH'
  )
) {
  console.error(
    'ANCHOR_MISSING'
  );
  process.exit(1);
}

const INSERTION = `

/*
 * WRITE_PHASE
 *
 * EXECUTION CORRIDOR REQUIRED
 */

for (const file of FILES) {
  fs.writeFileSync(
    file,
    mutated.get(file)
  );
}

/*
 * POST_WRITE_ASSERTIONS
 */

let postWriteTargetCount = 0;
let postWriteReplacementCount = 0;

for (const file of FILES) {
  const s = fs.readFileSync(
    file,
    'utf8'
  );

  postWriteTargetCount +=
    (s.match(/transport: ws,/g) || []).length;

  postWriteReplacementCount +=
    (
      s.match(
        /transport: ws as unknown as WebSocketLikeConstructor,/g
      ) || []
    ).length;
}

if (postWriteTargetCount !== 0) {
  console.error(
    'POST_WRITE_TARGET_COUNT_MISMATCH=' +
    postWriteTargetCount
  );
  process.exit(1);
}

if (postWriteReplacementCount !== 10) {
  console.error(
    'POST_WRITE_REPLACEMENT_COUNT_MISMATCH=' +
    postWriteReplacementCount
  );
  process.exit(1);
}
`;

const ANCHOR = `
if (totalReplacementAfter !== 10) {
  console.error(
    'TOTAL_REPLACEMENT_AFTER_MISMATCH=' +
    totalReplacementAfter
  );
  process.exit(1);
}
`;

if (!source.includes(ANCHOR)) {
  console.error(
    'EXACT_ANCHOR_MATCH_FAILED'
  );
  process.exit(1);
}

let updated =
  source.replace(
    ANCHOR,
    ANCHOR + INSERTION
  );

updated =
  updated.replace(
    'SIMULATION_ARTIFACT_READY_FOR_REVIEW=YES',
    'EXECUTION_ARTIFACT_READY_FOR_REVIEW=YES'
  );

fs.writeFileSync(
  ARTIFACT,
  updated
);

const verify =
  fs.readFileSync(ARTIFACT, 'utf8');

if (!verify.includes('WRITE_PHASE')) {
  console.error('WRITE_PHASE_MISSING');
  process.exit(1);
}

if (
  !verify.includes(
    'POST_WRITE_ASSERTIONS'
  )
) {
  console.error(
    'POST_WRITE_ASSERTIONS_MISSING'
  );
  process.exit(1);
}

if (
  !verify.includes(
    'EXECUTION_ARTIFACT_READY_FOR_REVIEW=YES'
  )
) {
  console.error(
    'EXECUTION_STAGE_MARKER_MISSING'
  );
  process.exit(1);
}

if (
  verify.includes(
    'SIMULATION_ARTIFACT_READY_FOR_REVIEW=YES'
  )
) {
  console.error(
    'SIMULATION_STAGE_MARKER_STILL_PRESENT'
  );
  process.exit(1);
}

if (
  verify.includes('BACKUP_PHASE')
) {
  console.error(
    'BACKUP_PHASE_PRESENT'
  );
  process.exit(1);
}

if (
  verify.includes(
    'POST_WRITE_VERIFICATION'
  )
) {
  console.error(
    'POST_WRITE_VERIFICATION_PRESENT'
  );
  process.exit(1);
}

if (
  verify.includes(
    'ROLLBACK_PHASE'
  )
) {
  console.error(
    'ROLLBACK_PHASE_PRESENT'
  );
  process.exit(1);
}

console.log(
  'MUTATOR_ARTIFACT_SUCCESS=YES'
);
