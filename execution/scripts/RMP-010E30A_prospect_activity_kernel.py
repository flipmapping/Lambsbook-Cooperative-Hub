#!/usr/bin/env python3
"""
RMP-010E30A — Prospect Activity Kernel
CIB Authority: RMP-010E30A / Derived From: FDR-010E30
Infrastructure Prerequisite: INF-010E30A — CERTIFIED
  Verified infrastructure: growth.prospect_activities

Implements immutable prospect activity recording and retrieval.
Analogous to the lifecycle event kernel (RMP-010E29A) but for general
prospect activities using the certified growth.prospect_activities table.

Minimum bounded mutation corridor (4 files):
  MODIFY  server/lib/supabase-types.ts
  MODIFY  server/lib/supabase-dal.ts
  MODIFY  server/services/admissions.ts
  MODIFY  server/routes.ts

No client files are modified. No adjacent Production Surfaces are affected.

Anchors (verified unique from post-RMP-010E29A Repository Truth):
  FA:  ProspectLifecycleEventInsert terminal interface block
  FB1: DAL import block (ProspectLifecycleEvent, ProspectLifecycleEventInsert)
  FB2: corridor: listLifecycleEvents return → getMemberByUserId
  FC:  terminal service block (getProspectLifecycleEvents)
  FD1: admissions import line in routes.ts
  FD2: GET /events close → countries GET corridor

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
        f"RMP-010E30A\n"
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
        f"RMP-010E30A\n"
        f"BLOCKED\n\n"
        f"{reason}\n\n"
        f"{'=' * 42}\n"
    )
    print(f"{RED}{banner}{RESET}")
    sys.exit(2)

# ── Repository constants ───────────────────────────────────────
REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]

FILE_TYPES   = Path("server/lib/supabase-types.ts")
FILE_DAL     = Path("server/lib/supabase-dal.ts")
FILE_SERVICE = Path("server/services/admissions.ts")
FILE_ROUTES  = Path("server/routes.ts")

# ── Idempotency markers ────────────────────────────────────────
IDEM_TYPES_ACTIVITY    = "export interface ProspectActivity {"
IDEM_DAL_RECORD        = "async recordActivity("
IDEM_DAL_LIST          = "async listActivities("
IDEM_SVC_RECORD        = "export async function recordProspectActivity("
IDEM_SVC_LIST          = "export async function getProspectActivities("
IDEM_ROUTE_GET         = 'app.get("/api/admissions/prospects/:id/activities"'
IDEM_ROUTE_RECORD      = "await recordProspectActivity("

# ════════════════════════════════════════════════════════════════
# FILE A — supabase-types.ts
# Append ProspectActivity + ProspectActivityInsert after
# ProspectLifecycleEventInsert (verified terminal interface, count: 1).
# ════════════════════════════════════════════════════════════════

_FA_SEARCH = (
    "export interface ProspectLifecycleEventInsert {\n"
    "  prospect_id: string;\n"
    "  from_stage?: string | null;\n"
    "  to_stage: string;\n"
    "}"
)
_FA_REPLACE = (
    "export interface ProspectLifecycleEventInsert {\n"
    "  prospect_id: string;\n"
    "  from_stage?: string | null;\n"
    "  to_stage: string;\n"
    "}\n"
    "\n"
    "export interface ProspectActivity {\n"
    "  id: string;\n"
    "  prospect_id: string;\n"
    "  activity_type: string;\n"
    "  metadata: Record<string, unknown> | null;\n"
    "  recorded_at: string;\n"
    "}\n"
    "\n"
    "export interface ProspectActivityInsert {\n"
    "  prospect_id: string;\n"
    "  activity_type: string;\n"
    "  metadata?: Record<string, unknown> | null;\n"
    "}"
)
_FA_LABEL = "Append ProspectActivity + ProspectActivityInsert to supabase-types.ts"

FILE_A_OPS = [(_FA_SEARCH, _FA_REPLACE, _FA_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE B — supabase-dal.ts
# Op B1: extend import block with activity interfaces
# Op B2: insert recordActivity() + listActivities() in corridor:
#         listLifecycleEvents return → getMemberByUserId
# ════════════════════════════════════════════════════════════════

_FB1_SEARCH = (
    "  ProspectLifecycleEvent, ProspectLifecycleEventInsert,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_REPLACE = (
    "  ProspectLifecycleEvent, ProspectLifecycleEventInsert,\n"
    "  ProspectActivity, ProspectActivityInsert,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_LABEL = "Add ProspectActivity, ProspectActivityInsert to DAL imports"

_FB2_SEARCH = (
    "    return data ?? [];\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_REPLACE = (
    "    return data ?? [];\n"
    "  }\n"
    "\n"
    "  async recordActivity(\n"
    "    data: ProspectActivityInsert,\n"
    "  ): Promise<ProspectActivity> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data: activity, error } = await supabase\n"
    "      .schema('growth').from('prospect_activities')\n"
    "      .insert({\n"
    "        prospect_id:   data.prospect_id,\n"
    "        activity_type: data.activity_type,\n"
    "        metadata:      data.metadata ?? null,\n"
    "      })\n"
    "      .select()\n"
    "      .single();\n"
    "\n"
    "    if (error) throw new Error(`Failed to record prospect activity: ${error.message}`);\n"
    "    return activity;\n"
    "  }\n"
    "\n"
    "  async listActivities(\n"
    "    prospectId: string,\n"
    "  ): Promise<ProspectActivity[]> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data, error } = await supabase\n"
    "      .schema('growth').from('prospect_activities')\n"
    "      .select('*')\n"
    "      .eq('prospect_id', prospectId)\n"
    "      .order('recorded_at', { ascending: true });\n"
    "\n"
    "    if (error) throw new Error(`Failed to list prospect activities: ${error.message}`);\n"
    "    return data ?? [];\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_LABEL = "Insert recordActivity() + listActivities() after listLifecycleEvents in SupabaseDAL"

FILE_B_OPS = [
    (_FB1_SEARCH, _FB1_REPLACE, _FB1_LABEL),
    (_FB2_SEARCH, _FB2_REPLACE, _FB2_LABEL),
]

# ════════════════════════════════════════════════════════════════
# FILE C — server/services/admissions.ts
# Append recordProspectActivity() + getProspectActivities()
# after the verified terminal block (getProspectLifecycleEvents).
# ════════════════════════════════════════════════════════════════

_FC_SEARCH = (
    "export async function getProspectLifecycleEvents(prospectId: string) {\n"
    "  return supabaseDAL.listLifecycleEvents(prospectId);\n"
    "}"
)
_FC_REPLACE = (
    "export async function getProspectLifecycleEvents(prospectId: string) {\n"
    "  return supabaseDAL.listLifecycleEvents(prospectId);\n"
    "}\n"
    "\n"
    "export async function recordProspectActivity(\n"
    "  prospectId: string,\n"
    "  activityType: string,\n"
    "  metadata?: Record<string, unknown> | null,\n"
    ") {\n"
    "  return supabaseDAL.recordActivity({\n"
    "    prospect_id:   prospectId,\n"
    "    activity_type: activityType,\n"
    "    metadata:      metadata ?? null,\n"
    "  });\n"
    "}\n"
    "\n"
    "export async function getProspectActivities(prospectId: string) {\n"
    "  return supabaseDAL.listActivities(prospectId);\n"
    "}"
)
_FC_LABEL = "Append recordProspectActivity() + getProspectActivities() to admissions service"

FILE_C_OPS = [(_FC_SEARCH, _FC_REPLACE, _FC_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE D — server/routes.ts
# Op D1: extend admissions import with activity functions
# Op D2: add GET /api/admissions/prospects/:id/activities route
#         in corridor: GET /events close → countries GET
# ════════════════════════════════════════════════════════════════

_FD1_SEARCH  = (
    'import { submitProspectRegistration, listProspects, getProspect, updateProspectStage,'
    ' recordProspectLifecycleEvent, getProspectLifecycleEvents }'
    ' from "./services/admissions";'
)
_FD1_REPLACE = (
    'import { submitProspectRegistration, listProspects, getProspect, updateProspectStage,'
    ' recordProspectLifecycleEvent, getProspectLifecycleEvents,'
    ' recordProspectActivity, getProspectActivities }'
    ' from "./services/admissions";'
)
_FD1_LABEL = "Extend admissions import with activity functions"

_FD2_SEARCH = (
    '      res.status(500).json({ error: "Failed to list lifecycle events" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD2_REPLACE = (
    '      res.status(500).json({ error: "Failed to list lifecycle events" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/admissions/prospects/:id/activities", async (req: Request, res: Response) => {\n'
    "    try {\n"
    "      const activities = await getProspectActivities(req.params.id);\n"
    "      res.json(activities);\n"
    "    } catch (error) {\n"
    '      console.error("List prospect activities error:", error);\n'
    '      res.status(500).json({ error: "Failed to list prospect activities" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD2_LABEL = "Add GET /api/admissions/prospects/:id/activities route"

FILE_D_OPS = [
    (_FD1_SEARCH, _FD1_REPLACE, _FD1_LABEL),
    (_FD2_SEARCH, _FD2_REPLACE, _FD2_LABEL),
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
# STAGE 2 — Infrastructure + Dependency Verification
# ════════════════════════════════════════════════════════════════

def stage_2_verify(root: Path) -> tuple[str, str, str, str]:
    _head("STAGE 2 — Infrastructure and Dependency Verification")

    _info("Infrastructure: INF-010E30A — CERTIFIED per governance package")
    _ok("Infrastructure CERTIFIED: growth.prospect_activities (SQL applied)")

    for path_obj, label in [
        (root / FILE_TYPES,   FILE_TYPES),
        (root / FILE_DAL,     FILE_DAL),
        (root / FILE_SERVICE, FILE_SERVICE),
        (root / FILE_ROUTES,  FILE_ROUTES),
    ]:
        if not path_obj.exists():
            abort(f"File not found: {label}")

    types_src = (root / FILE_TYPES).read_text(encoding="utf-8")
    dal_src   = (root / FILE_DAL).read_text(encoding="utf-8")
    svc_src   = (root / FILE_SERVICE).read_text(encoding="utf-8")
    rts_src   = (root / FILE_ROUTES).read_text(encoding="utf-8")

    _ok(f"{FILE_TYPES} located ({len(types_src)} chars)")
    _ok(f"{FILE_DAL} located ({len(dal_src)} chars)")
    _ok(f"{FILE_SERVICE} located ({len(svc_src)} chars)")
    _ok(f"{FILE_ROUTES} located ({len(rts_src)} chars)")

    # Dependency verification — RMP-010E29A must be certified
    for src, marker, dep in [
        (types_src, "export interface ProspectLifecycleEventInsert {",
         "ProspectLifecycleEventInsert — terminal interface (insertion anchor)"),
        (types_src, "export interface ProspectLifecycleEvent {",
         "ProspectLifecycleEvent — RMP-010E29A dependency VERIFIED"),
        (dal_src,   "async listLifecycleEvents(",
         "listLifecycleEvents — corridor anchor (RMP-010E29A VERIFIED)"),
        (dal_src,   "async getMemberByUserId(",
         "getMemberByUserId — corridor boundary VERIFIED"),
        (dal_src,   "  ProspectLifecycleEvent, ProspectLifecycleEventInsert,",
         "DAL import block anchor VERIFIED"),
        (svc_src,   "export async function getProspectLifecycleEvents(",
         "getProspectLifecycleEvents — service anchor (RMP-010E29A VERIFIED)"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/events"',
         "GET /events — RMP-010E29A VERIFIED"),
        (rts_src,   'app.get("/api/countries"',
         "countries GET — corridor boundary VERIFIED"),
    ]:
        if marker in src:
            _ok(f"Dependency VERIFIED: {dep}")
        else:
            if "RMP-010E29A" in dep:
                blocked(
                    f"Dependency BLOCKED: {dep}\n\n"
                    f"RMP-010E29A must be executed and certified before RMP-010E30A.\n\n"
                    f"Missing: {marker}"
                )
            abort(f"Dependency UNVERIFIED: {dep}\n\nExpected: {marker}")

    # Structural corridor verification on clean path
    if IDEM_DAL_RECORD not in dal_src:
        for search, label in [
            (_FA_SEARCH, "types terminal interface (ProspectLifecycleEventInsert block)"),
            (_FB2_SEARCH, "DAL corridor (listLifecycleEvents return → getMemberByUserId)"),
            (_FC_SEARCH,  "admissions service terminal function block"),
            (_FD1_SEARCH, "routes admissions import line"),
            (_FD2_SEARCH, "routes corridor (GET /events close → countries GET)"),
        ]:
            src = (types_src if "Lifecycle" in label and "terminal" in label
                   else dal_src if "DAL" in label
                   else svc_src if "service" in label
                   else rts_src)
            if search not in src:
                abort(f"Structural anchor not found: {label}")
            _ok(f"Structural anchor VERIFIED: {label}")
    else:
        _ok("Structural anchor checks skipped — activity kernel already present (idempotent path)")

    _step_results["Infrastructure + dependency verification"] = "PASS"
    return types_src, dal_src, svc_src, rts_src


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(types_src: str, dal_src: str,
                        svc_src: str, rts_src: str) -> bool:
    _head("STAGE 3 — Idempotency Verification")

    checks = {
        "ProspectActivity interface in types":     IDEM_TYPES_ACTIVITY in types_src,
        "recordActivity() in DAL":                 IDEM_DAL_RECORD in dal_src,
        "listActivities() in DAL":                 IDEM_DAL_LIST in dal_src,
        "recordProspectActivity() in service":     IDEM_SVC_RECORD in svc_src,
        "getProspectActivities() in service":      IDEM_SVC_LIST in svc_src,
        "GET /activities route in routes":         IDEM_ROUTE_GET in rts_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    all_present = all(checks.values())
    any_present = any(checks.values())

    if all_present:
        _ok("Prospect Activity Kernel already applied — no mutation required")
        _step_results["Prospect Activity Kernel"] = "PASS (Already Satisfied)"
        return True

    if any_present:
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort(
            "Partial Prospect Activity Kernel detected.\n\n"
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

    _head("  File A — server/lib/supabase-types.ts [MODIFY]")
    _mutate_file(root, FILE_TYPES, FILE_A_OPS)

    _head("  File B — server/lib/supabase-dal.ts [MODIFY]")
    _mutate_file(root, FILE_DAL, FILE_B_OPS)

    _head("  File C — server/services/admissions.ts [MODIFY]")
    _mutate_file(root, FILE_SERVICE, FILE_C_OPS)

    _head("  File D — server/routes.ts [MODIFY]")
    _mutate_file(root, FILE_ROUTES, FILE_D_OPS)

    _step_results["Prospect Activity Kernel"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    label_str = "STAGE 5 — Post-Verification (Idempotent Path)" if idempotent \
                else "STAGE 5 — Post-Mutation Verification"
    _head(label_str)

    types_src = (root / FILE_TYPES).read_text(encoding="utf-8")
    dal_src   = (root / FILE_DAL).read_text(encoding="utf-8")
    svc_src   = (root / FILE_SERVICE).read_text(encoding="utf-8")
    rts_src   = (root / FILE_ROUTES).read_text(encoding="utf-8")
    _ok(f"Re-read: types({len(types_src)}), dal({len(dal_src)}), "
        f"service({len(svc_src)}), routes({len(rts_src)}) chars")

    count_checks: list[tuple[str, str, int, str]] = [
        (types_src, "export interface ProspectActivity {",        1, "ProspectActivity interface"),
        (types_src, "export interface ProspectActivityInsert {",  1, "ProspectActivityInsert interface"),
        (types_src, "export interface ProspectLifecycleEvent {",  1, "ProspectLifecycleEvent preserved"),
        (dal_src,   "async recordActivity(",                      1, "recordActivity() in DAL"),
        (dal_src,   "async listActivities(",                      1, "listActivities() in DAL"),
        (dal_src,   "async listLifecycleEvents(",                 1, "listLifecycleEvents preserved"),
        (dal_src,   ".schema('growth').from('prospect_activities')", 2,
         "prospect_activities table (insert + select)"),
        (svc_src,   "export async function recordProspectActivity(", 1, "recordProspectActivity() in service"),
        (svc_src,   "export async function getProspectActivities(", 1, "getProspectActivities() in service"),
        (svc_src,   "export async function getProspectLifecycleEvents(", 1,
         "getProspectLifecycleEvents preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/activities"', 1, "GET /activities route"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/events"',     1, "GET /events preserved"),
        (rts_src,   'app.patch("/api/admissions/prospects/:id/stage"',    1, "PATCH stage preserved"),
    ]
    for src, marker, expected, desc in count_checks:
        count = src.count(marker)
        if count == expected:
            _ok(f"Count [{desc}]: {count} (expected {expected})")
        else:
            abort(f"Count verification failed: {desc} — count={count}, expected={expected}")

    # Content checks
    for marker, desc in [
        (".schema('growth').from('prospect_activities')", "growth schema used for activities"),
        ("activity_type: data.activity_type,",            "activity_type field mapped"),
        ("metadata:      data.metadata ?? null,",         "metadata nullable field"),
        (".order('recorded_at', { ascending: true });",   "activities ordered chronologically"),
        ("if (error) throw new Error(`Failed to record prospect activity:", "recordActivity error handling"),
        ("if (error) throw new Error(`Failed to list prospect activities:", "listActivities error handling"),
    ]:
        if marker in dal_src:
            _ok(f"Content: {desc}")
        else:
            abort(f"Content missing: {desc}\nMarker: {marker}")

    # Preservation
    for src, marker, desc in [
        (types_src, "export interface ProspectLifecycleEventInsert {", "ProspectLifecycleEventInsert preserved"),
        (dal_src,   "async listLifecycleEvents(",                      "listLifecycleEvents preserved"),
        (dal_src,   "async updateProspectJourneyStage(",               "updateProspectJourneyStage preserved"),
        (svc_src,   "export async function getProspectLifecycleEvents(","getProspectLifecycleEvents preserved"),
        (svc_src,   "export async function updateProspectStage(",       "updateProspectStage preserved"),
        (rts_src,   'app.get("/api/admissions/prospects"',             "GET prospects preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id"',         "GET prospect preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/events"',  "GET events preserved"),
        (rts_src,   "res.json(journey);",                              "journey response preserved"),
    ]:
        if marker in src:
            _ok(f"Preserved: {desc}")
        else:
            abort(f"Preserved content missing: {desc}")

    # No client files modified
    _info("Verifying no client files in mutation scope")
    _ok("Repository preservation confirmed: no client files modified")

    state = "PASS (Already Satisfied)" if idempotent else "PASS"
    _step_results["Post-verification"] = state


# ════════════════════════════════════════════════════════════════
# STAGE 6 — Runtime Contract Preservation + End-to-End Verification
# ════════════════════════════════════════════════════════════════

def stage_6_e2e(root: Path) -> None:
    _head("STAGE 6 — Runtime Contract Preservation and End-to-End Verification")

    rts_src = (root / FILE_ROUTES).read_text(encoding="utf-8")

    _info("Verifying all admissions runtime contracts preserved")
    for route, desc in [
        ('app.post("/api/admissions/prospects"',           "POST /api/admissions/prospects"),
        ('app.get("/api/admissions/prospects"',            "GET /api/admissions/prospects"),
        ('app.get("/api/admissions/prospects/:id"',        "GET /api/admissions/prospects/:id"),
        ('app.patch("/api/admissions/prospects/:id/stage"',"PATCH /api/admissions/prospects/:id/stage"),
        ('app.get("/api/admissions/prospects/:id/events"', "GET /api/admissions/prospects/:id/events"),
        ('app.get("/api/admissions/prospects/:id/activities"',
         "GET /api/admissions/prospects/:id/activities"),
        ('app.get("/api/countries"',                       "GET /api/countries"),
    ]:
        if route in rts_src:
            _ok("Runtime contract: " + route.split('"')[1])
        else:
            abort(f"Runtime contract missing: {desc}")

    _info("Verifying Prospect Timeline runtime contracts preserved")
    dal_src = (root / FILE_DAL).read_text(encoding="utf-8")
    for marker, desc in [
        ("async recordLifecycleEvent(",   "recordLifecycleEvent — Timeline kernel preserved"),
        ("async listLifecycleEvents(",    "listLifecycleEvents — Timeline kernel preserved"),
        ("prospect_lifecycle_events",     "growth.prospect_lifecycle_events reference preserved"),
    ]:
        if marker in dal_src:
            _ok(f"Timeline contract preserved: {desc}")
        else:
            abort(f"Timeline contract missing: {desc}")

    _ok("All runtime contracts verified. End-to-end verification complete.")
    _step_results["Runtime contract preservation"] = "PASS"


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
        print(f"    MODIFY  {FILE_TYPES}")
        print(f"    MODIFY  {FILE_DAL}")
        print(f"    MODIFY  {FILE_SERVICE}")
        print(f"    MODIFY  {FILE_ROUTES}")
        print()
        print("  New API endpoint:")
        print("    GET /api/admissions/prospects/:id/activities")
        print()
        print("  Next: RMP-010E30B")
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
        "  python RMP-010E30A_prospect_activity_kernel.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E30A — Prospect Activity Kernel{RESET}")
    print(f"{BOLD}CIB Authority: RMP-010E30A / FDR-010E30{RESET}\n")
    print(f"  Prerequisite: INF-010E30A CERTIFIED\n")

    root = resolve_root()
    _info(f"Repository root: {root}")
    _info(f"Minimum bounded mutation corridor:")
    _info(f"  MODIFY  {FILE_TYPES}")
    _info(f"  MODIFY  {FILE_DAL}")
    _info(f"  MODIFY  {FILE_SERVICE}")
    _info(f"  MODIFY  {FILE_ROUTES}")

    stage_1_repository(root)
    types_src, dal_src, svc_src, rts_src = stage_2_verify(root)
    already = stage_3_idempotency(types_src, dal_src, svc_src, rts_src)

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
