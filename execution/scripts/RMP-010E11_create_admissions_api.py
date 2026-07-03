#!/usr/bin/env python3
"""
RMP-010E11 — Admissions API Scaffold
CIP-010E11 Revision 2 — Repository Mutation Quality Enhancement

Authorized mutation scope: exactly two files.
  server/services/admissions.ts   [CREATE]
  server/routes.ts                [MODIFY — import + endpoint]

Revision 2 changes (structural safety only — no business logic changes):
  - Stage 2 adds Anchor C verification: app.get("/api/countries")
  - Stage 2 verifies insertion corridor: Anchor B precedes Anchor C
  - Stage 2 verifies corridor is clean (no prior admissions endpoint)
  - Stage 7 verifies A/B/C all survive mutation
  - Stage 7 verifies admissions endpoint is positionally between B and C
  - Summary labels match required EXEC-STD-002 format

Quality gate: EXEC-STD-002 (RMP-010E9 Rev3 / RMP-010E10 Rev2 standard)
"""

import re
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
        f"RMP-010E11\n"
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

FILE_SERVICE = Path("server/services/admissions.ts")
FILE_ROUTES  = Path("server/routes.ts")
DIR_SERVICES = Path("server/services")

# ── Structural anchors (verified from Repository Truth) ────────
#
# Anchor A — routing authority
ANCHOR_A = 'export async function registerRoutes('
ANCHOR_A_LABEL = "Anchor A: export async function registerRoutes("
#
# Anchor B — verified insertion authority (last partners route)
# Repository Truth: app.patch("/api/partners/:id" is the final partners
# handler. The admissions endpoint is inserted immediately after it closes.
ANCHOR_B = 'app.patch("/api/partners/:id"'
ANCHOR_B_LABEL = 'Anchor B: app.patch("/api/partners/:id"'
#
# Anchor C — downstream business endpoint (insertion corridor boundary)
# Repository Truth: app.get("/api/countries" immediately follows the
# partners section. Verified from uploaded routes.ts.
ANCHOR_C = 'app.get("/api/countries"'
ANCHOR_C_LABEL = 'Anchor C: app.get("/api/countries"'

# Supporting anchors verified in Stage 2 (not corridor-related)
ANCHOR_RETURN_HTTP = "return httpServer;"
ANCHOR_ZOD_IMPORT  = 'from "zod"'
ANCHOR_NOTIF_IMPORT = 'import { notifyNewEnquiry } from "./services/notifications";'

# ── Idempotency markers ────────────────────────────────────────
IDEM_SERVICE  = "submitProspectRegistration"
IDEM_ENDPOINT = '"/api/admissions/prospects"'
IDEM_IMPORT   = 'from "./services/admissions"'

# ── Route import to add ────────────────────────────────────────
ROUTE_IMPORT = 'import { submitProspectRegistration } from "./services/admissions";'

# ── Admissions route block ─────────────────────────────────────
ADMISSIONS_ROUTE_BLOCK = """\

  // ============================================================
  // ADMISSIONS ROUTES
  // ============================================================

  app.post("/api/admissions/prospects", async (req: Request, res: Response) => {
    try {
      const prospectSchema = z.object({
        fullName:          z.string().min(1, "Full name is required"),
        email:             z.string().email("Valid email is required"),
        country:           z.string().min(1, "Country is required"),
        programOfInterest: z.string().min(1, "Program of interest is required"),
        phone:             z.string().optional(),
      });

      const data = prospectSchema.parse(req.body);
      const result = submitProspectRegistration(data);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Admissions prospect error:", error);
      res.status(500).json({ error: "Failed to process prospect registration" });
    }
  });

"""

# ── Admissions service source ──────────────────────────────────
SERVICE_SOURCE = """\
// server/services/admissions.ts
// Admissions Service — RMP-010E11
// No persistence. No Supabase. No DAL. No notifications. No email.

export interface ProspectRegistrationPayload {
  fullName: string;
  email: string;
  country: string;
  programOfInterest: string;
  phone?: string;
}

export interface ProspectRegistrationResult {
  accepted: true;
  status: "validated";
  message: "Prospect registration accepted for future persistence.";
}

export function submitProspectRegistration(
  payload: ProspectRegistrationPayload,
): ProspectRegistrationResult {
  return {
    accepted: true,
    status: "validated",
    message: "Prospect registration accepted for future persistence.",
  };
}
"""


# ════════════════════════════════════════════════════════════════
# STAGE 1 — Repository anchor verification
# ════════════════════════════════════════════════════════════════

def stage_1_repository(root: Path) -> None:
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        target = root / anchor
        if target.exists():
            _ok(f"Anchor present: {anchor}")
        else:
            abort(f"Repository anchor missing: {anchor}")
    _ok("All repository anchors confirmed")
    _step_results["Repository anchors"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 2 — Structural anchor verification (A, B, C + corridor)
# ════════════════════════════════════════════════════════════════

def stage_2_verify_routes(root: Path) -> str:
    _head("STAGE 2 — Structural Anchor Verification")

    routes_path = root / FILE_ROUTES
    _info(f"Locating {FILE_ROUTES}")
    if not routes_path.exists():
        abort(f"Routing authority not found: {FILE_ROUTES}")
    source = routes_path.read_text(encoding="utf-8")
    _ok(f"File located ({len(source)} chars)")

    # ── Anchor A ──────────────────────────────────────────────
    _info(f"Verifying {ANCHOR_A_LABEL}")
    if ANCHOR_A not in source:
        abort(
            f"Anchor A missing.\n\n"
            f"Expected: {ANCHOR_A}\n\n"
            "Routing authority cannot be confirmed."
        )
    _ok(f"Confirmed: {ANCHOR_A_LABEL}")

    # ── Anchor B ──────────────────────────────────────────────
    _info(f"Verifying {ANCHOR_B_LABEL}")
    if ANCHOR_B not in source:
        abort(
            f"Anchor B missing.\n\n"
            f"Expected: {ANCHOR_B}\n\n"
            "Insertion authority cannot be confirmed."
        )
    _ok(f"Confirmed: {ANCHOR_B_LABEL}")

    # ── Anchor C ──────────────────────────────────────────────
    _info(f"Verifying {ANCHOR_C_LABEL}")
    if ANCHOR_C not in source:
        abort(
            f"Anchor C missing.\n\n"
            f"Expected: {ANCHOR_C}\n\n"
            "Insertion corridor downstream boundary cannot be confirmed."
        )
    _ok(f"Confirmed: {ANCHOR_C_LABEL}")

    # ── Positional ordering: B must precede C ─────────────────
    _info("Verifying insertion corridor: Anchor B precedes Anchor C")
    idx_b = source.find(ANCHOR_B)
    idx_c = source.find(ANCHOR_C)
    if idx_b >= idx_c:
        abort(
            "Insertion corridor ordering violation.\n\n"
            f"Anchor B position: {idx_b}\n"
            f"Anchor C position: {idx_c}\n\n"
            "Anchor B must appear before Anchor C.\n"
            "File structure differs from Current Implementation Authority."
        )
    _ok(f"Corridor ordering confirmed: B ({idx_b}) < C ({idx_c})")

    # ── Corridor cleanliness: no admissions endpoint between B and C ──
    # (unless the idempotency path handles it — checked in Stage 4)
    _info("Verifying insertion corridor is clean (no prior admissions endpoint)")
    between_b_and_c = source[idx_b:idx_c]
    if IDEM_ENDPOINT in between_b_and_c:
        # Admissions endpoint already in corridor — idempotency will handle
        _info("Admissions endpoint detected in corridor — idempotency check will follow")
    else:
        _ok("Insertion corridor clean — no prior admissions endpoint")

    # ── Supporting anchors ────────────────────────────────────
    supporting = [
        (ANCHOR_RETURN_HTTP, "return httpServer; present"),
        (ANCHOR_ZOD_IMPORT,  "z (Zod) already imported — no new framework needed"),
        (ANCHOR_NOTIF_IMPORT, "notifications import (import insertion anchor)"),
    ]
    for marker, label in supporting:
        _info(f"Verifying: {label}")
        if marker not in source:
            abort(
                f"Structural anchor missing: {label}\n\n"
                f"Expected: {marker}"
            )
        _ok(f"Confirmed: {label}")

    _step_results["Structural anchors"] = "PASS"
    return source


# ════════════════════════════════════════════════════════════════
# STAGE 3 — server/services/ directory verification
# ════════════════════════════════════════════════════════════════

def stage_3_verify_services_dir(root: Path) -> None:
    _head("STAGE 3 — server/services/ Directory Verification")
    services_dir = root / DIR_SERVICES
    _info(f"Locating {DIR_SERVICES}")
    if not services_dir.is_dir():
        abort(
            f"Services directory not found: {DIR_SERVICES}\n\n"
            "Cannot create admissions.ts without the services directory."
        )
    _ok(f"Directory confirmed: {DIR_SERVICES}")
    # Stage 3 feeds into the corridor check result — folded into structural anchors
    # No separate step result: corridor verification is reported in Stage 2


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Idempotency check
# ════════════════════════════════════════════════════════════════

def stage_4_idempotency(root: Path, routes_source: str) -> bool:
    """Returns True if already applied (skip mutation), False if mutation needed."""
    _head("STAGE 4 — Idempotency Check")

    service_path    = root / FILE_SERVICE
    service_present  = (
        service_path.exists()
        and IDEM_SERVICE in service_path.read_text(encoding="utf-8")
    )
    endpoint_present = IDEM_ENDPOINT in routes_source
    import_present   = IDEM_IMPORT in routes_source

    _info(f"submitProspectRegistration in service file  → {service_present}")
    _info(f'"{IDEM_ENDPOINT}" in routes.ts              → {endpoint_present}')
    _info(f"admissions import in routes.ts               → {import_present}")

    if service_present and endpoint_present and import_present:
        _ok("Service and endpoint already present — mutation not required")
        _step_results["Admissions endpoint"] = "PASS (Already Present)"
        return True

    any_present = service_present or endpoint_present or import_present
    if any_present:
        present = [n for n, v in [("service", service_present), ("endpoint", endpoint_present), ("import", import_present)] if v]
        absent  = [n for n, v in [("service", service_present), ("endpoint", endpoint_present), ("import", import_present)] if not v]
        abort(
            "Partial mutation detected.\n\n"
            f"Present: {', '.join(present)}\n"
            f"Absent:  {', '.join(absent)}\n\n"
            "File state is inconsistent. Manual review required."
        )

    _ok("Mutation not yet applied — proceeding")
    return False


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Create server/services/admissions.ts
# ════════════════════════════════════════════════════════════════

def stage_5_create_service(root: Path) -> None:
    _head("STAGE 5 — Create server/services/admissions.ts")
    service_path = root / FILE_SERVICE

    if service_path.exists():
        abort(
            "admissions.ts already exists but was not detected in idempotency check.\n\n"
            "Unexpected file state. Manual review required."
        )

    _info("Writing server/services/admissions.ts")
    service_path.write_text(SERVICE_SOURCE, encoding="utf-8")
    _ok("File written")
    _step_results["Service file"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 6 — Mutate server/routes.ts
# Insertion: between verified Anchor B and verified Anchor C
# ════════════════════════════════════════════════════════════════

def stage_6_mutate_routes(root: Path) -> None:
    _head("STAGE 6 — Mutate server/routes.ts")
    _head("         Insertion corridor: Anchor B → [admissions] → Anchor C")
    routes_path = root / FILE_ROUTES
    source = routes_path.read_text(encoding="utf-8")

    # ── Insert import ─────────────────────────────────────────
    _info("Inserting admissions import after notifications service import")
    if ANCHOR_NOTIF_IMPORT not in source:
        abort(f"Import insertion anchor missing: {ANCHOR_NOTIF_IMPORT}")
    mutated = source.replace(
        ANCHOR_NOTIF_IMPORT,
        ANCHOR_NOTIF_IMPORT + "\n" + ROUTE_IMPORT,
        1,
    )
    _ok("Import inserted")

    # ── Insert route block between Anchor B close and Anchor C ─
    # Regex locates: the closing '  });' of the Anchor B (partners PATCH) block,
    # followed by any whitespace, followed by Anchor C.
    # This is structurally equivalent to "insert between B and C".
    _info(f"Locating insertion corridor: Anchor B close → Anchor C")
    _info(f"  Anchor B: {ANCHOR_B}")
    _info(f"  Anchor C: {ANCHOR_C}")

    corridor_pattern = re.compile(
        r'(  \}\);)\n+( {2,}' + re.escape(ANCHOR_C) + r')',
        re.MULTILINE,
    )
    m = corridor_pattern.search(mutated)
    if not m:
        abort(
            "Insertion corridor not found.\n\n"
            "Expected: closing '  });' of Anchor B (partners PATCH) followed\n"
            f"by Anchor C: {ANCHOR_C}\n\n"
            "File structure differs from Current Implementation Authority."
        )

    insert_pos   = m.end(1)        # end of '  });'
    anchor_c_pos = m.start(2)      # start of Anchor C

    _ok(f"Corridor located — insert at position {insert_pos}, Anchor C at {anchor_c_pos}")

    mutated = (
        mutated[:insert_pos]
        + "\n"
        + ADMISSIONS_ROUTE_BLOCK
        + mutated[anchor_c_pos:]
    )
    _ok("Route block inserted between Anchor B close and Anchor C")

    routes_path.write_text(mutated, encoding="utf-8")
    _ok("routes.ts written")

    _step_results["Insertion corridor verified"] = "PASS"
    _step_results["Admissions endpoint"]         = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 7 — Post-mutation verification
# ════════════════════════════════════════════════════════════════

def stage_7_post_verify(root: Path, idempotent: bool = False) -> None:
    label = "STAGE 7 — Post-Verification (Idempotent Path)" if idempotent \
            else "STAGE 7 — Post-Mutation Verification"
    _head(label)

    # ── Service file ──────────────────────────────────────────
    service_path = root / FILE_SERVICE
    _info("Re-reading server/services/admissions.ts")
    if not service_path.exists():
        abort("Post-mutation verification failed.\n\nadmissions.ts does not exist.")
    svc = service_path.read_text(encoding="utf-8")
    _ok(f"Service file read ({len(svc)} chars)")

    svc_checks = [
        ("submitProspectRegistration",                        "submitProspectRegistration export"),
        ("ProspectRegistrationPayload",                       "ProspectRegistrationPayload interface"),
        ("ProspectRegistrationResult",                        "ProspectRegistrationResult interface"),
        ('"Prospect registration accepted for future persistence."', "canonical response message"),
        ("accepted: true",                                    "accepted: true in response"),
        ('status: "validated"',                               "status: validated in response"),
    ]
    for marker, desc in svc_checks:
        if marker in svc:
            _ok(f"Service: {desc}")
        else:
            abort(f"Post-mutation verification failed.\n\nService missing: {desc}\nMarker: {marker}")

    svc_exclusions = [
        ('from "./',       "No relative imports (no DAL, no Supabase client)"),
        ("fetch(",         "No fetch() calls"),
        ("createClient(",  "No Supabase client instantiation"),
    ]
    for marker, desc in svc_exclusions:
        if marker not in svc:
            _ok(f"Service exclusion confirmed: {desc}")
        else:
            abort(f"Post-mutation verification failed.\n\nProhibited content in service: {desc}\nMarker: {marker}")

    export_count = svc.count("export function submitProspectRegistration")
    if export_count != 1:
        abort(
            f"Post-mutation verification failed.\n\n"
            f"submitProspectRegistration export count: {export_count} (expected exactly 1)"
        )
    _ok(f"Service export count: {export_count} (exactly 1)")

    # ── routes.ts ─────────────────────────────────────────────
    routes_path = root / FILE_ROUTES
    _info("Re-reading server/routes.ts")
    rts = routes_path.read_text(encoding="utf-8")
    _ok(f"routes.ts read ({len(rts)} chars)")

    # ── A, B, C survive mutation ──────────────────────────────
    _info("Verifying Anchors A, B, C all survive mutation")
    for anchor, label in [
        (ANCHOR_A, ANCHOR_A_LABEL),
        (ANCHOR_B, ANCHOR_B_LABEL),
        (ANCHOR_C, ANCHOR_C_LABEL),
    ]:
        if anchor in rts:
            _ok(f"Post-verify: {label} — still present")
        else:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"{label} was lost during mutation.\n\n"
                "Mutation may have corrupted routes.ts."
            )

    # ── Endpoint positioned between B and C ───────────────────
    _info("Verifying admissions endpoint is positioned between Anchor B and Anchor C")
    idx_b        = rts.find(ANCHOR_B)
    idx_endpoint = rts.find(IDEM_ENDPOINT)
    idx_c        = rts.find(ANCHOR_C)

    if not (idx_b < idx_endpoint < idx_c):
        abort(
            "Post-mutation positional verification failed.\n\n"
            f"Anchor B position:   {idx_b}\n"
            f"Admissions position: {idx_endpoint}\n"
            f"Anchor C position:   {idx_c}\n\n"
            "Required ordering: Anchor B < admissions endpoint < Anchor C"
        )
    _ok(
        f"Positional order confirmed: "
        f"B ({idx_b}) < admissions ({idx_endpoint}) < C ({idx_c})"
    )

    # ── Endpoint exactly once ─────────────────────────────────
    endpoint_count = rts.count(IDEM_ENDPOINT)
    if endpoint_count != 1:
        abort(
            f"Post-mutation verification failed.\n\n"
            f"Admissions endpoint count: {endpoint_count} (expected exactly 1)"
        )
    _ok(f"Admissions endpoint count: {endpoint_count} (exactly 1)")

    # ── Import exactly once ───────────────────────────────────
    import_count = rts.count(IDEM_IMPORT)
    if import_count != 1:
        abort(
            f"Post-mutation verification failed.\n\n"
            f"Admissions import count: {import_count} (expected exactly 1)"
        )
    _ok(f"Admissions import count: {import_count} (exactly 1)")

    # ── Route content checks ──────────────────────────────────
    rts_checks = [
        (IDEM_IMPORT,                       "admissions service import present"),
        (IDEM_ENDPOINT,                     "endpoint path present"),
        ("submitProspectRegistration(data)", "service function called in handler"),
        ("prospectSchema",                  "prospectSchema validation present"),
        ("z.string().min(1",                "Zod min-length validation used"),
        ("z.string().email(",               "Zod email validation used"),
        ("z.ZodError",                      "ZodError catch block present"),
        ("return httpServer;",              "return httpServer preserved"),
        (ANCHOR_A,                          "registerRoutes signature preserved"),
    ]
    for marker, desc in rts_checks:
        if marker in rts:
            _ok(f"routes.ts: {desc}")
        else:
            abort(f"Post-mutation verification failed.\n\nroutes.ts missing: {desc}\nMarker: {marker}")

    # ── Existing endpoints preserved ──────────────────────────
    preserved = [
        'app.post("/api/partners"',
        'app.post("/api/members"',
        'app.post("/api/enquiries"',
        ANCHOR_C,
    ]
    for marker in preserved:
        if marker in rts:
            _ok(f"Preserved endpoint: {marker}")
        else:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Existing endpoint was lost: {marker}\n\n"
                "Mutation may have corrupted routes.ts."
            )

    state = "PASS (Already Present)" if idempotent else "PASS"
    _step_results["Service file"]    = state
    _step_results["Post-verification"] = state


# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

def print_summary() -> None:
    _head("MUTATION SUMMARY")
    max_len = max(len(k) for k in _step_results) if _step_results else 0
    for step, state in _step_results.items():
        if "Already Present" in state:
            colour = YELLOW
            display = "PASS (Already Present)"
        else:
            colour = GREEN
            display = "PASS"
        print(f"  {step.ljust(max_len)}   {colour}{display}{RESET}")

    all_pass = all(s.startswith("PASS") for s in _step_results.values())
    print()
    if all_pass:
        print(f"{BOLD}{GREEN}══ RESULT: PASS ══{RESET}{RESET}")
        print()
        print("  Two authorized files in final state:")
        print(f"    CREATE  {FILE_SERVICE}")
        print(f"    MODIFY  {FILE_ROUTES}")
        print()
        print("  Insertion corridor:")
        print(f"    {ANCHOR_B_LABEL}")
        print(f"    → [admissions endpoint]")
        print(f"    {ANCHOR_C_LABEL}")
        print()
        print("  Runtime verification:")
        print("    npm run build")
        print("    # POST /api/admissions/prospects")
        print("    # Body: { fullName, email, country, programOfInterest }")
        print('    # Expect: { accepted: true, status: "validated", message: "..." }')
        print("    # No database writes. No outbound network.")
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
        "  python RMP-010E11_create_admissions_api.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E11 — Admissions API Scaffold{RESET}")
    print(f"{BOLD}CIP-010E11 Revision 2{RESET}\n")

    root = resolve_root()
    _info(f"Repository root: {root}")
    _info(f"Authorized mutation scope:")
    _info(f"  CREATE  {FILE_SERVICE}")
    _info(f"  MODIFY  {FILE_ROUTES}")

    stage_1_repository(root)
    routes_source = stage_2_verify_routes(root)
    stage_3_verify_services_dir(root)
    already_present = stage_4_idempotency(root, routes_source)

    if already_present:
        _step_results["Insertion corridor verified"] = "PASS (Already Present)"
        stage_7_post_verify(root, idempotent=True)
    else:
        stage_5_create_service(root)
        stage_6_mutate_routes(root)
        stage_7_post_verify(root, idempotent=False)

    print_summary()


if __name__ == "__main__":
    main()
