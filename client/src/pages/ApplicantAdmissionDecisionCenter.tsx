import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface AdmissionDecision {
  id: string;
  prospect_id: string;
  decision: string;
  rationale: string | null;
  decided_by: string | null;
  offer_ready: boolean;
  decided_at: string;
}

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
  d: string
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
      return <CheckCircle2 className="h-5 w-5 text-primary" />;
    case "reject":
    case "withdrawn":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "waitlist":
    case "defer":
      return <Clock className="h-5 w-5 text-muted-foreground" />;
    default:
      return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function ApplicantAdmissionDecisionCenter() {
  const [, params] = useRoute("/hub/applicant/decisions/:id");
  const id = params?.id ?? "";

  const { data: decisions = [], isLoading, isError } =
    useQuery<AdmissionDecision[]>({
      queryKey: [`/api/admissions/prospects/${id}/decisions`],
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${id}/decisions`,
        );
        if (!res.ok) throw new Error("Failed to load decisions");
        return res.json();
      },
      enabled: !!id,
    });

  const latest = decisions.length > 0 ? decisions[decisions.length - 1] : null;

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
          <span className="text-sm font-medium">My Admission Decision</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your decision\u2026
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load decision. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && decisions.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Scale className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No admission decision has been recorded for your application yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your decision will appear here once the admissions committee has reviewed your application.
              </p>
            </CardContent>
          </Card>
        )}

        {latest && (
          <>
            {/* Current decision banner */}
            <Card className={latest.offer_ready ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    <DecisionIcon decision={latest.decision} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-semibold">
                        {formatDecision(latest.decision)}
                      </p>
                      <Badge variant={decisionVariant(latest.decision)} className="text-xs">
                        {latest.decision.replace(/_/g, " ")}
                      </Badge>
                      {latest.offer_ready && (
                        <Badge variant="default" className="text-xs bg-primary">
                          Offer Ready
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(latest.decided_at)}
                      {latest.decided_by && ` · ${latest.decided_by}`}
                    </p>
                    {latest.rationale && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        {latest.rationale}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full history */}
            {decisions.length > 1 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Decision History</CardTitle>
                  <CardDescription className="text-xs">
                    Complete record of decisions on your application.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="relative border-l border-border space-y-4 ml-3">
                    {decisions.map((dec, idx) => (
                      <li key={dec.id} className="ml-4">
                        <span
                          className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-background ${
                            idx === decisions.length - 1
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        />
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
                        <time className="text-xs text-muted-foreground">
                          {formatDateTime(dec.decided_at)}
                          {dec.decided_by && ` · ${dec.decided_by}`}
                        </time>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="text-center mb-2">
          <Link href={`/hub/applicant/timeline/${id}`}>
            <button className="text-xs text-primary underline hover:text-primary/80">
              View My Timeline
            </button>
          </Link>
        </div>
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
