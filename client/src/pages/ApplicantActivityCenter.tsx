import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";

interface ProspectActivity {
  id: string;
  prospect_id: string;
  activity_type: string;
  metadata: Record<string, unknown> | null;
  recorded_at: string;
}

function formatActivityType(activityType: string): string {
  return activityType
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

export default function ApplicantActivityCenter() {
  const [, params] = useRoute("/hub/applicant/activity/:id");
  const id = params?.id ?? "";

  const { data: activities = [], isLoading, isError } =
    useQuery<ProspectActivity[]>({
      queryKey: [`/api/admissions/prospects/${id}/activities`],
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${id}/activities`,
        );
        if (!res.ok) throw new Error("Failed to load activities");
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
          <span className="text-sm font-medium">My Activity</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your activity\u2026
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load activity. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No activities have been recorded for your application yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Activities will appear here as your application progresses.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity Log</CardTitle>
              <CardDescription className="text-xs">
                Immutable record of activities on your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-border space-y-6 ml-3">
                {activities.map((activity, idx) => (
                  <li key={activity.id} className="ml-5">
                    <span
                      className={`absolute -left-2 flex items-center justify-center
                        h-4 w-4 rounded-full border border-background
                        ${idx === activities.length - 1
                          ? "bg-primary"
                          : "bg-muted-foreground/30"}`}
                    />
                    <div className="space-y-1">
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
                      <time className="text-xs text-muted-foreground block">
                        {formatDateTime(activity.recorded_at)}
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
