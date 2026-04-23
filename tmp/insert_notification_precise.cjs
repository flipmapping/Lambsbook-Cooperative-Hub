const fs = require('fs');

const file = 'web/src/app/(protected)/dashboard/page.tsx';
let s = fs.readFileSync(file, 'utf8');
const original = s;

// Exact JSX block anchor (stronger than loose match)
const anchor = `<div className="mt-6">
        <ActivityFeed />
      </div>`;

if (!s.includes(anchor)) {
  console.log('STOP: exact anchor not found');
  process.exit(1);
}

const replacement = `<div className="mt-6">
        <ActivityFeed />
        <div className="mt-4">
          <NotificationPreferencesPanel />
        </div>
      </div>`;

s = s.replace(anchor, replacement);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(file, s);
console.log('INSERT_APPLIED');
