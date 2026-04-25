import ToggleControl from "./ToggleControl";
import ChannelSelector from "./ChannelSelector";
import { useState, useEffect } from "react";

export default function NotificationPreferencesPanel() {
  const [enabled, setEnabled] = useState(true);
  const [channel, setChannel] = useState<"email" | "in_app">("in_app");

  // ⚠️ TEMP: replace with real auth provider later
  const token = localStorage.getItem("token") || "";

  function debounce(fn: (...args: any[]) => void, delay: number) {
    let t: any;
    return (...args: any[]) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  const savePreferences = debounce((payload: any) => {
    fetch("/api/notification-preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  }, 400);

  // Load existing preferences
  useEffect(() => {
    fetch("/api/notification-preferences", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data) {
          setEnabled(data.enabled);
          setChannel(data.channel);
        }
      })
      .catch(() => {
        // silent fail for now
      });
  }, []);

  const handleToggle = (next: boolean) => {
    setEnabled(next); // optimistic

    savePreferences({
      enabled: next,
      channel,
    });
  };

  const handleChannelChange = (next: "email" | "in_app") => {
    setChannel(next); // optimistic

    savePreferences({
      enabled,
      channel: next,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <h2 className="text-sm font-medium text-gray-800">
        Notification Preferences
      </h2>

      <ToggleControl
        label="Enable notifications"
        enabled={enabled}
        onChange={handleToggle}
      />

      <ChannelSelector
        value={channel}
        onChange={handleChannelChange}
        disabled={!enabled}
      />

      <p className="text-xs text-gray-400">
        Preferences are saved automatically.
      </p>
    </div>
  );
}
