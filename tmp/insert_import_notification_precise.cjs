const fs = require('fs');

const file = 'web/src/app/(protected)/dashboard/page.tsx';
let s = fs.readFileSync(file, 'utf8');

const importLine = 'import NotificationPreferencesPanel from "@/components/notifications/NotificationPreferencesPanel";';
const anchor = 'import { ActivityFeed } from "@/components/activity/ActivityFeed";';

if (s.includes(importLine)) {
  console.log("NO_CHANGE_ALREADY_IMPORTED");
  process.exit(0);
}

if (!s.includes(anchor)) {
  console.log("STOP: import anchor not found");
  process.exit(1);
}

s = s.replace(anchor, anchor + '\n' + importLine);

fs.writeFileSync(file, s);
console.log("IMPORT_INSERTED");
