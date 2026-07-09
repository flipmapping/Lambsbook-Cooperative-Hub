import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, Circle } from "lucide-react";

interface ApplicantStatus {
  id: string;
  full_name: string;
  email: string;
  program_of_interest: string;
  current_stage: string | null;
  created_at: string;
}

const JOURNEY_STAGES = [
  { id: "registered",          label: "Application Received" },
  { id: "screening",           label: "Under Review" },
  { id: "interview_scheduled", label: "Interview Scheduled" },
  { id: "interview_completed", label: "Interview Completed" },
  { id: "offer_pending",       label: "Offer Pending" },
  { id: "offer_accepted",      label: "Offer Accepted" },
  { id: "enrolled",            label: "Enrolled" },
] as const;

function stageIndex(stage: string | null): number {
  if (!stage) return -1;
  return JOURNEY_STAGES.findIndex((s) => s.id === stage);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return iso; }
}

export default function ApplicantJourneyStatus() {
  const [, params] = useRoute("/hub/applicant/status/:id");
  const id = params?.id ?? "";

  const { data: applicant, isLoading, isError } = useQuery<ApplicantStatus>({
    queryKey: [`/api/admissions/prospects/${id}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admissions/prospects/${id}`);
      if (!res.ok) throw new Error("Application not found");
      return res.json();
    },
    enabled: !!id,
  });

  const currentIdx = stageIndex(applicant?.current_stage ?? null);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-2xl flex items-center gap-3">
          <Link href="/hub/prospect-registration">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <span className="text-sm font-medium">Application Status</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your application…
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Application not found. Please check your application reference.
              </p>
              <Link href="/hub/prospect-registration">
                <Button variant="outline" size="sm" className="mt-4">
                  Return to Registration
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {applicant && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{applicant.full_name}</CardTitle>
                <CardDescription>{applicant.program_of_interest}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application date</span>
                  <span>{formatDate(applicant.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{applicant.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={
                    applicant.current_stage === "enrolled" ? "default" :
                    applicant.current_stage === "offer_accepted" ? "default" :
                    applicant.current_stage === "withdrawn" ? "destructive" :
                    "secondary"
                  }>
                    {applicant.current_stage?.replace(/_/g, " ") ?? "registered"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Application Journey</CardTitle>
                <CardDescription className="text-xs">
                  Your progress through the admissions process.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="relative border-l border-border space-y-5 ml-3">
                  {JOURNEY_STAGES.map((stage, idx) => {
                    const completed = idx < currentIdx;
                    const current   = idx === currentIdx;
                    const pending   = idx > currentIdx;
                    return (
                      <li key={stage.id} className="ml-5">
                        <span className={`absolute -left-2 flex items-center justify-center h-4 w-4 rounded-full border border-background ${completed ? "bg-primary" : current ? "bg-primary" : "bg-muted-foreground/20"}`}>
                          {completed ? (
                            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                          ) : current ? (
                            <Clock className="h-3 w-3 text-primary-foreground" />
                          ) : (
                            <Circle className="h-3 w-3 text-muted-foreground/40" />
                          )}
                        </span>
                        <p className={`text-sm leading-tight ${pending ? "text-muted-foreground" : current ? "font-semibold" : "text-foreground"}`}>
                          {stage.label}
                          {current && (
                            <span className="ml-2 text-xs text-primary font-normal">
                              ← current
                            </span>
                          )}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>

            <p className="text-xs text-center text-muted-foreground">
              Questions about your application? Contact us at{" "}
              <a href="mailto:admissions@lambsbook.net" className="underline hover:text-foreground">
                admissions@lambsbook.net
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
