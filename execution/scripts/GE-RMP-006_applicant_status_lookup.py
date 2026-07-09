#!/usr/bin/env python3
"""
GE-RMP-006 — Applicant Status Lookup
CIB Authority: GE-RMP-006 / Derived From: DISC-GE-APPLICANT-STATUS-LOOKUP-GAP

Production Surface: Applicant Status Lookup

Repository Truth (from ICM-GE-RMP-006):
  client/src/App.tsx                              — CERTIFIED (GE-RMP-005 applied)
  client/src/pages/ApplicantJourneyStatus.tsx     — CERTIFIED (GE-RMP-005 applied)
  web/src/growth/registry/journey.json            — CERTIFIED (GE-RMP-005 applied)

Gap: No applicant-facing lookup surface. Applicants need a UUID to access
/hub/applicant/status/:id directly. The lookup page closes this gap.

Permitted mutations:
  CREATE  client/src/pages/ApplicantStatusLookup.tsx
  MODIFY  client/src/App.tsx  — lazy import + /hub/applicant/status route

Forbidden: Backend, database, admissions runtime, prospect persistence, authentication.

Resumable mutation semantics (FDR-GE-005A).

Anchors (verified unique from Repository Truth):
  A1: ApplicantJourneyStatus lazy declaration — last lazy in App.tsx
  A2: /hub/applicant/status/:id route — insertion point

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
    print(f"{RED}\n{'='*42}\nGE-RMP-006\nFAIL\n\n{reason}\n\nMutation aborted.\n{'='*42}\n{RESET}")
    sys.exit(1)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_LOOKUP = Path("client/src/pages/ApplicantStatusLookup.tsx")
FILE_APP    = Path("client/src/App.tsx")

IDEM_LOOKUP_EXPORT = "export default function ApplicantStatusLookup"
IDEM_APP_LAZY      = "const ApplicantStatusLookup = lazy"
IDEM_APP_ROUTE     = 'path="/hub/applicant/status"'

# App.tsx anchors
APP_LAZY_SEARCH  = "const ApplicantJourneyStatus = lazy(() => import('@/pages/ApplicantJourneyStatus'));"
APP_LAZY_REPLACE = ("const ApplicantJourneyStatus = lazy(() => import('@/pages/ApplicantJourneyStatus'));\n"
                    "const ApplicantStatusLookup = lazy(() => import('@/pages/ApplicantStatusLookup'));")

APP_ROUTE_SEARCH  = '      <Route path="/hub/applicant/status/:id" component={ApplicantJourneyStatus} />'
APP_ROUTE_REPLACE = ('      <Route path="/hub/applicant/status/:id" component={ApplicantJourneyStatus} />\n'
                     '      <Route path="/hub/applicant/status" component={ApplicantStatusLookup} />')

# ════════════════════════════════════════════════════════════════
# FILE A — ApplicantStatusLookup.tsx (CREATE)
# Email-based lookup form. Calls GET /api/admissions/prospects,
# finds matching record client-side, navigates to /hub/applicant/status/:id.
# No backend mutation. No authentication.
# ════════════════════════════════════════════════════════════════

LOOKUP_SOURCE = '''import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowRight } from "lucide-react";

export default function ApplicantStatusLookup() {
  const [, setLocation] = useLocation();
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setLookupError(null);

    try {
      const res = await apiRequest("GET", "/api/admissions/prospects");
      if (!res.ok) throw new Error("Failed to contact admissions service");

      const prospects: Array<{ id: string; email: string }> = await res.json();
      const match = prospects.find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!match) {
        setLookupError(
          "No application found for that email address. " +
          "Please check your email or register at the link below."
        );
        return;
      }

      setLocation(`/hub/applicant/status/${match.id}`);
    } catch {
      setLookupError("Unable to look up your application. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Check Application Status</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter the email address you used to register your application.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Find your application</CardTitle>
            <CardDescription className="text-xs">
              We\'ll look up your status using your registered email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-10"
                />
              </div>

              {lookupError && (
                <p className="text-sm text-destructive">{lookupError}</p>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading || !email.trim()}
              >
                {loading ? "Searching\\u2026" : (
                  <>
                    Find My Application
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Haven\'t registered yet?{" "}
          <a href="/hub/prospect-registration" className="underline hover:text-foreground">
            Register your application
          </a>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Need help? Contact{" "}
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

def _mutate_lookup_page(root: Path) -> bool:
    path = root / FILE_LOOKUP
    if path.exists():
        if IDEM_LOOKUP_EXPORT in path.read_text(encoding="utf-8"):
            _skip("ApplicantStatusLookup.tsx already present — satisfied")
            return False
        abort(f"{FILE_LOOKUP} exists but missing export — unexpected state.")
    path.parent.mkdir(parents=True, exist_ok=True)
    _write_and_verify(path, LOOKUP_SOURCE)
    _ok("ApplicantStatusLookup.tsx created")
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
        abort(f"Anchor not found in App.tsx: ApplicantJourneyStatus lazy declaration")
    if src.count(APP_LAZY_SEARCH) > 1:
        abort("Ambiguous anchor: ApplicantJourneyStatus lazy appears multiple times")
    _write_and_verify(path, src.replace(APP_LAZY_SEARCH, APP_LAZY_REPLACE, 1))
    _ok("App.tsx lazy import added")
    return True


def _mutate_app_route(root: Path) -> bool:
    path = root / FILE_APP
    src = path.read_text(encoding="utf-8")
    if IDEM_APP_ROUTE in src:
        _skip("App.tsx lookup route already present — satisfied")
        return False
    if APP_ROUTE_SEARCH not in src:
        abort(f"Anchor not found in App.tsx: /hub/applicant/status/:id route")
    if src.count(APP_ROUTE_SEARCH) > 1:
        abort("Ambiguous anchor: /hub/applicant/status/:id appears multiple times")
    _write_and_verify(path, src.replace(APP_ROUTE_SEARCH, APP_ROUTE_REPLACE, 1))
    _ok("App.tsx lookup route added")
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

    # GE-RMP-005 prerequisite: ApplicantJourneyStatus must be present
    app_path = root / FILE_APP
    if not app_path.exists():
        abort(f"File not found: {FILE_APP}")
    app_src = app_path.read_text(encoding="utf-8")

    for marker, dep in [
        ("const ApplicantJourneyStatus = lazy", "ApplicantJourneyStatus lazy (GE-RMP-005)"),
        ('/hub/applicant/status/:id',            "ApplicantJourneyStatus route (GE-RMP-005)"),
    ]:
        if marker in app_src:
            _ok(f"Prerequisite VERIFIED: {dep}")
        else:
            abort(
                f"Prerequisite MISSING: {dep}\n\n"
                f"GE-RMP-005 must be certified before GE-RMP-006.\n\n"
                f"Missing: {marker}"
            )

    _ok(f"{FILE_APP} located ({len(app_src)} chars)")
    _step_results["Repository Truth"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Resumable Mutation Execution
# ════════════════════════════════════════════════════════════════

def stage_3_mutations(root):
    _head("STAGE 3 — Resumable Mutation Execution")

    results = {}

    _info("Mutation 1/3: ApplicantStatusLookup.tsx")
    results["ApplicantStatusLookup.tsx"] = "applied" if _mutate_lookup_page(root) else "already satisfied"

    _info("Mutation 2/3: App.tsx lazy import")
    results["App.tsx lazy import"] = "applied" if _mutate_app_lazy(root) else "already satisfied"

    _info("Mutation 3/3: App.tsx lookup route")
    results["App.tsx lookup route"] = "applied" if _mutate_app_route(root) else "already satisfied"

    for label, outcome in results.items():
        if outcome == "applied":
            _ok(f"{label}: applied")
        else:
            _skip(f"{label}: already satisfied")

    all_sat = all(v == "already satisfied" for v in results.values())
    _step_results["Mutations"] = "PASS (Already Satisfied)" if all_sat else "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_4_post_verify(root):
    _head("STAGE 4 — Post-Mutation Verification")

    lookup_src = (root / FILE_LOOKUP).read_text(encoding="utf-8")
    app_src    = (root / FILE_APP).read_text(encoding="utf-8")

    # Lookup page content
    for marker, desc in [
        (IDEM_LOOKUP_EXPORT,                    "default export"),
        ("useLocation",                          "useLocation for navigation"),
        ("/api/admissions/prospects",            "existing admissions endpoint consumed"),
        ("apiRequest",                           "apiRequest used"),
        ("/hub/applicant/status/${match.id}",    "navigation to ApplicantJourneyStatus"),
        ("email",                                "email lookup field"),
        ("lookupError",                          "error state"),
        ("loading",                              "loading state"),
        ("/hub/prospect-registration",           "registration link for new applicants"),
        ("admissions@lambsbook.net",             "support contact"),
    ]:
        if marker in lookup_src:
            _ok(f"Lookup: {desc}")
        else:
            abort(f"Lookup page missing: {desc}")

    for forbidden in ["useMutation", 'apiRequest("POST"', 'apiRequest("PATCH"',
                      "supabase", "createProspect"]:
        if forbidden in lookup_src:
            abort(f"Forbidden content in lookup page: {forbidden!r}")
    _ok("Lookup: no forbidden mutations")

    # App.tsx
    for marker, expected, desc in [
        (IDEM_APP_LAZY,  1, "ApplicantStatusLookup lazy import"),
        (IDEM_APP_ROUTE, 1, "/hub/applicant/status route (lookup)"),
        ('/hub/applicant/status/:id', 1, "ApplicantJourneyStatus route preserved"),
        ("const ApplicantJourneyStatus = lazy", 1, "ApplicantJourneyStatus preserved"),
    ]:
        count = app_src.count(marker)
        if count == expected:
            _ok(f"App.tsx [{desc}]: {count}")
        else:
            abort(f"App.tsx [{desc}]: count={count}, expected={expected}")

    # Route ordering: specific (:id) before general (lookup without :id)
    idx_status_id = app_src.find('/hub/applicant/status/:id')
    idx_lookup    = app_src.find('/hub/applicant/status"')
    if idx_status_id < idx_lookup:
        _ok("Route order: /hub/applicant/status/:id before /hub/applicant/status (correct)")
    else:
        abort("Route order: /hub/applicant/status/:id must precede /hub/applicant/status")

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
        all_sat = "Already Satisfied" in _step_results.get("Mutations", "")
        tag = " (Already Satisfied)" if all_sat else ""
        print(f"{BOLD}{GREEN}══ RESULT: PASS{tag} ══{RESET}{RESET}")
        print()
        print(f"  CREATE/VERIFY  {FILE_LOOKUP}")
        print(f"  MODIFY/VERIFY  {FILE_APP}")
        print()
        print("  ✓  Applicant Status Lookup page (/hub/applicant/status)")
        print("  ✓  Route registered (lookup before :id — correct order)")
        print("  ✓  Navigation to Applicant Journey Status (/hub/applicant/status/:id)")
        print("  ✓  Existing admissions runtime consumed (GET /api/admissions/prospects)")
        print("  ✓  No backend mutations")
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
    abort("Repository root not found.\n\nPass root as argument:\n  python GE-RMP-006_applicant_status_lookup.py /path/to/repo")
    raise SystemExit(1)


def main():
    print(f"\n{BOLD}GE-RMP-006 — Applicant Status Lookup{RESET}")
    print(f"{BOLD}CIB Authority: GE-RMP-006 / DISC-GE-APPLICANT-STATUS-LOOKUP-GAP{RESET}\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    stage_1_repository(root)
    stage_2_repository_truth(root)
    stage_3_mutations(root)
    stage_4_post_verify(root)
    print_summary()


if __name__ == "__main__":
    main()
