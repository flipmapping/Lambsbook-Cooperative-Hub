const fs = require('fs');

const file = 'client/src/pages/Dashboard.tsx';
let s = fs.readFileSync(file, 'utf8');

const importLine = `import NotificationPreferencesPanel from "@/components/notifications/NotificationPreferencesPanel";`;

// anchor: last import line (safe generic strategy)
const anchorMatch = s.match(/import .*;\n(?!import)/);

if (!anchorMatch) {
  console.log('STOP: import anchor not found');
  process.exit(1);
}

if (s.includes(importLine)) {
  console.log('NO_CHANGE_ALREADY_IMPORTED');
  process.exit(0);
}

s = s.replace(anchorMatch[0], anchorMatch[0] + importLine + '\n');

fs.writeFileSync(file, s);
console.log('IMPORT_INSERTED');
