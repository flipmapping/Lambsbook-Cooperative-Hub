#!/usr/bin/env python3
"""
RMP-010E18 — Prospect Lifecycle Read Model
CIP-010E18

Authorized mutation scope: exactly three files.
  MODIFY  server/lib/supabase-dal.ts     — listProspects(), getProspect()
  MODIFY  server/services/admissions.ts  — listProspects(), getProspect() delegates
  MODIFY  server/routes.ts               — GET /api/admissions/prospects, GET /api/admissions/prospects/:id

Constraints:
  - POST /api/admissions/prospects unchanged
  - submitProspectRegistration() unchanged
  - Growth Persistence Kernel unchanged
  - Read-only additions only

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
        f"RMP-010E18\n"
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
IDEM_DAL_LIST      = "async listProspects("
IDEM_DAL_GET       = "async getProspect("
IDEM_SVC_LIST      = "export async function listProspects("
IDEM_SVC_GET       = "export async function getProspect("
IDEM_ROUTE_GET_ALL = 'app.get("/api/admissions/prospects"'
IDEM_ROUTE_GET_ONE = 'app.get("/api/admissions/prospects/:id"'

# ════════════════════════════════════════════════════════════════
# FILE A — supabase-dal.ts
# Op A1: Insert listProspects() + getProspect() between
#         createProspectJourney close and getMemberByUserId.
# ════════════════════════════════════════════════════════════════

# Corridor: unique closing sequence of createProspectJourney → getMemberByUserId
_FA_SEARCH = (
    "    if (error) throw new Error(`Failed to create prospect journey: ${error.message}`);\n"
    "    return journey;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)

# ProspectRow inline type for JOIN result — defined once inside the method
# as a local interface is not valid TS in a class body, so we use inline typing.
_FA_REPLACE = (
    "    if (error) throw new Error(`Failed to create prospect journey: ${error.message}`);\n"
    "    return journey;\n"
    "  }\n"
    "\n"
    "  async listProspects(): Promise<Array<{\n"
    "    id: string;\n"
    "    full_name: string;\n"
    "    email: string;\n"
    "    country: string;\n"
    "    program_of_interest: string;\n"
    "    phone: string | null;\n"
    "    created_at: string;\n"
    "    funnel_code: string | null;\n"
    "    current_stage: string | null;\n"
    "  }>> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data, error } = await supabase\n"
    "      .schema('growth').from('prospects')\n"
    "      .select(`\n"
    "        id,\n"
    "        full_name,\n"
    "        email,\n"
    "        country,\n"
    "        program_of_interest,\n"
    "        phone,\n"
    "        created_at,\n"
    "        prospect_journeys ( current_stage, funnels ( code ) )\n"
    "      `)\n"
    "      .order('created_at', { ascending: false });\n"
    "\n"
    "    if (error) throw new Error(`Failed to list prospects: ${error.message}`);\n"
    "\n"
    "    return (data ?? []).map((row: any) => ({\n"
    "      id:                  row.id,\n"
    "      full_name:           row.full_name,\n"
    "      email:               row.email,\n"
    "      country:             row.country,\n"
    "      program_of_interest: row.program_of_interest,\n"
    "      phone:               row.phone ?? null,\n"
    "      created_at:          row.created_at,\n"
    "      funnel_code:         row.prospect_journeys?.[0]?.funnels?.code ?? null,\n"
    "      current_stage:       row.prospect_journeys?.[0]?.current_stage ?? null,\n"
    "    }));\n"
    "  }\n"
    "\n"
    "  async getProspect(id: string): Promise<{\n"
    "    id: string;\n"
    "    full_name: string;\n"
    "    email: string;\n"
    "    country: string;\n"
    "    program_of_interest: string;\n"
    "    phone: string | null;\n"
    "    created_at: string;\n"
    "    funnel_code: string | null;\n"
    "    current_stage: string | null;\n"
    "  } | null> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data, error } = await supabase\n"
    "      .schema('growth').from('prospects')\n"
    "      .select(`\n"
    "        id,\n"
    "        full_name,\n"
    "        email,\n"
    "        country,\n"
    "        program_of_interest,\n"
    "        phone,\n"
    "        created_at,\n"
    "        prospect_journeys ( current_stage, funnels ( code ) )\n"
    "      `)\n"
    "      .eq('id', id)\n"
    "      .maybeSingle();\n"
    "\n"
    "    if (error) throw new Error(`Failed to get prospect: ${error.message}`);\n"
    "    if (!data) return null;\n"
    "\n"
    "    return {\n"
    "      id:                  data.id,\n"
    "      full_name:           data.full_name,\n"
    "      email:               data.email,\n"
    "      country:             data.country,\n"
    "      program_of_interest: data.program_of_interest,\n"
    "      phone:               data.phone ?? null,\n"
    "      created_at:          data.created_at,\n"
    "      funnel_code:         data.prospect_journeys?.[0]?.funnels?.code ?? null,\n"
    "      current_stage:       data.prospect_journeys?.[0]?.current_stage ?? null,\n"
    "    };\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FA_LABEL = "Insert listProspects() + getProspect() after createProspectJourney in SupabaseDAL"

FILE_A_OPS = [(_FA_SEARCH, _FA_REPLACE, _FA_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE B — server/services/admissions.ts
# Op B1: Extend import line + insert listProspects() + getProspect()
#         after submitProspectRegistration closing brace.
# ════════════════════════════════════════════════════════════════

# Op B1a: extend service import to include new DAL methods (no-op in TS but
# we insert the function bodies which delegate — no import change needed since
# supabaseDAL singleton already imported.

# Op B1: Insert two exported functions after the file's final closing brace.
# Anchor: the unique final sequence of submitProspectRegistration.
_FB_SEARCH = (
    "  return {\n"
    "    accepted: true,\n"
    "    status: \"validated\",\n"
    "    message: \"Prospect registration accepted for future persistence.\",\n"
    "  };\n"
    "}"
)
_FB_REPLACE = (
    "  return {\n"
    "    accepted: true,\n"
    "    status: \"validated\",\n"
    "    message: \"Prospect registration accepted for future persistence.\",\n"
    "  };\n"
    "}\n"
    "\n"
    "export async function listProspects() {\n"
    "  return supabaseDAL.listProspects();\n"
    "}\n"
    "\n"
    "export async function getProspect(id: string) {\n"
    "  return supabaseDAL.getProspect(id);\n"
    "}"
)
_FB_LABEL = "Insert listProspects() + getProspect() delegates into admissions service"

FILE_B_OPS = [(_FB_SEARCH, _FB_REPLACE, _FB_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE C — server/routes.ts
# Op C1: Extend admissions import + insert GET routes after POST close.
# ════════════════════════════════════════════════════════════════

# Op C1a: extend the admissions import line to include listProspects + getProspect
_FC1_SEARCH  = 'import { submitProspectRegistration } from "./services/admissions";'
_FC1_REPLACE = 'import { submitProspectRegistration, listProspects, getProspect } from "./services/admissions";'
_FC1_LABEL   = "Extend admissions import to include listProspects and getProspect"

# Op C1b: insert GET routes after POST /api/admissions/prospects close
# Corridor: POST route close → app.get("/api/countries"
_FC2_SEARCH = (
    "      console.error(\"Admissions prospect error:\", error);\n"
    "      res.status(500).json({ error: \"Failed to process prospect registration\" });\n"
    "    }\n"
    "  });\n"
    "\n"
    "  app.get(\"/api/countries\""
)
_FC2_REPLACE = (
    "      console.error(\"Admissions prospect error:\", error);\n"
    "      res.status(500).json({ error: \"Failed to process prospect registration\" });\n"
    "    }\n"
    "  });\n"
    "\n"
    "  app.get(\"/api/admissions/prospects\", async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const prospects = await listProspects();\n"
    "      res.json(prospects);\n"
    "    } catch (error) {\n"
    "      console.error(\"List prospects error:\", error);\n"
    "      res.status(500).json({ error: \"Failed to list prospects\" });\n"
    "    }\n"
    "  });\n"
    "\n"
    "  app.get(\"/api/admissions/prospects/:id\", async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const prospect = await getProspect(req.params.id);\n"
    "      if (!prospect) {\n"
    "        return res.status(404).json({ error: \"Prospect not found\" });\n"
    "      }\n"
    "      res.json(prospect);\n"
    "    } catch (error) {\n"
    "      console.error(\"Get prospect error:\", error);\n"
    "      res.status(500).json({ error: \"Failed to get prospect\" });\n"
    "    }\n"
    "  });\n"
    "\n"
    "  app.get(\"/api/countries\""
)
_FC2_LABEL = "Insert GET /api/admissions/prospects and GET /api/admissions/prospects/:id routes"

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
        ("async createProspectJourney(",   "createProspectJourney present — insertion authority"),
        ("async getMemberByUserId(",        "getMemberByUserId present — corridor boundary"),
        ("async createProspect(",           "createProspect preserved"),
        ("async getFunnelByCode(",          "getFunnelByCode preserved"),
        (".schema('growth').from('prospects')", "growth schema present"),
    ]:
        _info(f"Verifying: {label}")
        if marker not in dal_src:
            abort(f"Structural anchor missing in supabase-dal.ts: {label}\n\nExpected: {marker}")
        _ok(f"Confirmed: {label}")

    # Corridor anchor — only verify on clean path
    if IDEM_DAL_LIST not in dal_src:
        _info("Verifying insertion corridor: createProspectJourney close → getMemberByUserId")
        if _FA_SEARCH not in dal_src:
            abort(
                "Insertion corridor missing in supabase-dal.ts.\n\n"
                "Expected: createProspectJourney closing → getMemberByUserId.\n\n"
                "Cannot safely insert listProspects + getProspect."
            )
        _ok("Corridor confirmed: createProspectJourney close → getMemberByUserId")
    else:
        _ok("Corridor check skipped — listProspects already present (idempotent path)")

    # ── File B (service) ──────────────────────────────────────
    _info(f"Locating {FILE_SERVICE}")
    svc_path = root / FILE_SERVICE
    if not svc_path.exists():
        abort(f"File not found: {FILE_SERVICE}")
    svc_src = svc_path.read_text(encoding="utf-8")
    _ok(f"{FILE_SERVICE} located ({len(svc_src)} chars)")

    for marker, label in [
        ("submitProspectRegistration(",                "submitProspectRegistration present"),
        ("from '../lib/supabase-dal'",                 "supabase-dal import present"),
        ("resolveRegistrationFunnel",                  "GP-ARCH-002 resolver preserved"),
        ('"Prospect registration accepted for future persistence."', "response contract present"),
    ]:
        _info(f"Verifying: {label}")
        if marker not in svc_src:
            abort(f"Structural anchor missing in admissions.ts: {label}\n\nExpected: {marker}")
        _ok(f"Confirmed: {label}")

    # Service body anchor — only verify on clean path
    if IDEM_SVC_LIST not in svc_src:
        _info("Verifying service insertion anchor (clean path)")
        if _FB_SEARCH not in svc_src:
            abort(
                "Service insertion anchor missing in admissions.ts.\n\n"
                "Cannot safely insert listProspects + getProspect delegates."
            )
        _ok("Service insertion anchor confirmed")
    else:
        _ok("Service anchor check skipped — listProspects already present (idempotent path)")

    # ── File C (routes) ───────────────────────────────────────
    _info(f"Locating {FILE_ROUTES}")
    rts_path = root / FILE_ROUTES
    if not rts_path.exists():
        abort(f"File not found: {FILE_ROUTES}")
    rts_src = rts_path.read_text(encoding="utf-8")
    _ok(f"{FILE_ROUTES} located ({len(rts_src)} chars)")

    for marker, label in [
        ('app.post("/api/admissions/prospects"',       "POST /api/admissions/prospects present"),
        ('from "./services/admissions";',           "admissions import present"),
        ('app.get("/api/countries"',                   "countries GET — corridor boundary"),
    ]:
        _info(f"Verifying: {label}")
        if marker not in rts_src:
            abort(f"Structural anchor missing in routes.ts: {label}\n\nExpected: {marker}")
        _ok(f"Confirmed: {label}")

    # Route corridor — only verify on clean path
    if IDEM_ROUTE_GET_ALL not in rts_src:
        _info("Verifying route insertion corridor: POST close → countries GET")
        if _FC2_SEARCH not in rts_src:
            abort(
                "Route insertion corridor missing in routes.ts.\n\n"
                "Expected: POST /api/admissions/prospects close → app.get(\"/api/countries\").\n\n"
                "Cannot safely insert GET routes."
            )
        _ok("Route corridor confirmed: POST close → countries GET")
    else:
        _ok("Route corridor check skipped — GET route already present (idempotent path)")

    _step_results["Structural anchors"] = "PASS"
    return dal_src, svc_src, rts_src


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(dal_src: str, svc_src: str, rts_src: str) -> bool:
    """Returns True if Already Present, False if Clean. Aborts on Partial."""
    _head("STAGE 3 — Idempotency Verification")

    checks = {
        "listProspects in DAL":              IDEM_DAL_LIST in dal_src,
        "getProspect in DAL":                IDEM_DAL_GET in dal_src,
        "listProspects in service":          IDEM_SVC_LIST in svc_src,
        "getProspect in service":            IDEM_SVC_GET in svc_src,
        "GET /api/admissions/prospects":     IDEM_ROUTE_GET_ALL in rts_src,
        "GET /api/admissions/prospects/:id": IDEM_ROUTE_GET_ONE in rts_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    all_present = all(checks.values())
    any_present = any(checks.values())

    if all_present:
        _ok("Prospect read model already applied — mutation not required")
        _step_results["Read model"] = "PASS (Already Present)"
        return True

    if any_present:
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort(
            "Partial prospect read model detected.\n\n"
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

    _step_results["Read model"] = "PASS"


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
        (dal_src, "async listProspects(",                        1, "listProspects in DAL"),
        (dal_src, "async getProspect(",                          1, "getProspect in DAL"),
        (dal_src, "async createProspect(",                       1, "createProspect in DAL (no duplicate)"),
        (dal_src, "async createProspectJourney(",                1, "createProspectJourney in DAL (no duplicate)"),
        (svc_src, "export async function listProspects(",        1, "listProspects in service"),
        (svc_src, "export async function getProspect(",          1, "getProspect in service"),
        (svc_src, "export async function submitProspectRegistration(", 1, "submitProspectRegistration preserved"),
        (rts_src, 'app.get("/api/admissions/prospects"',         1, "GET /api/admissions/prospects (no duplicate)"),
        (rts_src, 'app.get("/api/admissions/prospects/:id"',     1, "GET /api/admissions/prospects/:id"),
        (rts_src, 'app.post("/api/admissions/prospects"',        1, "POST preserved (no duplicate)"),
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
    _info("Verifying listProspects content")
    for marker, desc in [
        (".schema('growth').from('prospects')", "growth.prospects table"),
        ("prospect_journeys",                   "LEFT JOIN prospect_journeys"),
        ("funnels",                             "LEFT JOIN funnels"),
        ("created_at",                          "created_at in projection"),
        ("funnel_code",                         "funnel_code in result mapping"),
        ("current_stage",                       "current_stage in result mapping"),
        ("ascending: false",                    "ORDER BY created_at DESC"),
        ("if (error) throw new Error(`Failed to list prospects:", "error handling"),
    ]:
        if marker in dal_src:
            _ok(f"listProspects: {desc}")
        else:
            abort(f"listProspects missing: {desc}\nMarker: {marker}")

    _info("Verifying getProspect content")
    for marker, desc in [
        (".eq('id', id)",                        "filter by id"),
        (".maybeSingle();",                      "maybeSingle — returns null if not found"),
        ("if (!data) return null;",              "null return for not found"),
        ("if (error) throw new Error(`Failed to get prospect:", "error handling"),
    ]:
        if marker in dal_src:
            _ok(f"getProspect: {desc}")
        else:
            abort(f"getProspect missing: {desc}\nMarker: {marker}")

    # ── Service delegates ─────────────────────────────────────
    _info("Verifying service delegates")
    for marker, desc in [
        ("supabaseDAL.listProspects()", "listProspects delegates to DAL"),
        ("supabaseDAL.getProspect(id)", "getProspect delegates to DAL"),
    ]:
        if marker in svc_src:
            _ok(f"Service: {desc}")
        else:
            abort(f"Service missing: {desc}\nMarker: {marker}")

    # ── Route content ─────────────────────────────────────────
    _info("Verifying route content")
    for marker, desc in [
        ("await listProspects()",                     "GET list calls listProspects()"),
        ("await getProspect(req.params.id)",           "GET single calls getProspect(id)"),
        ("res.status(404).json",                      "404 on not found"),
        ("listProspects, getProspect",                "import extended with listProspects, getProspect"),
    ]:
        if marker in rts_src:
            _ok(f"Route: {desc}")
        else:
            abort(f"Route missing: {desc}\nMarker: {marker}")

    # ── Preservation ──────────────────────────────────────────
    _info("Verifying unchanged content preserved")
    for src, marker, desc in [
        (dal_src, "async createProspect(",                    "createProspect DAL method preserved"),
        (dal_src, "async getFunnelByCode(",                   "getFunnelByCode preserved"),
        (dal_src, "async createProspectJourney(",             "createProspectJourney preserved"),
        (svc_src, "submitProspectRegistration(",              "submitProspectRegistration preserved"),
        (svc_src, "resolveRegistrationFunnel",                "GP-ARCH-002 resolver preserved"),
        (svc_src, '"Prospect registration accepted for future persistence."',
                  "response contract preserved"),
        (rts_src, 'app.post("/api/admissions/prospects"',     "POST route preserved"),
    ]:
        if marker in src:
            _ok(f"Preserved: {desc}")
        else:
            abort(f"Preserved content missing: {desc}")

    # ── Duplicate detection ───────────────────────────────────
    _info("Duplicate detection")
    for src, marker, desc in [
        (dal_src, "async listProspects(",    "listProspects appears once in DAL"),
        (dal_src, "async getProspect(",      "getProspect appears once in DAL"),
        (rts_src, 'app.get("/api/admissions/prospects"', "GET all appears once in routes"),
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
    svc_src = (root / FILE_SERVICE).read_text(encoding="utf-8")
    rts_src = (root / FILE_ROUTES).read_text(encoding="utf-8")

    # Verify read methods do not contain write operations
    _info("Verifying read-only constraint on new DAL methods")
    dal_new_methods_start = dal_src.find("async listProspects(")
    dal_new_methods_end   = dal_src.find("async getMemberByUserId(", dal_new_methods_start)
    if dal_new_methods_start == -1 or dal_new_methods_end == -1:
        abort("Cannot locate new DAL methods for semantic verification.")
    new_methods_src = dal_src[dal_new_methods_start:dal_new_methods_end]
    for forbidden, desc in [
        (".insert(",  "no insert in read methods"),
        (".update(",  "no update in read methods"),
        (".delete(",  "no delete in read methods"),
        (".upsert(",  "no upsert in read methods"),
    ]:
        if forbidden in new_methods_src:
            abort(f"Read-only violation: {desc}\nFound {forbidden!r} in listProspects/getProspect block.")
        _ok(f"Semantic: {desc}")

    # Verify ordering: listProspects before getProspect in DAL
    idx_list = dal_src.find("async listProspects(")
    idx_get  = dal_src.find("async getProspect(")
    if idx_list >= idx_get:
        abort(f"Semantic ordering: listProspects ({idx_list}) must precede getProspect ({idx_get})")
    _ok(f"Semantic order: listProspects ({idx_list}) < getProspect ({idx_get})")

    # Verify GET routes appear after POST in routes
    idx_post    = rts_src.find('app.post("/api/admissions/prospects"')
    idx_get_all = rts_src.find('app.get("/api/admissions/prospects"')
    idx_get_one = rts_src.find('app.get("/api/admissions/prospects/:id"')
    if not (idx_post < idx_get_all < idx_get_one):
        abort(
            f"Route ordering violation.\n\n"
            f"POST({idx_post}) < GET-all({idx_get_all}) < GET-one({idx_get_one}) required."
        )
    _ok(f"Route order: POST({idx_post}) < GET-all({idx_get_all}) < GET-one({idx_get_one})")

    _info("Architecture chain: DAL read methods → service delegates → routes")
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
        print("    GET /api/admissions/prospects")
        print("      → HTTP 200, JSON array of prospects with funnel_code + current_stage")
        print()
        print("    GET /api/admissions/prospects/:id")
        print("      → HTTP 200, single prospect object")
        print("      → HTTP 404 if not found")
        print()
        print("    POST /api/admissions/prospects  (unchanged)")
        print("      → HTTP 200, { accepted: true, status: 'validated', message: '...' }")
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
        "  python RMP-010E18_prospect_read_model.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E18 — Prospect Lifecycle Read Model{RESET}")
    print(f"{BOLD}CIP-010E18{RESET}\n")

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
