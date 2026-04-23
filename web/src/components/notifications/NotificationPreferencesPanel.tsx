import ToggleControl from "./ToggleControl";
import ChannelSelector from "./ChannelSelector";
import { useState } from "react";

export default function NotificationPreferencesPanel() {
  const [enabled, setEnabled] = useState(true);
  const [channel, setChannel] = useState<"email" | "in_app">("in_app");

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <h2 className="text-sm font-medium text-gray-800">
        Notification Preferences
      </h2>

      <ToggleControl
        label="Enable notifications"
        enabled={enabled}
        onChange={setEnabled}
      />

      <ChannelSelector
        value={channel}
        onChange={setChannel}
        disabled={!enabled}
      />
    </div>
  );
}
