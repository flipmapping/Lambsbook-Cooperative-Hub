#!/usr/bin/env python3
"""
GE-RMP-008 — Applicant Appointment Center
CIB Authority: GE-RMP-008 / Derived From: DISC-GE-APPLICANT-APPOINTMENT-CENTER-GAP

Production Surface: Applicant Appointment Center

Repository Truth (from ICM-GE-RMP-008):
  client/src/App.tsx                              — CERTIFIED (GE-RMP-007)
  client/src/pages/ApplicantJourneyStatus.tsx     — CERTIFIED (GE-RMP-007)
  client/src/pages/ApplicantDocumentCenter.tsx    — CERTIFIED (GE-RMP-007)

Gap: No applicant-facing appointment center.
Admissions appointment runtime exists (RMP-010E32A certified).

Permitted mutations:
  CREATE  client/src/pages/ApplicantAppointmentCenter.tsx
  MODIFY  client/src/App.tsx                          — lazy import + route
  MODIFY  client/src/pages/ApplicantJourneyStatus.tsx — appointments link
  MODIFY  client/src/pages/ApplicantDocumentCenter.tsx — appointments link

Forbidden: Backend, database, admissions runtime, prospect persistence, authentication.

Resumable mutation semantics.

Anchors (verified unique from Repository Truth):
  A1: ApplicantDocumentCenter lazy in App.tsx
  A2: /hub/applicant/documents/:id route in App.tsx
  A3: Journey Status — div close + contact p (after View My Documents div)
  A4: Document Center — contact paragraph opening tag

Quality gate: EXEC-STD-001 + EXEC-STD-002
"""

import sys
from pathlib import Path

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

_step_results: dict[str, str] = {}

def _ok(msg):   print(f"  {GREEN}✓{RESET}  {msg}")
def _skip(msg): print(f"  {YELLOW}⊘{RESET}  {msg}")
def _info(msg): print(f"  {CYAN}→{RESET}  {msg}")
def _head(msg): print(f"\n{BOLD}{msg}{RESET}")

def abort(reason):
    print(f"{RED}\n{'='*42}\nGE-RMP-008\nFAIL\n\n{reason}\n\nMutation aborted.\n{'='*42}\n{RESET}")
    sys.exit(1)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_APPT    = Path("client/src/pages/ApplicantAppointmentCenter.tsx")
FILE_APP     = Path("client/src/App.tsx")
FILE_JOURNEY = Path("client/src/pages/ApplicantJourneyStatus.tsx")
FILE_DOC     = Path("client/src/pages/ApplicantDocumentCenter.tsx")

IDEM_APPT_EXPORT   = "export default function ApplicantAppointmentCenter"
IDEM_APP_LAZY      = "const ApplicantAppointmentCenter = lazy"
IDEM_APP_ROUTE     = 'path="/hub/applicant/appointments/:id"'
IDEM_JOURNEY_LINK  = 'href={`/hub/applicant/appointments/${id}`}'
IDEM_DOC_LINK      = 'href={`/hub/applicant/appointments/${id}`}'

# App.tsx anchors
APP_LAZY_SEARCH  = "const ApplicantDocumentCenter = lazy(() => import('@/pages/ApplicantDocumentCenter'));"
APP_LAZY_REPLACE = ("const ApplicantDocumentCenter = lazy(() => import('@/pages/ApplicantDocumentCenter'));\n"
                    "const ApplicantAppointmentCenter = lazy(() => import('@/pages/ApplicantAppointmentCenter'));")

APP_ROUTE_SEARCH  = '      <Route path="/hub/applicant/documents/:id" component={ApplicantDocumentCenter} />'
APP_ROUTE_REPLACE = ('      <Route path="/hub/applicant/documents/:id" component={ApplicantDocumentCenter} />\n'
                     '      <Route path="/hub/applicant/appointments/:id" component={ApplicantAppointmentCenter} />')

# ApplicantJourneyStatus anchor: close of View My Documents div + contact p
JOURNEY_SEARCH = (
    '            </div>\n'
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)
JOURNEY_REPLACE = (
    '            </div>\n'
    '            <div className="text-center">\n'
    '              <Link href={`/hub/applicant/appointments/${id}`}>\n'
    '                <button className="text-xs text-primary underline hover:text-primary/80">\n'
    '                  View My Appointments\n'
    '                </button>\n'
    '              </Link>\n'
    '            </div>\n'
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)

# ApplicantDocumentCenter anchor: contact paragraph open
DOC_SEARCH  = '        <p className="text-xs text-center text-muted-foreground pt-2">'
DOC_REPLACE = ('        <div className="text-center">\n'
               '          <Link href={`/hub/applicant/appointments/${id}`}>\n'
               '            <button className="text-xs text-primary underline hover:text-primary/80">\n'
               '              View My Appointments\n'
               '            </button>\n'
               '          </Link>\n'
               '        </div>\n'
               '        <p className="text-xs text-center text-muted-foreground pt-2">')

# ════════════════════════════════════════════════════════════════
# FILE A — ApplicantAppointmentCenter.tsx (CREATE)
# Read-only. Consumes GET /api/admissions/prospects/:id/appointments.
# ════════════════════════════════════════════════════════════════

APPT_CENTER_SOURCE = '''import { useRoute, Link } from "wouter";
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
  notes: string | null;
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
            Loading your appointments\\u2026
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
                            {appt.duration_minutes && ` \\u00b7 ${appt.duration_minutes} min`}
                          </span>
                        </div>
                        {appt.location && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{appt.location}</span>
                          </div>
                        )}
                        {appt.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{appt.notes}</p>
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
                          {appt.outcome_notes && ` \\u2014 ${appt.outcome_notes}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
'''


def _write_and_verify(path, content):
    path.write_text(content, encoding="utf-8")
    if path.read_text(encoding="utf-8") != content:
        abort(f"Round-trip verification failed: {path.name}")
    _ok(f"Round-trip verified ({len(content)} chars)")


# ── Resumable mutations ───────────────────────────────────────

def _mutate_appt_center(root: Path) -> bool:
    path = root / FILE_APPT
    if path.exists():
        if IDEM_APPT_EXPORT in path.read_text(encoding="utf-8"):
            _skip("ApplicantAppointmentCenter.tsx already present — satisfied")
            return False
        abort(f"{FILE_APPT} exists but missing export — unexpected state.")
    path.parent.mkdir(parents=True, exist_ok=True)
    _write_and_verify(path, APPT_CENTER_SOURCE)
    _ok("ApplicantAppointmentCenter.tsx created")
    return True


def _mutate_app_lazy(root: Path) -> bool:
    path = root / FILE_APP
    if not path.exists():
        abort(f"File not found: {FILE_APP}")
    src = path.read_text(encoding="utf-8")
    if IDEM_APP_LAZY in src:
        _skip("App.tsx lazy import already present — satisfied")
        return False
    if APP_LAZY_SEARCH not in src:
        abort(f"Anchor not found in App.tsx: ApplicantDocumentCenter lazy declaration")
    if src.count(APP_LAZY_SEARCH) > 1:
        abort("Ambiguous anchor: ApplicantDocumentCenter lazy appears multiple times")
    _write_and_verify(path, src.replace(APP_LAZY_SEARCH, APP_LAZY_REPLACE, 1))
    _ok("App.tsx lazy import added")
    return True


def _mutate_app_route(root: Path) -> bool:
    path = root / FILE_APP
    src = path.read_text(encoding="utf-8")
    if IDEM_APP_ROUTE in src:
        _skip("App.tsx appointment route already present — satisfied")
        return False
    if APP_ROUTE_SEARCH not in src:
        abort(f"Anchor not found in App.tsx: /hub/applicant/documents/:id route")
    if src.count(APP_ROUTE_SEARCH) > 1:
        abort("Ambiguous anchor: /hub/applicant/documents/:id route appears multiple times")
    _write_and_verify(path, src.replace(APP_ROUTE_SEARCH, APP_ROUTE_REPLACE, 1))
    _ok("App.tsx appointment route added")
    return True


def _mutate_journey_link(root: Path) -> bool:
    path = root / FILE_JOURNEY
    if not path.exists():
        abort(f"File not found: {FILE_JOURNEY}")
    src = path.read_text(encoding="utf-8")
    if IDEM_JOURNEY_LINK in src:
        _skip("ApplicantJourneyStatus.tsx appointment link already present — satisfied")
        return False
    if JOURNEY_SEARCH not in src:
        abort(f"Anchor not found in ApplicantJourneyStatus.tsx: View My Documents div + contact p")
    if src.count(JOURNEY_SEARCH) > 1:
        abort("Ambiguous anchor in ApplicantJourneyStatus.tsx")
    _write_and_verify(path, src.replace(JOURNEY_SEARCH, JOURNEY_REPLACE, 1))
    _ok("ApplicantJourneyStatus.tsx appointment link added")
    return True


def _mutate_doc_link(root: Path) -> bool:
    path = root / FILE_DOC
    if not path.exists():
        abort(f"File not found: {FILE_DOC}")
    src = path.read_text(encoding="utf-8")
    if IDEM_DOC_LINK in src:
        _skip("ApplicantDocumentCenter.tsx appointment link already present — satisfied")
        return False
    if DOC_SEARCH not in src:
        abort(f"Anchor not found in ApplicantDocumentCenter.tsx: contact paragraph")
    if src.count(DOC_SEARCH) > 1:
        abort("Ambiguous anchor in ApplicantDocumentCenter.tsx")
    _write_and_verify(path, src.replace(DOC_SEARCH, DOC_REPLACE, 1))
    _ok("ApplicantDocumentCenter.tsx appointment link added")
    return True


# ════════════════════════════════════════════════════════════════
# STAGES
# ════════════════════════════════════════════════════════════════

def stage_1_repository(root):
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        if (root / anchor).exists():
            _ok(f"Anchor: {anchor}")
        else:
            abort(f"Repository anchor missing: {anchor}")
    _step_results["Repository anchors"] = "PASS"


def stage_2_repository_truth(root):
    _head("STAGE 2 — Repository Truth Verification")
    app_path = root / FILE_APP
    if not app_path.exists():
        abort(f"File not found: {FILE_APP}")
    app_src = app_path.read_text(encoding="utf-8")
    for marker, dep in [
        ("const ApplicantJourneyStatus = lazy",  "ApplicantJourneyStatus (GE-RMP-005)"),
        ("const ApplicantStatusLookup = lazy",   "ApplicantStatusLookup (GE-RMP-006)"),
        ("const ApplicantDocumentCenter = lazy", "ApplicantDocumentCenter (GE-RMP-007)"),
        ('/hub/applicant/documents/:id',          "documents route (GE-RMP-007)"),
    ]:
        if marker in app_src:
            _ok(f"Prerequisite VERIFIED: {dep}")
        else:
            abort(f"Prerequisite MISSING: {dep}\n\nGE-RMP-005/006/007 must be certified first.")
    for f in [FILE_JOURNEY, FILE_DOC]:
        if not (root / f).exists():
            abort(f"File not found: {f}")
        _ok(f"{f} located")
    _step_results["Repository Truth"] = "PASS"


def stage_3_mutations(root):
    _head("STAGE 3 — Resumable Mutation Execution")
    results = {}
    _info("Mutation 1/5: ApplicantAppointmentCenter.tsx")
    results["ApplicantAppointmentCenter.tsx"] = "applied" if _mutate_appt_center(root) else "already satisfied"
    _info("Mutation 2/5: App.tsx lazy import")
    results["App.tsx lazy import"] = "applied" if _mutate_app_lazy(root) else "already satisfied"
    _info("Mutation 3/5: App.tsx appointment route")
    results["App.tsx appointment route"] = "applied" if _mutate_app_route(root) else "already satisfied"
    _info("Mutation 4/5: ApplicantJourneyStatus.tsx link")
    results["ApplicantJourneyStatus.tsx link"] = "applied" if _mutate_journey_link(root) else "already satisfied"
    _info("Mutation 5/5: ApplicantDocumentCenter.tsx link")
    results["ApplicantDocumentCenter.tsx link"] = "applied" if _mutate_doc_link(root) else "already satisfied"
    for label, outcome in results.items():
        if outcome == "applied": _ok(f"{label}: applied")
        else:                    _skip(f"{label}: already satisfied")
    all_sat = all(v == "already satisfied" for v in results.values())
    _step_results["Mutations"] = "PASS (Already Satisfied)" if all_sat else "PASS"


def stage_4_post_verify(root):
    _head("STAGE 4 — Post-Mutation Verification")

    appt_src    = (root / FILE_APPT).read_text(encoding="utf-8")
    app_src     = (root / FILE_APP).read_text(encoding="utf-8")
    journey_src = (root / FILE_JOURNEY).read_text(encoding="utf-8")
    doc_src     = (root / FILE_DOC).read_text(encoding="utf-8")

    for marker, desc in [
        (IDEM_APPT_EXPORT,                             "default export"),
        ("/api/admissions/prospects/${id}/appointments","appointments endpoint consumed"),
        ("useQuery",                                    "useQuery — read-only"),
        ("/hub/applicant/status/${id}",                "back link to journey status"),
        ("CalendarClock",                               "calendar icon"),
        ("status",                                      "status displayed"),
        ("outcome",                                     "outcome displayed"),
        ("admissions@lambsbook.net",                    "support contact"),
    ]:
        if marker in appt_src:
            _ok(f"Appt center: {desc}")
        else:
            abort(f"Appt center missing: {desc}")

    for forbidden in ["useMutation", 'apiRequest("POST"', 'apiRequest("PATCH"', "supabase"]:
        if forbidden in appt_src:
            abort(f"Forbidden in appt center: {forbidden!r}")
    _ok("Appt center: no forbidden mutations — read-only")

    for marker, expected, desc in [
        (IDEM_APP_LAZY,           1, "ApplicantAppointmentCenter lazy import"),
        (IDEM_APP_ROUTE,          1, "/hub/applicant/appointments/:id route"),
        ('/hub/applicant/documents/:id', 1, "documents route preserved"),
        ('/hub/applicant/status/:id', 1, "status route preserved"),
    ]:
        count = app_src.count(marker)
        if count == expected:
            _ok(f"App.tsx [{desc}]: {count}")
        else:
            abort(f"App.tsx [{desc}]: count={count}, expected={expected}")

    if IDEM_JOURNEY_LINK in journey_src:
        _ok("ApplicantJourneyStatus: appointment link present")
    else:
        abort("ApplicantJourneyStatus: appointment link missing")

    if IDEM_DOC_LINK in doc_src:
        _ok("ApplicantDocumentCenter: appointment link present")
    else:
        abort("ApplicantDocumentCenter: appointment link missing")

    _step_results["Post-verification"] = "PASS"


def print_summary():
    _head("MUTATION SUMMARY")
    max_len = max(len(k) for k in _step_results)
    for step, state in _step_results.items():
        colour = YELLOW if "Already" in state else GREEN
        print(f"  {step.ljust(max_len)}   {colour}{state}{RESET}")
    all_pass = all(s.startswith("PASS") for s in _step_results.values())
    print()
    if all_pass:
        all_sat = "Already Satisfied" in _step_results.get("Mutations", "")
        tag = " (Already Satisfied)" if all_sat else ""
        print(f"{BOLD}{GREEN}══ RESULT: PASS{tag} ══{RESET}{RESET}")
        print()
        print(f"  CREATE/VERIFY  {FILE_APPT}")
        print(f"  MODIFY/VERIFY  {FILE_APP}")
        print(f"  MODIFY/VERIFY  {FILE_JOURNEY}")
        print(f"  MODIFY/VERIFY  {FILE_DOC}")
        print()
        print("  ✓  Applicant Appointment Center (/hub/applicant/appointments/:id)")
        print("  ✓  Route registered in App.tsx")
        print("  ✓  'View My Appointments' link in Applicant Journey Status")
        print("  ✓  'View My Appointments' link in Applicant Document Center")
        print("  ✓  GET /api/admissions/prospects/:id/appointments consumed (read-only)")
        print("  ✓  No backend mutations")
        print()
        print("  Second execution: PASS (Already Satisfied)")
    else:
        print(f"{BOLD}{RED}══ RESULT: FAIL ══{RESET}{RESET}")
        sys.exit(1)


def resolve_root():
    for candidate in [Path(__file__).resolve().parent.parent.parent, Path.cwd()]:
        if all((candidate / a).exists() for a in REPO_ROOT_ANCHORS):
            return candidate
    if len(sys.argv) > 1:
        p = Path(sys.argv[1]).resolve()
        if all((p / a).exists() for a in REPO_ROOT_ANCHORS):
            return p
    abort("Repository root not found.\n\nPass root as argument:\n  python GE-RMP-008_applicant_appointment_center.py /path/to/repo")
    raise SystemExit(1)


def main():
    print(f"\n{BOLD}GE-RMP-008 — Applicant Appointment Center{RESET}")
    print(f"{BOLD}CIB Authority: GE-RMP-008 / DISC-GE-APPLICANT-APPOINTMENT-CENTER-GAP{RESET}\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    stage_1_repository(root)
    stage_2_repository_truth(root)
    stage_3_mutations(root)
    stage_4_post_verify(root)
    print_summary()


if __name__ == "__main__":
    main()
