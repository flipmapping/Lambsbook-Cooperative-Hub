#!/usr/bin/env python3
"""
GE-RMP-007 — Applicant Document Center
CIB Authority: GE-RMP-007 / Derived From: DISC-GE-APPLICANT-DOCUMENT-CENTER-GAP

Production Surface: Applicant Document Center

Repository Truth (from ICM-GE-RMP-007):
  client/src/App.tsx                              — CERTIFIED (GE-RMP-006 applied)
  client/src/pages/ApplicantJourneyStatus.tsx     — CERTIFIED (GE-RMP-005 applied)
  client/src/pages/ApplicantStatusLookup.tsx      — CERTIFIED (GE-RMP-006 applied)

Gap: No applicant-facing document center. Admissions document runtime
(GET /api/admissions/prospects/:id/documents) is certified and live.

Permitted mutations:
  CREATE  client/src/pages/ApplicantDocumentCenter.tsx
  MODIFY  client/src/App.tsx                          — lazy import + route
  MODIFY  client/src/pages/ApplicantJourneyStatus.tsx — Document Center link

Forbidden: Backend, database, admissions runtime, prospect persistence, authentication.

Resumable mutation semantics.

Anchors (verified unique from Repository Truth):
  A1: ApplicantStatusLookup lazy declaration
  A2: /hub/applicant/status route
  A3: contact <p> block in ApplicantJourneyStatus (insertion point for link)

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
    print(f"{RED}\n{'='*42}\nGE-RMP-007\nFAIL\n\n{reason}\n\nMutation aborted.\n{'='*42}\n{RESET}")
    sys.exit(1)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_DOC     = Path("client/src/pages/ApplicantDocumentCenter.tsx")
FILE_APP     = Path("client/src/App.tsx")
FILE_JOURNEY = Path("client/src/pages/ApplicantJourneyStatus.tsx")

IDEM_DOC_EXPORT    = "export default function ApplicantDocumentCenter"
IDEM_APP_LAZY      = "const ApplicantDocumentCenter = lazy"
IDEM_APP_ROUTE     = 'path="/hub/applicant/documents/:id"'
IDEM_JOURNEY_LINK  = 'href={`/hub/applicant/documents/${id}`}'

# App.tsx anchors
APP_LAZY_SEARCH  = "const ApplicantStatusLookup = lazy(() => import('@/pages/ApplicantStatusLookup'));"
APP_LAZY_REPLACE = ("const ApplicantStatusLookup = lazy(() => import('@/pages/ApplicantStatusLookup'));\n"
                    "const ApplicantDocumentCenter = lazy(() => import('@/pages/ApplicantDocumentCenter'));")

APP_ROUTE_SEARCH  = '      <Route path="/hub/applicant/status" component={ApplicantStatusLookup} />'
APP_ROUTE_REPLACE = ('      <Route path="/hub/applicant/status" component={ApplicantStatusLookup} />\n'
                     '      <Route path="/hub/applicant/documents/:id" component={ApplicantDocumentCenter} />')

# ApplicantJourneyStatus anchor (contact paragraph — unique)
JOURNEY_SEARCH = (
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)
JOURNEY_REPLACE = (
    '            <div className="text-center">\n'
    '              <Link href={`/hub/applicant/documents/${id}`}>\n'
    '                <button className="text-xs text-primary underline hover:text-primary/80">\n'
    '                  View My Documents\n'
    '                </button>\n'
    '              </Link>\n'
    '            </div>\n'
    '            <p className="text-xs text-center text-muted-foreground">\n'
    '              Questions about your application? Contact us at'
)

# ════════════════════════════════════════════════════════════════
# FILE A — ApplicantDocumentCenter.tsx (CREATE)
# Read-only. Consumes GET /api/admissions/prospects/:id/documents.
# ════════════════════════════════════════════════════════════════

DOC_CENTER_SOURCE = '''import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ExternalLink, Archive } from "lucide-react";

interface ApplicantDocument {
  id: string;
  prospect_id: string;
  document_type: string;
  file_name: string;
  storage_url: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
}

function formatDocType(docType: string): string {
  return docType.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

export default function ApplicantDocumentCenter() {
  const [, params] = useRoute("/hub/applicant/documents/:id");
  const id = params?.id ?? "";

  const { data: documents = [], isLoading, isError } = useQuery<ApplicantDocument[]>({
    queryKey: [`/api/admissions/prospects/${id}/documents`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admissions/prospects/${id}/documents`);
      if (!res.ok) throw new Error("Failed to load documents");
      return res.json();
    },
    enabled: !!id,
  });

  const active   = documents.filter((d) => !d.archived);
  const archived = documents.filter((d) => d.archived);

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
          <span className="text-sm font-medium">My Documents</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your documents\\u2026
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load documents. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && documents.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No documents have been registered for your application yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Documents will appear here once your admissions advisor registers them.
              </p>
            </CardContent>
          </Card>
        )}

        {active.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">
              Active Documents ({active.length})
            </h2>
            {active.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Badge variant="outline" className="text-xs mb-1">
                            {formatDocType(doc.document_type)}
                          </Badge>
                          <p className="text-sm font-medium leading-tight truncate">
                            {doc.file_name}
                          </p>
                          {doc.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {doc.notes}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Registered {formatDate(doc.created_at)}
                          </p>
                        </div>
                        {doc.storage_url && (
                          <a
                            href={doc.storage_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                              <ExternalLink className="h-3 w-3" />
                              View
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {archived.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-1.5">
              <Archive className="h-3.5 w-3.5" />
              Archived ({archived.length})
            </h2>
            {archived.map((doc) => (
              <Card key={doc.id} className="opacity-60">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <Badge variant="outline" className="text-xs mb-0.5">
                        {formatDocType(doc.document_type)}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-through truncate">
                        {doc.file_name}
                      </p>
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

def _mutate_doc_center(root: Path) -> bool:
    path = root / FILE_DOC
    if path.exists():
        if IDEM_DOC_EXPORT in path.read_text(encoding="utf-8"):
            _skip("ApplicantDocumentCenter.tsx already present — satisfied")
            return False
        abort(f"{FILE_DOC} exists but missing export — unexpected state.")
    path.parent.mkdir(parents=True, exist_ok=True)
    _write_and_verify(path, DOC_CENTER_SOURCE)
    _ok("ApplicantDocumentCenter.tsx created")
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
        abort(f"Anchor not found in App.tsx: ApplicantStatusLookup lazy declaration")
    if src.count(APP_LAZY_SEARCH) > 1:
        abort("Ambiguous anchor: ApplicantStatusLookup lazy appears multiple times")
    _write_and_verify(path, src.replace(APP_LAZY_SEARCH, APP_LAZY_REPLACE, 1))
    _ok("App.tsx lazy import added")
    return True


def _mutate_app_route(root: Path) -> bool:
    path = root / FILE_APP
    src = path.read_text(encoding="utf-8")
    if IDEM_APP_ROUTE in src:
        _skip("App.tsx document route already present — satisfied")
        return False
    if APP_ROUTE_SEARCH not in src:
        abort(f"Anchor not found in App.tsx: /hub/applicant/status route")
    if src.count(APP_ROUTE_SEARCH) > 1:
        abort("Ambiguous anchor: /hub/applicant/status route appears multiple times")
    _write_and_verify(path, src.replace(APP_ROUTE_SEARCH, APP_ROUTE_REPLACE, 1))
    _ok("App.tsx document center route added")
    return True


def _mutate_journey_link(root: Path) -> bool:
    path = root / FILE_JOURNEY
    if not path.exists():
        abort(f"File not found: {FILE_JOURNEY}")
    src = path.read_text(encoding="utf-8")
    if IDEM_JOURNEY_LINK in src:
        _skip("ApplicantJourneyStatus.tsx document link already present — satisfied")
        return False
    if JOURNEY_SEARCH not in src:
        abort(f"Anchor not found in ApplicantJourneyStatus.tsx: contact paragraph")
    if src.count(JOURNEY_SEARCH) > 1:
        abort("Ambiguous anchor: contact paragraph appears multiple times")
    _write_and_verify(path, src.replace(JOURNEY_SEARCH, JOURNEY_REPLACE, 1))
    _ok("ApplicantJourneyStatus.tsx document center link added")
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

    app_path = root / FILE_APP
    if not app_path.exists():
        abort(f"File not found: {FILE_APP}")
    app_src = app_path.read_text(encoding="utf-8")

    for marker, dep in [
        ("const ApplicantJourneyStatus = lazy", "ApplicantJourneyStatus (GE-RMP-005)"),
        ("const ApplicantStatusLookup = lazy",  "ApplicantStatusLookup (GE-RMP-006)"),
        ('/hub/applicant/status/:id',            "status :id route (GE-RMP-005)"),
        ('/hub/applicant/status"',               "lookup route (GE-RMP-006)"),
    ]:
        if marker in app_src:
            _ok(f"Prerequisite VERIFIED: {dep}")
        else:
            abort(f"Prerequisite MISSING: {dep}\n\nGE-RMP-005/006 must be certified first.")

    journey_path = root / FILE_JOURNEY
    if not journey_path.exists():
        abort(f"File not found: {FILE_JOURNEY}")
    journey_src = journey_path.read_text(encoding="utf-8")
    if "useRoute" not in journey_src:
        abort(f"ApplicantJourneyStatus.tsx does not use useRoute — unexpected state.")
    _ok(f"{FILE_JOURNEY} located ({len(journey_src)} chars)")

    _step_results["Repository Truth"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Resumable Mutation Execution
# ════════════════════════════════════════════════════════════════

def stage_3_mutations(root):
    _head("STAGE 3 — Resumable Mutation Execution")

    results = {}

    _info("Mutation 1/4: ApplicantDocumentCenter.tsx")
    results["ApplicantDocumentCenter.tsx"] = "applied" if _mutate_doc_center(root) else "already satisfied"

    _info("Mutation 2/4: App.tsx lazy import")
    results["App.tsx lazy import"] = "applied" if _mutate_app_lazy(root) else "already satisfied"

    _info("Mutation 3/4: App.tsx document route")
    results["App.tsx document route"] = "applied" if _mutate_app_route(root) else "already satisfied"

    _info("Mutation 4/4: ApplicantJourneyStatus.tsx document link")
    results["ApplicantJourneyStatus.tsx link"] = "applied" if _mutate_journey_link(root) else "already satisfied"

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

    doc_src     = (root / FILE_DOC).read_text(encoding="utf-8")
    app_src     = (root / FILE_APP).read_text(encoding="utf-8")
    journey_src = (root / FILE_JOURNEY).read_text(encoding="utf-8")

    # Document center page
    for marker, desc in [
        (IDEM_DOC_EXPORT,                            "default export"),
        ("/api/admissions/prospects/${id}/documents", "documents endpoint consumed"),
        ("useQuery",                                  "useQuery — read-only"),
        ("/hub/applicant/status/${id}",               "back link to journey status"),
        ("FileText",                                  "file icon"),
        ("archived",                                  "archived documents handled"),
        ("storage_url",                               "storage URL displayed"),
        ("admissions@lambsbook.net",                  "support contact"),
    ]:
        if marker in doc_src:
            _ok(f"Doc center: {desc}")
        else:
            abort(f"Doc center missing: {desc}")

    for forbidden in ["useMutation", 'apiRequest("POST"', 'apiRequest("PATCH"',
                      "supabase", "createDocument"]:
        if forbidden in doc_src:
            abort(f"Forbidden content: {forbidden!r}")
    _ok("Doc center: no forbidden mutations — read-only")

    # App.tsx
    for marker, expected, desc in [
        (IDEM_APP_LAZY,           1, "ApplicantDocumentCenter lazy import"),
        (IDEM_APP_ROUTE,          1, "/hub/applicant/documents/:id route"),
        ('/hub/applicant/status/:id', 1, "ApplicantJourneyStatus route preserved"),
        ('/hub/applicant/status"',    1, "ApplicantStatusLookup route preserved"),
    ]:
        count = app_src.count(marker)
        if count == expected:
            _ok(f"App.tsx [{desc}]: {count}")
        else:
            abort(f"App.tsx [{desc}]: count={count}, expected={expected}")

    # ApplicantJourneyStatus
    if IDEM_JOURNEY_LINK in journey_src:
        _ok("ApplicantJourneyStatus: document center link present")
    else:
        abort("ApplicantJourneyStatus: document center link missing")

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
        print(f"  CREATE/VERIFY  {FILE_DOC}")
        print(f"  MODIFY/VERIFY  {FILE_APP}")
        print(f"  MODIFY/VERIFY  {FILE_JOURNEY}")
        print()
        print("  ✓  Applicant Document Center (/hub/applicant/documents/:id)")
        print("  ✓  Route registered in App.tsx")
        print("  ✓  'View My Documents' link in Applicant Journey Status")
        print("  ✓  GET /api/admissions/prospects/:id/documents consumed (read-only)")
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
    abort("Repository root not found.\n\nPass root as argument:\n  python GE-RMP-007_applicant_document_center.py /path/to/repo")
    raise SystemExit(1)


def main():
    print(f"\n{BOLD}GE-RMP-007 — Applicant Document Center{RESET}")
    print(f"{BOLD}CIB Authority: GE-RMP-007 / DISC-GE-APPLICANT-DOCUMENT-CENTER-GAP{RESET}\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    stage_1_repository(root)
    stage_2_repository_truth(root)
    stage_3_mutations(root)
    stage_4_post_verify(root)
    print_summary()


if __name__ == "__main__":
    main()
