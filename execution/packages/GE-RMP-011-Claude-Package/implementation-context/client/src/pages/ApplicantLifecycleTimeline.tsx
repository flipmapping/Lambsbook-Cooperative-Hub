import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity } from "lucide-react";

interface LifecycleEvent {
  id: string;
  prospect_id: string;
  event_type: string;
  metadata: Record<string, unknown> | null;
  recorded_at: string;
}

function formatEventType(eventType: string): string {
  return eventType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export default function ApplicantLifecycleTimeline() {
  const [, params] = useRoute("/hub/applicant/timeline/:id");
  const id = params?.id ?? "";

  const { data: events = [], isLoading, isError } =
    useQuery<LifecycleEvent[]>({
      queryKey: [`/api/admissions/prospects/${id}/events`],
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${id}/events`,
        );
        if (!res.ok) throw new Error("Failed to load lifecycle events");
        return res.json();
      },
      enabled: !!id,
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-2xl flex items-center gap-3">
          <Link href={`/hub/applicant/status/${id}`}>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Status
            </Button>
          </Link>
          <span className="text-sm font-medium">My Timeline</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your timeline\u2026
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load timeline. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && events.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No timeline events have been recorded for your application yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Events will appear here as your application progresses.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Application Timeline</CardTitle>
              <CardDescription className="text-xs">
                A chronological record of events on your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-border space-y-6 ml-3">
                {events.map((event, idx) => (
                  <li key={event.id} className="ml-5">
                    <span
                      className={`absolute -left-2 flex items-center justify-center
                        h-4 w-4 rounded-full border border-background
                        ${idx === events.length - 1
                          ? "bg-primary"
                          : "bg-muted-foreground/30"}`}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {formatEventType(event.event_type)}
                        </Badge>
                        {idx === events.length - 1 && (
                          <span className="text-xs text-muted-foreground font-medium">
                            latest
                          </span>
                        )}
                      </div>
                      {event.metadata &&
                        Object.keys(event.metadata).length > 0 && (
                          <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                            {Object.entries(event.metadata).map(([k, v]) => (
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
                      <time className="text-xs text-muted-foreground block">
                        {formatDateTime(event.recorded_at)}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-center text-muted-foreground pt-2">
          Questions? Contact{" "}
          <a href="mailto:admissions@lambsbook.net" className="underline hover:text-foreground">
            admissions@lambsbook.net
          </a>
        </p>
      </div>
    </div>
  );
}
