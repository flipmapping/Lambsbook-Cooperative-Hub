import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { ProspectTimeline } from "@/components/admissions/ProspectTimeline";
import { ProspectActivityWorkspace } from "@/components/admissions/ProspectActivityWorkspace";
import { ProspectFollowupTaskWorkspace } from "@/components/admissions/ProspectFollowupTaskWorkspace";
import { ProspectAppointmentWorkspace } from "@/components/admissions/ProspectAppointmentWorkspace";
import { ProspectDocumentWorkspace } from "@/components/admissions/ProspectDocumentWorkspace";
import { ProspectAdmissionDecisionWorkspace } from "@/components/admissions/ProspectAdmissionDecisionWorkspace";
import { useToast } from "@/hooks/use-toast";

interface ProspectDetail {
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
    case "enrolled":       return "default";
    case "offer_accepted": return "default";
    case "withdrawn":      return "destructive";
    case "registered":     return "secondary";
    default:               return "outline";
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function FieldRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value ?? "—"}</dd>
    </div>
  );
}

export default function ProspectDetailWorkspace() {
  const [, params] = useRoute("/hub/admin/prospects/:id");
  const id = params?.id ?? "";
  const { toast } = useToast();
  const [stageInput, setStageInput] = useState<string>("");

  const { data: prospect, isLoading, isError } = useQuery<ProspectDetail>({
    queryKey: [`/api/admissions/prospects/${id}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admissions/prospects/${id}`);
      if (!res.ok) {
        throw new Error("Prospect not found");
      }
      return res.json();
    },
    enabled: !!id,
  });

  const stageMutation = useMutation({
    mutationFn: async (stage: string) => {
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
      queryClient.invalidateQueries({ queryKey: [`/api/admissions/prospects/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admissions/prospects"] });
      toast({ title: "Stage updated", description: "Prospect lifecycle stage saved." });
      setStageInput("");
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center gap-3">
          <Link href="/hub/admin">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Admissions Workspace
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading prospect…</p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                Prospect not found or failed to load.
              </p>
              <Link href="/hub/admin">
                <Button variant="outline" size="sm" className="mt-3">
                  Return to Admissions Workspace
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {prospect && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{prospect.full_name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{prospect.email}</p>
              </div>
              <Badge
                variant={stageBadgeVariant(prospect.current_stage)}
                className="text-sm px-3 py-1 shrink-0"
              >
                {prospect.current_stage ?? "untracked"}
              </Badge>
            </div>

            {/* Prospect Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Prospect Information</CardTitle>
                <CardDescription className="text-xs">
                  Read-only admissions record.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <FieldRow label="Full Name"          value={prospect.full_name} />
                  <FieldRow label="Email"              value={prospect.email} />
                  <FieldRow label="Country"            value={prospect.country} />
                  <FieldRow label="Program of Interest" value={prospect.program_of_interest} />
                  <FieldRow label="Phone"              value={prospect.phone} />
                  <FieldRow label="Funnel Code"        value={prospect.funnel_code} />
                  <FieldRow label="Current Stage"      value={prospect.current_stage} />
                  <FieldRow label="Registered"         value={formatDate(prospect.created_at)} />
                </dl>
              </CardContent>
            </Card>

            {/* Stage Update */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lifecycle Progression</CardTitle>
                <CardDescription className="text-xs">
                  Update the prospect's admissions stage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="flex gap-3 items-center">
                  <Select value={stageInput} onValueChange={setStageInput}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select new stage…" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIFECYCLE_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={!stageInput || stageMutation.isPending}
                    onClick={() => stageMutation.mutate(stageInput)}
                  >
                    {stageMutation.isPending ? "Saving…" : "Update Stage"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current stage: <span className="font-medium">{prospect.current_stage ?? "untracked"}</span>
                </p>
              </CardContent>
            </Card>

            {/* Lifecycle Timeline */}
            <ProspectTimeline prospectId={id} />

            {/* Activity Log */}
            <ProspectActivityWorkspace prospectId={id} />

            {/* Follow-up Tasks */}
            <ProspectFollowupTaskWorkspace prospectId={id} />

            {/* Appointments & Interviews */}
            <ProspectAppointmentWorkspace prospectId={id} />

            {/* Documents */}
            <ProspectDocumentWorkspace prospectId={id} />

            {/* Admission Decisions */}
            <ProspectAdmissionDecisionWorkspace prospectId={id} />
          </>
        )}
      </div>
    </div>
  );
}
