import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarClock, MapPin, Clock } from "lucide-react";

interface ApplicantAppointment {
  id: string;
  prospect_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number | null;
  location: string | null;
  description: string | null;
  status: string;
  outcome: string | null;
  outcome_notes: string | null;
  created_at: string;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":  return "default";
    case "cancelled":  return "destructive";
    case "scheduled":  return "secondary";
    default:           return "outline";
  }
}

export default function ApplicantAppointmentCenter() {
  const [, params] = useRoute("/hub/applicant/appointments/:id");
  const id = params?.id ?? "";

  const { data: appointments = [], isLoading, isError } =
    useQuery<ApplicantAppointment[]>({
      queryKey: [`/api/admissions/prospects/${id}/appointments`],
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${id}/appointments`,
        );
        if (!res.ok) throw new Error("Failed to load appointments");
        return res.json();
      },
      enabled: !!id,
    });

  const upcoming  = appointments.filter((a) => a.status === "scheduled");
  const concluded = appointments.filter((a) => a.status !== "scheduled");

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
          <span className="text-sm font-medium">My Appointments</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your appointments\u2026
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load appointments. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && appointments.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <CalendarClock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No appointments have been scheduled for your application yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Appointments will appear here once your admissions advisor schedules them.
              </p>
            </CardContent>
          </Card>
        )}

        {upcoming.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.map((appt) => (
              <Card key={appt.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarClock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{appt.title}</p>
                        <Badge variant={statusVariant(appt.status)} className="text-xs shrink-0">
                          {appt.status}
                        </Badge>
                      </div>
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>
                            {formatDateTime(appt.scheduled_at)}
                            {appt.duration_minutes && ` \u00b7 ${appt.duration_minutes} min`}
                          </span>
                        </div>
                        {appt.location && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{appt.location}</span>
                          </div>
                        )}
                        {appt.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{appt.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {concluded.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">
              Past Appointments ({concluded.length})
            </h2>
            {concluded.map((appt) => (
              <Card key={appt.id} className="opacity-70">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-muted-foreground leading-tight">{appt.title}</p>
                        <Badge variant={statusVariant(appt.status)} className="text-xs shrink-0">
                          {appt.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(appt.scheduled_at)}
                      </p>
                      {appt.outcome && (
                        <p className="text-xs mt-1">
                          <span className="font-medium">Outcome:</span>{" "}
                          {appt.outcome.replace(/_/g, " ")}
                          {appt.outcome_notes && ` \u2014 ${appt.outcome_notes}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mb-2">
          <Link href={`/hub/applicant/decisions/${id}`}>
            <button className="text-xs text-primary underline hover:text-primary/80">
              View My Decision
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
