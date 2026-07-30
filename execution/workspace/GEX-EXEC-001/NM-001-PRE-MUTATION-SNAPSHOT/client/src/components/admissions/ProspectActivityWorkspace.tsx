import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProspectActivity {
  id: string;
  prospect_id: string;
  activity_type: string;
  metadata: Record<string, unknown> | null;
  recorded_at: string;
}

function formatActivityDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatActivityType(activityType: string): string {
  return activityType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface ProspectActivityWorkspaceProps {
  prospectId: string;
}

export function ProspectActivityWorkspace({
  prospectId,
}: ProspectActivityWorkspaceProps) {
  const { data: activities = [], isLoading, isError } = useQuery<
    ProspectActivity[]
  >({
    queryKey: [`/api/admissions/prospects/${prospectId}/activities`],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/admissions/prospects/${prospectId}/activities`,
      );
      if (!res.ok) throw new Error("Failed to load prospect activities");
      return res.json();
    },
    enabled: !!prospectId,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Activity Log</CardTitle>
        <CardDescription className="text-xs">
          Immutable record of prospect activities in chronological order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading activity log…
          </p>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to load activity log.
          </p>
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No activities recorded yet.
          </p>
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <ol className="relative border-l border-border space-y-6 ml-3">
            {activities.map((activity, idx) => (
              <li key={activity.id} className="ml-4">
                <span
                  className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background ${
                    idx === activities.length - 1
                      ? "bg-primary"
                      : "bg-muted-foreground/40"
                  }`}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {formatActivityType(activity.activity_type)}
                    </Badge>
                    {idx === activities.length - 1 && (
                      <span className="text-xs text-muted-foreground font-medium">
                        latest
                      </span>
                    )}
                  </div>
                  {activity.metadata &&
                    Object.keys(activity.metadata).length > 0 && (
                      <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                        {Object.entries(activity.metadata).map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-muted-foreground capitalize">
                              {k.replace(/_/g, " ")}
                            </dt>
                            <dd className="font-medium truncate">
                              {String(v)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  <time className="text-xs text-muted-foreground">
                    {formatActivityDate(activity.recorded_at)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
