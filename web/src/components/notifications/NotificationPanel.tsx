import { NotificationItem, type NotificationPresentationItem } from "./NotificationItem";

type NotificationPanelProps = {
  items: NotificationPresentationItem[];
  open: boolean;
};

export function NotificationPanel({ items, open }: NotificationPanelProps) {
  if (!open) return null;

  return (
    <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl">
      <div className="mb-3 border-b border-slate-800 pb-3">
        <h2 className="text-sm font-semibold text-slate-100">Notifications</h2>
      </div>

      {items.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500">
          No notifications yet.
        </div>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <NotificationItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
