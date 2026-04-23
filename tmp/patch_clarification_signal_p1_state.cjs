const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = '  const [hasLocallyInitiated, setHasLocallyInitiated] = useState(false);';
const insert = '  const [hasLocallyInitiated, setHasLocallyInitiated] = useState(false);\n  const [hasLocallyClarified, setHasLocallyClarified] = useState(false);';

if (!s.includes(anchor)) {
  console.log('STOP: local initiation state anchor not found');
  process.exit(1);
}
if (s.includes('const [hasLocallyClarified, setHasLocallyClarified] = useState(false);')) {
  console.log('NO_CHANGE_NEEDED_ALREADY_PRESENT');
  process.exit(0);
}

s = s.replace(anchor, insert);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
