type ToggleControlProps = {
  label: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

export default function ToggleControl({
  label,
  enabled,
  onChange,
  disabled = false,
}: ToggleControlProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`text-sm ${
          disabled ? "text-gray-400" : "text-gray-700"
        }`}
      >
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled} aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
          enabled ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-150 ease-in-out ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}