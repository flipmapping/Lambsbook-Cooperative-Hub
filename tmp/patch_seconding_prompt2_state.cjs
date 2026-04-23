const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = 'export default function ContributionCard({ contribution }: ContributionCardProps) {\n  return (';
const replacement = 'export default function ContributionCard({ contribution }: ContributionCardProps) {\n  const [hasLocallySeconded, setHasLocallySeconded] = useState(false);\n\n  return (';

if (!s.includes(anchor)) {
  console.log('STOP: component state anchor not found');
  process.exit(1);
}
if (s.includes('const [hasLocallySeconded, setHasLocallySeconded] = useState(false);')) {
  console.log('NO_CHANGE_NEEDED_ALREADY_PRESENT');
  process.exit(0);
}

s = s.replace(anchor, replacement);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
