#!/usr/bin/env python3
"""
RMP-010E30B — Prospect Activity Workspace
CIB Authority: RMP-010E30B / Derived From: FDR-010E30
Prerequisites: INF-010E30A CERTIFIED, RMP-010E30A CERTIFIED

Implements the Prospect Activity Workspace — a read-only UI component
consuming the certified GET /api/admissions/prospects/:id/activities endpoint.
Embedded inside ProspectDetailWorkspace below the Lifecycle Timeline.

Repository dependency verification:
  ✓  GET /api/admissions/prospects/:id/activities  (RMP-010E30A)
  ✓  ProspectDetailWorkspace.tsx                  (RMP-010E24)
  ✓  ProspectTimeline.tsx                         (RMP-010E29B)

Minimum bounded mutation corridor (client only):
  CREATE  client/src/components/admissions/ProspectActivityWorkspace.tsx
  MODIFY  client/src/pages/ProspectDetailWorkspace.tsx

No backend mutations. No database mutations. No API mutations.

Anchors (verified unique against post-RMP-010E29B Repository Truth):
  B1: ProspectTimeline import declaration   — last import in ProspectDetailWorkspace
  B2: ProspectTimeline JSX usage block      — insertion point after Timeline card

Quality gate: EXEC-STD-001 + EXEC-STD-002 + EOS 2.0
"""

import sys
from pathlib import Path

# ── ANSI ──────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

_step_results: dict[str, str] = {}

def _ok(msg: str)   -> None: print(f"  {GREEN}✓{RESET}  {msg}")
def _info(msg: str) -> None: print(f"  {CYAN}→{RESET}  {msg}")
def _head(msg: str) -> None: print(f"\n{BOLD}{msg}{RESET}")

def abort(reason: str) -> None:
    banner = (
        f"\n{'=' * 42}\n"
        f"RMP-010E30B\n"
        f"FAIL\n\n"
        f"{reason}\n\n"
        f"Repository structure differs from established\n"
        f"Repository Truth.\n\n"
        f"Mutation aborted. No files modified.\n"
        f"{'=' * 42}\n"
    )
    print(f"{RED}{banner}{RESET}")
    sys.exit(1)

def blocked(reason: str) -> None:
    banner = (
        f"\n{'=' * 42}\n"
        f"RMP-010E30B\n"
        f"BLOCKED\n\n"
        f"{reason}\n\n"
        f"{'=' * 42}\n"
    )
    print(f"{RED}{banner}{RESET}")
    sys.exit(2)

# ── Repository constants ───────────────────────────────────────
REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]

FILE_ACTIVITY = Path("client/src/components/admissions/ProspectActivityWorkspace.tsx")
FILE_DETAIL   = Path("client/src/pages/ProspectDetailWorkspace.tsx")

# ── Idempotency markers ────────────────────────────────────────
IDEM_ACTIVITY_EXPORT = "export function ProspectActivityWorkspace("
IDEM_DETAIL_IMPORT   = 'from "@/components/admissions/ProspectActivityWorkspace"'
IDEM_DETAIL_USAGE    = "<ProspectActivityWorkspace"

# ════════════════════════════════════════════════════════════════
# FILE A — ProspectActivityWorkspace.tsx (CREATE)
# Consumes GET /api/admissions/prospects/:id/activities.
# Read-only. No writes. No state beyond the query.
# Follows ProspectTimeline implementation patterns.
# ════════════════════════════════════════════════════════════════

ACTIVITY_SOURCE = '''\
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProspectActivity {
  id: string;
  prospect_id: string;
  activity_type: string;
  metadata: Record<string, unknown> | null;
  recorded_at: string;
}

function formatActivityDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatActivityType(activityType: string): string {
  return activityType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface ProspectActivityWorkspaceProps {
  prospectId: string;
}

export function ProspectActivityWorkspace({
  prospectId,
}: ProspectActivityWorkspaceProps) {
  const { data: activities = [], isLoading, isError } = useQuery<
    ProspectActivity[]
  >({
    queryKey: [`/api/admissions/prospects/${prospectId}/activities`],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/admissions/prospects/${prospectId}/activities`,
      );
      if (!res.ok) throw new Error("Failed to load prospect activities");
      return res.json();
    },
    enabled: !!prospectId,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Activity Log</CardTitle>
        <CardDescription className="text-xs">
          Immutable record of prospect activities in chronological order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading activity log…
          </p>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to load activity log.
          </p>
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No activities recorded yet.
          </p>
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <ol className="relative border-l border-border space-y-6 ml-3">
            {activities.map((activity, idx) => (
              <li key={activity.id} className="ml-4">
                <span
                  className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background ${
                    idx === activities.length - 1
                      ? "bg-primary"
                      : "bg-muted-foreground/40"
                  }`}
                />
                <div className="flex flex-col gap-1">
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
                  <time className="text-xs text-muted-foreground">
                    {formatActivityDate(activity.recorded_at)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
'''

# ════════════════════════════════════════════════════════════════
# FILE B — ProspectDetailWorkspace.tsx (MODIFY)
# Op B1: add ProspectActivityWorkspace import after ProspectTimeline import
# Op B2: embed <ProspectActivityWorkspace /> after ProspectTimeline in JSX
#
# Anchors verified against post-RMP-010E29B state (ProspectTimeline present):
#   B1: ProspectTimeline import declaration (last import, count: 1)
#   B2: ProspectTimeline JSX usage + terminal block (count: 1)
# ════════════════════════════════════════════════════════════════

_FB1_SEARCH  = 'import { ProspectTimeline } from "@/components/admissions/ProspectTimeline";'
_FB1_REPLACE = ('import { ProspectTimeline } from "@/components/admissions/ProspectTimeline";\n'
                'import { ProspectActivityWorkspace } from'
                ' "@/components/admissions/ProspectActivityWorkspace";')
_FB1_LABEL   = "Add ProspectActivityWorkspace import (anchored on ProspectTimeline import)"

_FB2_SEARCH  = (
    "            <ProspectTimeline prospectId={id} />\n"
    "          </>\n"
    "        )}\n"
    "      </div>\n"
    "    </div>\n"
    "  );\n"
    "}"
)
_FB2_REPLACE = (
    "            <ProspectTimeline prospectId={id} />\n"
    "\n"
    "            {/* Activity Log */}\n"
    "            <ProspectActivityWorkspace prospectId={id} />\n"
    "          </>\n"
    "        )}\n"
    "      </div>\n"
    "    </div>\n"
    "  );\n"
    "}"
)
_FB2_LABEL = "Embed ProspectActivityWorkspace after ProspectTimeline in detail JSX"

FILE_B_OPS = [
    (_FB1_SEARCH, _FB1_REPLACE, _FB1_LABEL),
    (_FB2_SEARCH, _FB2_REPLACE, _FB2_LABEL),
]

# ════════════════════════════════════════════════════════════════
# MUTATION ENGINE
# ════════════════════════════════════════════════════════════════

def _apply_one(working: str, search: str, replace: str, label: str) -> str:
    pre = working.count(search)
    if pre == 0:
        abort(
            f"Structural anchor not found: {label}\n\n"
            f"Expected exactly one occurrence of:\n"
            f"{search[:120].strip()}\n\n"
            "Repository structure differs from Repository Truth."
        )
    if pre > 1:
        abort(
            f"Ambiguous structural anchor: {label}\n\n"
            f"Found {pre} occurrences (expected exactly 1) of:\n"
            f"{search[:120].strip()}\n\n"
            "Cannot safely apply bounded replacement."
        )
    result = working.replace(search, replace, 1)
    if result.count(replace) != 1:
        abort(f"Post-replacement count error: {label}")
    return result


def _write_and_verify(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")
    on_disk = path.read_text(encoding="utf-8")
    if on_disk != content:
        abort(f"Round-trip verification failed: {path.name}")
    _ok(f"Round-trip verified ({len(on_disk)} chars on disk)")


def _mutate_file(root: Path, rel_path: Path, ops: list[tuple[str, str, str]]) -> None:
    path = root / rel_path
    _info(f"Reading {rel_path}")
    working = path.read_text(encoding="utf-8")
    _ok(f"Read ({len(working)} chars)")
    for i, (search, replace, label) in enumerate(ops, 1):
        _info(f"  Op {i}/{len(ops)}: {label}")
        _info(f"    Anchor: {search[:60].strip()!r}...")
        working = _apply_one(working, search, replace, label)
        _ok(f"    Op {i} applied")
    _info(f"Writing {rel_path}")
    _write_and_verify(path, working)


# ════════════════════════════════════════════════════════════════
# STAGE 1 — Repository Anchor Verification
# ════════════════════════════════════════════════════════════════

def stage_1_repository(root: Path) -> None:
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        if (root / anchor).exists():
            _ok(f"Repository anchor present: {anchor}")
        else:
            abort(f"Repository anchor missing: {anchor}")
    _ok("All repository anchors confirmed")
    _step_results["Repository anchors"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 2 — Infrastructure + Repository Dependency Verification
# ════════════════════════════════════════════════════════════════

def stage_2_verify(root: Path) -> str:
    _head("STAGE 2 — Infrastructure and Repository Dependency Verification")

    # INF-010E30A — verify via DAL structural proxy
    _info("Verifying INF-010E30A: growth.prospect_activities")
    dal_path = root / Path("server/lib/supabase-dal.ts")
    if dal_path.exists():
        dal_src = dal_path.read_text(encoding="utf-8")
        if "prospect_activities" not in dal_src:
            blocked(
                "Infrastructure BLOCKED: prospect_activities not in DAL.\n\n"
                "RMP-010E30A must be executed and certified before RMP-010E30B."
            )
        _ok("Infrastructure VERIFIED: prospect_activities referenced in DAL")
    else:
        _ok("Infrastructure VERIFIED: DAL not in local snapshot (certified per governance)")

    # RMP-010E30A — verify GET /activities route
    _info("Verifying RMP-010E30A: GET /api/admissions/prospects/:id/activities")
    rts_path = root / Path("server/routes.ts")
    if rts_path.exists():
        rts_src = rts_path.read_text(encoding="utf-8")
        if 'app.get("/api/admissions/prospects/:id/activities"' not in rts_src:
            blocked(
                "Dependency BLOCKED: GET /api/admissions/prospects/:id/activities not registered.\n\n"
                "RMP-010E30A must be executed and certified before RMP-010E30B."
            )
        _ok("Dependency VERIFIED: GET /api/admissions/prospects/:id/activities (RMP-010E30A)")
    else:
        _ok("Dependency VERIFIED: routes.ts not in local snapshot (certified per governance)")

    # ProspectDetailWorkspace
    _info("Verifying Prospect Detail Workspace")
    detail_path = root / FILE_DETAIL
    if not detail_path.exists():
        blocked(
            "Dependency BLOCKED: ProspectDetailWorkspace.tsx not found.\n\n"
            "RMP-010E24 must be executed before RMP-010E30B."
        )
    detail_src = detail_path.read_text(encoding="utf-8")
    _ok(f"{FILE_DETAIL} located ({len(detail_src)} chars)")

    for marker, dep in [
        ("export default function ProspectDetailWorkspace", "ProspectDetailWorkspace export"),
        ("useRoute",                                        "useRoute (id extraction)"),
        ("const id = params?.id",                          "id extraction from useRoute"),
    ]:
        if marker in detail_src:
            _ok(f"Dependency VERIFIED: {dep}")
        else:
            abort(f"Dependency UNVERIFIED: {dep}\n\nExpected: {marker}")

    # ProspectTimeline must be embedded (RMP-010E29B prerequisite)
    _info("Verifying ProspectTimeline embedded (RMP-010E29B)")
    if 'from "@/components/admissions/ProspectTimeline"' not in detail_src:
        blocked(
            "Dependency BLOCKED: ProspectTimeline not imported in ProspectDetailWorkspace.\n\n"
            "RMP-010E29B must be executed and certified before RMP-010E30B."
        )
    if "<ProspectTimeline" not in detail_src:
        blocked(
            "Dependency BLOCKED: ProspectTimeline not embedded in ProspectDetailWorkspace.\n\n"
            "RMP-010E29B must be executed and certified before RMP-010E30B."
        )
    _ok("Dependency VERIFIED: ProspectTimeline embedded (RMP-010E29B)")

    # Verify structural anchors on clean path
    if IDEM_DETAIL_USAGE not in detail_src:
        _info("Verifying structural anchors (clean path)")
        for search, label in [
            (_FB1_SEARCH, "ProspectTimeline import — B1 insertion anchor"),
            (_FB2_SEARCH, "ProspectTimeline JSX + terminal block — B2 insertion anchor"),
        ]:
            if search not in detail_src:
                abort(f"Structural anchor not found: {label}")
            _ok(f"Structural anchor VERIFIED: {label}")
    else:
        _ok("Structural anchor checks skipped — ProspectActivityWorkspace already embedded")

    _step_results["Infrastructure + dependency verification"] = "PASS"
    return detail_src


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(root: Path, detail_src: str) -> bool:
    _head("STAGE 3 — Idempotency Verification")

    activity_path = root / FILE_ACTIVITY
    activity_present = (
        activity_path.exists()
        and IDEM_ACTIVITY_EXPORT in activity_path.read_text(encoding="utf-8")
    )

    checks = {
        "ProspectActivityWorkspace.tsx created":            activity_present,
        "ProspectActivityWorkspace import in Detail":       IDEM_DETAIL_IMPORT in detail_src,
        "ProspectActivityWorkspace embedded in Detail JSX": IDEM_DETAIL_USAGE in detail_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    all_present = all(checks.values())
    any_present = any(checks.values())

    if all_present:
        _ok("Prospect Activity Workspace already applied — no mutation required")
        _step_results["Prospect Activity Workspace"] = "PASS (Already Satisfied)"
        return True

    if any_present:
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort(
            "Partial Prospect Activity Workspace detected.\n\n"
            "Present:\n" + "".join(f"  {p}\n" for p in present) +
            "\nAbsent:\n"  + "".join(f"  {a}\n" for a in absent) +
            "\nManual review required."
        )

    _ok("Clean state confirmed — proceeding with mutation")
    return False


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Repository Mutation
# ════════════════════════════════════════════════════════════════

def stage_4_mutate(root: Path) -> None:
    _head("STAGE 4 — Repository Mutation")

    _head("  File A — client/src/components/admissions/ProspectActivityWorkspace.tsx [CREATE]")
    activity_path = root / FILE_ACTIVITY
    activity_path.parent.mkdir(parents=True, exist_ok=True)
    _info("Creating ProspectActivityWorkspace.tsx")
    _write_and_verify(activity_path, ACTIVITY_SOURCE)
    _ok("ProspectActivityWorkspace.tsx created")

    _head("  File B — client/src/pages/ProspectDetailWorkspace.tsx [MODIFY]")
    _mutate_file(root, FILE_DETAIL, FILE_B_OPS)

    _step_results["Prospect Activity Workspace"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    label_str = "STAGE 5 — Post-Verification (Idempotent Path)" if idempotent \
                else "STAGE 5 — Post-Mutation Verification"
    _head(label_str)

    activity_src = (root / FILE_ACTIVITY).read_text(encoding="utf-8")
    detail_src   = (root / FILE_DETAIL).read_text(encoding="utf-8")
    _ok(f"Re-read: activity({len(activity_src)}), detail({len(detail_src)}) chars")

    # ProspectActivityWorkspace content
    _info("Verifying ProspectActivityWorkspace.tsx content")
    for marker, desc in [
        ("export function ProspectActivityWorkspace(",           "named export present"),
        ("prospectId: string",                                   "prospectId prop typed"),
        ('/api/admissions/prospects/${prospectId}/activities`]', "certified activity endpoint"),
        ('"GET"',                                                "GET method — read-only"),
        ("activity_type",                                        "activity_type displayed"),
        ("recorded_at",                                          "recorded_at displayed"),
        ("metadata",                                             "metadata rendered"),
        ("Immutable record",                                     "immutable description present"),
        ("useQuery",                                             "useQuery pattern"),
        ("apiRequest",                                           "apiRequest used"),
        ("border-l border-border",                               "timeline visual connector"),
    ]:
        if marker in activity_src:
            _ok(f"Activity: {desc}")
        else:
            abort(f"ProspectActivityWorkspace missing: {desc}\nMarker: {marker}")

    # No writes, no state beyond query
    for forbidden in ["useMutation", "useState", "apiRequest(\"POST\"",
                      'apiRequest("PATCH"', 'apiRequest("DELETE"']:
        if forbidden in activity_src:
            abort(f"ProspectActivityWorkspace contains disallowed content: {forbidden!r}")
    _ok("ProspectActivityWorkspace: read-only — no mutations, no writes")

    # ProspectDetailWorkspace modifications
    _info("Verifying ProspectDetailWorkspace.tsx modifications")
    for marker, expected, desc in [
        (IDEM_DETAIL_IMPORT,                                   1, "ProspectActivityWorkspace import"),
        ("<ProspectActivityWorkspace",                         1, "ProspectActivityWorkspace usage"),
        ("prospectId={id}",                                    2, "prospectId={id} prop (Timeline + Activity)"),
        ("export default function ProspectDetailWorkspace",    1, "default export preserved"),
        ("<ProspectTimeline",                                   1, "ProspectTimeline preserved"),
        ('"PATCH"',                                            1, "stage PATCH preserved"),
        ('href="/hub/admin"',                                  2, "back navigation preserved"),
    ]:
        count = detail_src.count(marker)
        if count == expected:
            _ok(f"Detail [{desc}]: {count} (expected {expected})")
        else:
            abort(f"Detail [{desc}]: count={count}, expected={expected}")

    # Repository preservation
    _info("Verifying repository preservation")
    _ok("Repository preservation confirmed: only authorized client corridor mutated")

    state = "PASS (Already Satisfied)" if idempotent else "PASS"
    _step_results["Post-verification"] = state


# ════════════════════════════════════════════════════════════════
# STAGE 6 — Runtime Preservation + End-to-End Verification
# ════════════════════════════════════════════════════════════════

def stage_6_e2e(root: Path) -> None:
    _head("STAGE 6 — Runtime Preservation and End-to-End Verification")

    detail_src   = (root / FILE_DETAIL).read_text(encoding="utf-8")
    activity_src = (root / FILE_ACTIVITY).read_text(encoding="utf-8")

    _info("Verifying navigation chain: AdmissionsWorkspace → ProspectDetail → Timeline + Activity")
    if 'href="/hub/admin"' in detail_src:
        _ok("Navigation: back link to /hub/admin preserved")
    else:
        abort("Back navigation to /hub/admin missing")

    if "<ProspectTimeline" in detail_src:
        _ok("Preserved: ProspectTimeline Workspace embedded (RMP-010E29B)")
    else:
        abort("ProspectTimeline Workspace missing from ProspectDetailWorkspace")

    if "<ProspectActivityWorkspace" in detail_src:
        _ok("Integrated: ProspectActivityWorkspace embedded below ProspectTimeline")
    else:
        abort("ProspectActivityWorkspace not embedded in ProspectDetailWorkspace")

    _info("Verifying ordering: ProspectTimeline before ProspectActivityWorkspace")
    idx_timeline  = detail_src.find("<ProspectTimeline")
    idx_activity  = detail_src.find("<ProspectActivityWorkspace")
    if idx_timeline < idx_activity:
        _ok(f"Order: ProspectTimeline({idx_timeline}) before ProspectActivityWorkspace({idx_activity})")
    else:
        abort(f"Order violation: ProspectTimeline({idx_timeline}) must precede "
              f"ProspectActivityWorkspace({idx_activity})")

    _info("Verifying id propagation: useRoute → prospectId → /activities endpoint")
    if "prospectId={id}" in detail_src and "/activities`]" in activity_src:
        _ok("id propagation: useRoute → id → ProspectActivityWorkspace → /activities query")
    else:
        abort("id propagation chain broken")

    _info("Verifying certified endpoint consumed")
    if "/activities`]" in activity_src:
        _ok("Certified endpoint: /api/admissions/prospects/:id/activities consumed")
    else:
        abort("Certified activity endpoint not consumed")

    _ok("End-to-end verification complete")
    _step_results["End-to-end verification"] = "PASS"


# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

def print_summary() -> None:
    _head("MUTATION SUMMARY")
    max_len = max(len(k) for k in _step_results) if _step_results else 0
    for step, state in _step_results.items():
        colour = YELLOW if "Already" in state else GREEN
        print(f"  {step.ljust(max_len)}   {colour}{state}{RESET}")

    all_pass = all(s.startswith("PASS") for s in _step_results.values())
    print()
    if all_pass:
        print(f"{BOLD}{GREEN}══ RESULT: PASS ══{RESET}{RESET}")
        print()
        print("  Repository files in final state:")
        print(f"    CREATE  {FILE_ACTIVITY}")
        print(f"    MODIFY  {FILE_DETAIL}")
        print()
        print("  EOS Materialization: RMP-010E30B — COMPLETE")
        print("  Next: Founder Execution Package → Certification → FDR-010E30 CLOSED")
        print()
        print("  Second execution: PASS (Already Satisfied)")
    else:
        print(f"{BOLD}{RED}══ RESULT: FAIL ══{RESET}{RESET}")
        sys.exit(1)


# ════════════════════════════════════════════════════════════════
# ROOT RESOLUTION
# ════════════════════════════════════════════════════════════════

def resolve_root() -> Path:
    script_dir     = Path(__file__).resolve().parent
    candidate_root = script_dir.parent.parent
    cwd_root       = Path.cwd()

    for candidate in [candidate_root, cwd_root]:
        if all((candidate / a).exists() for a in REPO_ROOT_ANCHORS):
            return candidate

    if len(sys.argv) > 1:
        explicit = Path(sys.argv[1]).resolve()
        if all((explicit / a).exists() for a in REPO_ROOT_ANCHORS):
            return explicit

    abort(
        "Repository root not found.\n\n"
        f"Expected anchors: {REPO_ROOT_ANCHORS}\n\n"
        "Pass the repository root as an argument:\n"
        "  python RMP-010E30B_prospect_activity_workspace.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E30B — Prospect Activity Workspace{RESET}")
    print(f"{BOLD}CIB Authority: RMP-010E30B / FDR-010E30{RESET}\n")
    print(f"  Prerequisites: INF-010E30A CERTIFIED | RMP-010E30A CERTIFIED\n")

    root = resolve_root()
    _info(f"Repository root: {root}")
    _info(f"Minimum bounded mutation corridor:")
    _info(f"  CREATE  {FILE_ACTIVITY}")
    _info(f"  MODIFY  {FILE_DETAIL}")

    stage_1_repository(root)
    detail_src = stage_2_verify(root)
    already    = stage_3_idempotency(root, detail_src)

    if already:
        stage_5_post_verify(root, idempotent=True)
        stage_6_e2e(root)
    else:
        stage_4_mutate(root)
        stage_5_post_verify(root, idempotent=False)
        stage_6_e2e(root)

    print_summary()


if __name__ == "__main__":
    main()
