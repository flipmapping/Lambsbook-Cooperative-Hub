import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Plus, Pencil, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FollowupTask {
  id: string;
  prospect_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

interface ProspectFollowupTaskWorkspaceProps {
  prospectId: string;
}

export function ProspectFollowupTaskWorkspace({
  prospectId,
}: ProspectFollowupTaskWorkspaceProps) {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createDue, setCreateDue] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDue, setEditDue] = useState("");

  const queryKey = [`/api/admissions/prospects/${prospectId}/followup-tasks`];

  const { data: tasks = [], isLoading, isError } = useQuery<FollowupTask[]>({
    queryKey,
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/admissions/prospects/${prospectId}/followup-tasks`,
      );
      if (!res.ok) throw new Error("Failed to load follow-up tasks");
      return res.json();
    },
    enabled: !!prospectId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!createTitle.trim()) throw new Error("Title is required");
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/followup-tasks`,
        {
          title:       createTitle.trim(),
          description: createDesc.trim() || null,
          due_date:    createDue || null,
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Failed to create task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Task created" });
      setCreateTitle("");
      setCreateDesc("");
      setCreateDue("");
      setShowCreate(false);
    },
    onError: (err: Error) => {
      toast({ title: "Create failed", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admissions/prospects/${prospectId}/followup-tasks/${taskId}`,
        {
          title:       editTitle.trim() || undefined,
          description: editDesc.trim() || null,
          due_date:    editDue || null,
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Failed to update task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Task updated" });
      setEditingId(null);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/followup-tasks/${taskId}/complete`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Failed to complete task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Task completed" });
    },
    onError: (err: Error) => {
      toast({ title: "Complete failed", description: err.message, variant: "destructive" });
    },
  });

  function startEdit(task: FollowupTask) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description ?? "");
    setEditDue(task.due_date ?? "");
  }

  const pending  = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Follow-up Tasks</CardTitle>
            <CardDescription className="text-xs">
              Manage prospect follow-up actions.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 shrink-0"
            onClick={() => setShowCreate((v) => !v)}
          >
            <Plus className="h-3 w-3" />
            New Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        {showCreate && (
          <div className="rounded-md border p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium">New follow-up task</p>
            <Input
              placeholder="Title (required)"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="h-8 text-xs"
            />
            <Textarea
              placeholder="Description (optional)"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              className="text-xs min-h-[56px]"
            />
            <Input
              type="date"
              value={createDue}
              onChange={(e) => setCreateDue(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={!createTitle.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        )}

        {isError && (
          <p className="text-sm text-destructive">Failed to load tasks.</p>
        )}

        {!isLoading && !isError && tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No follow-up tasks yet.</p>
        )}

        {/* Pending tasks */}
        {pending.length > 0 && (
          <div className="space-y-2">
            {pending.map((task) => (
              <div key={task.id} className="rounded-md border p-3 space-y-2">
                {editingId === task.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="text-xs min-h-[56px]"
                    />
                    <Input
                      type="date"
                      value={editDue}
                      onChange={(e) => setEditDue(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate(task.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {updateMutation.isPending ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <button
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => completeMutation.mutate(task.id)}
                      disabled={completeMutation.isPending}
                      title="Mark complete"
                    >
                      <Circle className="h-4 w-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {task.due_date && (
                          <Badge variant="outline" className="text-xs h-5">
                            Due {formatDate(task.due_date)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Created {formatDate(task.created_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => startEdit(task)}
                      title="Edit task"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Completed tasks */}
        {completed.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Completed</p>
            {completed.map((task) => (
              <div
                key={task.id}
                className="rounded-md border p-3 bg-muted/20 opacity-70"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium line-through text-muted-foreground">
                      {task.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Completed {formatDate(task.completed_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
