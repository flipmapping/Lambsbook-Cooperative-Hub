const fs = require('fs');

const file = 'shared/schema.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('notificationPreferences = pgTable')) {
  console.log('NO_CHANGE_ALREADY_EXISTS');
  process.exit(0);
}

const anchor = 'export const insertNotificationSchema';

if (!s.includes(anchor)) {
  console.log('STOP: anchor not found');
  process.exit(1);
}

const insert = `

// === Notification Preferences ===
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),

  recipientId: text("recipient_id").notNull(),
  recipientType: text("recipient_type").notNull(),

  enabled: boolean("enabled").notNull().default(true),
  channel: text("channel").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationPreferencesSchema =
  createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true });

export type InsertNotificationPreferences =
  z.infer<typeof insertNotificationPreferencesSchema>;

export type NotificationPreferences =
  typeof notificationPreferences.$inferSelect;
`;

s = s.replace(anchor, insert + '\n' + anchor);

fs.writeFileSync(file, s);
console.log('SCHEMA_INSERTED');
