const fs = require('fs');

const file = 'server/routes.ts';
let s = fs.readFileSync(file, 'utf8');

const importLine = `import notificationPreferencesRoute from "./routes/notification-preferences.route";`;

if (!s.includes(importLine)) {
  const importAnchor = 'import devTestAuthRoutes from "./routes/devTestAuth";';

  if (!s.includes(importAnchor)) {
    console.log('STOP: import anchor not found');
    process.exit(1);
  }

  s = s.replace(importAnchor, importAnchor + '\n' + importLine);
}

const mountLine = `app.use("/api/notification-preferences", notificationPreferencesRoute);`;

if (s.includes(mountLine)) {
  console.log('NO_CHANGE_ALREADY_REGISTERED');
  process.exit(0);
}

const mountAnchor = 'app.use("/api/member", memberRoutes);';

if (!s.includes(mountAnchor)) {
  console.log('STOP: mount anchor not found');
  process.exit(1);
}

s = s.replace(
  mountAnchor,
  mountAnchor + '\n  ' + mountLine
);

fs.writeFileSync(file, s);
console.log('ROUTE_REGISTERED_CORRECTLY');
