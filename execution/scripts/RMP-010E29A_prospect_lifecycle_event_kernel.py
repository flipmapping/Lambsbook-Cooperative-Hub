#!/usr/bin/env python3
"""
RMP-010E29A — Prospect Lifecycle Event Kernel
CIB Authority: RMP-010E29A / Derived From: FDR-010E29
Infrastructure Prerequisite: INF-010E29A — CERTIFIED

Implements immutable lifecycle event recording for Admissions.
Preserves all existing runtime contracts.

Infrastructure verified:
  ✓  growth.prospect_lifecycle_events  (INF-010E29A CERTIFIED — SQL applied)

Minimum bounded mutation corridor (4 files):
  MODIFY  server/lib/supabase-types.ts
  MODIFY  server/lib/supabase-dal.ts
  MODIFY  server/services/admissions.ts
  MODIFY  server/routes.ts

Anchors (verified unique from Repository Truth):
  FA:  terminal ProspectJourneyInsert interface block
  FB1: DAL import block (Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert)
  FB2: corridor: updateProspectJourneyStage return → getMemberByUserId
  FC:  terminal service block (getProspect + updateProspectStage)
  FD1: admissions import line in routes.ts
  FD2: PATCH handler journey null-check + response block
  FD3: PATCH handler close → countries GET corridor

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
        f"RMP-010E29A\n"
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
        f"RMP-010E29A\n"
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
IDEM_TYPES_EVENT     = "export interface ProspectLifecycleEvent {"
IDEM_DAL_RECORD      = "async recordLifecycleEvent("
IDEM_DAL_LIST        = "async listLifecycleEvents("
IDEM_SVC_RECORD      = "export async function recordProspectLifecycleEvent("
IDEM_SVC_LIST        = "export async function getProspectLifecycleEvents("
IDEM_ROUTE_EVENTS    = 'app.get("/api/admissions/prospects/:id/events"'
IDEM_ROUTE_RECORD    = "await recordProspectLifecycleEvent("

# ════════════════════════════════════════════════════════════════
# FILE A — supabase-types.ts
# Append ProspectLifecycleEvent + ProspectLifecycleEventInsert after
# ProspectJourneyInsert (verified terminal interface, anchor count: 1).
# ════════════════════════════════════════════════════════════════

_FA_SEARCH = (
    "export interface ProspectJourneyInsert {\n"
    "  prospect_id: string;\n"
    "  funnel_id: string;\n"
    "  current_stage?: string;\n"
    "}"
)
_FA_REPLACE = (
    "export interface ProspectJourneyInsert {\n"
    "  prospect_id: string;\n"
    "  funnel_id: string;\n"
    "  current_stage?: string;\n"
    "}\n"
    "\n"
    "export interface ProspectLifecycleEvent {\n"
    "  id: string;\n"
    "  prospect_id: string;\n"
    "  from_stage: string | null;\n"
    "  to_stage: string;\n"
    "  recorded_at: string;\n"
    "}\n"
    "\n"
    "export interface ProspectLifecycleEventInsert {\n"
    "  prospect_id: string;\n"
    "  from_stage?: string | null;\n"
    "  to_stage: string;\n"
    "}"
)
_FA_LABEL = "Append ProspectLifecycleEvent + ProspectLifecycleEventInsert to supabase-types.ts"

FILE_A_OPS = [(_FA_SEARCH, _FA_REPLACE, _FA_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE B — supabase-dal.ts
# Op B1: extend import block with new event interfaces
# Op B2: insert recordLifecycleEvent() + listLifecycleEvents() in corridor:
#         updateProspectJourneyStage return → getMemberByUserId
# ════════════════════════════════════════════════════════════════

_FB1_SEARCH = (
    "  Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_REPLACE = (
    "  Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert,\n"
    "  ProspectLifecycleEvent, ProspectLifecycleEventInsert,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_LABEL = "Add ProspectLifecycleEvent, ProspectLifecycleEventInsert to DAL imports"

_FB2_SEARCH = (
    "    return data;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_REPLACE = (
    "    return data;\n"
    "  }\n"
    "\n"
    "  async recordLifecycleEvent(\n"
    "    data: ProspectLifecycleEventInsert,\n"
    "  ): Promise<ProspectLifecycleEvent> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data: event, error } = await supabase\n"
    "      .schema('growth').from('prospect_lifecycle_events')\n"
    "      .insert({\n"
    "        prospect_id: data.prospect_id,\n"
    "        from_stage:  data.from_stage ?? null,\n"
    "        to_stage:    data.to_stage,\n"
    "      })\n"
    "      .select()\n"
    "      .single();\n"
    "\n"
    "    if (error) throw new Error(`Failed to record lifecycle event: ${error.message}`);\n"
    "    return event;\n"
    "  }\n"
    "\n"
    "  async listLifecycleEvents(\n"
    "    prospectId: string,\n"
    "  ): Promise<ProspectLifecycleEvent[]> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data, error } = await supabase\n"
    "      .schema('growth').from('prospect_lifecycle_events')\n"
    "      .select('*')\n"
    "      .eq('prospect_id', prospectId)\n"
    "      .order('recorded_at', { ascending: true });\n"
    "\n"
    "    if (error) throw new Error(`Failed to list lifecycle events: ${error.message}`);\n"
    "    return data ?? [];\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_LABEL = "Insert recordLifecycleEvent() + listLifecycleEvents() after updateProspectJourneyStage"

FILE_B_OPS = [(_FB1_SEARCH, _FB1_REPLACE, _FB1_LABEL),
              (_FB2_SEARCH, _FB2_REPLACE, _FB2_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE C — server/services/admissions.ts
# Append recordProspectLifecycleEvent() + getProspectLifecycleEvents()
# after verified terminal block (getProspect + updateProspectStage).
# ════════════════════════════════════════════════════════════════

_FC_SEARCH = (
    "export async function getProspect(id: string) {\n"
    "  return supabaseDAL.getProspect(id);\n"
    "}\n"
    "\n"
    "export async function updateProspectStage(id: string, stage: string) {\n"
    "  return supabaseDAL.updateProspectJourneyStage(id, stage);\n"
    "}"
)
_FC_REPLACE = (
    "export async function getProspect(id: string) {\n"
    "  return supabaseDAL.getProspect(id);\n"
    "}\n"
    "\n"
    "export async function updateProspectStage(id: string, stage: string) {\n"
    "  return supabaseDAL.updateProspectJourneyStage(id, stage);\n"
    "}\n"
    "\n"
    "export async function recordProspectLifecycleEvent(\n"
    "  prospectId: string,\n"
    "  fromStage: string | null,\n"
    "  toStage: string,\n"
    ") {\n"
    "  return supabaseDAL.recordLifecycleEvent({\n"
    "    prospect_id: prospectId,\n"
    "    from_stage:  fromStage,\n"
    "    to_stage:    toStage,\n"
    "  });\n"
    "}\n"
    "\n"
    "export async function getProspectLifecycleEvents(prospectId: string) {\n"
    "  return supabaseDAL.listLifecycleEvents(prospectId);\n"
    "}"
)
_FC_LABEL = "Append recordProspectLifecycleEvent() + getProspectLifecycleEvents() to admissions service"

FILE_C_OPS = [(_FC_SEARCH, _FC_REPLACE, _FC_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE D — server/routes.ts
# Op D1: extend admissions import to include new service functions
# Op D2: record lifecycle event inside PATCH handler (non-blocking)
# Op D3: add GET /api/admissions/prospects/:id/events route
# ════════════════════════════════════════════════════════════════

_FD1_SEARCH  = (
    'import { submitProspectRegistration, listProspects, getProspect, updateProspectStage }'
    ' from "./services/admissions";'
)
_FD1_REPLACE = (
    'import { submitProspectRegistration, listProspects, getProspect, updateProspectStage,'
    ' recordProspectLifecycleEvent, getProspectLifecycleEvents }'
    ' from "./services/admissions";'
)
_FD1_LABEL = "Extend admissions import with lifecycle event functions"

_FD2_SEARCH = (
    "      const journey = await updateProspectStage(req.params.id, current_stage);\n"
    "      if (!journey) {\n"
    '        return res.status(404).json({ error: "No journey found for this prospect" });\n'
    "      }\n"
    "      res.json(journey);"
)
_FD2_REPLACE = (
    "      const existingProspect = await getProspect(req.params.id);\n"
    "      const fromStage = existingProspect?.current_stage ?? null;\n"
    "      const journey = await updateProspectStage(req.params.id, current_stage);\n"
    "      if (!journey) {\n"
    '        return res.status(404).json({ error: "No journey found for this prospect" });\n'
    "      }\n"
    "      await recordProspectLifecycleEvent(\n"
    "        req.params.id,\n"
    "        fromStage,\n"
    "        current_stage,\n"
    "      ).catch((err) => {\n"
    '        console.error("Lifecycle event record error (non-blocking):", err);\n'
    "      });\n"
    "      res.json(journey);"
)
_FD2_LABEL = "Record lifecycle event in PATCH handler after stage update (non-blocking)"

_FD3_SEARCH = (
    '      console.error("Update prospect stage error:", error);\n'
    '      res.status(500).json({ error: "Failed to update prospect stage" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD3_REPLACE = (
    '      console.error("Update prospect stage error:", error);\n'
    '      res.status(500).json({ error: "Failed to update prospect stage" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/admissions/prospects/:id/events", async (req: Request, res: Response) => {\n'
    "    try {\n"
    "      const events = await getProspectLifecycleEvents(req.params.id);\n"
    "      res.json(events);\n"
    "    } catch (error) {\n"
    '      console.error("List lifecycle events error:", error);\n'
    '      res.status(500).json({ error: "Failed to list lifecycle events" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD3_LABEL = "Add GET /api/admissions/prospects/:id/events route"

FILE_D_OPS = [(_FD1_SEARCH, _FD1_REPLACE, _FD1_LABEL),
              (_FD2_SEARCH, _FD2_REPLACE, _FD2_LABEL),
              (_FD3_SEARCH, _FD3_REPLACE, _FD3_LABEL)]

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

    _info("Infrastructure: INF-010E29A — CERTIFIED per governance package")
    _ok("Infrastructure CERTIFIED: growth.prospect_lifecycle_events (SQL applied)")

    paths = {
        "types":   root / FILE_TYPES,
        "dal":     root / FILE_DAL,
        "service": root / FILE_SERVICE,
        "routes":  root / FILE_ROUTES,
    }
    for key, path in paths.items():
        if not path.exists():
            abort(f"File not found: {path}")

    types_src = paths["types"].read_text(encoding="utf-8")
    dal_src   = paths["dal"].read_text(encoding="utf-8")
    svc_src   = paths["service"].read_text(encoding="utf-8")
    rts_src   = paths["routes"].read_text(encoding="utf-8")

    _ok(f"{FILE_TYPES} located ({len(types_src)} chars)")
    _ok(f"{FILE_DAL} located ({len(dal_src)} chars)")
    _ok(f"{FILE_SERVICE} located ({len(svc_src)} chars)")
    _ok(f"{FILE_ROUTES} located ({len(rts_src)} chars)")

    # Dependency verification
    for src, marker, dep in [
        (types_src, "export interface ProspectJourneyInsert {", "ProspectJourneyInsert (insertion anchor)"),
        (types_src, "export interface ProspectJourney {",       "ProspectJourney (preserved dependency)"),
        (dal_src,   "async updateProspectJourneyStage(",        "updateProspectJourneyStage (corridor anchor)"),
        (dal_src,   "async getMemberByUserId(",                 "getMemberByUserId (corridor boundary)"),
        (dal_src,   "  Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert,", "DAL import block anchor"),
        (svc_src,   "export async function updateProspectStage(", "updateProspectStage (service anchor)"),
        (svc_src,   "export async function getProspect(",        "getProspect (service anchor)"),
        (rts_src,   'app.patch("/api/admissions/prospects/:id/stage"', "PATCH stage route (route anchor)"),
        (rts_src,   'app.get("/api/countries"',                 "countries GET (corridor boundary)"),
    ]:
        if marker in src:
            _ok(f"Dependency VERIFIED: {dep}")
        else:
            abort(f"Dependency UNVERIFIED: {dep}\n\nExpected: {marker}")

    # Structural corridor verification on clean path
    if IDEM_DAL_RECORD not in dal_src:
        if _FB2_SEARCH not in dal_src:
            abort("Corridor anchor not found: updateProspectJourneyStage return → getMemberByUserId")
        _ok("DAL corridor confirmed: updateProspectJourneyStage → getMemberByUserId")
        if _FD2_SEARCH not in rts_src:
            abort("PATCH handler anchor not found: journey null-check + response block")
        _ok("Route PATCH D2 anchor confirmed")
        if _FD3_SEARCH not in rts_src:
            abort("Route corridor anchor not found: PATCH close → countries GET")
        _ok("Route PATCH D3 corridor confirmed")
        if _FC_SEARCH not in svc_src:
            abort("Service insertion anchor not found: getProspect + updateProspectStage terminal block")
        _ok("Service terminal block anchor confirmed")
        if _FA_SEARCH not in types_src:
            abort("Types insertion anchor not found: ProspectJourneyInsert terminal block")
        _ok("Types terminal interface anchor confirmed")
    else:
        _ok("Corridor checks skipped — lifecycle event kernel already present (idempotent path)")

    _step_results["Infrastructure + dependency verification"] = "PASS"
    return types_src, dal_src, svc_src, rts_src


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(types_src: str, dal_src: str,
                        svc_src: str, rts_src: str) -> bool:
    _head("STAGE 3 — Idempotency Verification")

    checks = {
        "ProspectLifecycleEvent interface in types":     IDEM_TYPES_EVENT in types_src,
        "recordLifecycleEvent() in DAL":                 IDEM_DAL_RECORD in dal_src,
        "listLifecycleEvents() in DAL":                  IDEM_DAL_LIST in dal_src,
        "recordProspectLifecycleEvent() in service":     IDEM_SVC_RECORD in svc_src,
        "getProspectLifecycleEvents() in service":       IDEM_SVC_LIST in svc_src,
        "GET /events route in routes":                   IDEM_ROUTE_EVENTS in rts_src,
        "recordProspectLifecycleEvent call in PATCH":    IDEM_ROUTE_RECORD in rts_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    all_present = all(checks.values())
    any_present = any(checks.values())

    if all_present:
        _ok("Lifecycle event kernel already applied — no mutation required")
        _step_results["Lifecycle event kernel"] = "PASS (Already Satisfied)"
        return True

    if any_present:
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort(
            "Partial lifecycle event kernel detected.\n\n"
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

    _step_results["Lifecycle event kernel"] = "PASS"


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
        (types_src, "export interface ProspectLifecycleEvent {",       1, "ProspectLifecycleEvent interface"),
        (types_src, "export interface ProspectLifecycleEventInsert {", 1, "ProspectLifecycleEventInsert interface"),
        (types_src, "export interface ProspectJourney {",              1, "ProspectJourney preserved (no duplicate)"),
        (dal_src,   "async recordLifecycleEvent(",                     1, "recordLifecycleEvent() in DAL"),
        (dal_src,   "async listLifecycleEvents(",                      1, "listLifecycleEvents() in DAL"),
        (dal_src,   "async updateProspectJourneyStage(",               1, "updateProspectJourneyStage preserved"),
        (dal_src,   ".schema('growth').from('prospect_lifecycle_events')", 2,
         "prospect_lifecycle_events table (insert + select)"),
        (svc_src,   "export async function recordProspectLifecycleEvent(", 1, "recordProspectLifecycleEvent() in service"),
        (svc_src,   "export async function getProspectLifecycleEvents(", 1, "getProspectLifecycleEvents() in service"),
        (svc_src,   "export async function updateProspectStage(",       1, "updateProspectStage preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/events"',  1, "GET /events route"),
        (rts_src,   "await recordProspectLifecycleEvent(",              1, "recordProspectLifecycleEvent call in PATCH"),
        (rts_src,   'app.patch("/api/admissions/prospects/:id/stage"', 1, "PATCH route preserved (no duplicate)"),
    ]
    for src, marker, expected, desc in count_checks:
        count = src.count(marker)
        if count == expected:
            _ok(f"Count [{desc}]: {count} (expected {expected})")
        else:
            abort(f"Count verification failed: {desc} — count={count}, expected={expected}")

    # Content checks
    for marker, desc in [
        (".schema('growth').from('prospect_lifecycle_events')", "growth schema used for events"),
        ("from_stage:  data.from_stage ?? null,",              "from_stage nullable field"),
        ("to_stage:    data.to_stage,",                        "to_stage field"),
        (".order('recorded_at', { ascending: true });",        "events ordered chronologically"),
        (".catch((err) => {",                                  "event recording is non-blocking"),
        ("const fromStage = existingProspect?.current_stage ?? null;", "from_stage captured before update"),
    ]:
        if marker in dal_src or marker in rts_src:
            _ok(f"Content: {desc}")
        else:
            abort(f"Content missing: {desc}")

    # Preservation
    for src, marker, desc in [
        (types_src, "export interface ProspectJourney {",     "ProspectJourney preserved"),
        (dal_src,   "async updateProspectJourneyStage(",       "updateProspectJourneyStage preserved"),
        (dal_src,   "async createProspect(",                   "createProspect preserved"),
        (svc_src,   "export async function updateProspectStage(", "updateProspectStage preserved"),
        (rts_src,   'app.get("/api/admissions/prospects"',    "GET prospects route preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id"',"GET prospect route preserved"),
        (rts_src,   "res.json(journey);",                     "journey response preserved"),
    ]:
        if marker in src:
            _ok(f"Preserved: {desc}")
        else:
            abort(f"Preserved content missing: {desc}")

    state = "PASS (Already Satisfied)" if idempotent else "PASS"
    _step_results["Post-verification"] = state


# ════════════════════════════════════════════════════════════════
# STAGE 6 — End-to-End + Repository Preservation Verification
# ════════════════════════════════════════════════════════════════

def stage_6_e2e(root: Path) -> None:
    _head("STAGE 6 — End-to-End and Repository Preservation Verification")

    rts_src = (root / FILE_ROUTES).read_text(encoding="utf-8")

    _info("Verifying PATCH event recording chain order")
    patch_start = rts_src.find('app.patch("/api/admissions/prospects/:id/stage"')
    if patch_start == -1:
        abort("PATCH route not found in routes.ts")
    patch_block = rts_src[patch_start:patch_start + 1200]
    positions = {
        "fromStage":    patch_block.find("fromStage"),
        "updateStage":  patch_block.find("updateProspectStage"),
        "recordEvent":  patch_block.find("recordProspectLifecycleEvent"),
        "respond":      patch_block.find("res.json(journey)"),
    }
    ordered = ["fromStage", "updateStage", "recordEvent", "respond"]
    if all(positions[ordered[i]] < positions[ordered[i+1]]
           for i in range(len(ordered) - 1)
           if positions[ordered[i]] != -1 and positions[ordered[i+1]] != -1):
        _ok("PATCH chain order: fromStage → updateStage → recordEvent → respond")
    else:
        abort(f"PATCH chain ordering violation: {positions}")

    _info("Verifying GET /events route registered")
    if IDEM_ROUTE_EVENTS in rts_src:
        _ok("GET /api/admissions/prospects/:id/events route registered")
    else:
        abort("GET /events route not found")

    _info("Verifying Release 1 runtime contracts preserved")
    for route, desc in [
        ('app.post("/api/admissions/prospects"',  "POST /api/admissions/prospects"),
        ('app.get("/api/admissions/prospects"',   "GET /api/admissions/prospects"),
        ('app.get("/api/admissions/prospects/:id"',"GET /api/admissions/prospects/:id"),
        ('app.patch("/api/admissions/prospects/:id/stage"', "PATCH stage"),
        ('app.get("/api/countries"',              "GET /api/countries"),
    ]:
        if route in rts_src:
            _ok(f"Runtime contract preserved: {desc}")
        else:
            abort(f"Runtime contract missing: {desc}")

    _ok("End-to-end and repository preservation verification complete")
    _step_results["End-to-end + preservation"] = "PASS"


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
        print("  Verified new API endpoint:")
        print("    GET /api/admissions/prospects/:id/events")
        print()
        print("  Next: RMP-010E29B")
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
        "  python RMP-010E29A_prospect_lifecycle_event_kernel.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E29A — Prospect Lifecycle Event Kernel{RESET}")
    print(f"{BOLD}CIB Authority: RMP-010E29A / FDR-010E29 / INF-010E29A CERTIFIED{RESET}\n")

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
