export type NotificationPresentationItem = {
  id: string;
  message: string;
  timestampLabel: string;
  read: boolean;
};

type NotificationItemProps = {
  item: NotificationPresentationItem;
};

export function NotificationItem({ item }: NotificationItemProps) {
  return (
    <li
      className={`rounded-xl border px-3 py-3 ${
        item.read
          ? "border-slate-800 bg-slate-950/40"
          : "border-slate-700 bg-slate-900/70"
      }`}
    >
      <div className="space-y-1">
        <p className={item.read ? "text-sm text-slate-300" : "text-sm text-slate-100"}>
          {item.message}
        </p>
        <p className="text-xs text-slate-500">{item.timestampLabel}</p>
      </div>
    </li>
  );
}
