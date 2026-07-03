#!/usr/bin/env python3
"""
RMP-010E12 — Client/API Contract Convergence
EXEC-STD-001 Repository Convergence Brief — Revision 2

Authorized mutation scope: exactly one file.
  client/src/pages/ProspectRegistration.tsx

Bounded changes from Repository Truth (attached ProspectRegistration.tsx):
  - Add loading state
  - Add submitError state
  - Replace local setSubmitted(true) with POST /api/admissions/prospects → confirmation
  - Replace disabled={!isValid} with disabled={loading || !isValid}
  - Replace "Continue" with {loading ? "Submitting..." : "Continue"}
  - Insert one conditional error message above the submit button

Stage 4 performs bounded string replacements — does not overwrite the file.
Each replacement is individually anchored and exactly-one verified before and after.

No axios. No React Query. No queryClient. No Supabase. No DAL. No RPC.
No persistence. No localStorage. No sessionStorage. No redesign.
No styling changes. No navigation changes.
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
        f"RMP-010E12\n"
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

# ── Constants ──────────────────────────────────────────────────
REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_PAGE = Path("client/src/pages/ProspectRegistration.tsx")

# Stage 2 structural anchors (from Repository Truth)
# ANCHOR_HANDLE_SUBMIT matches both sync (Repository Truth) and async (post-mutation)
ANCHOR_HANDLE_SUBMIT = "const handleSubmit ="
ANCHOR_SET_SUBMITTED = "setSubmitted(true);"
ANCHOR_IF_SUBMITTED  = "if (submitted) {"
ANCHOR_DISABLED      = "disabled={"   # present in both disabled={!isValid} and disabled={loading || !isValid}

# Idempotency markers — all three must be present for Already Present
IDEM_LOADING      = "const [loading, setLoading] = useState(false);"
IDEM_SUBMIT_ERROR = "const [submitError, setSubmitError] = useState<string | null>(null);"
IDEM_FETCH        = 'fetch("/api/admissions/prospects"'

# ════════════════════════════════════════════════════════════════
# BOUNDED MUTATION OPERATIONS
#
# Each operation is a (search, replace, label) triple.
# Stage 4 applies them in sequence. For each:
#   1. Verify search exists exactly once in the working copy.
#   2. Apply replacement.
#   3. Verify replacement string now present exactly once.
# Abort immediately on zero or multiple matches at either check.
# No disk write occurs until all operations pass in-memory.
# ════════════════════════════════════════════════════════════════

# Op 1 — Add loading + submitError state after submitted state
_OP1_SEARCH = "const [submitted, setSubmitted] = useState(false);"
_OP1_REPLACE = (
    "const [submitted, setSubmitted] = useState(false);\n"
    "  const [loading, setLoading] = useState(false);\n"
    "  const [submitError, setSubmitError] = useState<string | null>(null);"
)
_OP1_LABEL = "Add loading + submitError state declarations"

# Op 2 — Replace entire sync handleSubmit body with async fetch POST
# Search spans the complete declaration through its closing semicolon (unique in file).
_OP2_SEARCH = (
    "const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {\n"
    "    e.preventDefault();\n"
    "\n"
    "    if (!isValid) {\n"
    "      return;\n"
    "    }\n"
    "\n"
    "    setSubmitted(true);\n"
    "  };"
)
_OP2_REPLACE = (
    "const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {\n"
    "    e.preventDefault();\n"
    "\n"
    "    if (!isValid) {\n"
    "      return;\n"
    "    }\n"
    "\n"
    "    setLoading(true);\n"
    "    setSubmitError(null);\n"
    "\n"
    "    try {\n"
    '      const response = await fetch("/api/admissions/prospects", {\n'
    '        method: "POST",\n'
    '        headers: { "Content-Type": "application/json" },\n'
    "        body: JSON.stringify({\n"
    "          fullName:          form.fullName,\n"
    "          email:             form.email,\n"
    "          phone:             form.phone,\n"
    "          country:           form.country,\n"
    "          programOfInterest: form.programOfInterest,\n"
    "        }),\n"
    "      });\n"
    "\n"
    "      if (!response.ok) {\n"
    "        const body = await response.json().catch(() => ({}));\n"
    "        setSubmitError(\n"
    "          (body as { error?: string }).error ??\n"
    '            "Submission failed. Please try again."\n'
    "        );\n"
    "        return;\n"
    "      }\n"
    "\n"
    "      setSubmitted(true);\n"
    "    } catch {\n"
    '      setSubmitError("Network error. Please check your connection and try again.");\n'
    "    } finally {\n"
    "      setLoading(false);\n"
    "    }\n"
    "  };"
)
_OP2_LABEL = "Replace sync handleSubmit with async fetch POST body"

# Op 3 — disabled={!isValid} → disabled={loading || !isValid}
_OP3_SEARCH  = "    disabled={!isValid}"
_OP3_REPLACE = "    disabled={loading || !isValid}"
_OP3_LABEL   = "Replace disabled={!isValid} with disabled={loading || !isValid}"

# Op 4 — Replace static "Continue" label with loading-conditional
_OP4_SEARCH  = "            Continue"
_OP4_REPLACE = '            {loading ? "Submitting..." : "Continue"}'
_OP4_LABEL   = "Replace button label with loading-conditional"

# Op 5 — Insert conditional submitError display above <button
_OP5_SEARCH = "          <button"
_OP5_REPLACE = (
    "          {submitError && (\n"
    "            <p role=\"alert\" className=\"text-sm text-destructive\">\n"
    "              {submitError}\n"
    "            </p>\n"
    "          )}\n"
    "\n"
    "          <button"
)
_OP5_LABEL = "Insert conditional submitError message above submit button"

# Ordered operation list
MUTATIONS: list[tuple[str, str, str]] = [
    (_OP1_SEARCH, _OP1_REPLACE, _OP1_LABEL),
    (_OP2_SEARCH, _OP2_REPLACE, _OP2_LABEL),
    (_OP3_SEARCH, _OP3_REPLACE, _OP3_LABEL),
    (_OP4_SEARCH, _OP4_REPLACE, _OP4_LABEL),
    (_OP5_SEARCH, _OP5_REPLACE, _OP5_LABEL),
]


# ════════════════════════════════════════════════════════════════
# STAGE 1 — Repository Anchor Verification
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
# STAGE 2 — Structural Anchor Verification
# ════════════════════════════════════════════════════════════════

def stage_2_structural(root: Path) -> str:
    _head("STAGE 2 — Structural Anchor Verification")

    page_path = root / FILE_PAGE
    _info(f"Locating {FILE_PAGE}")
    if not page_path.exists():
        abort(
            f"Target file not found: {FILE_PAGE}\n\n"
            "ProspectRegistration.tsx must exist before this mutation.\n"
            "Verify RMP-010E10 has been applied."
        )
    source = page_path.read_text(encoding="utf-8")
    _ok(f"File located ({len(source)} chars)")

    anchors = [
        (ANCHOR_HANDLE_SUBMIT, "handleSubmit function declaration"),
        (ANCHOR_SET_SUBMITTED, "setSubmitted(true) present"),
        (ANCHOR_IF_SUBMITTED,  "if (submitted) confirmation branch"),
        (ANCHOR_DISABLED,      "disabled= attribute on submit button"),
    ]
    for marker, label in anchors:
        _info(f"Verifying anchor: {label}")
        if marker not in source:
            abort(
                f"Structural anchor missing: {label}\n\n"
                f"Expected: {marker}\n\n"
                f"File structure differs from Current Implementation Authority."
            )
        _ok(f"Anchor confirmed: {label}")

    _step_results["Structural anchors"] = "PASS"
    return source


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# Three states: Clean → Proceed | Already Present → skip | Partial → abort
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(source: str) -> bool:
    """Returns True if Already Present (skip mutation), False if Clean (proceed)."""
    _head("STAGE 3 — Idempotency Verification")

    has_loading      = IDEM_LOADING in source
    has_submit_error = IDEM_SUBMIT_ERROR in source
    has_fetch        = IDEM_FETCH in source

    _info(f"loading state present      → {has_loading}")
    _info(f"submitError state present  → {has_submit_error}")
    _info(f"fetch API call present     → {has_fetch}")

    all_present = has_loading and has_submit_error and has_fetch
    any_present = has_loading or has_submit_error or has_fetch

    if all_present:
        _ok("Client/API convergence already applied — mutation not required")
        _step_results["Client/API convergence"] = "PASS (Already Present)"
        return True

    if any_present:
        present = []
        absent  = []
        for name, val in [
            ("loading state",      has_loading),
            ("submitError state",  has_submit_error),
            ("fetch API call",     has_fetch),
        ]:
            (present if val else absent).append(name)
        abort(
            "Partial client/API convergence detected.\n\n"
            "Present:\n" + "".join(f"  {p}\n" for p in present) +
            "\nAbsent:\n"  + "".join(f"  {a}\n" for a in absent) +
            "\nManual review required."
        )

    _ok("Clean state confirmed — proceeding with mutation")
    return False


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Repository Mutation (bounded string replacements)
#
# Sequence:
#   read repository
#   ↓ for each operation:
#     verify search anchor exists exactly once
#     ↓ apply replacement
#     ↓ verify replacement present exactly once
#   write repository
#   ↓ re-read
#   ↓ verify round-trip
# ════════════════════════════════════════════════════════════════

def _apply_one(working: str, search: str, replace: str, label: str) -> str:
    """
    Apply one bounded replacement.
    Aborts if search is absent or ambiguous.
    Aborts if replacement is absent or duplicated after apply.
    Returns mutated string. No file I/O.
    """
    pre_count = working.count(search)
    if pre_count == 0:
        abort(
            f"Mutation anchor not found: {label}\n\n"
            f"Expected exactly one occurrence of:\n"
            f"{search[:120].strip()}\n\n"
            f"Repository state differs from Current Implementation Authority."
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


def stage_4_mutate(root: Path) -> None:
    _head("STAGE 4 — Repository Mutation (bounded string replacements)")
    page_path = root / FILE_PAGE

    _info("Reading current repository state")
    working = page_path.read_text(encoding="utf-8")
    _ok(f"Source read ({len(working)} chars)")

    for i, (search, replace, label) in enumerate(MUTATIONS, 1):
        _info(f"Op {i}/{len(MUTATIONS)}: {label}")
        _info(f"  Anchor: {search[:60].strip()!r}...")
        working = _apply_one(working, search, replace, label)
        _ok(f"  Op {i} applied and verified (exactly 1 occurrence)")

    _info("Writing mutated file to disk")
    page_path.write_text(working, encoding="utf-8")
    _ok("File written")

    _info("Re-reading from disk for round-trip verification")
    on_disk = page_path.read_text(encoding="utf-8")
    if on_disk != working:
        abort(
            "Round-trip verification failed.\n\n"
            "File on disk differs from expected working copy.\n"
            "Encoding or write error."
        )
    _ok(f"Round-trip verified ({len(on_disk)} chars on disk)")

    _step_results["Client/API convergence"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    label = "STAGE 5 — Post-Verification (Idempotent Path)" if idempotent \
            else "STAGE 5 — Post-Mutation Verification"
    _head(label)

    page_path = root / FILE_PAGE
    _info("Re-reading file")
    written = page_path.read_text(encoding="utf-8")
    _ok(f"File re-read ({len(written)} chars)")

    # ── Required: exactly one occurrence ─────────────────────
    exact_one_checks = [
        (IDEM_FETCH,                        'fetch("/api/admissions/prospects")'),
        (IDEM_LOADING,                      "loading state declaration"),
        (IDEM_SUBMIT_ERROR,                 "submitError state declaration"),
        ("setSubmitted(true);",             "setSubmitted(true)"),
        ("disabled={loading || !isValid}",  "disabled={loading || !isValid}"),
        ('"Submitting..."',                 '"Submitting..."'),
    ]
    for marker, desc in exact_one_checks:
        count = written.count(marker)
        if count == 1:
            _ok(f"Post-verify [{desc}] — exactly once")
        elif count == 0:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Required content missing: {desc}\n"
                f"Marker: {marker}"
            )
        else:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Duplicate content: {desc} (count: {count}, expected 1)\n"
                f"Marker: {marker}"
            )

    # ── Correction 3: API contract ────────────────────────────
    _info("Verifying API contract (fetch POST with Content-Type: application/json)")
    api_contract_checks = [
        ('fetch("/api/admissions/prospects"', "fetch to /api/admissions/prospects"),
        ('method: "POST"',                   'method: "POST"'),
        ('"Content-Type"',                   "Content-Type header"),
        ('"application/json"',               "application/json value"),
    ]
    for marker, desc in api_contract_checks:
        if marker in written:
            _ok(f"API contract: {desc}")
        else:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"API contract missing: {desc}\n"
                f"Marker: {marker}"
            )

    # ── Correction 4: loading lifecycle presence ──────────────
    _info("Verifying loading lifecycle markers")
    for marker, desc in [
        ("setLoading(true);",  "setLoading(true)"),
        (IDEM_FETCH,           "fetch() call"),
        ("setLoading(false);", "setLoading(false)"),
    ]:
        if marker in written:
            _ok(f"Loading lifecycle: {desc}")
        else:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Loading lifecycle missing: {desc}\n"
                f"Marker: {marker}"
            )

    # ── Correction 4: semantic ordering ──────────────────────
    _info("Verifying semantic order: "
          "preventDefault → setLoading(true) → fetch → setSubmitted(true) → setLoading(false)")
    order_markers = [
        ("e.preventDefault();",               "preventDefault"),
        ("setLoading(true);",                 "setLoading(true)"),
        ('fetch("/api/admissions/prospects"', "fetch"),
        ("setSubmitted(true);",               "setSubmitted(true)"),
        ("setLoading(false);",                "setLoading(false)"),
    ]
    positions: list[tuple[int, str]] = []
    for marker, desc in order_markers:
        idx = written.find(marker)
        if idx == -1:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Semantic ordering: marker not found: {desc}\n"
                f"Marker: {marker}"
            )
        positions.append((idx, desc))

    for i in range(len(positions) - 1):
        pos_a, label_a = positions[i]
        pos_b, label_b = positions[i + 1]
        if pos_a >= pos_b:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Semantic ordering violation.\n\n"
                f"Expected: {label_a} ({pos_a}) < {label_b} ({pos_b})\n\n"
                f"Required order: "
                f"preventDefault → setLoading(true) → fetch → setSubmitted(true) → setLoading(false)"
            )
    _ok(
        "Semantic order confirmed: "
        + " → ".join(f"{desc}({pos})" for pos, desc in positions)
    )

    # ── Correction 5: error lifecycle ────────────────────────
    _info("Verifying error lifecycle")
    for marker, desc in [
        ("setSubmitError(null);", "setSubmitError(null) — reset on each submit"),
        ("setSubmitError(",       "setSubmitError( — error assignment present"),
        ("{submitError &&",       "{submitError && — conditional render present"),
    ]:
        if marker in written:
            _ok(f"Error lifecycle: {desc}")
        else:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Error lifecycle missing: {desc}\n"
                f"Marker: {marker}"
            )

    # ── Correction 7: response.ok before setSubmitted(true) ──
    _info("Verifying confirmation flow: response.ok precedes setSubmitted(true)")
    idx_ok     = written.find("response.ok")
    idx_submit = written.find("setSubmitted(true);")
    if idx_ok == -1:
        abort(
            "Post-mutation verification failed.\n\n"
            "response.ok check not found.\n"
            "setSubmitted(true) must be guarded by response.ok."
        )
    if idx_ok >= idx_submit:
        abort(
            "Post-mutation verification failed.\n\n"
            f"Confirmation flow ordering violation.\n\n"
            f"response.ok position:        {idx_ok}\n"
            f"setSubmitted(true) position: {idx_submit}\n\n"
            "response.ok must appear before setSubmitted(true)."
        )
    _ok(f"Confirmation flow: response.ok ({idx_ok}) precedes setSubmitted(true) ({idx_submit})")

    # ── Correction 8: preserved UI ───────────────────────────
    _info("Verifying preserved UI content")
    preserved_checks = [
        ("e.preventDefault();",                 "preventDefault() preserved"),
        ("if (submitted) {",                    "confirmation branch preserved"),
        ('href="/growth"',                      "Back to Growth link preserved"),
        ("Prospect Registration Received",      "confirmation heading preserved"),
        ("Back to Growth",                      "Back to Growth label preserved"),
        ("Your information has been validated", "confirmation copy preserved"),
        ("import { useState } from 'react';",   "useState import preserved"),
        ('import { Link } from "wouter";',      "Link import preserved"),
        ("const isValid =",                     "isValid derived value preserved"),
        ("<form onSubmit={handleSubmit}",        "form submission handler preserved"),
        ("const INITIAL_STATE",                 "INITIAL_STATE preserved"),
        ("function isValidEmail",               "isValidEmail preserved"),
        ("const handleChange",                  "handleChange preserved"),
    ]
    for marker, desc in preserved_checks:
        if marker in written:
            _ok(f"Preserved: {desc}")
        else:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Preserved content missing: {desc}\n"
                f"Marker: {marker}"
            )

    # ── Forbidden constructs absent ───────────────────────────
    _info("Verifying forbidden constructs absent")
    forbidden_checks = [
        ("axios",          "No axios"),
        ("queryClient",    "No queryClient"),
        ("React Query",    "No React Query"),
        ("useQuery",       "No useQuery"),
        ("useMutation",    "No useMutation"),
        ("supabase",       "No Supabase"),
        ("localStorage",   "No localStorage"),
        ("sessionStorage", "No sessionStorage"),
    ]
    for marker, desc in forbidden_checks:
        if marker not in written:
            _ok(f"Exclusion confirmed: {desc}")
        else:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Forbidden construct present: {desc}\n"
                f"Marker: {marker}"
            )

    state = "PASS (Already Present)" if idempotent else "PASS"
    _step_results["Post-verification"] = state


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
        print("  One authorized file in final state:")
        print(f"    {FILE_PAGE}")
        print()
        print("  Build and run:")
        print("    npm run build")
        print("    npm run dev")
        print()
        print("  Runtime acceptance checklist:")
        print("    [ ] /hub/prospect-registration loads without errors")
        print("    [ ] Continue button disabled when required fields are empty")
        print("    [ ] Continue button enabled when fullName, email, country,")
        print("        and programOfInterest are all valid")
        print("    [ ] Submitting form sends POST /api/admissions/prospects")
        print("    [ ] Button shows 'Submitting...' during request")
        print("    [ ] Button disabled during loading")
        print("    [ ] On success: confirmation panel appears")
        print("    [ ] On API error: error message appears above button")
        print("    [ ] On network error: error message appears above button")
        print("    [ ] 'Back to Growth' navigates to /growth")
        print("    [ ] Refreshing page resets form (no persistence)")
        print("    [ ] No console errors from application code")
        print("    [ ] No unauthorized network requests")
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
        "  python RMP-010E12_client_api_contract_convergence.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E12 — Client/API Contract Convergence{RESET}")
    print(f"{BOLD}EXEC-STD-001 Repository Convergence Brief — Revision 2{RESET}\n")

    root = resolve_root()
    _info(f"Repository root: {root}")
    _info(f"Authorized mutation scope: {FILE_PAGE}")

    stage_1_repository(root)
    source = stage_2_structural(root)
    already_present = stage_3_idempotency(source)

    if already_present:
        stage_5_post_verify(root, idempotent=True)
    else:
        stage_4_mutate(root)
        stage_5_post_verify(root, idempotent=False)

    print_summary()


if __name__ == "__main__":
    main()