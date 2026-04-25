const fs = require('fs');

const file = 'server/storage.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('recipientType') && s.includes('and(')) {
  console.log('NO_CHANGE_ALREADY_SCOPED');
  process.exit(0);
}

s = s.replace(
  'where(eq(notificationPreferences.recipientId, recipientId))',
  `where(and(
        eq(notificationPreferences.recipientId, recipientId),
        eq(notificationPreferences.recipientType, recipientType)
      ))`
);

s = s.replace(
  'getNotificationPreferences(recipientId: string)',
  'getNotificationPreferences(recipientId: string, recipientType: string)'
);

s = s.replace(
  'this.getNotificationPreferences(data.recipientId)',
  'this.getNotificationPreferences(data.recipientId, data.recipientType)'
);

fs.writeFileSync(file, s);
console.log('SCOPE_FIXED');
