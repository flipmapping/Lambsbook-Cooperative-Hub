#!/usr/bin/env python3
"""
RMP-010E20 — Prospect Lifecycle Progression
CIP-010E20

Authorized mutation scope: exactly three files.
  MODIFY  server/lib/supabase-dal.ts     — updateProspectJourneyStage()
  MODIFY  server/services/admissions.ts  — updateProspectStage() delegate
  MODIFY  server/routes.ts               — PATCH /api/admissions/prospects/:id/stage

Constraints:
  - All existing routes, methods, and contracts unchanged
  - No schema changes, no SQL, no UI, no environment changes
  - Bounded lifecycle progression only

Quality gate: EXEC-STD-001 + EXEC-STD-002
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
        f"RMP-010E20\n"
        f"FAIL\n\n"
        f"{reason}\n\n"
        f"Repository structure differs from Current\n"
        f"Implementation Authority.\n\n"
        f"Mutation aborted.\n\n"
        f"No files modified.\n"
        f"{'=' * 42}\n"
    )
    print(f"{RED}{banner}{RESET}")
    sys.exit(1)

# ── Repository constants ───────────────────────────────────────
REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]

FILE_DAL     = Path("server/lib/supabase-dal.ts")
FILE_SERVICE = Path("server/services/admissions.ts")
FILE_ROUTES  = Path("server/routes.ts")

# ── Idempotency markers ────────────────────────────────────────
IDEM_DAL_UPDATE     = "async updateProspectJourneyStage("
IDEM_SVC_UPDATE     = "export async function updateProspectStage("
IDEM_ROUTE_PATCH    = 'app.patch("/api/admissions/prospects/:id/stage"'

# ════════════════════════════════════════════════════════════════
# FILE A — supabase-dal.ts
# Corridor: getProspect close → getMemberByUserId (verified unique)
# ════════════════════════════════════════════════════════════════

_FA_SEARCH = (
    "    };\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)

_FA_REPLACE = (
    "    };\n"
    "  }\n"
    "\n"
    "  async updateProspectJourneyStage(\n"
    "    prospectId: string,\n"
    "    stage: string,\n"
    "  ): Promise<ProspectJourney | null> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data, error } = await supabase\n"
    "      .schema('growth').from('prospect_journeys')\n"
    "      .update({ current_stage: stage })\n"
    "      .eq('prospect_id', prospectId)\n"
    "      .select()\n"
    "      .maybeSingle();\n"
    "\n"
    "    if (error) throw new Error(`Failed to update prospect journey stage: ${error.message}`);\n"
    "    return data;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FA_LABEL = "Insert updateProspectJourneyStage() after getProspect() in SupabaseDAL"

FILE_A_OPS = [(_FA_SEARCH, _FA_REPLACE, _FA_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE B — server/services/admissions.ts
# Append updateProspectStage() after getProspect() (end of file)
# ════════════════════════════════════════════════════════════════

_FB_SEARCH = (
    "export async function getProspect(id: string) {\n"
    "  return supabaseDAL.getProspect(id);\n"
    "}"
)
_FB_REPLACE = (
    "export async function getProspect(id: string) {\n"
    "  return supabaseDAL.getProspect(id);\n"
    "}\n"
    "\n"
    "export async function updateProspectStage(id: string, stage: string) {\n"
    "  return supabaseDAL.updateProspectJourneyStage(id, stage);\n"
    "}"
)
_FB_LABEL = "Append updateProspectStage() delegate to admissions service"

FILE_B_OPS = [(_FB_SEARCH, _FB_REPLACE, _FB_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE C — server/routes.ts
# Op C1: Extend import to include updateProspectStage
# Op C2: Insert PATCH route after GET /:id close → countries GET
# ════════════════════════════════════════════════════════════════

_FC1_SEARCH  = (
    'import { submitProspectRegistration, listProspects, getProspect }'
    ' from "./services/admissions";'
)
_FC1_REPLACE = (
    'import { submitProspectRegistration, listProspects, getProspect, updateProspectStage }'
    ' from "./services/admissions";'
)
_FC1_LABEL = "Extend admissions import to include updateProspectStage"

_FC2_SEARCH = (
    '      res.status(500).json({ error: "Failed to get prospect" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FC2_REPLACE = (
    '      res.status(500).json({ error: "Failed to get prospect" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.patch("/api/admissions/prospects/:id/stage", async (req: Request, res: Response) => {\n'
    "    try {\n"
    "      const { current_stage } = req.body;\n"
    "      if (!current_stage || typeof current_stage !== \"string\") {\n"
    '        return res.status(400).json({ error: "current_stage is required" });\n'
    "      }\n"
    "      const journey = await updateProspectStage(req.params.id, current_stage);\n"
    "      if (!journey) {\n"
    '        return res.status(404).json({ error: "No journey found for this prospect" });\n'
    "      }\n"
    "      res.json(journey);\n"
    "    } catch (error) {\n"
    '      console.error("Update prospect stage error:", error);\n'
    '      res.status(500).json({ error: "Failed to update prospect stage" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FC2_LABEL = "Insert PATCH /api/admissions/prospects/:id/stage route"

FILE_C_OPS = [
    (_FC1_SEARCH, _FC1_REPLACE, _FC1_LABEL),
    (_FC2_SEARCH, _FC2_REPLACE, _FC2_LABEL),
]

# ════════════════════════════════════════════════════════════════
# MUTATION ENGINE
# ════════════════════════════════════════════════════════════════

def _apply_one(working: str, search: str, replace: str, label: str) -> str:
    pre_count = working.count(search)
    if pre_count == 0:
        abort(
            f"Mutation anchor not found: {label}\n\n"
            f"Expected exactly one occurrence of:\n"
            f"{search[:120].strip()}\n\n"
            "Repository state differs from Current Implementation Authority."
        )
    if pre_count > 1:
        abort(
            f"Ambiguous mutation anchor: {label}\n\n"
            f"Found {pre_count} occurrences (expected exactly 1) of:\n"
            f"{search[:120].strip()}\n\n"
            "Cannot safely apply bounded replacement."
        )
    result = working.replace(search, replace, 1)
    post_count = result.count(replace)
    if post_count != 1:
        abort(
            f"Post-replacement count error: {label}\n\n"
            f"count after apply: {post_count} (expected 1)"
        )
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
        _ok(f"    Op {i} applied and verified")
    _info(f"Writing {rel_path}")
    _write_and_verify(path, working)


# ════════════════════════════════════════════════════════════════
# STAGE 1 — Repository Anchor Verification
# ════════════════════════════════════════════════════════════════

def stage_1_repository(root: Path) -> None:
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        if (root / anchor).exists():
            _ok(f"Anchor present: {anchor}")
        else:
            abort(f"Repository anchor missing: {anchor}")
    _ok("All repository anchors confirmed")
    _step_results["Repository anchors"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 2 — Structural Anchor Verification
# ════════════════════════════════════════════════════════════════

def stage_2_structural(root: Path) -> tuple[str, str, str]:
    _head("STAGE 2 — Structural Anchor Verification")

    # ── File A (DAL) ──────────────────────────────────────────
    _info(f"Locating {FILE_DAL}")
    dal_path = root / FILE_DAL
    if not dal_path.exists():
        abort(f"File not found: {FILE_DAL}")
    dal_src = dal_path.read_text(encoding="utf-8")
    _ok(f"{FILE_DAL} located ({len(dal_src)} chars)")

    for marker, label in [
        ("async createProspect(",           "createProspect present"),
        ("async getFunnelByCode(",          "getFunnelByCode present"),
        ("async createProspectJourney(",    "createProspectJourney present"),
        ("async listProspects(",            "listProspects present (RMP-010E18)"),
        ("async getProspect(",              "getProspect present — insertion authority"),
        ("async getMemberByUserId(",        "getMemberByUserId present — corridor boundary"),
        (".schema('growth').from('prospect_journeys')", "growth.prospect_journeys present"),
    ]:
        _info(f"Verifying: {label}")
        if marker not in dal_src:
            abort(f"Structural anchor missing in supabase-dal.ts: {label}\n\nExpected: {marker}")
        _ok(f"Confirmed: {label}")

    # Corridor: only verify on clean path
    if IDEM_DAL_UPDATE not in dal_src:
        _info("Verifying insertion corridor: getProspect close → getMemberByUserId")
        if _FA_SEARCH not in dal_src:
            abort(
                "Insertion corridor missing in supabase-dal.ts.\n\n"
                "Expected: getProspect closing brace → getMemberByUserId.\n\n"
                "Cannot safely insert updateProspectJourneyStage."
            )
        _ok("Corridor confirmed: getProspect close → getMemberByUserId")
    else:
        _ok("Corridor check skipped — updateProspectJourneyStage already present (idempotent path)")

    # ── File B (service) ──────────────────────────────────────
    _info(f"Locating {FILE_SERVICE}")
    svc_path = root / FILE_SERVICE
    if not svc_path.exists():
        abort(f"File not found: {FILE_SERVICE}")
    svc_src = svc_path.read_text(encoding="utf-8")
    _ok(f"{FILE_SERVICE} located ({len(svc_src)} chars)")

    for marker, label in [
        ("submitProspectRegistration(",           "submitProspectRegistration present"),
        ("export async function listProspects(",  "listProspects present (RMP-010E18)"),
        ("export async function getProspect(",    "getProspect present — insertion authority"),
        ("from '../lib/supabase-dal'",            "supabase-dal import present"),
        ("resolveRegistrationFunnel",             "GP-ARCH-002 resolver preserved"),
    ]:
        _info(f"Verifying: {label}")
        if marker not in svc_src:
            abort(f"Structural anchor missing in admissions.ts: {label}\n\nExpected: {marker}")
        _ok(f"Confirmed: {label}")

    # Service insertion anchor: only verify on clean path
    if IDEM_SVC_UPDATE not in svc_src:
        _info("Verifying service insertion anchor (clean path)")
        if _FB_SEARCH not in svc_src:
            abort(
                "Service insertion anchor missing in admissions.ts.\n\n"
                "Expected: getProspect function body at end of file.\n\n"
                "Cannot safely append updateProspectStage."
            )
        _ok("Service insertion anchor confirmed")
    else:
        _ok("Service anchor check skipped — updateProspectStage already present (idempotent path)")

    # ── File C (routes) ───────────────────────────────────────
    _info(f"Locating {FILE_ROUTES}")
    rts_path = root / FILE_ROUTES
    if not rts_path.exists():
        abort(f"File not found: {FILE_ROUTES}")
    rts_src = rts_path.read_text(encoding="utf-8")
    _ok(f"{FILE_ROUTES} located ({len(rts_src)} chars)")

    for marker, label in [
        ('app.post("/api/admissions/prospects"',  "POST /api/admissions/prospects present"),
        ('app.get("/api/admissions/prospects"',   "GET /api/admissions/prospects present (RMP-010E18)"),
        ('app.get("/api/admissions/prospects/:id"',"GET /api/admissions/prospects/:id present (RMP-010E18)"),
        ('app.get("/api/countries"',              "countries GET — corridor boundary"),
        ('from "./services/admissions"',          "admissions import present"),
    ]:
        _info(f"Verifying: {label}")
        if marker not in rts_src:
            abort(f"Structural anchor missing in routes.ts: {label}\n\nExpected: {marker}")
        _ok(f"Confirmed: {label}")

    # Route corridor: only verify on clean path
    if IDEM_ROUTE_PATCH not in rts_src:
        _info("Verifying route corridor: GET /:id close → countries GET")
        if _FC2_SEARCH not in rts_src:
            abort(
                "Route insertion corridor missing in routes.ts.\n\n"
                "Expected: GET /:id close → app.get(\"/api/countries\").\n\n"
                "Cannot safely insert PATCH route."
            )
        _ok("Route corridor confirmed: GET /:id close → countries GET")
    else:
        _ok("Route corridor check skipped — PATCH route already present (idempotent path)")

    _step_results["Structural anchors"] = "PASS"
    return dal_src, svc_src, rts_src


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(dal_src: str, svc_src: str, rts_src: str) -> bool:
    """Returns True if Already Present, False if Clean. Aborts on Partial."""
    _head("STAGE 3 — Idempotency Verification")

    checks = {
        "updateProspectJourneyStage in DAL": IDEM_DAL_UPDATE in dal_src,
        "updateProspectStage in service":    IDEM_SVC_UPDATE in svc_src,
        "PATCH route in routes":             IDEM_ROUTE_PATCH in rts_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    all_present = all(checks.values())
    any_present = any(checks.values())

    if all_present:
        _ok("Lifecycle progression already applied — mutation not required")
        _step_results["Lifecycle progression"] = "PASS (Already Present)"
        return True

    if any_present:
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort(
            "Partial lifecycle progression detected.\n\n"
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
    _info("Three files — bounded string replacements — no overwrites")

    _head("  File A — server/lib/supabase-dal.ts")
    _mutate_file(root, FILE_DAL, FILE_A_OPS)

    _head("  File B — server/services/admissions.ts")
    _mutate_file(root, FILE_SERVICE, FILE_B_OPS)

    _head("  File C — server/routes.ts")
    _mutate_file(root, FILE_ROUTES, FILE_C_OPS)

    _step_results["Lifecycle progression"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    label = "STAGE 5 — Post-Verification (Idempotent Path)" if idempotent \
            else "STAGE 5 — Post-Mutation Verification"
    _head(label)

    dal_src = (root / FILE_DAL).read_text(encoding="utf-8")
    svc_src = (root / FILE_SERVICE).read_text(encoding="utf-8")
    rts_src = (root / FILE_ROUTES).read_text(encoding="utf-8")
    _ok(f"Re-read: dal({len(dal_src)}), service({len(svc_src)}), routes({len(rts_src)}) chars")

    # ── Exact-count checks ────────────────────────────────────
    count_checks: list[tuple[str, str, int, str]] = [
        (dal_src, "async updateProspectJourneyStage(",                1, "updateProspectJourneyStage in DAL"),
        (dal_src, "async createProspect(",                            1, "createProspect in DAL (no duplicate)"),
        (dal_src, "async listProspects(",                             1, "listProspects in DAL (no duplicate)"),
        (dal_src, "async getProspect(",                               1, "getProspect in DAL (no duplicate)"),
        (svc_src, "export async function updateProspectStage(",       1, "updateProspectStage in service"),
        (svc_src, "export async function submitProspectRegistration(", 1, "submitProspectRegistration preserved"),
        (svc_src, "export async function listProspects(",             1, "listProspects in service (no duplicate)"),
        (svc_src, "export async function getProspect(",               1, "getProspect in service (no duplicate)"),
        (rts_src, 'app.patch("/api/admissions/prospects/:id/stage"',  1, "PATCH route"),
        (rts_src, 'app.post("/api/admissions/prospects"',             1, "POST preserved (no duplicate)"),
        (rts_src, 'app.get("/api/admissions/prospects"',              1, "GET list preserved (no duplicate)"),
        (rts_src, 'app.get("/api/admissions/prospects/:id"',          1, "GET single preserved (no duplicate)"),
    ]
    for src, marker, expected, desc in count_checks:
        count = src.count(marker)
        if count == expected:
            _ok(f"Count [{desc}]: {count} (exactly {expected})")
        else:
            abort(
                f"Post-mutation count verification failed.\n\n"
                f"{desc}: count={count}, expected={expected}\n"
                f"Marker: {marker}"
            )

    # ── DAL method content ────────────────────────────────────
    _info("Verifying updateProspectJourneyStage content")
    for marker, desc in [
        (".schema('growth').from('prospect_journeys')",       "growth.prospect_journeys table"),
        (".update({ current_stage: stage })",                 "updates current_stage field"),
        (".eq('prospect_id', prospectId)",                    "filters by prospect_id"),
        (".select()\n      .maybeSingle();",                  "select().maybeSingle() — null if no journey"),
        ("if (error) throw new Error(`Failed to update prospect journey stage:", "error handling"),
        ("return data;",                                      "returns updated journey"),
    ]:
        if marker in dal_src:
            _ok(f"DAL method: {desc}")
        else:
            abort(f"DAL method missing: {desc}\nMarker: {marker}")

    # ── Service delegate ──────────────────────────────────────
    _info("Verifying updateProspectStage service delegate")
    for marker, desc in [
        ("supabaseDAL.updateProspectJourneyStage(id, stage)", "delegates to DAL with id + stage"),
    ]:
        if marker in svc_src:
            _ok(f"Service: {desc}")
        else:
            abort(f"Service missing: {desc}\nMarker: {marker}")

    # ── Route content ─────────────────────────────────────────
    _info("Verifying PATCH route content")
    for marker, desc in [
        ("current_stage",                           "validates current_stage in body"),
        ('return res.status(400).json',             "400 on missing current_stage"),
        ("await updateProspectStage(req.params.id", "calls updateProspectStage with id"),
        ('res.status(404).json',                    "404 when no journey found"),
        ("res.json(journey)",                       "200 with updated journey"),
        ("updateProspectStage",                     "import extended with updateProspectStage"),
    ]:
        if marker in rts_src:
            _ok(f"Route: {desc}")
        else:
            abort(f"Route missing: {desc}\nMarker: {marker}")

    # ── Preservation ──────────────────────────────────────────
    _info("Verifying locked content preserved")
    for src, marker, desc in [
        (dal_src, "async createProspect(",              "createProspect preserved"),
        (dal_src, "async getFunnelByCode(",             "getFunnelByCode preserved"),
        (dal_src, "async createProspectJourney(",       "createProspectJourney preserved"),
        (dal_src, "async listProspects(",               "listProspects preserved"),
        (dal_src, "async getProspect(",                 "getProspect preserved"),
        (svc_src, "submitProspectRegistration(",        "submitProspectRegistration preserved"),
        (svc_src, "resolveRegistrationFunnel",          "GP-ARCH-002 resolver preserved"),
        (svc_src, '"Prospect registration accepted for future persistence."',
                  "response contract preserved"),
        (rts_src, 'app.post("/api/admissions/prospects"', "POST route preserved"),
        (rts_src, 'app.get("/api/admissions/prospects"',  "GET list route preserved"),
        (rts_src, 'app.get("/api/admissions/prospects/:id"', "GET single route preserved"),
    ]:
        if marker in src:
            _ok(f"Preserved: {desc}")
        else:
            abort(f"Preserved content missing: {desc}")

    # ── Duplicate detection ───────────────────────────────────
    _info("Duplicate detection")
    for src, marker, desc in [
        (dal_src, "async updateProspectJourneyStage(",  "updateProspectJourneyStage once in DAL"),
        (svc_src, "export async function updateProspectStage(", "updateProspectStage once in service"),
        (rts_src, 'app.patch("/api/admissions/prospects/:id/stage"', "PATCH route once in routes"),
    ]:
        count = src.count(marker)
        if count == 1:
            _ok(f"No duplicate: {desc} (count={count})")
        else:
            abort(f"Duplicate detected: {desc} (count={count}, expected 1)")

    state = "PASS (Already Present)" if idempotent else "PASS"
    _step_results["Post-verification"] = state


# ════════════════════════════════════════════════════════════════
# STAGE 6 — Semantic Verification
# ════════════════════════════════════════════════════════════════

def stage_6_semantic(root: Path) -> None:
    _head("STAGE 6 — Semantic Verification")
    dal_src = (root / FILE_DAL).read_text(encoding="utf-8")
    rts_src = (root / FILE_ROUTES).read_text(encoding="utf-8")

    # Verify the new DAL method uses update (write) not select-only
    _info("Verifying updateProspectJourneyStage is a write operation")
    idx = dal_src.find("async updateProspectJourneyStage(")
    end = dal_src.find("async getMemberByUserId(", idx)
    if idx == -1 or end == -1:
        abort("Cannot locate updateProspectJourneyStage block for semantic verification.")
    method_src = dal_src[idx:end]
    if ".update(" not in method_src:
        abort("Semantic verification failed.\n\nupdateProspectJourneyStage does not call .update().")
    _ok("updateProspectJourneyStage confirmed as write operation (.update)")

    # Verify no read-only constraint violation: existing list/get unchanged
    for marker, desc in [
        ("async listProspects(",   "listProspects read method preserved"),
        ("async getProspect(",     "getProspect read method preserved"),
    ]:
        if marker in dal_src:
            _ok(f"Semantic: {desc}")
        else:
            abort(f"Semantic: {desc} — missing")

    # Verify route ordering: POST < GET-all < GET-one < PATCH < countries
    idx_post     = rts_src.find('app.post("/api/admissions/prospects"')
    idx_get_all  = rts_src.find('app.get("/api/admissions/prospects"')
    idx_get_one  = rts_src.find('app.get("/api/admissions/prospects/:id"')
    idx_patch    = rts_src.find('app.patch("/api/admissions/prospects/:id/stage"')
    idx_countries= rts_src.find('app.get("/api/countries"')

    if not (idx_post < idx_get_all < idx_get_one < idx_patch < idx_countries):
        abort(
            f"Route ordering violation.\n\n"
            f"POST({idx_post}) < GET-all({idx_get_all}) < GET-one({idx_get_one}) "
            f"< PATCH({idx_patch}) < countries({idx_countries}) required."
        )
    _ok(
        f"Route order: POST({idx_post}) < GET-all({idx_get_all}) < "
        f"GET-one({idx_get_one}) < PATCH({idx_patch}) < countries({idx_countries})"
    )

    _ok("Semantic verification complete")


# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

def print_summary() -> None:
    _head("MUTATION SUMMARY")
    max_len = max(len(k) for k in _step_results) if _step_results else 0
    for step, state in _step_results.items():
        colour = YELLOW if "Already Present" in state else GREEN
        display = state if "Already Present" in state else "PASS"
        print(f"  {step.ljust(max_len)}   {colour}{display}{RESET}")

    all_pass = all(s.startswith("PASS") for s in _step_results.values())
    print()
    if all_pass:
        print(f"{BOLD}{GREEN}══ RESULT: PASS ══{RESET}{RESET}")
        print()
        print("  Three authorized files in final state:")
        print(f"    MODIFY  {FILE_DAL}")
        print(f"    MODIFY  {FILE_SERVICE}")
        print(f"    MODIFY  {FILE_ROUTES}")
        print()
        print("  Build and runtime verification:")
        print("    npm run build")
        print("    npm run dev")
        print()
        print("    PATCH /api/admissions/prospects/:id/stage")
        print("    Body: { current_stage: \"<new_stage>\" }")
        print("      → HTTP 200, updated journey object")
        print("      → HTTP 400 if current_stage missing")
        print("      → HTTP 404 if no journey exists for prospect")
        print()
        print("    All existing routes unchanged:")
        print("      POST   /api/admissions/prospects")
        print("      GET    /api/admissions/prospects")
        print("      GET    /api/admissions/prospects/:id")
        print()
        print("    Second execution: PASS (Already Present)")
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
        "  python RMP-010E20_prospect_lifecycle_progression.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E20 — Prospect Lifecycle Progression{RESET}")
    print(f"{BOLD}CIP-010E20{RESET}\n")

    root = resolve_root()
    _info(f"Repository root: {root}")
    _info(f"Authorized mutation scope:")
    _info(f"  MODIFY  {FILE_DAL}")
    _info(f"  MODIFY  {FILE_SERVICE}")
    _info(f"  MODIFY  {FILE_ROUTES}")

    stage_1_repository(root)
    dal_src, svc_src, rts_src = stage_2_structural(root)
    already_present = stage_3_idempotency(dal_src, svc_src, rts_src)

    if already_present:
        stage_5_post_verify(root, idempotent=True)
        stage_6_semantic(root)
    else:
        stage_4_mutate(root)
        stage_5_post_verify(root, idempotent=False)
        stage_6_semantic(root)

    print_summary()


if __name__ == "__main__":
    main()
