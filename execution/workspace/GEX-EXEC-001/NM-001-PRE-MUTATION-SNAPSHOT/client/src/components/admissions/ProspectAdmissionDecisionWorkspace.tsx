import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Scale, Plus, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdmissionDecision {
  id: string;
  prospect_id: string;
  decision: string;
  rationale: string | null;
  decided_by: string | null;
  offer_ready: boolean;
  decided_at: string;
}

const DECISION_VALUES = [
  "admit",
  "conditional_admit",
  "waitlist",
  "defer",
  "reject",
  "withdrawn",
] as const;

function formatDecision(d: string): string {
  return d.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function decisionVariant(
  d: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (d) {
    case "admit":
    case "conditional_admit": return "default";
    case "reject":
    case "withdrawn":         return "destructive";
    case "waitlist":
    case "defer":             return "secondary";
    default:                  return "outline";
  }
}

function DecisionIcon({ decision }: { decision: string }) {
  switch (decision) {
    case "admit":
    case "conditional_admit":
      return <CheckCircle2 className="h-4 w-4 text-primary" />;
    case "reject":
    case "withdrawn":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "waitlist":
    case "defer":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

interface ProspectAdmissionDecisionWorkspaceProps {
  prospectId: string;
}

export function ProspectAdmissionDecisionWorkspace({
  prospectId,
}: ProspectAdmissionDecisionWorkspaceProps) {
  const { toast } = useToast();
  const queryKey = [`/api/admissions/prospects/${prospectId}/decisions`];

  const [showRecord, setShowRecord] = useState(false);
  const [decisionValue, setDecisionValue] = useState("");
  const [rationale, setRationale]         = useState("");
  const [decidedBy, setDecidedBy]         = useState("");
  const [offerReady, setOfferReady]       = useState(false);

  const { data: decisions = [], isLoading, isError } =
    useQuery<AdmissionDecision[]>({
      queryKey,
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${prospectId}/decisions`,
        );
        if (!res.ok) throw new Error("Failed to load admission decisions");
        return res.json();
      },
      enabled: !!prospectId,
    });

  const recordMutation = useMutation({
    mutationFn: async () => {
      if (!decisionValue) throw new Error("Decision is required");
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/decisions`,
        {
          decision:    decisionValue,
          rationale:   rationale.trim() || null,
          decided_by:  decidedBy.trim() || null,
          offer_ready: offerReady,
        },
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Record failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Decision recorded" });
      setDecisionValue(""); setRationale(""); setDecidedBy("");
      setOfferReady(false); setShowRecord(false);
    },
    onError: (e: Error) =>
      toast({ title: "Record failed", description: e.message, variant: "destructive" }),
  });

  const latest = decisions.length > 0 ? decisions[decisions.length - 1] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Admission Decisions
            </CardTitle>
            <CardDescription className="text-xs">
              Immutable audit trail of admission decisions.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 shrink-0"
            onClick={() => setShowRecord((v) => !v)}
          >
            <Plus className="h-3 w-3" />
            Record Decision
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current status banner */}
        {latest && (
          <div className={`rounded-md p-3 flex items-start gap-3 ${
            latest.offer_ready ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
          }`}>
            <DecisionIcon decision={latest.decision} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">
                  Current: {formatDecision(latest.decision)}
                </span>
                <Badge variant={decisionVariant(latest.decision)} className="text-xs">
                  {latest.decision}
                </Badge>
                {latest.offer_ready && (
                  <Badge variant="default" className="text-xs bg-primary">
                    Offer Ready
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDateTime(latest.decided_at)}
                {latest.decided_by && ` · ${latest.decided_by}`}
              </p>
              {latest.rationale && (
                <p className="text-xs mt-1 text-muted-foreground">{latest.rationale}</p>
              )}
            </div>
          </div>
        )}

        {/* Record form */}
        {showRecord && (
          <div className="rounded-md border p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium">Record new admission decision</p>
            <Select value={decisionValue} onValueChange={setDecisionValue}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select decision…" />
              </SelectTrigger>
              <SelectContent>
                {DECISION_VALUES.map((d) => (
                  <SelectItem key={d} value={d} className="text-xs">
                    {formatDecision(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Rationale (optional)"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="text-xs min-h-[56px]"
            />
            <Input
              placeholder="Decided by (email / name)"
              value={decidedBy}
              onChange={(e) => setDecidedBy(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="flex items-center gap-2">
              <Switch
                id="offer-ready"
                checked={offerReady}
                onCheckedChange={setOfferReady}
              />
              <label htmlFor="offer-ready" className="text-xs cursor-pointer">
                Offer ready
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" className="h-7 text-xs"
                onClick={() => setShowRecord(false)}>Cancel</Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={!decisionValue || recordMutation.isPending}
                onClick={() => recordMutation.mutate()}
              >
                {recordMutation.isPending ? "Recording…" : "Record"}
              </Button>
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-muted-foreground">Loading decisions…</p>}
        {isError   && <p className="text-sm text-destructive">Failed to load decisions.</p>}

        {!isLoading && !isError && decisions.length === 0 && (
          <p className="text-sm text-muted-foreground">No admission decisions recorded yet.</p>
        )}

        {/* Full audit trail (all decisions, oldest first) */}
        {decisions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Audit Trail ({decisions.length})
            </p>
            <ol className="relative border-l border-border space-y-4 ml-3">
              {decisions.map((dec, idx) => (
                <li key={dec.id} className="ml-4">
                  <span
                    className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background ${
                      idx === decisions.length - 1
                        ? "bg-primary"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={decisionVariant(dec.decision)} className="text-xs">
                        {formatDecision(dec.decision)}
                      </Badge>
                      {dec.offer_ready && (
                        <Badge variant="outline" className="text-xs">
                          Offer Ready
                        </Badge>
                      )}
                      {idx === decisions.length - 1 && (
                        <span className="text-xs text-muted-foreground font-medium">
                          current
                        </span>
                      )}
                    </div>
                    {dec.rationale && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dec.rationale}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <time>{formatDateTime(dec.decided_at)}</time>
                      {dec.decided_by && <span>· {dec.decided_by}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
