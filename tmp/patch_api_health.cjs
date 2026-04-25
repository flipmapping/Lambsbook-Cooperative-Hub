const fs = require('fs');

const file = 'scripts/runtime-guard.sh';
let s = fs.readFileSync(file, 'utf8');

if (s.includes("5) API contract check")) {
  console.log("NO_CHANGE_ALREADY_ADDED");
  process.exit(0);
}

const insertPoint = 'echo "======================================"';

const block = `
echo
echo "5) API contract check..."

API_TEST=$(curl -s --max-time 2 "http://localhost:5000/api/notification-preferences?recipientId=test&recipientType=member" || true)

if echo "$API_TEST" | grep -q "<!DOCTYPE html>"; then
  echo "❌ API returned HTML (likely Vite interception)"
  exit 1
fi

echo "API response:"
echo "$API_TEST"

echo "✅ API route responding"
`;

s = s.replace(insertPoint, block + "\n" + insertPoint);

fs.writeFileSync(file, s);
console.log("API_HEALTH_ADDED");
