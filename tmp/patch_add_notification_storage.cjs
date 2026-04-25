const fs = require('fs');

const file = 'server/storage.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('getNotificationPreferences')) {
  console.log('NO_CHANGE_ALREADY_EXISTS');
  process.exit(0);
}

const anchor = 'async getNotifications';

if (!s.includes(anchor)) {
  console.log('STOP: anchor not found');
  process.exit(1);
}

const insert = `
  async getNotificationPreferences(recipientId: string) {
    const [row] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.recipientId, recipientId));

    return row;
  }

  async upsertNotificationPreferences(data: InsertNotificationPreferences) {
    const existing = await this.getNotificationPreferences(data.recipientId);

    if (existing) {
      const [updated] = await db
        .update(notificationPreferences)
        .set(data)
        .where(eq(notificationPreferences.recipientId, data.recipientId))
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(notificationPreferences)
      .values(data)
      .returning();

    return created;
  }
`;

s = s.replace(anchor, insert + '\n  ' + anchor);

fs.writeFileSync(file, s);
console.log('STORAGE_INSERTED');
