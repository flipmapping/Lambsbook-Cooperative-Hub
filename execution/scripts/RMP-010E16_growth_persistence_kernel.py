#!/usr/bin/env python3
"""
RMP-010E16 — Growth Persistence Kernel
CIP-010E16 Revision 3

Authorized mutation scope: exactly three files.
  MODIFY  server/lib/supabase-types.ts   — Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert
  MODIFY  server/lib/supabase-dal.ts     — schema meh→growth, getFunnelByCode, createProspectJourney
  MODIFY  server/services/admissions.ts  — full journey orchestration, preserved API contract

Migration: meh.prospects → growth.prospects + growth.prospect_journeys
API response contract: byte-identical to RMP-010E11/E13.
Column names: active (not is_active), current_stage (not stage). GP-ARCH-002.
Funnel resolution: DEFAULT_FUNNEL_CODE + resolveRegistrationFunnel() seam.

Quality gate: EXEC-STD-001 + EXEC-STD-002 + EXEC-STD-002A
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

# ── Fail-fast abort ────────────────────────────────────────────
def abort(reason: str) -> None:
    banner = (
        f"\n{'=' * 42}\n"
        f"RMP-010E16\n"
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

FILE_TYPES   = Path("server/lib/supabase-types.ts")
FILE_DAL     = Path("server/lib/supabase-dal.ts")
FILE_SERVICE = Path("server/services/admissions.ts")

DEFAULT_FUNNEL_CODE = "CTBC-2026"

# ── Idempotency markers ────────────────────────────────────────
IDEM_TYPES_FUNNEL           = "export interface Funnel {"
IDEM_TYPES_PROSPECT_JOURNEY = "export interface ProspectJourney {"
IDEM_DAL_GROWTH_SCHEMA      = ".schema('growth').from('prospects')"
IDEM_DAL_GET_FUNNEL         = "async getFunnelByCode("
IDEM_DAL_CREATE_JOURNEY     = "async createProspectJourney("
IDEM_SERVICE_RESOLVER       = "getFunnelByCode(resolveRegistrationFunnel())"
IDEM_SERVICE_GET_FUNNEL     = "await supabaseDAL.getFunnelByCode("
IDEM_SERVICE_CREATE_JOURNEY = "await supabaseDAL.createProspectJourney("

# ════════════════════════════════════════════════════════════════
# FILE A — STRUCTURAL INSERTION CONSTANTS
# Insert four Growth interfaces immediately after the closing brace
# of ProspectInsert, located by brace-depth walking.
# ════════════════════════════════════════════════════════════════

# Declaration anchor: the opening of the ProspectInsert interface.
_FA1_INTERFACE_OPEN = "export interface ProspectInsert {"

# Content inserted immediately after ProspectInsert's matching closing brace.
_FA1_INSERT = (
    "\n"
    "\n"
    "export interface Funnel {\n"
    "  id: string;\n"
    "  code: string;\n"
    "  name: string;\n"
    "  active: boolean;\n"
    "  created_at: string;\n"
    "}\n"
    "\n"
    "export interface FunnelInsert {\n"
    "  code: string;\n"
    "  name: string;\n"
    "  active?: boolean;\n"
    "}\n"
    "\n"
    "export interface ProspectJourney {\n"
    "  id: string;\n"
    "  prospect_id: string;\n"
    "  funnel_id: string;\n"
    "  current_stage: string;\n"
    "  created_at: string;\n"
    "}\n"
    "\n"
    "export interface ProspectJourneyInsert {\n"
    "  prospect_id: string;\n"
    "  funnel_id: string;\n"
    "  current_stage?: string;\n"
    "}"
)

_FA1_LABEL = "Append Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert to supabase-types.ts"

# ════════════════════════════════════════════════════════════════
# FILE B — BOUNDED REPLACEMENT CONSTANTS
# ════════════════════════════════════════════════════════════════

# Op 1: Extend import block with Growth types
_FB1_SEARCH = (
    "  Prospect, ProspectInsert,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_REPLACE = (
    "  Prospect, ProspectInsert,\n"
    "  Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_LABEL = "Add Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert to DAL imports"

# Op 2: Migrate schema meh → growth in createProspect
_FB2_SEARCH  = ".schema('meh').from('prospects')"
_FB2_REPLACE = ".schema('growth').from('prospects')"
_FB2_LABEL   = "Migrate createProspect from schema meh to schema growth"

# Op 3: Insert getFunnelByCode + createProspectJourney after createProspect close
# Corridor: createProspect close → getMemberByUserId (verified unique)
_FB3_SEARCH = (
    "    if (error) throw new Error(`Failed to create prospect: ${error.message}`);\n"
    "    return prospect;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB3_REPLACE = (
    "    if (error) throw new Error(`Failed to create prospect: ${error.message}`);\n"
    "    return prospect;\n"
    "  }\n"
    "\n"
    "  async getFunnelByCode(code: string): Promise<Funnel | null> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data, error } = await supabase\n"
    "      .schema('growth').from('funnels')\n"
    "      .select('*')\n"
    "      .eq('code', code)\n"
    "      .eq('active', true)\n"
    "      .maybeSingle();\n"
    "\n"
    "    if (error) throw new Error(`Failed to get funnel: ${error.message}`);\n"
    "    return data;\n"
    "  }\n"
    "\n"
    "  async createProspectJourney(data: ProspectJourneyInsert): Promise<ProspectJourney> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data: journey, error } = await supabase\n"
    "      .schema('growth').from('prospect_journeys')\n"
    "      .insert({\n"
    "        prospect_id: data.prospect_id,\n"
    "        funnel_id:   data.funnel_id,\n"
    "        current_stage: data.current_stage ?? 'registered',\n"
    "      })\n"
    "      .select()\n"
    "      .single();\n"
    "\n"
    "    if (error) throw new Error(`Failed to create prospect journey: ${error.message}`);\n"
    "    return journey;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB3_LABEL = "Insert getFunnelByCode + createProspectJourney after createProspect in SupabaseDAL"

FILE_B_OPS = [
    (_FB1_SEARCH, _FB1_REPLACE, _FB1_LABEL),
    (_FB2_SEARCH, _FB2_REPLACE, _FB2_LABEL),
    (_FB3_SEARCH, _FB3_REPLACE, _FB3_LABEL),
]

# ════════════════════════════════════════════════════════════════
# FILE C — BOUNDED REPLACEMENT CONSTANTS
# ════════════════════════════════════════════════════════════════

# Op 0: Insert DEFAULT_FUNNEL_CODE + resolver seam before function (GP-ARCH-002)
_FC0_SEARCH  = "export async function submitProspectRegistration("
_FC0_REPLACE = (
    "const DEFAULT_FUNNEL_CODE = \"CTBC-2026\";\n"
    "\n"
    "function resolveRegistrationFunnel(): string {\n"
    "  return DEFAULT_FUNNEL_CODE;\n"
    "}\n"
    "\n"
    "export async function submitProspectRegistration("
)
_FC0_LABEL = "Insert DEFAULT_FUNNEL_CODE + resolveRegistrationFunnel seam before function"

# Op 1: Replace sync body with full journey orchestration
_FC1_SEARCH = (
    "  await supabaseDAL.createProspect({\n"
    "    full_name:            payload.fullName,\n"
    "    email:                payload.email,\n"
    "    country:              payload.country,\n"
    "    program_of_interest:  payload.programOfInterest,\n"
    "    phone:                payload.phone ?? null,\n"
    "  });\n"
    "\n"
    "  return {\n"
    "    accepted: true,\n"
    "    status: \"validated\",\n"
    "    message: \"Prospect registration accepted for future persistence.\",\n"
    "  };"
)
_FC1_REPLACE = (
    "  const prospect = await supabaseDAL.createProspect({\n"
    "    full_name:            payload.fullName,\n"
    "    email:                payload.email,\n"
    "    country:              payload.country,\n"
    "    program_of_interest:  payload.programOfInterest,\n"
    "    phone:                payload.phone ?? null,\n"
    "  });\n"
    "\n"
    "  const funnel = await supabaseDAL.getFunnelByCode(resolveRegistrationFunnel());\n"
    "\n"
    "  if (funnel) {\n"
    "    await supabaseDAL.createProspectJourney({\n"
    "      prospect_id: prospect.id,\n"
    "      funnel_id:   funnel.id,\n"
    "      current_stage: 'registered',\n"
    "    });\n"
    "  }\n"
    "\n"
    "  return {\n"
    "    accepted: true,\n"
    "    status: \"validated\",\n"
    "    message: \"Prospect registration accepted for future persistence.\",\n"
    "  };"
)
_FC1_LABEL = "Replace admissions service body with growth journey orchestration"

FILE_C_OPS = [
    (_FC0_SEARCH, _FC0_REPLACE, _FC0_LABEL),
    (_FC1_SEARCH, _FC1_REPLACE, _FC1_LABEL),
]

# ════════════════════════════════════════════════════════════════
# MUTATION ENGINE — module-scope helpers only, no nesting
# ════════════════════════════════════════════════════════════════

def _apply_one(working: str, search: str, replace: str, label: str) -> str:
    """Apply one bounded replacement. Aborts on zero or multiple matches."""
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
            f"Replacement text count after apply: {post_count} (expected 1)\n\n"
            "Mutation produced unexpected output."
        )
    return result


def _write_and_verify(path: Path, content: str) -> None:
    """Write content to path and verify round-trip integrity."""
    path.write_text(content, encoding="utf-8")
    on_disk = path.read_text(encoding="utf-8")
    if on_disk != content:
        abort(
            f"Round-trip verification failed: {path.name}\n\n"
            "File on disk differs from expected working copy."
        )
    _ok(f"Round-trip verified ({len(on_disk)} chars on disk)")


def _mutate_file(root: Path, rel_path: Path, ops: list[tuple[str, str, str]]) -> None:
    """Apply a list of bounded replacements to a file, then write and verify."""
    path = root / rel_path
    _info(f"Reading {rel_path}")
    working = path.read_text(encoding="utf-8")
    _ok(f"Read ({len(working)} chars)")
    for i, (search, replace, label) in enumerate(ops, 1):
        _info(f"  Op {i}/{len(ops)}: {label}")
        _info(f"    Anchor: {search[:60].strip()!r}...")
        working = _apply_one(working, search, replace, label)
        _ok(f"    Op {i} applied and verified (exactly 1 occurrence)")
    _info(f"Writing {rel_path}")
    _write_and_verify(path, working)


def _find_interface_closing_brace(source: str, open_pos: int) -> int:
    """
    Given the position of the opening '{' of a TypeScript interface declaration,
    walk the source character by character tracking brace depth and return the
    position of the matching closing '}'. Aborts if the closing brace is not found.
    """
    depth = 0
    i = open_pos
    while i < len(source):
        ch = source[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    abort(
        f"Brace-depth walk failed: no matching closing brace found.\n\n"
        f"Started at position {open_pos} in {FILE_TYPES}.\n\n"
        "File structure differs from Current Implementation Authority."
    )
    return -1  # unreachable; satisfies type checker


def _apply_file_a_structural_insert(root: Path) -> None:
    """
    File A structural insertion — brace-depth walk algorithm.

    Algorithm:
      1. Read server/lib/supabase-types.ts.
      2. Verify 'export interface ProspectInsert {' appears exactly once.
      3. Check whether 'export interface Funnel {' already exists.
         If yes: report PASS (Already Present) and return without writing.
      4. Locate the opening '{' of ProspectInsert.
      5. Walk source character by character, tracking brace depth.
      6. Locate the matching closing '}' of ProspectInsert.
      7. Insert _FA1_INSERT immediately after that closing brace.
      8. Write file.
      9. Reload file.
      10. Verify exactly one occurrence each of:
          ProspectInsert, Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert.
      11. Verify they appear in that exact order.
      12. Abort on any verification failure.
    """
    path = root / FILE_TYPES
    _info(f"Reading {FILE_TYPES}")
    source = path.read_text(encoding="utf-8")
    _ok(f"Read ({len(source)} chars)")

    _info(f"  Op 1/1: {_FA1_LABEL}")

    # Step 2: verify ProspectInsert appears exactly once
    pi_count = source.count(_FA1_INTERFACE_OPEN)
    if pi_count == 0:
        abort(
            f"Structural insertion anchor not found: {_FA1_LABEL}\n\n"
            f"Expected exactly one occurrence of:\n"
            f"{_FA1_INTERFACE_OPEN}\n\n"
            "Repository state differs from Current Implementation Authority."
        )
    if pi_count > 1:
        abort(
            f"Ambiguous structural insertion anchor: {_FA1_LABEL}\n\n"
            f"Found {pi_count} occurrences (expected exactly 1) of:\n"
            f"{_FA1_INTERFACE_OPEN}\n\n"
            "Cannot safely determine insertion point."
        )
    _ok(f"    Anchor confirmed: '{_FA1_INTERFACE_OPEN}' (exactly 1 occurrence)")

    # Step 3: idempotency — if Funnel already exists, skip
    if IDEM_TYPES_FUNNEL in source:
        _ok("    Funnel interface already present — skipping File A (idempotent)")
        return

    # Step 4: locate the opening brace of ProspectInsert
    # _FA1_INTERFACE_OPEN ends with '{', so find its position in the source
    open_decl_pos = source.index(_FA1_INTERFACE_OPEN)
    # The '{' is the last character of _FA1_INTERFACE_OPEN
    open_brace_pos = open_decl_pos + len(_FA1_INTERFACE_OPEN) - 1
    _info(f"    ProspectInsert opening brace at position {open_brace_pos}")

    # Steps 5–6: brace-depth walk to find matching closing brace
    close_brace_pos = _find_interface_closing_brace(source, open_brace_pos)
    _info(f"    ProspectInsert closing brace at position {close_brace_pos}")

    # Step 7: insert _FA1_INSERT immediately after the closing brace
    insert_pos = close_brace_pos + 1
    result = source[:insert_pos] + _FA1_INSERT + source[insert_pos:]
    _ok(f"    _FA1_INSERT placed at position {insert_pos}")

    # Step 8: write
    _info(f"Writing {FILE_TYPES}")
    _write_and_verify(path, result)

    # Steps 9–11: reload and verify
    _info("    Reloading and verifying post-insertion state")
    reloaded = path.read_text(encoding="utf-8")

    verify_interfaces = [
        ("export interface ProspectInsert {",    "ProspectInsert"),
        ("export interface Funnel {",            "Funnel"),
        ("export interface FunnelInsert {",      "FunnelInsert"),
        ("export interface ProspectJourney {",   "ProspectJourney"),
        ("export interface ProspectJourneyInsert {", "ProspectJourneyInsert"),
    ]

    # Verify each appears exactly once
    for marker, name in verify_interfaces:
        count = reloaded.count(marker)
        if count != 1:
            abort(
                f"Post-insertion count verification failed: {name}\n\n"
                f"Expected exactly 1 occurrence, found {count}.\n"
                f"Marker: {marker}"
            )
        _ok(f"    Post-verify: {name} — exactly 1 occurrence")

    # Verify they appear in the required order
    positions = [reloaded.index(marker) for marker, _ in verify_interfaces]
    names     = [name for _, name in verify_interfaces]
    for i in range(len(positions) - 1):
        if positions[i] >= positions[i + 1]:
            abort(
                f"Post-insertion order verification failed.\n\n"
                f"Expected: {names[i]} ({positions[i]}) < {names[i+1]} ({positions[i+1]})\n\n"
                f"Required order: {' → '.join(names)}"
            )
    _ok(f"    Post-verify: order confirmed — {' → '.join(names)}")


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
# Anchors stable across both clean and already-present states.
# Corridor anchor verified conditionally (consumed by insertion).
# ════════════════════════════════════════════════════════════════

def stage_2_structural(root: Path) -> tuple[str, str, str]:
    _head("STAGE 2 — Structural Anchor Verification")

    # ── File A ────────────────────────────────────────────────
    _info(f"Locating {FILE_TYPES}")
    types_path = root / FILE_TYPES
    if not types_path.exists():
        abort(f"File not found: {FILE_TYPES}")
    types_src = types_path.read_text(encoding="utf-8")
    _ok(f"{FILE_TYPES} located ({len(types_src)} chars)")

    for marker, label in [
        ("export interface GatewayInvitationInsert {", "GatewayInvitationInsert present"),
        ("export interface Prospect {",                "Prospect interface present"),
        ("export interface ProspectInsert {",          "ProspectInsert interface present"),
    ]:
        _info(f"Verifying: {label}")
        if marker not in types_src:
            abort(f"Structural anchor missing in supabase-types.ts: {label}\n\nExpected: {marker}")
        _ok(f"Confirmed: {label}")

    # ── File B ────────────────────────────────────────────────
    _info(f"Locating {FILE_DAL}")
    dal_path = root / FILE_DAL
    if not dal_path.exists():
        abort(f"File not found: {FILE_DAL}")
    dal_src = dal_path.read_text(encoding="utf-8")
    _ok(f"{FILE_DAL} located ({len(dal_src)} chars)")

    for marker, label in [
        ("export class SupabaseDAL {",                   "SupabaseDAL class declaration"),
        ("export const supabaseDAL = new SupabaseDAL();", "supabaseDAL singleton export"),
        ("async createMember(",                           "createMember present"),
        ("async createProspect(",                         "createProspect present — migration authority"),
        ("async getMemberByUserId(",                      "getMemberByUserId present — corridor boundary"),
        ("  Prospect, ProspectInsert,",                   "Prospect, ProspectInsert in import block"),
    ]:
        _info(f"Verifying: {label}")
        if marker not in dal_src:
            abort(
                f"Structural anchor missing in supabase-dal.ts: {label}\n\n"
                f"Expected: {marker[:80]}"
            )
        _ok(f"Confirmed: {label}")

    # Corridor anchor: only verify if getFunnelByCode not yet inserted
    if IDEM_DAL_GET_FUNNEL not in dal_src:
        corridor = (
            "    if (error) throw new Error(`Failed to create prospect: ${error.message}`);\n"
            "    return prospect;\n"
            "  }\n"
            "\n"
            "  async getMemberByUserId"
        )
        _info("Verifying insertion corridor: createProspect close → getMemberByUserId")
        if corridor not in dal_src:
            abort(
                "Insertion corridor missing in supabase-dal.ts.\n\n"
                "Expected: createProspect closing → getMemberByUserId.\n\n"
                "Cannot safely insert getFunnelByCode + createProspectJourney."
            )
        _ok("Insertion corridor confirmed: createProspect close → getMemberByUserId")
    else:
        _ok("Corridor check skipped — getFunnelByCode already present (idempotent path)")

    # ── File C ────────────────────────────────────────────────
    _info(f"Locating {FILE_SERVICE}")
    svc_path = root / FILE_SERVICE
    if not svc_path.exists():
        abort(f"File not found: {FILE_SERVICE}")
    svc_src = svc_path.read_text(encoding="utf-8")
    _ok(f"{FILE_SERVICE} located ({len(svc_src)} chars)")

    for marker, label in [
        ("submitProspectRegistration(",               "submitProspectRegistration — stable anchor"),
        ("export interface ProspectRegistrationPayload {", "ProspectRegistrationPayload present"),
        ("export interface ProspectRegistrationResult {",  "ProspectRegistrationResult present"),
        ("accepted: true,",                           "response contract — accepted: true"),
        ("from '../lib/supabase-dal'",                "supabase-dal import present"),
    ]:
        _info(f"Verifying: {label}")
        if marker not in svc_src:
            abort(
                f"Structural anchor missing in admissions.ts: {label}\n\n"
                f"Expected: {marker[:80]}"
            )
        _ok(f"Confirmed: {label}")

    # Service body anchor: only verify on clean path (consumed by Op 1)
    if IDEM_SERVICE_GET_FUNNEL not in svc_src:
        body_anchor = "  await supabaseDAL.createProspect({"
        _info("Verifying service body anchor (clean path)")
        if body_anchor not in svc_src:
            abort(
                "Service body anchor missing in admissions.ts.\n\n"
                "Expected: await supabaseDAL.createProspect({\n\n"
                "File state differs from Current Implementation Authority."
            )
        _ok("Service body anchor confirmed — replacement target present")
    else:
        _ok("Service body check skipped — getFunnelByCode already present (idempotent path)")

    _step_results["Structural anchors"] = "PASS"
    return types_src, dal_src, svc_src


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# Three states: Clean → proceed | Already Present → skip | Partial → abort
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(types_src: str, dal_src: str, svc_src: str) -> bool:
    """Returns True if Already Present, False if Clean. Aborts on Partial."""
    _head("STAGE 3 — Idempotency Verification")

    checks = {
        "Funnel interface in types":             IDEM_TYPES_FUNNEL in types_src,
        "ProspectJourney interface in types":    IDEM_TYPES_PROSPECT_JOURNEY in types_src,
        "growth schema in createProspect":       IDEM_DAL_GROWTH_SCHEMA in dal_src,
        "getFunnelByCode in DAL":                IDEM_DAL_GET_FUNNEL in dal_src,
        "createProspectJourney in DAL":          IDEM_DAL_CREATE_JOURNEY in dal_src,
        "resolveRegistrationFunnel seam":        IDEM_SERVICE_RESOLVER in svc_src,
        "getFunnelByCode call in service":       IDEM_SERVICE_GET_FUNNEL in svc_src,
        "createProspectJourney call in service": IDEM_SERVICE_CREATE_JOURNEY in svc_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    all_present = all(checks.values())
    any_present = any(checks.values())

    if all_present:
        _ok("Growth persistence kernel already applied — mutation not required")
        _step_results["Persistence kernel"] = "PASS (Already Present)"
        return True

    if any_present:
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort(
            "Partial growth persistence kernel detected.\n\n"
            "Present:\n" + "".join(f"  {p}\n" for p in present) +
            "\nAbsent:\n"  + "".join(f"  {a}\n" for a in absent) +
            "\nManual review required."
        )

    _ok("Clean state confirmed — proceeding with mutation")
    return False


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Repository Mutation
# File A: brace-walk structural insert via _apply_file_a_structural_insert.
# Files B, C: bounded replacements via _mutate_file.
# ════════════════════════════════════════════════════════════════

def stage_4_mutate(root: Path) -> None:
    _head("STAGE 4 — Repository Mutation")
    _info("Three files — no overwrites")

    _head("  File A — server/lib/supabase-types.ts")
    _apply_file_a_structural_insert(root)

    _head("  File B — server/lib/supabase-dal.ts")
    _mutate_file(root, FILE_DAL, FILE_B_OPS)

    _head("  File C — server/services/admissions.ts")
    _mutate_file(root, FILE_SERVICE, FILE_C_OPS)

    _step_results["Persistence kernel"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    label = "STAGE 5 — Post-Verification (Idempotent Path)" if idempotent \
            else "STAGE 5 — Post-Mutation Verification"
    _head(label)

    types_src = (root / FILE_TYPES).read_text(encoding="utf-8")
    dal_src   = (root / FILE_DAL).read_text(encoding="utf-8")
    svc_src   = (root / FILE_SERVICE).read_text(encoding="utf-8")
    _ok(f"Re-read: types({len(types_src)}), dal({len(dal_src)}), service({len(svc_src)}) chars")

    # ── Exact-count checks (EXEC-STD-002) ────────────────────
    count_checks: list[tuple[str, str, int, str]] = [
        (types_src, "export interface Funnel {",                      1, "Funnel interface in types"),
        (types_src, "export interface FunnelInsert {",                1, "FunnelInsert interface in types"),
        (types_src, "export interface ProspectJourney {",             1, "ProspectJourney interface in types"),
        (types_src, "export interface ProspectJourneyInsert {",       1, "ProspectJourneyInsert interface in types"),
        (dal_src,   ".schema('growth').from('prospects')",            1, "growth.prospects reference"),
        (dal_src,   ".schema('growth').from('funnels')",              1, "growth.funnels reference"),
        (dal_src,   ".schema('growth').from('prospect_journeys')",    1, "growth.prospect_journeys reference"),
        (dal_src,   "async getFunnelByCode(",                         1, "getFunnelByCode in DAL"),
        (dal_src,   "async createProspectJourney(",                   1, "createProspectJourney in DAL"),
        (dal_src,   "async createProspect(",                          1, "createProspect in DAL (no duplicate)"),
        (svc_src,   "await supabaseDAL.getFunnelByCode(",             1, "getFunnelByCode call in service"),
        (svc_src,   "await supabaseDAL.createProspectJourney(",       1, "createProspectJourney call in service"),
        (svc_src,   "getFunnelByCode(resolveRegistrationFunnel())",   1, "resolver seam call in service"),
        (svc_src,   "await supabaseDAL.createProspect(",              1, "createProspect call in service"),
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

    # ── meh schema absent ─────────────────────────────────────
    _info("Verifying meh schema absent from createProspect")
    if ".schema('meh').from('prospects')" not in dal_src:
        _ok("meh.prospects reference removed — migration confirmed")
    else:
        abort(
            "Post-mutation verification failed.\n\n"
            "meh.prospects still present in supabase-dal.ts.\n"
            "Schema migration to growth.prospects did not apply."
        )

    # ── Response contract preserved ───────────────────────────
    _info("Verifying API response contract preserved (byte-identical)")
    for marker, desc in [
        ("accepted: true,",                                          "accepted: true"),
        ('status: "validated",',                                     'status: "validated"'),
        ('"Prospect registration accepted for future persistence."', "canonical message"),
        ("export interface ProspectRegistrationPayload {",           "ProspectRegistrationPayload preserved"),
        ("export interface ProspectRegistrationResult {",            "ProspectRegistrationResult preserved"),
        ("Promise<ProspectRegistrationResult>",                      "Promise return type preserved"),
    ]:
        if marker in svc_src:
            _ok(f"Contract: {desc}")
        else:
            abort(f"Response contract broken: {desc}\nMarker: {marker}")

    # ── DAL method content ────────────────────────────────────
    _info("Verifying getFunnelByCode content")
    for marker, desc in [
        (".schema('growth').from('funnels')", "growth.funnels table"),
        (".eq('code', code)",                 "code filter"),
        (".eq('active', true)",               "active filter (canonical column)"),
        (".maybeSingle();",                   "maybeSingle() — returns null if not found"),
        ("if (error) throw new Error(`Failed to get funnel:", "error handling"),
    ]:
        if marker in dal_src:
            _ok(f"getFunnelByCode: {desc}")
        else:
            abort(f"getFunnelByCode missing: {desc}\nMarker: {marker}")

    _info("Verifying createProspectJourney content")
    for marker, desc in [
        (".schema('growth').from('prospect_journeys')",         "growth.prospect_journeys table"),
        ("prospect_id: data.prospect_id,",                     "prospect_id field"),
        ("funnel_id:   data.funnel_id,",                       "funnel_id field"),
        ("current_stage: data.current_stage ?? 'registered',", "current_stage with registered default"),
        ("if (error) throw new Error(`Failed to create prospect journey:", "error handling"),
    ]:
        if marker in dal_src:
            _ok(f"createProspectJourney: {desc}")
        else:
            abort(f"createProspectJourney missing: {desc}\nMarker: {marker}")

    # ── Preservation ──────────────────────────────────────────
    _info("Verifying existing content preserved")
    for src, marker, desc in [
        (types_src, "export interface GatewayInvitationInsert {",    "GatewayInvitationInsert preserved"),
        (types_src, "export interface Prospect {",                    "Prospect interface preserved"),
        (types_src, "export interface ProspectInsert {",              "ProspectInsert interface preserved"),
        (dal_src,   "async createMember(",                           "createMember preserved"),
        (dal_src,   "async getMemberByUserId(",                      "getMemberByUserId preserved"),
        (dal_src,   "export const supabaseDAL = new SupabaseDAL();", "singleton preserved"),
        (svc_src,   "export interface ProspectRegistrationPayload {", "payload interface preserved"),
        (svc_src,   "from '../lib/supabase-dal'",                    "DAL import preserved"),
    ]:
        if marker in src:
            _ok(f"Preserved: {desc}")
        else:
            abort(f"Preserved content missing: {desc}")

    # ── Duplicate detection ───────────────────────────────────
    _info("Duplicate detection")
    for src, marker, desc in [
        (dal_src, "async createProspect(",        "createProspect appears once"),
        (dal_src, "async getFunnelByCode(",        "getFunnelByCode appears once"),
        (dal_src, "async createProspectJourney(", "createProspectJourney appears once"),
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
    svc_src = (root / FILE_SERVICE).read_text(encoding="utf-8")

    _info("Verifying semantic order: createProspect → getFunnelByCode → createProspectJourney → return")
    order_markers = [
        ("await supabaseDAL.createProspect(",       "createProspect"),
        ("await supabaseDAL.getFunnelByCode(",       "getFunnelByCode"),
        ("await supabaseDAL.createProspectJourney(", "createProspectJourney"),
        ("  return {\n    accepted: true,",          "return validated response"),
    ]

    positions: list[tuple[int, str]] = []
    for marker, desc in order_markers:
        idx = svc_src.find(marker)
        if idx == -1:
            abort(f"Semantic ordering: marker not found: {desc}\nMarker: {marker}")
        positions.append((idx, desc))

    for i in range(len(positions) - 1):
        pos_a, label_a = positions[i]
        pos_b, label_b = positions[i + 1]
        if pos_a >= pos_b:
            abort(
                f"Semantic ordering violation.\n\n"
                f"Expected: {label_a} ({pos_a}) < {label_b} ({pos_b})\n\n"
                f"Required order: createProspect → getFunnelByCode → "
                f"createProspectJourney → return"
            )

    _ok(
        "Semantic order confirmed: "
        + " → ".join(f"{desc}({pos})" for pos, desc in positions)
    )

    _info("Verifying GP-ARCH-002 resolver seam")
    if "resolveRegistrationFunnel()" not in svc_src:
        abort("resolveRegistrationFunnel() not found in service.\nExpected: getFunnelByCode(resolveRegistrationFunnel())")
    _ok("resolveRegistrationFunnel() call present in service")

    if 'getFunnelByCode("' + DEFAULT_FUNNEL_CODE + '")' in svc_src:
        abort("CTBC-2026 hardcoded in service body — GP-ARCH-002 seam violation")
    _ok("GP-ARCH-002 confirmed: funnel code absent from workflow logic")

    _info("Verifying prospect.id flows into createProspectJourney")
    if "prospect_id: prospect.id," not in svc_src:
        abort("prospect.id not passed to createProspectJourney.\nExpected: prospect_id: prospect.id,")
    _ok("prospect.id → createProspectJourney.prospect_id confirmed")

    _info("Verifying funnel guard")
    if "if (funnel) {" not in svc_src:
        abort("Funnel guard missing.\nExpected: if (funnel) {")
    _ok("Funnel existence guard present — journey skipped gracefully if funnel absent")

    _ok("Architecture chain: createProspect → getFunnel → createJourney → return contract")


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
        print(f"    MODIFY  {FILE_TYPES}")
        print(f"    MODIFY  {FILE_DAL}")
        print(f"    MODIFY  {FILE_SERVICE}")
        print()
        print("  Build and runtime verification:")
        print("    npm run build")
        print("    npm run dev")
        print()
        print("    POST /api/admissions/prospects")
        print("    Body: { fullName, email, country, programOfInterest }")
        print()
        print("    Verify:")
        print("      growth.prospects contains row")
        print("      growth.prospect_journeys contains row")
        print('      Response: { accepted: true, status: "validated", message: "..." }')
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
        "  python RMP-010E16_growth_persistence_kernel.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E16 — Growth Persistence Kernel{RESET}")
    print(f"{BOLD}CIP-010E16 Revision 3{RESET}\n")

    root = resolve_root()
    _info(f"Repository root: {root}")
    _info(f"Authorized mutation scope:")
    _info(f"  MODIFY  {FILE_TYPES}")
    _info(f"  MODIFY  {FILE_DAL}")
    _info(f"  MODIFY  {FILE_SERVICE}")

    stage_1_repository(root)
    types_src, dal_src, svc_src = stage_2_structural(root)
    already_present = stage_3_idempotency(types_src, dal_src, svc_src)

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
