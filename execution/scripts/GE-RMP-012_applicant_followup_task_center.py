#!/usr/bin/env python3
"""
GE-RMP-012 — Applicant Follow-up Task Center
CIB Authority: GE-RMP-012 / Derived From: FDR-GE-002

Production Surface: Applicant Follow-up Task Center

Repository Truth (from ICM-GE-RMP-012):
  client/src/App.tsx                              — CERTIFIED (GE-RMP-011)
  client/src/pages/ApplicantJourneyStatus.tsx     — CERTIFIED (GE-RMP-011)
  client/src/pages/ApplicantActivityCenter.tsx    — CERTIFIED (GE-RMP-011)

Permitted mutations:
  CREATE  client/src/pages/ApplicantFollowupTaskCenter.tsx
  MODIFY  client/src/App.tsx                           — lazy import + route
  MODIFY  client/src/pages/ApplicantJourneyStatus.tsx  — tasks link
  MODIFY  client/src/pages/ApplicantActivityCenter.tsx — tasks link

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
    print(f"{RED}\n{'='*42}\nGE-RMP-012\nFAIL\n\n{reason}\n\nMutation aborted.\n{'='*42}\n{RESET}")
    sys.exit(1)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_FT    = Path("client/src/pages/ApplicantFollowupTaskCenter.tsx")
FILE_APP   = Path("client/src/App.tsx")
FILE_JOUR  = Path("client/src/pages/ApplicantJourneyStatus.tsx")
FILE_AC    = Path("client/src/pages/ApplicantActivityCenter.tsx")

IDEM_FT_EXPORT  = "export default function ApplicantFollowupTaskCenter"
IDEM_APP_LAZY   = "const ApplicantFollowupTaskCenter = lazy"
IDEM_APP_ROUTE  = 'path="/hub/applicant/tasks/:id"'
IDEM_JOUR_LINK  = 'href={`/hub/applicant/tasks/${id}`}'

APP_LAZY_SEARCH  = "const ApplicantActivityCenter = lazy(() => import('@/pages/ApplicantActivityCenter'));"
APP_LAZY_REPLACE = ("const ApplicantActivityCenter = lazy(() => import('@/pages/ApplicantActivityCenter'));\n"
                    "const ApplicantFollowupTaskCenter = lazy(() => import('@/pages/ApplicantFollowupTaskCenter'));")

APP_ROUTE_SEARCH  = '      <Route path="/hub/applicant/activity/:id" component={ApplicantActivityCenter} />'
APP_ROUTE_REPLACE = ('      <Route path="/hub/applicant/activity/:id" component={ApplicantActivityCenter} />\n'
                     '      <Route path="/hub/applicant/tasks/:id" component={ApplicantFollowupTaskCenter} />')

JOUR_SEARCH = (
    '            </div>\n'
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)
JOUR_REPLACE = (
    '            </div>\n'
    '            <div className="text-center">\n'
    '              <Link href={`/hub/applicant/tasks/${id}`}>\n'
    '                <button className="text-xs text-primary underline hover:text-primary/80">\n'
    '                  View My Tasks\n'
    '                </button>\n'
    '              </Link>\n'
    '            </div>\n'
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)

AC_SEARCH  = '        <p className="text-xs text-center text-muted-foreground pt-2">'
AC_REPLACE = ('        <div className="text-center mb-2">\n'
              '          <Link href={`/hub/applicant/tasks/${id}`}>\n'
              '            <button className="text-xs text-primary underline hover:text-primary/80">\n'
              '              View My Tasks\n'
              '            </button>\n'
              '          </Link>\n'
              '        </div>\n'
              '        <p className="text-xs text-center text-muted-foreground pt-2">')

FT_SOURCE = '''import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, ClipboardList } from "lucide-react";

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
  if (!iso) return "\\u2014";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

export default function ApplicantFollowupTaskCenter() {
  const [, params] = useRoute("/hub/applicant/tasks/:id");
  const id = params?.id ?? "";

  const { data: tasks = [], isLoading, isError } =
    useQuery<FollowupTask[]>({
      queryKey: [`/api/admissions/prospects/${id}/followup-tasks`],
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${id}/followup-tasks`,
        );
        if (!res.ok) throw new Error("Failed to load tasks");
        return res.json();
      },
      enabled: !!id,
    });

  const pending   = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

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
          <span className="text-sm font-medium">My Tasks</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your tasks\\u2026
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load tasks. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && tasks.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No follow-up tasks have been assigned to your application yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks assigned by your admissions advisor will appear here.
              </p>
            </CardContent>
          </Card>
        )}

        {pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">
              Pending ({pending.length})
            </h2>
            <Card>
              <CardContent className="pt-4 pb-4 space-y-4">
                {pending.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
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
                          Assigned {formatDate(task.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {completed.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">
              Completed ({completed.length})
            </h2>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground font-normal">
                  Completed tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4 space-y-3">
                {completed.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 opacity-70">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground line-through leading-tight">
                        {task.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        Completed {formatDate(task.completed_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
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


def _mutate_ft(root: Path) -> bool:
    path = root / FILE_FT
    if path.exists():
        if IDEM_FT_EXPORT in path.read_text(encoding="utf-8"):
            _skip("ApplicantFollowupTaskCenter.tsx already present — satisfied"); return False
        abort(f"{FILE_FT} exists but missing export.")
    path.parent.mkdir(parents=True, exist_ok=True)
    _write_and_verify(path, FT_SOURCE)
    _ok("ApplicantFollowupTaskCenter.tsx created"); return True


def _mutate_app_lazy(root: Path) -> bool:
    path = root / FILE_APP
    if not path.exists(): abort(f"File not found: {FILE_APP}")
    src = path.read_text(encoding="utf-8")
    if IDEM_APP_LAZY in src:
        _skip("App.tsx lazy import already present — satisfied"); return False
    if APP_LAZY_SEARCH not in src:
        abort("Anchor not found in App.tsx: ApplicantActivityCenter lazy")
    if src.count(APP_LAZY_SEARCH) > 1: abort("Ambiguous anchor")
    _write_and_verify(path, src.replace(APP_LAZY_SEARCH, APP_LAZY_REPLACE, 1))
    _ok("App.tsx lazy import added"); return True


def _mutate_app_route(root: Path) -> bool:
    path = root / FILE_APP
    src = path.read_text(encoding="utf-8")
    if IDEM_APP_ROUTE in src:
        _skip("App.tsx tasks route already present — satisfied"); return False
    if APP_ROUTE_SEARCH not in src:
        abort("Anchor not found in App.tsx: /hub/applicant/activity/:id route")
    if src.count(APP_ROUTE_SEARCH) > 1: abort("Ambiguous anchor")
    _write_and_verify(path, src.replace(APP_ROUTE_SEARCH, APP_ROUTE_REPLACE, 1))
    _ok("App.tsx tasks route added"); return True


def _mutate_jour_link(root: Path) -> bool:
    path = root / FILE_JOUR
    if not path.exists(): abort(f"File not found: {FILE_JOUR}")
    src = path.read_text(encoding="utf-8")
    if IDEM_JOUR_LINK in src:
        _skip("ApplicantJourneyStatus.tsx tasks link already present — satisfied"); return False
    if JOUR_SEARCH not in src:
        abort("Anchor not found in ApplicantJourneyStatus.tsx")
    if src.count(JOUR_SEARCH) > 1: abort("Ambiguous anchor in ApplicantJourneyStatus.tsx")
    _write_and_verify(path, src.replace(JOUR_SEARCH, JOUR_REPLACE, 1))
    _ok("ApplicantJourneyStatus.tsx tasks link added"); return True


def _mutate_ac_link(root: Path) -> bool:
    path = root / FILE_AC
    if not path.exists(): abort(f"File not found: {FILE_AC}")
    src = path.read_text(encoding="utf-8")
    if IDEM_JOUR_LINK in src:
        _skip("ApplicantActivityCenter.tsx tasks link already present — satisfied"); return False
    if AC_SEARCH not in src:
        abort("Anchor not found in ApplicantActivityCenter.tsx: contact paragraph")
    if src.count(AC_SEARCH) > 1: abort("Ambiguous anchor in ApplicantActivityCenter.tsx")
    _write_and_verify(path, src.replace(AC_SEARCH, AC_REPLACE, 1))
    _ok("ApplicantActivityCenter.tsx tasks link added"); return True


def stage_1_repository(root):
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        if (root / anchor).exists(): _ok(f"Anchor: {anchor}")
        else: abort(f"Repository anchor missing: {anchor}")
    _step_results["Repository anchors"] = "PASS"


def stage_2_repository_truth(root):
    _head("STAGE 2 — Repository Truth Verification")
    if not (root / FILE_APP).exists(): abort(f"File not found: {FILE_APP}")
    app_src = (root / FILE_APP).read_text(encoding="utf-8")
    for marker, dep in [
        ("const ApplicantActivityCenter = lazy", "ApplicantActivityCenter (GE-RMP-011)"),
        ('/hub/applicant/activity/:id',           "activity route (GE-RMP-011)"),
    ]:
        if marker in app_src: _ok(f"Prerequisite VERIFIED: {dep}")
        else: abort(f"Prerequisite MISSING: {dep}\n\nGE-RMP-011 must be certified first.")
    for f in [FILE_JOUR, FILE_AC]:
        if not (root / f).exists(): abort(f"File not found: {f}")
        _ok(f"{f} located")
    _step_results["Repository Truth"] = "PASS"


def stage_3_mutations(root):
    _head("STAGE 3 — Resumable Mutation Execution")
    results = {}
    _info("Mutation 1/5: ApplicantFollowupTaskCenter.tsx")
    results["ApplicantFollowupTaskCenter.tsx"] = "applied" if _mutate_ft(root) else "already satisfied"
    _info("Mutation 2/5: App.tsx lazy import")
    results["App.tsx lazy import"] = "applied" if _mutate_app_lazy(root) else "already satisfied"
    _info("Mutation 3/5: App.tsx tasks route")
    results["App.tsx tasks route"] = "applied" if _mutate_app_route(root) else "already satisfied"
    _info("Mutation 4/5: ApplicantJourneyStatus.tsx tasks link")
    results["ApplicantJourneyStatus.tsx link"] = "applied" if _mutate_jour_link(root) else "already satisfied"
    _info("Mutation 5/5: ApplicantActivityCenter.tsx tasks link")
    results["ApplicantActivityCenter.tsx link"] = "applied" if _mutate_ac_link(root) else "already satisfied"
    for label, outcome in results.items():
        if outcome == "applied": _ok(f"{label}: applied")
        else: _skip(f"{label}: already satisfied")
    all_sat = all(v == "already satisfied" for v in results.values())
    _step_results["Mutations"] = "PASS (Already Satisfied)" if all_sat else "PASS"


def stage_4_post_verify(root):
    _head("STAGE 4 — Post-Mutation Verification")
    ft_src   = (root / FILE_FT).read_text(encoding="utf-8")
    app_src  = (root / FILE_APP).read_text(encoding="utf-8")
    jour_src = (root / FILE_JOUR).read_text(encoding="utf-8")
    ac_src   = (root / FILE_AC).read_text(encoding="utf-8")

    for marker, desc in [
        (IDEM_FT_EXPORT,                                    "default export"),
        ("/api/admissions/prospects/${id}/followup-tasks",   "tasks endpoint consumed"),
        ("useQuery",                                         "useQuery — read-only"),
        ("/hub/applicant/status/${id}",                      "back link"),
        ("ClipboardList",                                    "tasks icon"),
        ("completed",                                        "completed state displayed"),
        ("due_date",                                         "due date displayed"),
        ("admissions@lambsbook.net",                         "support contact"),
    ]:
        if marker in ft_src: _ok(f"Tasks center: {desc}")
        else: abort(f"Tasks center missing: {desc}")

    for forbidden in ["useMutation", 'apiRequest("POST"', 'apiRequest("PATCH"', "supabase"]:
        if forbidden in ft_src: abort(f"Forbidden: {forbidden!r}")
    _ok("Tasks center: no forbidden mutations — read-only")

    for marker, expected, desc in [
        (IDEM_APP_LAZY,  1, "ApplicantFollowupTaskCenter lazy import"),
        (IDEM_APP_ROUTE, 1, "/hub/applicant/tasks/:id route"),
        ('/hub/applicant/activity/:id', 1, "activity route preserved"),
    ]:
        count = app_src.count(marker)
        if count == expected: _ok(f"App.tsx [{desc}]: {count}")
        else: abort(f"App.tsx [{desc}]: count={count}, expected={expected}")

    if IDEM_JOUR_LINK in jour_src: _ok("ApplicantJourneyStatus: tasks link present")
    else: abort("ApplicantJourneyStatus: tasks link missing")

    if IDEM_JOUR_LINK in ac_src: _ok("ApplicantActivityCenter: tasks link present")
    else: abort("ApplicantActivityCenter: tasks link missing")

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
        print(f"  CREATE/VERIFY  {FILE_FT}")
        print(f"  MODIFY/VERIFY  {FILE_APP}")
        print(f"  MODIFY/VERIFY  {FILE_JOUR}")
        print(f"  MODIFY/VERIFY  {FILE_AC}")
        print()
        print("  ✓  Applicant Follow-up Task Center (/hub/applicant/tasks/:id)")
        print("  ✓  Route registered in App.tsx")
        print("  ✓  'View My Tasks' link in Applicant Journey Status")
        print("  ✓  'View My Tasks' link in Applicant Activity Center")
        print("  ✓  GET /api/admissions/prospects/:id/followup-tasks consumed (read-only)")
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
    abort("Repository root not found.")
    raise SystemExit(1)


def main():
    print(f"\n{BOLD}GE-RMP-012 — Applicant Follow-up Task Center{RESET}")
    print(f"{BOLD}CIB Authority: GE-RMP-012 / FDR-GE-002{RESET}\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    stage_1_repository(root)
    stage_2_repository_truth(root)
    stage_3_mutations(root)
    stage_4_post_verify(root)
    print_summary()


if __name__ == "__main__":
    main()
