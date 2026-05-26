import { ActivityItem } from "./ActivityItem";

type ActivityFeedEntry = {
  id: string;
  typeLabel: string;
  title: string;
  summary: string;
  timestampLabel: string;
};

const activityFeedMockData: ActivityFeedEntry[] = [
  {
    id: "activity-1",
    typeLabel: "Idea",
    title: "Local idea added",
    summary: "A new idea entered the visible cooperative workflow in this dashboard view.",
    timestampLabel: "Just now",
  },
  {
    id: "activity-2",
    typeLabel: "Discussion",
    title: "Discussion activity recorded",
    summary: "A discussion action appears here as part of the read-only activity timeline.",
    timestampLabel: "Earlier",
  },
  {
    id: "activity-3",
    typeLabel: "Support",
    title: "Support activity recorded",
    summary: "Support-related activity appears here as passive context for the dashboard experience.",
    timestampLabel: "Earlier",
  },
];

export function ActivityFeed() {
  return (
    <section
      aria-labelledby="activity-feed-heading"
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <div className="mb-4">
        <h2 id="activity-feed-heading" className="text-lg font-semibold text-slate-100">
          Activity Feed
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          A read-only timeline that provides ongoing context without interrupting the dashboard experience.
        </p>
      </div>

      {activityFeedMockData.length === 0 ? (
        <p className="text-sm text-slate-400">No activity yet.</p>
      ) : (
        <ol className="space-y-4">
          {activityFeedMockData.map((item) => (
            <ActivityItem
              key={item.id}
              title={item.title}
              summary={item.summary}
              timestampLabel={item.timestampLabel}
              typeLabel={item.typeLabel}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
