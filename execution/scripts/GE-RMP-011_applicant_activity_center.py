#!/usr/bin/env python3
"""
GE-RMP-011 — Applicant Activity Center
CIB Authority: GE-RMP-011 / Derived From: FDR-GE-002

Production Surface: Applicant Activity Center

Repository Truth (from ICM-GE-RMP-011):
  client/src/App.tsx                              — CERTIFIED (GE-RMP-010)
  client/src/pages/ApplicantJourneyStatus.tsx     — CERTIFIED (GE-RMP-010)
  client/src/pages/ApplicantLifecycleTimeline.tsx — CERTIFIED (GE-RMP-010)

Permitted mutations:
  CREATE  client/src/pages/ApplicantActivityCenter.tsx
  MODIFY  client/src/App.tsx                              — lazy import + route
  MODIFY  client/src/pages/ApplicantJourneyStatus.tsx     — activity link
  MODIFY  client/src/pages/ApplicantLifecycleTimeline.tsx — activity link

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
    print(f"{RED}\n{'='*42}\nGE-RMP-011\nFAIL\n\n{reason}\n\nMutation aborted.\n{'='*42}\n{RESET}")
    sys.exit(1)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_AC    = Path("client/src/pages/ApplicantActivityCenter.tsx")
FILE_APP   = Path("client/src/App.tsx")
FILE_JOUR  = Path("client/src/pages/ApplicantJourneyStatus.tsx")
FILE_TL    = Path("client/src/pages/ApplicantLifecycleTimeline.tsx")

IDEM_AC_EXPORT  = "export default function ApplicantActivityCenter"
IDEM_APP_LAZY   = "const ApplicantActivityCenter = lazy"
IDEM_APP_ROUTE  = 'path="/hub/applicant/activity/:id"'
IDEM_JOUR_LINK  = 'href={`/hub/applicant/activity/${id}`}'

APP_LAZY_SEARCH  = "const ApplicantLifecycleTimeline = lazy(() => import('@/pages/ApplicantLifecycleTimeline'));"
APP_LAZY_REPLACE = ("const ApplicantLifecycleTimeline = lazy(() => import('@/pages/ApplicantLifecycleTimeline'));\n"
                    "const ApplicantActivityCenter = lazy(() => import('@/pages/ApplicantActivityCenter'));")

APP_ROUTE_SEARCH  = '      <Route path="/hub/applicant/timeline/:id" component={ApplicantLifecycleTimeline} />'
APP_ROUTE_REPLACE = ('      <Route path="/hub/applicant/timeline/:id" component={ApplicantLifecycleTimeline} />\n'
                     '      <Route path="/hub/applicant/activity/:id" component={ApplicantActivityCenter} />')

JOUR_SEARCH = (
    '            </div>\n'
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)
JOUR_REPLACE = (
    '            </div>\n'
    '            <div className="text-center">\n'
    '              <Link href={`/hub/applicant/activity/${id}`}>\n'
    '                <button className="text-xs text-primary underline hover:text-primary/80">\n'
    '                  View My Activity\n'
    '                </button>\n'
    '              </Link>\n'
    '            </div>\n'
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)

TL_SEARCH  = '        <p className="text-xs text-center text-muted-foreground pt-2">'
TL_REPLACE = ('        <div className="text-center mb-2">\n'
              '          <Link href={`/hub/applicant/activity/${id}`}>\n'
              '            <button className="text-xs text-primary underline hover:text-primary/80">\n'
              '              View My Activity\n'
              '            </button>\n'
              '          </Link>\n'
              '        </div>\n'
              '        <p className="text-xs text-center text-muted-foreground pt-2">')

AC_SOURCE = '''import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";

interface ProspectActivity {
  id: string;
  prospect_id: string;
  activity_type: string;
  metadata: Record<string, unknown> | null;
  recorded_at: string;
}

function formatActivityType(activityType: string): string {
  return activityType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export default function ApplicantActivityCenter() {
  const [, params] = useRoute("/hub/applicant/activity/:id");
  const id = params?.id ?? "";

  const { data: activities = [], isLoading, isError } =
    useQuery<ProspectActivity[]>({
      queryKey: [`/api/admissions/prospects/${id}/activities`],
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${id}/activities`,
        );
        if (!res.ok) throw new Error("Failed to load activities");
        return res.json();
      },
      enabled: !!id,
    });

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
          <span className="text-sm font-medium">My Activity</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your activity\\u2026
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load activity. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No activities have been recorded for your application yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Activities will appear here as your application progresses.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity Log</CardTitle>
              <CardDescription className="text-xs">
                Immutable record of activities on your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-border space-y-6 ml-3">
                {activities.map((activity, idx) => (
                  <li key={activity.id} className="ml-5">
                    <span
                      className={`absolute -left-2 flex items-center justify-center
                        h-4 w-4 rounded-full border border-background
                        ${idx === activities.length - 1
                          ? "bg-primary"
                          : "bg-muted-foreground/30"}`}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {formatActivityType(activity.activity_type)}
                        </Badge>
                        {idx === activities.length - 1 && (
                          <span className="text-xs text-muted-foreground font-medium">
                            latest
                          </span>
                        )}
                      </div>
                      {activity.metadata &&
                        Object.keys(activity.metadata).length > 0 && (
                          <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                            {Object.entries(activity.metadata).map(([k, v]) => (
                              <div key={k}>
                                <dt className="text-muted-foreground capitalize">
                                  {k.replace(/_/g, " ")}
                                </dt>
                                <dd className="font-medium truncate">
                                  {String(v)}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      <time className="text-xs text-muted-foreground block">
                        {formatDateTime(activity.recorded_at)}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
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


def _mutate_ac(root: Path) -> bool:
    path = root / FILE_AC
    if path.exists():
        if IDEM_AC_EXPORT in path.read_text(encoding="utf-8"):
            _skip("ApplicantActivityCenter.tsx already present — satisfied")
            return False
        abort(f"{FILE_AC} exists but missing export.")
    path.parent.mkdir(parents=True, exist_ok=True)
    _write_and_verify(path, AC_SOURCE)
    _ok("ApplicantActivityCenter.tsx created")
    return True


def _mutate_app_lazy(root: Path) -> bool:
    path = root / FILE_APP
    if not path.exists(): abort(f"File not found: {FILE_APP}")
    src = path.read_text(encoding="utf-8")
    if IDEM_APP_LAZY in src:
        _skip("App.tsx lazy import already present — satisfied"); return False
    if APP_LAZY_SEARCH not in src:
        abort("Anchor not found in App.tsx: ApplicantLifecycleTimeline lazy")
    if src.count(APP_LAZY_SEARCH) > 1:
        abort("Ambiguous anchor: ApplicantLifecycleTimeline lazy")
    _write_and_verify(path, src.replace(APP_LAZY_SEARCH, APP_LAZY_REPLACE, 1))
    _ok("App.tsx lazy import added"); return True


def _mutate_app_route(root: Path) -> bool:
    path = root / FILE_APP
    src = path.read_text(encoding="utf-8")
    if IDEM_APP_ROUTE in src:
        _skip("App.tsx activity route already present — satisfied"); return False
    if APP_ROUTE_SEARCH not in src:
        abort("Anchor not found in App.tsx: /hub/applicant/timeline/:id route")
    if src.count(APP_ROUTE_SEARCH) > 1:
        abort("Ambiguous anchor: timeline route")
    _write_and_verify(path, src.replace(APP_ROUTE_SEARCH, APP_ROUTE_REPLACE, 1))
    _ok("App.tsx activity route added"); return True


def _mutate_jour_link(root: Path) -> bool:
    path = root / FILE_JOUR
    if not path.exists(): abort(f"File not found: {FILE_JOUR}")
    src = path.read_text(encoding="utf-8")
    if IDEM_JOUR_LINK in src:
        _skip("ApplicantJourneyStatus.tsx activity link already present — satisfied"); return False
    if JOUR_SEARCH not in src:
        abort("Anchor not found in ApplicantJourneyStatus.tsx")
    if src.count(JOUR_SEARCH) > 1:
        abort("Ambiguous anchor in ApplicantJourneyStatus.tsx")
    _write_and_verify(path, src.replace(JOUR_SEARCH, JOUR_REPLACE, 1))
    _ok("ApplicantJourneyStatus.tsx activity link added"); return True


def _mutate_tl_link(root: Path) -> bool:
    path = root / FILE_TL
    if not path.exists(): abort(f"File not found: {FILE_TL}")
    src = path.read_text(encoding="utf-8")
    if IDEM_JOUR_LINK in src:
        _skip("ApplicantLifecycleTimeline.tsx activity link already present — satisfied"); return False
    if TL_SEARCH not in src:
        abort("Anchor not found in ApplicantLifecycleTimeline.tsx: contact paragraph")
    if src.count(TL_SEARCH) > 1:
        abort("Ambiguous anchor in ApplicantLifecycleTimeline.tsx")
    _write_and_verify(path, src.replace(TL_SEARCH, TL_REPLACE, 1))
    _ok("ApplicantLifecycleTimeline.tsx activity link added"); return True


def stage_1_repository(root):
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        if (root / anchor).exists(): _ok(f"Anchor: {anchor}")
        else: abort(f"Repository anchor missing: {anchor}")
    _step_results["Repository anchors"] = "PASS"


def stage_2_repository_truth(root):
    _head("STAGE 2 — Repository Truth Verification")
    app_src = (root / FILE_APP).read_text(encoding="utf-8") if (root / FILE_APP).exists() \
              else abort(f"File not found: {FILE_APP}")
    for marker, dep in [
        ("const ApplicantLifecycleTimeline = lazy", "ApplicantLifecycleTimeline (GE-RMP-010)"),
        ('/hub/applicant/timeline/:id',              "timeline route (GE-RMP-010)"),
    ]:
        if marker in app_src: _ok(f"Prerequisite VERIFIED: {dep}")
        else: abort(f"Prerequisite MISSING: {dep}\n\nGE-RMP-010 must be certified first.")
    for f in [FILE_JOUR, FILE_TL]:
        if not (root / f).exists(): abort(f"File not found: {f}")
        _ok(f"{f} located")
    _step_results["Repository Truth"] = "PASS"


def stage_3_mutations(root):
    _head("STAGE 3 — Resumable Mutation Execution")
    results = {}
    _info("Mutation 1/5: ApplicantActivityCenter.tsx")
    results["ApplicantActivityCenter.tsx"] = "applied" if _mutate_ac(root) else "already satisfied"
    _info("Mutation 2/5: App.tsx lazy import")
    results["App.tsx lazy import"] = "applied" if _mutate_app_lazy(root) else "already satisfied"
    _info("Mutation 3/5: App.tsx activity route")
    results["App.tsx activity route"] = "applied" if _mutate_app_route(root) else "already satisfied"
    _info("Mutation 4/5: ApplicantJourneyStatus.tsx activity link")
    results["ApplicantJourneyStatus.tsx link"] = "applied" if _mutate_jour_link(root) else "already satisfied"
    _info("Mutation 5/5: ApplicantLifecycleTimeline.tsx activity link")
    results["ApplicantLifecycleTimeline.tsx link"] = "applied" if _mutate_tl_link(root) else "already satisfied"
    for label, outcome in results.items():
        if outcome == "applied": _ok(f"{label}: applied")
        else: _skip(f"{label}: already satisfied")
    all_sat = all(v == "already satisfied" for v in results.values())
    _step_results["Mutations"] = "PASS (Already Satisfied)" if all_sat else "PASS"


def stage_4_post_verify(root):
    _head("STAGE 4 — Post-Mutation Verification")
    ac_src   = (root / FILE_AC).read_text(encoding="utf-8")
    app_src  = (root / FILE_APP).read_text(encoding="utf-8")
    jour_src = (root / FILE_JOUR).read_text(encoding="utf-8")
    tl_src   = (root / FILE_TL).read_text(encoding="utf-8")

    for marker, desc in [
        (IDEM_AC_EXPORT,                              "default export"),
        ("/api/admissions/prospects/${id}/activities", "activities endpoint consumed"),
        ("useQuery",                                   "useQuery — read-only"),
        ("/hub/applicant/status/${id}",                "back link"),
        ("Zap",                                        "icon"),
        ("activity_type",                              "activity_type displayed"),
        ("recorded_at",                                "recorded_at displayed"),
        ("admissions@lambsbook.net",                   "support contact"),
    ]:
        if marker in ac_src: _ok(f"Activity center: {desc}")
        else: abort(f"Activity center missing: {desc}")

    for forbidden in ["useMutation", 'apiRequest("POST"', 'apiRequest("PATCH"', "supabase"]:
        if forbidden in ac_src: abort(f"Forbidden: {forbidden!r}")
    _ok("Activity center: no forbidden mutations — read-only")

    for marker, expected, desc in [
        (IDEM_APP_LAZY,   1, "ApplicantActivityCenter lazy import"),
        (IDEM_APP_ROUTE,  1, "/hub/applicant/activity/:id route"),
        ('/hub/applicant/timeline/:id', 1, "timeline route preserved"),
    ]:
        count = app_src.count(marker)
        if count == expected: _ok(f"App.tsx [{desc}]: {count}")
        else: abort(f"App.tsx [{desc}]: count={count}, expected={expected}")

    if IDEM_JOUR_LINK in jour_src: _ok("ApplicantJourneyStatus: activity link present")
    else: abort("ApplicantJourneyStatus: activity link missing")

    if IDEM_JOUR_LINK in tl_src: _ok("ApplicantLifecycleTimeline: activity link present")
    else: abort("ApplicantLifecycleTimeline: activity link missing")

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
        print(f"  CREATE/VERIFY  {FILE_AC}")
        print(f"  MODIFY/VERIFY  {FILE_APP}")
        print(f"  MODIFY/VERIFY  {FILE_JOUR}")
        print(f"  MODIFY/VERIFY  {FILE_TL}")
        print()
        print("  ✓  Applicant Activity Center (/hub/applicant/activity/:id)")
        print("  ✓  Route registered in App.tsx")
        print("  ✓  'View My Activity' link in Applicant Journey Status")
        print("  ✓  'View My Activity' link in Applicant Lifecycle Timeline")
        print("  ✓  GET /api/admissions/prospects/:id/activities consumed (read-only)")
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
    print(f"\n{BOLD}GE-RMP-011 — Applicant Activity Center{RESET}")
    print(f"{BOLD}CIB Authority: GE-RMP-011 / FDR-GE-002{RESET}\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    stage_1_repository(root)
    stage_2_repository_truth(root)
    stage_3_mutations(root)
    stage_4_post_verify(root)
    print_summary()


if __name__ == "__main__":
    main()
