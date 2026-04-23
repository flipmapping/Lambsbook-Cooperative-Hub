const fs = require('fs');

const target = 'web/src/lib/contributions/mock-data.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

// Guard: do not duplicate if already present
if (/interactionState:\s*"initiated"/.test(s)) {
  console.log('NO_CHANGE_NEEDED_ALREADY_HAS_INITIATED');
  process.exit(0);
}

// Find the start of the array
const arrayStart = s.indexOf('export const MOCK_CONTRIBUTIONS');
if (arrayStart === -1) {
  console.log('STOP: MOCK_CONTRIBUTIONS export not found');
  process.exit(1);
}

// Insert after the first record closing brace "},"
const insertAnchor = s.match(/\n\s*\},\n\s*\{/);
if (!insertAnchor) {
  console.log('STOP: could not find safe insertion anchor between records');
  process.exit(1);
}

const initiatedRecord =
`\n  {\n    interactionState: "initiated",\n    id: "contrib_003",\n    title: "Coordinate initial meeting for visiting educators",\n    description:\n      "Arrange timing and basic coordination for an upcoming educator visit.",\n    contributionType: "coordination",\n\n    createdAt: "2026-04-20T08:45:00.000Z",\n    createdByMemberId: "member_020",\n    createdByDisplayName: "Member E",\n\n    initiator: {\n      memberId: "member_020",\n      displayName: "Member E",\n      initiatedAt: "2026-04-20T08:50:00.000Z",\n    },\n\n    partners: [],\n    seconders: [],\n    evidence: [],\n    stageHistory: [],\n\n    programLink: {\n      linked: false,\n      linkType: "placeholder",\n      note: "No program link established",\n    },\n  },\n`;

// Insert initiated record before the second record
s = s.replace(/\n\s*\},\n\s*\{/, match => `${match.replace('{', '{')}${initiatedRecord}`);

// Fail-closed if no change
if (s === original) {
  console.log('STOP: no insertion performed');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
