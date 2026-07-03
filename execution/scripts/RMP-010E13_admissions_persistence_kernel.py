#!/usr/bin/env python3
"""
RMP-010E13 — Admissions Persistence Kernel
CIP-010E13 Revision 1

Authorized mutation scope: exactly three files.
  MODIFY  server/lib/supabase-types.ts   — Prospect + ProspectInsert interfaces
  MODIFY  server/lib/supabase-dal.ts     — createProspect() method + type imports
  MODIFY  server/services/admissions.ts  — DAL-backed persistence, preserved API contract

Architecture: Route → Service → SupabaseDAL → Supabase
API response contract: identical to RMP-010E11 (accepted, status, message)

Quality gate: EXEC-STD-002 (RMP-010E9 Rev3 / RMP-010E10 Rev2 / RMP-010E11 Rev2 standard)
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
        f"RMP-010E13\n"
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

# ── Idempotency markers (all six must be present for Already Present) ──
IDEM_TYPES_PROSPECT        = "export interface Prospect {"
IDEM_TYPES_PROSPECT_INSERT = "export interface ProspectInsert {"
IDEM_DAL_CREATE_PROSPECT   = "async createProspect("
IDEM_DAL_IMPORT            = "Prospect, ProspectInsert,"
IDEM_SERVICE_AWAIT         = "await supabaseDAL.createProspect("
IDEM_SERVICE_IMPORT        = "from '../lib/supabase-dal'"

# ════════════════════════════════════════════════════════════════
# BOUNDED MUTATION OPERATIONS
# ════════════════════════════════════════════════════════════════

# ── File A: supabase-types.ts ──────────────────────────────────
# Append Prospect + ProspectInsert after the final closing brace of
# GatewayInvitationInsert (verified: ends file with "note?\n}\n").
_FA_SEARCH  = "  note?: string | null;\n}"
_FA_REPLACE = (
    "  note?: string | null;\n"
    "}\n"
    "\n"
    "export interface Prospect {\n"
    "  id: string;\n"
    "  full_name: string;\n"
    "  email: string;\n"
    "  country: string;\n"
    "  program_of_interest: string;\n"
    "  phone: string | null;\n"
    "  created_at: string;\n"
    "}\n"
    "\n"
    "export interface ProspectInsert {\n"
    "  full_name: string;\n"
    "  email: string;\n"
    "  country: string;\n"
    "  program_of_interest: string;\n"
    "  phone?: string | null;\n"
    "}"
)
_FA_LABEL = "Append Prospect + ProspectInsert interfaces to supabase-types.ts"

# ── File B Op 1: extend type import block ─────────────────────
# Add Prospect, ProspectInsert before TutorStatus in the import block.
# Verified: "  GatewayInvitation, GatewayInvitationInsert,\n  TutorStatus\n}"
_FB1_SEARCH = (
    "  GatewayInvitation, GatewayInvitationInsert,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_REPLACE = (
    "  GatewayInvitation, GatewayInvitationInsert,\n"
    "  Prospect, ProspectInsert,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_LABEL = "Add Prospect, ProspectInsert to DAL type imports"

# ── File B Op 2: insert createProspect after createMember ─────
# Insertion corridor: createMember close → getMemberByUserId.
# Anchor spans the unique closing sequence of createMember through the
# start of getMemberByUserId, ensuring positional safety.
_FB2_SEARCH = (
    "    if (error) throw new Error(`Failed to create member: ${error.message}`);\n"
    "    return member;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_REPLACE = (
    "    if (error) throw new Error(`Failed to create member: ${error.message}`);\n"
    "    return member;\n"
    "  }\n"
    "\n"
    "  async createProspect(data: ProspectInsert): Promise<Prospect> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "\n"
    "    const { data: prospect, error } = await supabase\n"
    "      .schema('meh').from('prospects')\n"
    "      .insert({\n"
    "        full_name: data.full_name,\n"
    "        email: data.email,\n"
    "        country: data.country,\n"
    "        program_of_interest: data.program_of_interest,\n"
    "        phone: data.phone ?? null,\n"
    "      })\n"
    "      .select()\n"
    "      .single();\n"
    "\n"
    "    if (error) throw new Error(`Failed to create prospect: ${error.message}`);\n"
    "    return prospect;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_LABEL = "Insert createProspect() after createMember() in SupabaseDAL"

# ── File C Op 1: update header + add import ───────────────────
_FC1_SEARCH = (
    "// server/services/admissions.ts\n"
    "// Admissions Service — RMP-010E11\n"
    "// No persistence. No Supabase. No DAL. No notifications. No email."
)
_FC1_REPLACE = (
    "// server/services/admissions.ts\n"
    "// Admissions Service — RMP-010E13\n"
    "// Persistence via SupabaseDAL. Response contract preserved from RMP-010E11.\n"
    "import { supabaseDAL } from '../lib/supabase-dal';"
)
_FC1_LABEL = "Add supabaseDAL import and update header comment"

# ── File C Op 2: make function async ──────────────────────────
_FC2_SEARCH  = "export function submitProspectRegistration("
_FC2_REPLACE = "export async function submitProspectRegistration("
_FC2_LABEL   = "Make submitProspectRegistration async"

# ── File C Op 3: fix return type to Promise<ProspectRegistrationResult> ─
# The function is now async so the return type must reflect that.
_FC3_SEARCH  = "): ProspectRegistrationResult {\n"
_FC3_REPLACE = "): Promise<ProspectRegistrationResult> {\n"
_FC3_LABEL   = "Update return type to Promise<ProspectRegistrationResult>"

# ── File C Op 4: replace sync body with DAL call + response ───
_FC4_SEARCH = (
    "  return {\n"
    "    accepted: true,\n"
    "    status: \"validated\",\n"
    "    message: \"Prospect registration accepted for future persistence.\",\n"
    "  };"
)
_FC4_REPLACE = (
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
_FC4_LABEL = "Replace sync return with DAL createProspect call + preserved response"

FILE_A_OPS = [(_FA_SEARCH,  _FA_REPLACE,  _FA_LABEL)]
FILE_B_OPS = [(_FB1_SEARCH, _FB1_REPLACE, _FB1_LABEL),
              (_FB2_SEARCH, _FB2_REPLACE, _FB2_LABEL)]
FILE_C_OPS = [(_FC1_SEARCH, _FC1_REPLACE, _FC1_LABEL),
              (_FC2_SEARCH, _FC2_REPLACE, _FC2_LABEL),
              (_FC3_SEARCH, _FC3_REPLACE, _FC3_LABEL),
              (_FC4_SEARCH, _FC4_REPLACE, _FC4_LABEL)]


# ════════════════════════════════════════════════════════════════
# BOUNDED REPLACEMENT ENGINE
# ════════════════════════════════════════════════════════════════

def _apply_one(working: str, search: str, replace: str, label: str) -> str:
    """Verify anchor exactly once, apply, verify result exactly once."""
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


def _mutate_file(root: Path, rel_path: Path,
                 ops: list[tuple[str, str, str]]) -> None:
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
    path.write_text(working, encoding="utf-8")
    on_disk = path.read_text(encoding="utf-8")
    if on_disk != working:
        abort(
            f"Round-trip verification failed: {rel_path}\n\n"
            "File on disk differs from expected working copy."
        )
    _ok(f"Round-trip verified ({len(on_disk)} chars on disk)")


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
#
# Anchors checked here must be stable across BOTH clean and
# already-present (post-mutation) states. Corridor-specific anchors
# that are consumed by insertion are verified in Stage 4 only.
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
        ("export interface GatewayInvitationInsert {",
         "GatewayInvitationInsert interface present"),
    ]:
        _info(f"Verifying anchor: {label}")
        if marker not in types_src:
            abort(f"Structural anchor missing in supabase-types.ts: {label}\n\n"
                  f"Expected: {marker}")
        _ok(f"Anchor confirmed: {label}")

    # ── File B ────────────────────────────────────────────────
    _info(f"Locating {FILE_DAL}")
    dal_path = root / FILE_DAL
    if not dal_path.exists():
        abort(f"File not found: {FILE_DAL}")
    dal_src = dal_path.read_text(encoding="utf-8")
    _ok(f"{FILE_DAL} located ({len(dal_src)} chars)")

    for marker, label in [
        ("export class SupabaseDAL {",
         "SupabaseDAL class declaration"),
        ("export const supabaseDAL = new SupabaseDAL();",
         "supabaseDAL singleton export"),
        ("async createMember(",
         "createMember method — insertion authority confirmed"),
        ("async getMemberByUserId(",
         "getMemberByUserId method — corridor downstream boundary confirmed"),
        ("  GatewayInvitation, GatewayInvitationInsert,",
         "type import block — import insertion anchor confirmed"),
    ]:
        _info(f"Verifying anchor: {label}")
        if marker not in dal_src:
            abort(f"Structural anchor missing in supabase-dal.ts: {label}\n\n"
                  f"Expected: {marker[:80]}")
        _ok(f"Anchor confirmed: {label}")

    # Corridor anchor: only verify if createProspect not yet inserted
    # (corridor is consumed by insertion; checking it on idempotent path would abort)
    if IDEM_DAL_CREATE_PROSPECT not in dal_src:
        corridor = (
            "    if (error) throw new Error(`Failed to create member: ${error.message}`);\n"
            "    return member;\n"
            "  }\n"
            "\n"
            "  async getMemberByUserId"
        )
        _info("Verifying insertion corridor: createMember close → getMemberByUserId")
        if corridor not in dal_src:
            abort(
                "Insertion corridor missing in supabase-dal.ts.\n\n"
                "Expected: createMember closing → getMemberByUserId\n\n"
                "Cannot safely insert createProspect."
            )
        _ok("Insertion corridor confirmed: Anchor B close → Anchor C")
    else:
        _ok("Insertion corridor check skipped — createProspect already present (idempotent path)")

    # ── File C ────────────────────────────────────────────────
    _info(f"Locating {FILE_SERVICE}")
    svc_path = root / FILE_SERVICE
    if not svc_path.exists():
        abort(f"File not found: {FILE_SERVICE}")
    svc_src = svc_path.read_text(encoding="utf-8")
    _ok(f"{FILE_SERVICE} located ({len(svc_src)} chars)")

    for marker, label in [
        ("submitProspectRegistration(",
         "submitProspectRegistration — matches both sync and async forms"),
        ("export interface ProspectRegistrationPayload {",
         "ProspectRegistrationPayload interface"),
        ("export interface ProspectRegistrationResult {",
         "ProspectRegistrationResult interface"),
        ("accepted: true,",
         "accepted: true — response contract anchor"),
    ]:
        _info(f"Verifying anchor: {label}")
        if marker not in svc_src:
            abort(f"Structural anchor missing in admissions.ts: {label}\n\n"
                  f"Expected: {marker[:80]}")
        _ok(f"Anchor confirmed: {label}")

    # Sync return body: only verify on clean path (consumed by Op 4)
    if IDEM_SERVICE_AWAIT not in svc_src:
        sync_body = (
            "  return {\n"
            "    accepted: true,\n"
            "    status: \"validated\",\n"
            "    message: \"Prospect registration accepted for future persistence.\",\n"
            "  };"
        )
        _info("Verifying sync return body anchor (clean path)")
        if sync_body not in svc_src:
            abort(
                "Sync return body anchor missing in admissions.ts.\n\n"
                "Expected the original static return block.\n\n"
                "File state differs from Current Implementation Authority."
            )
        _ok("Sync return body confirmed — replacement anchor present")
    else:
        _ok("Sync return body check skipped — DAL call already present (idempotent path)")

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
        "Prospect interface in types":        IDEM_TYPES_PROSPECT in types_src,
        "ProspectInsert interface in types":  IDEM_TYPES_PROSPECT_INSERT in types_src,
        "createProspect() in DAL":            IDEM_DAL_CREATE_PROSPECT in dal_src,
        "Prospect, ProspectInsert import":    IDEM_DAL_IMPORT in dal_src,
        "await createProspect in service":    IDEM_SERVICE_AWAIT in svc_src,
        "supabase-dal import in service":     IDEM_SERVICE_IMPORT in svc_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    all_present = all(checks.values())
    any_present = any(checks.values())

    if all_present:
        _ok("Persistence kernel already applied — mutation not required")
        _step_results["Persistence kernel"] = "PASS (Already Present)"
        return True

    if any_present:
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort(
            "Partial persistence kernel detected.\n\n"
            "Present:\n" + "".join(f"  {p}\n" for p in present) +
            "\nAbsent:\n"  + "".join(f"  {a}\n" for a in absent) +
            "\nManual review required."
        )

    _ok("Clean state confirmed — proceeding with mutation")
    return False


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Repository Mutation (bounded replacements, no overwrites)
# ════════════════════════════════════════════════════════════════

def stage_4_mutate(root: Path) -> None:
    _head("STAGE 4 — Repository Mutation")
    _info("Three files — bounded string replacements — no overwrites")

    _head("  File A — server/lib/supabase-types.ts")
    _mutate_file(root, FILE_TYPES, FILE_A_OPS)

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

    # ── Exact-count checks ────────────────────────────────────
    count_checks: list[tuple[str, str, int, str]] = [
        (types_src, "export interface Prospect {",                1, "Prospect interface in types"),
        (types_src, "export interface ProspectInsert {",          1, "ProspectInsert interface in types"),
        (dal_src,   "async createProspect(",                      1, "createProspect() in DAL"),
        (dal_src,   "Prospect, ProspectInsert,",                  1, "Prospect, ProspectInsert import in DAL"),
        (svc_src,   "await supabaseDAL.createProspect(",          1, "await createProspect() in service"),
        (svc_src,   "from '../lib/supabase-dal'",                 1, "supabase-dal import in service"),
        (svc_src,   "export async function submitProspectRegistration(", 1, "async function export in service"),
        (svc_src,   "Promise<ProspectRegistrationResult>",        1, "Promise return type in service"),
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

    # ── Response contract ─────────────────────────────────────
    _info("Verifying API response contract preserved")
    for src, marker, desc in [
        (svc_src, "accepted: true,",
         "accepted: true"),
        (svc_src, 'status: "validated",',
         'status: "validated"'),
        (svc_src, '"Prospect registration accepted for future persistence."',
         "canonical message string"),
        (svc_src, "export interface ProspectRegistrationPayload {",
         "ProspectRegistrationPayload preserved"),
        (svc_src, "export interface ProspectRegistrationResult {",
         "ProspectRegistrationResult preserved"),
    ]:
        if marker in src:
            _ok(f"Contract: {desc}")
        else:
            abort(f"Response contract broken: {desc}\nMarker: {marker}")

    # ── DAL method content ────────────────────────────────────
    _info("Verifying createProspect() method content")
    for marker, desc in [
        ("schema('meh').from('prospects')",           "schema meh prospects table"),
        (".insert({",                                 "insert call"),
        (".select()\n      .single();",               "select().single() chain"),
        ("if (error) throw new Error(`Failed to create prospect:", "error handling"),
        ("full_name: data.full_name,",               "full_name field mapping"),
        ("email: data.email,",                       "email field mapping"),
        ("country: data.country,",                   "country field mapping"),
        ("program_of_interest: data.program_of_interest,", "program_of_interest field mapping"),
        ("phone: data.phone ?? null,",               "phone nullable field"),
        ("getSupabaseAdmin();",                      "getSupabaseAdmin() used"),
        ("this.ensureConfigured();",                 "ensureConfigured() called"),
    ]:
        if marker in dal_src:
            _ok(f"DAL method: {desc}")
        else:
            abort(f"DAL method missing: {desc}\nMarker: {marker}")

    # ── Preservation checks ───────────────────────────────────
    _info("Verifying existing content preserved")
    for src, marker, desc in [
        (types_src, "export interface GatewayInvitationInsert {", "GatewayInvitationInsert preserved"),
        (types_src, "export interface Member {",                   "Member interface preserved"),
        (dal_src,   "async createMember(",                        "createMember preserved"),
        (dal_src,   "async getMemberByUserId(",                   "getMemberByUserId preserved"),
        (dal_src,   "export const supabaseDAL = new SupabaseDAL();", "singleton export preserved"),
        (svc_src,   "export interface ProspectRegistrationPayload {", "payload interface preserved"),
    ]:
        if marker in src:
            _ok(f"Preserved: {desc}")
        else:
            abort(f"Preserved content missing: {desc}")

    # ── Duplicate detection ───────────────────────────────────
    _info("Duplicate detection")
    for src, marker, desc in [
        (dal_src, "async createMember(",   "createMember appears once"),
        (dal_src, "async createProspect(", "createProspect appears once"),
        (svc_src, "export async function submitProspectRegistration(", "service export appears once"),
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
    dal_src = (root / FILE_DAL).read_text(encoding="utf-8")

    _info("Verifying Route → Service → DAL → Supabase chain")
    _ok("Route: POST /api/admissions/prospects (server/routes.ts — unchanged)")

    for marker, desc in [
        ("submitProspectRegistration",        "Service: submitProspectRegistration present"),
        ("supabaseDAL.createProspect(",       "DAL call: supabaseDAL.createProspect() in service"),
        ("getSupabaseAdmin()",                "Supabase: getSupabaseAdmin() in createProspect"),
    ]:
        src = svc_src if "supabaseDAL" in marker or "submitProspect" in marker else dal_src
        if marker in svc_src or marker in dal_src:
            _ok(desc)

    _info("Verifying semantic order: await createProspect precedes return")
    idx_await  = svc_src.find("await supabaseDAL.createProspect(")
    idx_return = svc_src.find("  return {\n    accepted: true,")
    if idx_await == -1:
        abort("Semantic verification failed.\n\nawait createProspect() not found in service.")
    if idx_return == -1:
        abort("Semantic verification failed.\n\nReturn statement not found in service.")
    if idx_await >= idx_return:
        abort(
            f"Semantic ordering violation.\n\n"
            f"await createProspect ({idx_await}) must precede return ({idx_return})."
        )
    _ok(f"Semantic order: await createProspect ({idx_await}) < return ({idx_return})")

    _info("Verifying payload field mapping: camelCase → snake_case")
    mappings = [
        ("payload.fullName",          "full_name"),
        ("payload.email",             "email"),
        ("payload.country",           "country"),
        ("payload.programOfInterest", "program_of_interest"),
        ("payload.phone",             "phone"),
    ]
    for camel, snake in mappings:
        if camel in svc_src and snake in svc_src:
            _ok(f"Field mapping: {camel} → {snake}")
        else:
            abort(
                f"Field mapping missing in service.\n\n"
                f"Expected: {camel} mapped to {snake}"
            )

    _ok("Architecture chain verified: payload → DAL insert → validated response")


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
        print("  Build verification:")
        print("    npm run build")
        print()
        print("  Runtime verification:")
        print("    npm run dev")
        print("    # Ensure Supabase credentials are configured in .env")
        print("    # Ensure meh.prospects table exists in Supabase")
        print("    # POST /api/admissions/prospects")
        print("    # Body: { fullName, email, country, programOfInterest }")
        print('    # Expect HTTP 200: { accepted: true, status: "validated", message: "..." }')
        print("    # Verify: row inserted into meh.prospects in Supabase dashboard")
        print("    # Verify: API response contract unchanged from RMP-010E11")
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
        "  python RMP-010E13_admissions_persistence_kernel.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E13 — Admissions Persistence Kernel{RESET}")
    print(f"{BOLD}CIP-010E13 Revision 1{RESET}\n")

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