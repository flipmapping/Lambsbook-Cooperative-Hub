import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'wouter';

interface Prospect {
  id: string;
  full_name: string;
  email: string;
  country: string;
  program_of_interest: string;
  phone: string | null;
  created_at: string;
  funnel_code: string | null;
  current_stage: string | null;
}

const LIFECYCLE_STAGES = [
  "registered",
  "screening",
  "interview_scheduled",
  "interview_completed",
  "offer_pending",
  "offer_accepted",
  "enrolled",
  "withdrawn",
] as const;

function stageBadgeVariant(stage: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (stage) {
    case "enrolled":      return "default";
    case "offer_accepted":return "default";
    case "withdrawn":     return "destructive";
    case "registered":    return "secondary";
    default:              return "outline";
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function AdmissionsWorkspace() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageInput, setStageInput] = useState<string>("");

  const { data: prospects = [], isLoading, isError } = useQuery<Prospect[]>({
    queryKey: ["/api/admissions/prospects"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admissions/prospects");
      return res.json();
    },
  });

  const selectedProspect = prospects.find((p) => p.id === selectedId) ?? null;

  const stageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const res = await apiRequest("PATCH", `/api/admissions/prospects/${id}/stage`, {
        current_stage: stage,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Stage update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admissions/prospects"] });
      toast({ title: "Stage updated", description: "Prospect lifecycle stage saved." });
      setStageInput("");
      setSelectedId(null);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  function handleStageUpdate() {
    if (!selectedId || !stageInput) return;
    stageMutation.mutate({ id: selectedId, stage: stageInput });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Admissions Workspace</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage prospect lifecycle progression.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {prospects.length} prospect{prospects.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading prospects…</p>
      )}

      {isError && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">
              Failed to load prospects. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && prospects.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No prospects registered yet.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && prospects.length > 0 && (
        <div className="grid gap-3">
          {prospects.map((p) => (
            <Card
              key={p.id}
              className={`cursor-pointer transition-colors ${
                selectedId === p.id ? "ring-2 ring-primary" : "hover:bg-accent/30"
              }`}
              onClick={() => {
                setSelectedId(selectedId === p.id ? null : p.id);
                setStageInput("");
              }}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold leading-tight truncate">
                      {p.full_name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {p.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={stageBadgeVariant(p.current_stage)} className="text-xs">
                      {p.current_stage ?? "untracked"}
                    </Badge>
                    <Link href={`/hub/admin/prospects/${p.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs px-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Country</dt>
                    <dd className="font-medium">{p.country}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Program</dt>
                    <dd className="font-medium truncate">{p.program_of_interest}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Funnel</dt>
                    <dd className="font-medium">{p.funnel_code ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Registered</dt>
                    <dd className="font-medium">{formatDate(p.created_at)}</dd>
                  </div>
                </dl>

                {selectedId === p.id && (
                  <div className="mt-4 pt-3 border-t space-y-2">
                    <p className="text-xs font-medium text-foreground">Update lifecycle stage</p>
                    <div className="flex gap-2 items-center">
                      <Select
                        value={stageInput}
                        onValueChange={setStageInput}
                      >
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue placeholder="Select stage…" />
                        </SelectTrigger>
                        <SelectContent>
                          {LIFECYCLE_STAGES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        disabled={!stageInput || stageMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStageUpdate();
                        }}
                      >
                        {stageMutation.isPending ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
