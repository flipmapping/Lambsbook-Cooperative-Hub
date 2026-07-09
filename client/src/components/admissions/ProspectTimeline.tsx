import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LifecycleEvent {
  id: string;
  prospect_id: string;
  from_stage: string | null;
  to_stage: string;
  recorded_at: string;
}

function formatEventDate(iso: string): string {
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

function stageBadgeVariant(
  stage: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (stage) {
    case "enrolled":
    case "offer_accepted":
      return "default";
    case "withdrawn":
      return "destructive";
    case "registered":
      return "secondary";
    default:
      return "outline";
  }
}

interface ProspectTimelineProps {
  prospectId: string;
}

export function ProspectTimeline({ prospectId }: ProspectTimelineProps) {
  const { data: events = [], isLoading, isError } = useQuery<LifecycleEvent[]>({
    queryKey: [`/api/admissions/prospects/${prospectId}/events`],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/admissions/prospects/${prospectId}/events`,
      );
      if (!res.ok) throw new Error("Failed to load lifecycle events");
      return res.json();
    },
    enabled: !!prospectId,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lifecycle Timeline</CardTitle>
        <CardDescription className="text-xs">
          Chronological record of admissions stage progression.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading timeline…</p>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to load lifecycle events.
          </p>
        )}

        {!isLoading && !isError && events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No lifecycle events recorded yet.
          </p>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <ol className="relative border-l border-border space-y-6 ml-3">
            {events.map((event, idx) => (
              <li key={event.id} className="ml-4">
                <span
                  className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background ${
                    idx === events.length - 1
                      ? "bg-primary"
                      : "bg-muted-foreground/40"
                  }`}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {event.from_stage && (
                      <>
                        <Badge
                          variant={stageBadgeVariant(event.from_stage)}
                          className="text-xs"
                        >
                          {event.from_stage.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                      </>
                    )}
                    <Badge
                      variant={stageBadgeVariant(event.to_stage)}
                      className="text-xs"
                    >
                      {event.to_stage.replace(/_/g, " ")}
                    </Badge>
                    {idx === events.length - 1 && (
                      <span className="text-xs text-muted-foreground font-medium">
                        current
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {formatEventDate(event.recorded_at)}
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
