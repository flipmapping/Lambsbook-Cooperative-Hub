#!/usr/bin/env python3
"""
GE-RMP-005 — Applicant Journey Status
CIB Authority: GE-RMP-005 / Derived From: DISC-GE-APPLICANT-STATUS-GAP
FDR-GE-005A: Resumable mutation semantics

Production Surface: Applicant Journey Status

Repository Truth (from ICM-GE-RMP-005):
  client/src/App.tsx                          — CERTIFIED (ICM)
  web/src/growth/registry/journey.json        — CERTIFIED (ICM)

Permitted mutations:
  CREATE  client/src/pages/ApplicantJourneyStatus.tsx
  MODIFY  client/src/App.tsx                  — lazy import + route
  MODIFY  web/src/growth/registry/journey.json — admissions stage path

Resumable mutation semantics (FDR-GE-005A):
  Each mutation is independently evaluated.
  Already-satisfied mutations are verified and skipped — NOT aborted.
  Unsatisfied mutations are applied and verified.
  Abort only on: anchor missing/ambiguous from unmutated file,
                 verification failure, or forbidden mutation required.

Quality gate: EXEC-STD-001 + EXEC-STD-002
"""

import json
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
    print(f"{RED}\n{'='*42}\nGE-RMP-005\nFAIL\n\n{reason}\n\nMutation aborted.\n{'='*42}\n{RESET}")
    sys.exit(1)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_PAGE    = Path("client/src/pages/ApplicantJourneyStatus.tsx")
FILE_APP     = Path("client/src/App.tsx")
FILE_JOURNEY = Path("web/src/growth/registry/journey.json")

IDEM_PAGE_EXPORT  = "export default function ApplicantJourneyStatus"
IDEM_APP_LAZY     = "const ApplicantJourneyStatus = lazy"
IDEM_APP_ROUTE    = 'path="/hub/applicant/status/:id"'
IDEM_JOURNEY_PATH = "/hub/applicant/status"

# App.tsx anchors (from pre-mutation file)
APP_LAZY_SEARCH  = "const ProspectDetailWorkspace = lazy(() => import('@/pages/ProspectDetailWorkspace'));"
APP_LAZY_REPLACE = ("const ProspectDetailWorkspace = lazy(() => import('@/pages/ProspectDetailWorkspace'));\n"
                    "const ApplicantJourneyStatus = lazy(() => import('@/pages/ApplicantJourneyStatus'));")
APP_ROUTE_SEARCH  = '      <Route path="/hub/admin/prospects/:id" component={ProspectDetailWorkspace} />'
APP_ROUTE_REPLACE = ('      <Route path="/hub/admin/prospects/:id" component={ProspectDetailWorkspace} />\n'
                     '      <Route path="/hub/applicant/status/:id" component={ApplicantJourneyStatus} />')

PAGE_SOURCE = r'''import { useRoute, Link } from "wouter";
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
            Loading your application\u2026
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
                              \u2190 current
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
'''


def _write_and_verify(path, content):
    path.write_text(content, encoding="utf-8")
    if path.read_text(encoding="utf-8") != content:
        abort(f"Round-trip verification failed: {path.name}")
    _ok(f"Round-trip verified ({len(content)} chars)")


# ────────────────────────────────────────────────────────────────
# RESUMABLE MUTATION HELPERS
# Each returns True if the mutation was applied, False if already satisfied.
# Aborts only if anchor is missing from an unmutated file or verification fails.
# ────────────────────────────────────────────────────────────────

def _mutate_page(root: Path) -> bool:
    """CREATE ApplicantJourneyStatus.tsx — resumable."""
    path = root / FILE_PAGE
    if path.exists():
        src = path.read_text(encoding="utf-8")
        if IDEM_PAGE_EXPORT in src:
            _skip("ApplicantJourneyStatus.tsx already present — satisfied")
            return False
        else:
            abort(f"{FILE_PAGE} exists but missing export — unexpected state. Manual review required.")
    path.parent.mkdir(parents=True, exist_ok=True)
    _write_and_verify(path, PAGE_SOURCE)
    _ok("ApplicantJourneyStatus.tsx created")
    return True


def _mutate_app_lazy(root: Path) -> bool:
    """Add ApplicantJourneyStatus lazy import to App.tsx — resumable."""
    path = root / FILE_APP
    if not path.exists():
        abort(f"File not found: {FILE_APP}")
    src = path.read_text(encoding="utf-8")

    if IDEM_APP_LAZY in src:
        _skip("App.tsx lazy import already present — satisfied")
        return False

    # Anchor must exist in unmutated file
    if APP_LAZY_SEARCH not in src:
        abort(
            f"Structural anchor not found in App.tsx: ProspectDetailWorkspace lazy declaration\n\n"
            f"Expected: {APP_LAZY_SEARCH[:80]}"
        )
    if src.count(APP_LAZY_SEARCH) > 1:
        abort("Ambiguous anchor: ProspectDetailWorkspace lazy declaration appears multiple times")

    new_src = src.replace(APP_LAZY_SEARCH, APP_LAZY_REPLACE, 1)
    _write_and_verify(path, new_src)
    _ok("App.tsx lazy import added")
    return True


def _mutate_app_route(root: Path) -> bool:
    """Add /hub/applicant/status/:id route to App.tsx — resumable."""
    path = root / FILE_APP
    src = path.read_text(encoding="utf-8")

    if IDEM_APP_ROUTE in src:
        _skip("App.tsx status route already present — satisfied")
        return False

    if APP_ROUTE_SEARCH not in src:
        abort(
            f"Structural anchor not found in App.tsx: /hub/admin/prospects/:id route\n\n"
            f"Expected: {APP_ROUTE_SEARCH[:80]}"
        )
    if src.count(APP_ROUTE_SEARCH) > 1:
        abort("Ambiguous anchor: /hub/admin/prospects/:id route appears multiple times")

    new_src = src.replace(APP_ROUTE_SEARCH, APP_ROUTE_REPLACE, 1)
    _write_and_verify(path, new_src)
    _ok("App.tsx status route added")
    return True


def _mutate_journey(root: Path) -> bool:
    """Add path to admissions stage in journey.json — resumable."""
    path = root / FILE_JOURNEY
    if not path.exists():
        abort(f"File not found: {FILE_JOURNEY}")

    data = json.loads(path.read_text(encoding="utf-8"))
    admissions = next((x for x in data.get("items", []) if x.get("id") == "admissions"), None)

    if admissions is None:
        abort("journey.json: 'admissions' item not found")

    if IDEM_JOURNEY_PATH in admissions.get("path", ""):
        _skip("journey.json admissions path already present — satisfied")
        return False

    admissions["path"] = "/hub/applicant/status"
    _write_and_verify(path, json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    _ok("journey.json admissions path set")
    return True


# ════════════════════════════════════════════════════════════════
# STAGE 1 — Repository Anchor Verification
# ════════════════════════════════════════════════════════════════

def stage_1_repository(root):
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        if (root / anchor).exists():
            _ok(f"Anchor: {anchor}")
        else:
            abort(f"Repository anchor missing: {anchor}")
    _step_results["Repository anchors"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 2 — Repository Truth Verification
# ════════════════════════════════════════════════════════════════

def stage_2_repository_truth(root):
    _head("STAGE 2 — Repository Truth Verification")

    # App.tsx must exist (it is an ICM-certified file)
    if not (root / FILE_APP).exists():
        abort(f"File not found: {FILE_APP}")
    _ok(f"{FILE_APP} located")

    # journey.json must exist
    if not (root / FILE_JOURNEY).exists():
        abort(f"File not found: {FILE_JOURNEY}")
    journey_data = json.loads((root / FILE_JOURNEY).read_text(encoding="utf-8"))
    if not any(x.get("id") == "admissions" for x in journey_data.get("items", [])):
        abort("journey.json: 'admissions' item not found")
    _ok(f"{FILE_JOURNEY} located — 'admissions' item present")

    _step_results["Repository Truth"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Resumable Mutation Execution
# ════════════════════════════════════════════════════════════════

def stage_3_mutations(root):
    _head("STAGE 3 — Resumable Mutation Execution")

    results = {
        "ApplicantJourneyStatus.tsx": None,
        "App.tsx lazy import":        None,
        "App.tsx status route":       None,
        "journey.json admissions":    None,
    }

    _info("Mutation 1/4: ApplicantJourneyStatus.tsx")
    applied = _mutate_page(root)
    results["ApplicantJourneyStatus.tsx"] = "applied" if applied else "already satisfied"

    _info("Mutation 2/4: App.tsx lazy import")
    applied = _mutate_app_lazy(root)
    results["App.tsx lazy import"] = "applied" if applied else "already satisfied"

    _info("Mutation 3/4: App.tsx status route")
    applied = _mutate_app_route(root)
    results["App.tsx status route"] = "applied" if applied else "already satisfied"

    _info("Mutation 4/4: journey.json admissions path")
    applied = _mutate_journey(root)
    results["journey.json admissions"] = "applied" if applied else "already satisfied"

    all_satisfied = all(v == "already satisfied" for v in results.values())
    any_applied   = any(v == "applied"           for v in results.values())

    for label, outcome in results.items():
        if outcome == "applied":
            _ok(f"{label}: applied")
        else:
            _skip(f"{label}: already satisfied")

    if all_satisfied:
        _step_results["Mutations"] = "PASS (Already Satisfied)"
    else:
        _step_results["Mutations"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_4_post_verify(root):
    _head("STAGE 4 — Post-Mutation Verification")

    # Page
    page_src = (root / FILE_PAGE).read_text(encoding="utf-8")
    for marker, desc in [
        (IDEM_PAGE_EXPORT,                       "default export"),
        ("/api/admissions/prospects/${id}",       "admissions endpoint consumed"),
        ("useQuery",                              "useQuery — read-only"),
        ("JOURNEY_STAGES",                        "journey stages"),
        ("current_stage",                         "current_stage displayed"),
        ("CheckCircle2",                          "stage icons"),
        ("admissions@lambsbook.net",              "contact email"),
    ]:
        if marker in page_src:
            _ok(f"Page: {desc}")
        else:
            abort(f"Page verification failed — missing: {desc}")

    for forbidden in ["useMutation", 'apiRequest("POST"', 'apiRequest("PATCH"', "supabase"]:
        if forbidden in page_src:
            abort(f"Forbidden content in page: {forbidden!r}")
    _ok("Page: no forbidden mutations")

    # App.tsx
    app_src = (root / FILE_APP).read_text(encoding="utf-8")
    for marker, expected, desc in [
        (IDEM_APP_LAZY,  1, "lazy import"),
        (IDEM_APP_ROUTE, 1, "status route"),
        ("const ProspectDetailWorkspace = lazy", 1, "ProspectDetailWorkspace preserved"),
    ]:
        count = app_src.count(marker)
        if count == expected:
            _ok(f"App.tsx [{desc}]: {count}")
        else:
            abort(f"App.tsx [{desc}]: count={count}, expected={expected}")

    # journey.json
    journey_data = json.loads((root / FILE_JOURNEY).read_text(encoding="utf-8"))
    admissions = next((x for x in journey_data.get("items", []) if x.get("id") == "admissions"), {})
    if IDEM_JOURNEY_PATH in admissions.get("path", ""):
        _ok("journey.json: admissions path verified")
    else:
        abort("journey.json: admissions path missing after mutation")

    expected_ids = {"growth", "scholarships", "registration", "admissions", "decision", "enrollment"}
    actual_ids   = {x.get("id") for x in journey_data.get("items", [])}
    if expected_ids == actual_ids:
        _ok("journey.json: all 6 items preserved")
    else:
        abort(f"journey.json: item set changed — got {actual_ids}")

    _step_results["Post-verification"] = "PASS"


# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

def print_summary():
    _head("MUTATION SUMMARY")
    max_len = max(len(k) for k in _step_results)
    for step, state in _step_results.items():
        colour = YELLOW if "Already" in state else GREEN
        print(f"  {step.ljust(max_len)}   {colour}{state}{RESET}")
    all_pass = all(s.startswith("PASS") for s in _step_results.values())
    print()
    if all_pass:
        mutation_state = _step_results.get("Mutations", "")
        if "Already Satisfied" in mutation_state:
            print(f"{BOLD}{GREEN}══ RESULT: PASS (Already Satisfied) ══{RESET}{RESET}")
        else:
            print(f"{BOLD}{GREEN}══ RESULT: PASS ══{RESET}{RESET}")
        print()
        print(f"  CREATE/VERIFY  {FILE_PAGE}")
        print(f"  MODIFY/VERIFY  {FILE_APP}")
        print(f"  MODIFY/VERIFY  {FILE_JOURNEY}")
        print()
        print("  ✓  Applicant Journey Status page")
        print("  ✓  Route: /hub/applicant/status/:id")
        print("  ✓  Journey registry: admissions stage path registered")
        print("  ✓  Admissions runtime consumed (read-only GET)")
        print()
        print("  Second execution: PASS (Already Satisfied)")
        print("  Partial state:    PASS (resumes from satisfied mutations)")
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
    abort("Repository root not found.\n\nPass root as argument:\n  python GE-RMP-005_applicant_journey_status.py /path/to/repo")
    raise SystemExit(1)


def main():
    print(f"\n{BOLD}GE-RMP-005 — Applicant Journey Status{RESET}")
    print(f"{BOLD}CIB Authority: GE-RMP-005 / FDR-GE-005A (Resumable){RESET}\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    stage_1_repository(root)
    stage_2_repository_truth(root)
    stage_3_mutations(root)
    stage_4_post_verify(root)
    print_summary()


if __name__ == "__main__":
    main()
