const fs = require('fs');

const file = 'server/routes/notification-preferences.route.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('DEV_BYPASS_USER')) {
  console.log('NO_CHANGE_ALREADY_APPLIED');
  process.exit(0);
}

// Replace req.user usage with fixed dev user
s = s.replace(
  /const user = req.user[\s\S]*?const recipientType = "member";/g,
  `// DEV_BYPASS_USER
    const recipientId = "dev-user";
    const recipientType = "member";`
);

fs.writeFileSync(file, s);
console.log("DEV_BYPASS_APPLIED");
