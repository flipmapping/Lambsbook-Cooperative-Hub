const fs = require('fs');

const file = 'client/src/components/notifications/NotificationPreferencesPanel.tsx';
let s = fs.readFileSync(file, 'utf8');
const original = s;

// anchor: ChannelSelector block closing
const anchor = `      <ChannelSelector
        value={channel}
        onChange={setChannel}
        disabled={!enabled}
      />`;

if (!s.includes(anchor)) {
  console.log('STOP: anchor not found');
  process.exit(1);
}

const insert = `${anchor}

      <p className="text-xs text-gray-400">
        Changes are not saved.
      </p>`;

s = s.replace(anchor, insert);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(file, s);
console.log('HINT_INSERTED');
