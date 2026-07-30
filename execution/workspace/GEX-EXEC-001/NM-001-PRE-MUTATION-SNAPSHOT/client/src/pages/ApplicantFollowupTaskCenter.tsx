import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, ClipboardList } from "lucide-react";

interface FollowupTask {
  id: string;
  prospect_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

export default function ApplicantFollowupTaskCenter() {
  const [, params] = useRoute("/hub/applicant/tasks/:id");
  const id = params?.id ?? "";

  const { data: tasks = [], isLoading, isError } =
    useQuery<FollowupTask[]>({
      queryKey: [`/api/admissions/prospects/${id}/followup-tasks`],
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${id}/followup-tasks`,
        );
        if (!res.ok) throw new Error("Failed to load tasks");
        return res.json();
      },
      enabled: !!id,
    });

  const pending   = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

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
          <span className="text-sm font-medium">My Tasks</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your tasks\u2026
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load tasks. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && tasks.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No follow-up tasks have been assigned to your application yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks assigned by your admissions advisor will appear here.
              </p>
            </CardContent>
          </Card>
        )}

        {pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">
              Pending ({pending.length})
            </h2>
            <Card>
              <CardContent className="pt-4 pb-4 space-y-4">
                {pending.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {task.due_at && (
                          <Badge variant="outline" className="text-xs h-5">
                            Due {formatDate(task.due_at)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Assigned {formatDate(task.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {completed.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">
              Completed ({completed.length})
            </h2>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground font-normal">
                  Completed tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4 space-y-3">
                {completed.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 opacity-70">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground line-through leading-tight">
                        {task.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        Completed {formatDate(task.completed_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
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
