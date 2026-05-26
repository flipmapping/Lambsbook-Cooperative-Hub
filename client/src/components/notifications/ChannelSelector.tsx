type Channel = "email" | "in_app";

type ChannelSelectorProps = {
  value: Channel;
  onChange: (next: Channel) => void;
  disabled?: boolean;
};

const CHANNELS: { key: Channel; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "in_app", label: "In-app" },
];

export default function ChannelSelector({
  value,
  onChange,
  disabled = false,
}: ChannelSelectorProps) {
  return (
    <div role="group" aria-label="Notification channel" className="inline-flex rounded-md border border-gray-200 overflow-hidden">
      {CHANNELS.map(({ key, label }, index) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => { if (!disabled && value !== key) onChange(key); }}
          className={`px-4 py-1.5 text-sm transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-40
            ${index > 0 ? "border-l border-gray-200" : ""}
            ${
              value === key
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          aria-pressed={value === key} aria-label={label}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
