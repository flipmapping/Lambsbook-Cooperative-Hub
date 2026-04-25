const fs = require('fs');

const file = 'server/storage.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('and(\n        eq(notificationPreferences.recipientId, data.recipientId)')) {
  console.log('NO_CHANGE_ALREADY_FIXED');
  process.exit(0);
}

s = s.replace(
  'where(eq(notificationPreferences.recipientId, data.recipientId))',
  `where(and(
        eq(notificationPreferences.recipientId, data.recipientId),
        eq(notificationPreferences.recipientType, data.recipientType)
      ))`
);

fs.writeFileSync(file, s);
console.log('UPDATE_SCOPE_FIXED');
