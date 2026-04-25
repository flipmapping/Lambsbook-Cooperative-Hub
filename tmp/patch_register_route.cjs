const fs = require('fs');

const file = 'server/index.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('notification-preferences')) {
  console.log('NO_CHANGE_ALREADY_REGISTERED');
  process.exit(0);
}

const importLine = `import notificationPreferencesRoute from "./routes/notification-preferences.route";`;
const anchor = `import express from "express";`;

if (!s.includes(anchor)) {
  console.log('STOP: anchor not found');
  process.exit(1);
}

s = s.replace(anchor, anchor + '\n' + importLine);

// mount near other routes
const mountAnchor = 'app.use("/api"';

s = s.replace(
  mountAnchor,
  `app.use("/api/notification-preferences", notificationPreferencesRoute);\n${mountAnchor}`
);

fs.writeFileSync(file, s);
console.log('ROUTE_REGISTERED');
