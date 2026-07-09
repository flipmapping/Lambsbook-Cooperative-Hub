#!/usr/bin/env python3
"""
GE-RMP-009 — Applicant Admission Decision Center
CIB Authority: GE-RMP-009 / Derived From: DISC-GE-APPLICANT-ADMISSION-DECISION-CENTER-GAP

Production Surface: Applicant Admission Decision Center

Repository Truth (from ICM-GE-RMP-009):
  client/src/App.tsx                              — CERTIFIED (GE-RMP-008)
  client/src/pages/ApplicantJourneyStatus.tsx     — CERTIFIED (GE-RMP-008)
  client/src/pages/ApplicantAppointmentCenter.tsx — CERTIFIED (GE-RMP-008)

Permitted mutations:
  CREATE  client/src/pages/ApplicantAdmissionDecisionCenter.tsx
  MODIFY  client/src/App.tsx                            — lazy import + route
  MODIFY  client/src/pages/ApplicantJourneyStatus.tsx   — decision link
  MODIFY  client/src/pages/ApplicantAppointmentCenter.tsx — decision link

Forbidden: Backend, database, admissions runtime, prospect persistence, authentication.

Resumable mutation semantics.

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
    print(f"{RED}\n{'='*42}\nGE-RMP-009\nFAIL\n\n{reason}\n\nMutation aborted.\n{'='*42}\n{RESET}")
    sys.exit(1)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_DEC     = Path("client/src/pages/ApplicantAdmissionDecisionCenter.tsx")
FILE_APP     = Path("client/src/App.tsx")
FILE_JOURNEY = Path("client/src/pages/ApplicantJourneyStatus.tsx")
FILE_APPT    = Path("client/src/pages/ApplicantAppointmentCenter.tsx")

IDEM_DEC_EXPORT  = "export default function ApplicantAdmissionDecisionCenter"
IDEM_APP_LAZY    = "const ApplicantAdmissionDecisionCenter = lazy"
IDEM_APP_ROUTE   = 'path="/hub/applicant/decisions/:id"'
IDEM_JOURNEY_LINK = 'href={`/hub/applicant/decisions/${id}`}'

APP_LAZY_SEARCH  = "const ApplicantAppointmentCenter = lazy(() => import('@/pages/ApplicantAppointmentCenter'));"
APP_LAZY_REPLACE = ("const ApplicantAppointmentCenter = lazy(() => import('@/pages/ApplicantAppointmentCenter'));\n"
                    "const ApplicantAdmissionDecisionCenter = lazy(() => import('@/pages/ApplicantAdmissionDecisionCenter'));")

APP_ROUTE_SEARCH  = '      <Route path="/hub/applicant/appointments/:id" component={ApplicantAppointmentCenter} />'
APP_ROUTE_REPLACE = ('      <Route path="/hub/applicant/appointments/:id" component={ApplicantAppointmentCenter} />\n'
                     '      <Route path="/hub/applicant/decisions/:id" component={ApplicantAdmissionDecisionCenter} />')

JOURNEY_SEARCH = (
    '            </div>\n'
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)
JOURNEY_REPLACE = (
    '            </div>\n'
    '            <div className="text-center">\n'
    '              <Link href={`/hub/applicant/decisions/${id}`}>\n'
    '                <button className="text-xs text-primary underline hover:text-primary/80">\n'
    '                  View My Decision\n'
    '                </button>\n'
    '              </Link>\n'
    '            </div>\n'
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)

APPT_SEARCH  = '        <p className="text-xs text-center text-muted-foreground pt-2">'
APPT_REPLACE = ('        <div className="text-center mb-2">\n'
                '          <Link href={`/hub/applicant/decisions/${id}`}>\n'
                '            <button className="text-xs text-primary underline hover:text-primary/80">\n'
                '              View My Decision\n'
                '            </button>\n'
                '          </Link>\n'
                '        </div>\n'
                '        <p className="text-xs text-center text-muted-foreground pt-2">')

# ════════════════════════════════════════════════════════════════
# FILE A — ApplicantAdmissionDecisionCenter.tsx (CREATE)
# Read-only. Consumes GET /api/admissions/prospects/:id/decisions.
# Decisions are immutable (append-only) — display only.
# ════════════════════════════════════════════════════════════════

DEC_CENTER_SOURCE = '''import { useRoute, Link } from "wouter";
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
            Loading your decision\\u2026
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
                      {latest.decided_by && ` \u00b7 ${latest.decided_by}`}
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
                          {dec.decided_by && ` \u00b7 ${dec.decided_by}`}
                        </time>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </>
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


def _mutate_dec_center(root: Path) -> bool:
    path = root / FILE_DEC
    if path.exists():
        if IDEM_DEC_EXPORT in path.read_text(encoding="utf-8"):
            _skip("ApplicantAdmissionDecisionCenter.tsx already present — satisfied")
            return False
        abort(f"{FILE_DEC} exists but missing export — unexpected state.")
    path.parent.mkdir(parents=True, exist_ok=True)
    _write_and_verify(path, DEC_CENTER_SOURCE)
    _ok("ApplicantAdmissionDecisionCenter.tsx created")
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
        abort("Anchor not found in App.tsx: ApplicantAppointmentCenter lazy")
    if src.count(APP_LAZY_SEARCH) > 1:
        abort("Ambiguous anchor: ApplicantAppointmentCenter lazy")
    _write_and_verify(path, src.replace(APP_LAZY_SEARCH, APP_LAZY_REPLACE, 1))
    _ok("App.tsx lazy import added")
    return True


def _mutate_app_route(root: Path) -> bool:
    path = root / FILE_APP
    src = path.read_text(encoding="utf-8")
    if IDEM_APP_ROUTE in src:
        _skip("App.tsx decision route already present — satisfied")
        return False
    if APP_ROUTE_SEARCH not in src:
        abort("Anchor not found in App.tsx: /hub/applicant/appointments/:id route")
    if src.count(APP_ROUTE_SEARCH) > 1:
        abort("Ambiguous anchor: appointments route")
    _write_and_verify(path, src.replace(APP_ROUTE_SEARCH, APP_ROUTE_REPLACE, 1))
    _ok("App.tsx decision route added")
    return True


def _mutate_journey_link(root: Path) -> bool:
    path = root / FILE_JOURNEY
    if not path.exists():
        abort(f"File not found: {FILE_JOURNEY}")
    src = path.read_text(encoding="utf-8")
    if IDEM_JOURNEY_LINK in src:
        _skip("ApplicantJourneyStatus.tsx decision link already present — satisfied")
        return False
    if JOURNEY_SEARCH not in src:
        abort("Anchor not found in ApplicantJourneyStatus.tsx: View My Appointments div + contact p")
    if src.count(JOURNEY_SEARCH) > 1:
        abort("Ambiguous anchor in ApplicantJourneyStatus.tsx")
    _write_and_verify(path, src.replace(JOURNEY_SEARCH, JOURNEY_REPLACE, 1))
    _ok("ApplicantJourneyStatus.tsx decision link added")
    return True


def _mutate_appt_link(root: Path) -> bool:
    path = root / FILE_APPT
    if not path.exists():
        abort(f"File not found: {FILE_APPT}")
    src = path.read_text(encoding="utf-8")
    if IDEM_JOURNEY_LINK in src:
        _skip("ApplicantAppointmentCenter.tsx decision link already present — satisfied")
        return False
    if APPT_SEARCH not in src:
        abort("Anchor not found in ApplicantAppointmentCenter.tsx: contact paragraph")
    if src.count(APPT_SEARCH) > 1:
        abort("Ambiguous anchor in ApplicantAppointmentCenter.tsx")
    _write_and_verify(path, src.replace(APPT_SEARCH, APPT_REPLACE, 1))
    _ok("ApplicantAppointmentCenter.tsx decision link added")
    return True


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
        ("const ApplicantJourneyStatus = lazy",    "ApplicantJourneyStatus (GE-RMP-005)"),
        ("const ApplicantDocumentCenter = lazy",   "ApplicantDocumentCenter (GE-RMP-007)"),
        ("const ApplicantAppointmentCenter = lazy","ApplicantAppointmentCenter (GE-RMP-008)"),
        ('/hub/applicant/appointments/:id',         "appointments route (GE-RMP-008)"),
    ]:
        if marker in app_src:
            _ok(f"Prerequisite VERIFIED: {dep}")
        else:
            abort(f"Prerequisite MISSING: {dep}\n\nGE-RMP-005–008 must be certified first.")
    for f in [FILE_JOURNEY, FILE_APPT]:
        if not (root / f).exists():
            abort(f"File not found: {f}")
        _ok(f"{f} located")
    _step_results["Repository Truth"] = "PASS"


def stage_3_mutations(root):
    _head("STAGE 3 — Resumable Mutation Execution")
    results = {}
    _info("Mutation 1/5: ApplicantAdmissionDecisionCenter.tsx")
    results["ApplicantAdmissionDecisionCenter.tsx"] = "applied" if _mutate_dec_center(root) else "already satisfied"
    _info("Mutation 2/5: App.tsx lazy import")
    results["App.tsx lazy import"] = "applied" if _mutate_app_lazy(root) else "already satisfied"
    _info("Mutation 3/5: App.tsx decision route")
    results["App.tsx decision route"] = "applied" if _mutate_app_route(root) else "already satisfied"
    _info("Mutation 4/5: ApplicantJourneyStatus.tsx decision link")
    results["ApplicantJourneyStatus.tsx link"] = "applied" if _mutate_journey_link(root) else "already satisfied"
    _info("Mutation 5/5: ApplicantAppointmentCenter.tsx decision link")
    results["ApplicantAppointmentCenter.tsx link"] = "applied" if _mutate_appt_link(root) else "already satisfied"
    for label, outcome in results.items():
        if outcome == "applied": _ok(f"{label}: applied")
        else:                    _skip(f"{label}: already satisfied")
    all_sat = all(v == "already satisfied" for v in results.values())
    _step_results["Mutations"] = "PASS (Already Satisfied)" if all_sat else "PASS"


def stage_4_post_verify(root):
    _head("STAGE 4 — Post-Mutation Verification")

    dec_src     = (root / FILE_DEC).read_text(encoding="utf-8")
    app_src     = (root / FILE_APP).read_text(encoding="utf-8")
    journey_src = (root / FILE_JOURNEY).read_text(encoding="utf-8")
    appt_src    = (root / FILE_APPT).read_text(encoding="utf-8")

    for marker, desc in [
        (IDEM_DEC_EXPORT,                             "default export"),
        ("/api/admissions/prospects/${id}/decisions",  "decisions endpoint consumed"),
        ("useQuery",                                   "useQuery — read-only"),
        ("/hub/applicant/status/${id}",                "back link to journey status"),
        ("Scale",                                      "scale icon"),
        ("offer_ready",                                "offer_ready displayed"),
        ("decided_at",                                 "decided_at displayed"),
        ("admissions@lambsbook.net",                   "support contact"),
    ]:
        if marker in dec_src:
            _ok(f"Decision center: {desc}")
        else:
            abort(f"Decision center missing: {desc}")

    for forbidden in ["useMutation", 'apiRequest("POST"', 'apiRequest("PATCH"', "supabase"]:
        if forbidden in dec_src:
            abort(f"Forbidden in decision center: {forbidden!r}")
    _ok("Decision center: no forbidden mutations — read-only")

    for marker, expected, desc in [
        (IDEM_APP_LAZY,   1, "ApplicantAdmissionDecisionCenter lazy import"),
        (IDEM_APP_ROUTE,  1, "/hub/applicant/decisions/:id route"),
        ('/hub/applicant/appointments/:id', 1, "appointments route preserved"),
    ]:
        count = app_src.count(marker)
        if count == expected:
            _ok(f"App.tsx [{desc}]: {count}")
        else:
            abort(f"App.tsx [{desc}]: count={count}, expected={expected}")

    if IDEM_JOURNEY_LINK in journey_src:
        _ok("ApplicantJourneyStatus: decision link present")
    else:
        abort("ApplicantJourneyStatus: decision link missing")

    if IDEM_JOURNEY_LINK in appt_src:
        _ok("ApplicantAppointmentCenter: decision link present")
    else:
        abort("ApplicantAppointmentCenter: decision link missing")

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
        print(f"  CREATE/VERIFY  {FILE_DEC}")
        print(f"  MODIFY/VERIFY  {FILE_APP}")
        print(f"  MODIFY/VERIFY  {FILE_JOURNEY}")
        print(f"  MODIFY/VERIFY  {FILE_APPT}")
        print()
        print("  ✓  Applicant Admission Decision Center (/hub/applicant/decisions/:id)")
        print("  ✓  Route registered in App.tsx")
        print("  ✓  'View My Decision' link in Applicant Journey Status")
        print("  ✓  'View My Decision' link in Applicant Appointment Center")
        print("  ✓  GET /api/admissions/prospects/:id/decisions consumed (read-only)")
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
    abort("Repository root not found.\n\nPass root as argument:\n  python GE-RMP-009_applicant_admission_decision_center.py /path/to/repo")
    raise SystemExit(1)


def main():
    print(f"\n{BOLD}GE-RMP-009 — Applicant Admission Decision Center{RESET}")
    print(f"{BOLD}CIB Authority: GE-RMP-009 / DISC-GE-APPLICANT-ADMISSION-DECISION-CENTER-GAP{RESET}\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    stage_1_repository(root)
    stage_2_repository_truth(root)
    stage_3_mutations(root)
    stage_4_post_verify(root)
    print_summary()


if __name__ == "__main__":
    main()
