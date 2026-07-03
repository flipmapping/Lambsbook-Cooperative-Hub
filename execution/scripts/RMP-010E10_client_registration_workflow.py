#!/usr/bin/env python3
"""
RMP-010E10 — Prospect Registration Client Workflow
CIP-010E10 Revision 2

Authorized mutation scope: exactly one file.
  client/src/pages/ProspectRegistration.tsx

Adds:
  - client-side validation (fullName, email, country, programOfInterest)
  - isValid derived directly from form state (no useState for validation)
  - handleSubmit: e.preventDefault() → if (!isValid) return → setSubmitted(true)
  - Continue button: disabled={!isValid}, no additional click handler
  - Confirmation view replacing form after valid submit
  - Back to Growth via <Link href="/growth"> (canonical Wouter navigation)

No API calls. No backend. No validation libraries.
"""

import sys
from pathlib import Path
from typing import Optional

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
        f"RMP-010E10\n"
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

# Structural anchors verified before mutation (from uploaded source)
ANCHOR_INITIAL_STATE  = "const INITIAL_STATE: FormState = {"
ANCHOR_HANDLE_SUBMIT  = "const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {"
ANCHOR_E_PREVENT      = "e.preventDefault();"
ANCHOR_FORM_TAG       = "<form onSubmit={handleSubmit}"
ANCHOR_SUBMIT_BUTTON  = 'type="submit"'

# Idempotency markers — both present → already applied
IDEM_MARKER_SUBMITTED = "const [submitted, setSubmitted] = useState(false);"
IDEM_MARKER_LINK      = 'href="/growth"'

# ── Mutated file (Rev 2) ───────────────────────────────────────
# Corrections from Rev 1:
#   1. Link import uses double quotes (matches wouter convention in repo)
#   2. handleSubmit: if (!isValid) return; then setSubmitted(true)
#   3. isValid uses !== "" comparisons (spec contract)
#   4. Confirmation copy revised per spec
MUTATED_SOURCE = """\
import { useState } from 'react';
import { Link } from "wouter";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  programOfInterest: string;
}

const INITIAL_STATE: FormState = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  programOfInterest: '',
};

function isValidEmail(value: string): boolean {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());
}

export default function ProspectRegistration() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValid =
    form.fullName.trim() !== "" &&
    isValidEmail(form.email) &&
    form.country.trim() !== "" &&
    form.programOfInterest !== "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Prospect Registration Received
            </h1>
            <p className="mt-4 text-muted-foreground">
              Thank you for your interest.
            </p>
            <p className="mt-2 text-muted-foreground">
              Your information has been validated in this session.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Online submission will be available in a future release.
            </p>
            <Link
              href="/growth"
              className="mt-8 inline-block rounded-md border border-input bg-background px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
            >
              Back to Growth
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Prospect Registration
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete the form below to begin your admissions journey. Our team
            will be in touch within 5–7 business days.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 555 000 0000"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="text-sm font-medium text-foreground">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              autoComplete="country-name"
              value={form.country}
              onChange={handleChange}
              placeholder="Your country of residence"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="programOfInterest" className="text-sm font-medium text-foreground">
              Program of Interest
            </label>
            <select
              id="programOfInterest"
              name="programOfInterest"
              value={form.programOfInterest}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>Select a program</option>
              <option value="business-administration">Business Administration</option>
              <option value="finance">Finance</option>
              <option value="information-management">Information Management</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
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
    _step_results["Stage 1: Repository anchors"] = "PASS (Applied)"


# ════════════════════════════════════════════════════════════════
# STAGE 2 — Target file location and structural anchor verification
# ════════════════════════════════════════════════════════════════

def stage_2_locate_and_verify(root: Path) -> str:
    _head("STAGE 2 — Target File Location and Structural Anchor Verification")
    page_path = root / FILE_PAGE

    _info(f"Locating {FILE_PAGE}")
    if not page_path.exists():
        abort(
            f"Target file not found: {FILE_PAGE}\n\n"
            "ProspectRegistration.tsx must exist before this mutation.\n"
            "Run RMP-010E9 first."
        )

    source = page_path.read_text(encoding="utf-8")
    _ok(f"File located ({len(source)} chars)")

    anchors = [
        (ANCHOR_INITIAL_STATE, "INITIAL_STATE const block"),
        (ANCHOR_HANDLE_SUBMIT, "handleSubmit function"),
        (ANCHOR_E_PREVENT,     "e.preventDefault() call"),
        (ANCHOR_FORM_TAG,      "<form onSubmit={handleSubmit}>"),
        (ANCHOR_SUBMIT_BUTTON, 'type="submit" button'),
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

    _step_results["Stage 2: Structural anchors"] = "PASS (Applied)"
    return source


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency check
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(source: str) -> bool:
    """Returns True if already applied (skip mutation), False if mutation needed."""
    _head("STAGE 3 — Idempotency Check")

    has_submitted = IDEM_MARKER_SUBMITTED in source
    has_link      = IDEM_MARKER_LINK in source

    _info(f"submitted state present  → {has_submitted}")
    _info(f'href="/growth" present   → {has_link}')

    if has_submitted and has_link:
        _ok("Workflow already present — mutation not required")
        _step_results["Stage 3: Idempotency"] = "PASS (Already Present)"
        return True

    if has_submitted != has_link:
        abort(
            "Partial mutation detected.\n\n"
            f"submitted state present: {has_submitted}\n"
            f'href="/growth" present: {has_link}\n\n'
            "File is in an intermediate state. Manual review required."
        )

    _ok("Mutation not yet applied — proceeding")
    _step_results["Stage 3: Idempotency"] = "PASS (Applied)"
    return False


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Mutation
# ════════════════════════════════════════════════════════════════

def stage_4_mutate(root: Path) -> None:
    _head("STAGE 4 — Mutation")
    page_path = root / FILE_PAGE
    _info("Writing mutated ProspectRegistration.tsx")
    page_path.write_text(MUTATED_SOURCE, encoding="utf-8")
    _ok("File written")
    _step_results["Stage 4: Mutation"] = "PASS (Applied)"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-mutation verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    label = "STAGE 5 — Post-Verification (Idempotent Path)" if idempotent \
            else "STAGE 5 — Post-Mutation Verification"
    _head(label)

    page_path = root / FILE_PAGE
    _info("Re-reading file")
    written = page_path.read_text(encoding="utf-8")
    _ok(f"File re-read ({len(written)} chars)")

    # ── Preservation checks ───────────────────────────────────
    preservation_checks = [
        ("e.preventDefault();",              "preventDefault() preserved"),
        ("const INITIAL_STATE: FormState = {","INITIAL_STATE preserved"),
        ("<form onSubmit={handleSubmit}",     "form tag preserved"),
        ('type="submit"',                    "submit button preserved"),
        ("import { useState } from 'react';","useState import preserved"),
        ("const handleChange",               "handleChange preserved"),
    ]
    for marker, desc in preservation_checks:
        if marker in written:
            _ok(f"Post-verify: {desc}")
        else:
            abort(f"Post-mutation verification failed.\n\nPreserved content missing: {desc}\nMarker: {marker}")

    # ── Addition checks ───────────────────────────────────────
    addition_checks = [
        ('import { Link } from "wouter";',            "Link imported from wouter (double quotes)"),
        (IDEM_MARKER_SUBMITTED,                       "submitted state declared"),
        ("const isValid =",                           "isValid derived value present"),
        ('form.fullName.trim() !== ""',               "fullName validation (trim !== \"\")"),
        ("isValidEmail(form.email)",                  "email validation"),
        ('form.country.trim() !== ""',                "country validation (trim !== \"\")"),
        ('form.programOfInterest !== ""',             "programOfInterest validation (!== \"\")"),
        ("if (!isValid) {",                           "if (!isValid) guard in handleSubmit"),
        ("setSubmitted(true);",                       "setSubmitted(true) present"),
        ("disabled={!isValid}",                       "Continue disabled={!isValid}"),
        ("if (submitted) {",                          "conditional confirmation branch"),
        ("Prospect Registration Received",            "confirmation heading"),
        ("Thank you for your interest",               "confirmation thank-you line"),
        ("validated in this session",                 "revised confirmation copy — session wording"),
        ("Online submission will be available",       "revised confirmation copy — future release"),
        (IDEM_MARKER_LINK,                            'href="/growth" present'),
        ("Back to Growth",                            "Back to Growth label"),
    ]
    for marker, desc in addition_checks:
        if marker in written:
            _ok(f"Post-verify: {desc}")
        else:
            abort(f"Post-mutation verification failed.\n\nExpected content missing: {desc}\nMarker: {marker}")

    # ── Semantic order check: if (!isValid) return before setSubmitted ────
    _info("Verifying semantic order: if (!isValid) return precedes setSubmitted(true)")
    idx_guard  = written.find("if (!isValid) {")
    idx_submit = written.find("setSubmitted(true);")
    if idx_guard == -1 or idx_submit == -1 or idx_guard >= idx_submit:
        abort(
            "Post-mutation verification failed.\n\n"
            "Semantic order violation:\n"
            "  'if (!isValid) {' must appear before 'setSubmitted(true);'\n\n"
            f"  if (!isValid) position: {idx_guard}\n"
            f"  setSubmitted(true) position: {idx_submit}"
        )
    _ok("Post-verify: if (!isValid) guard precedes setSubmitted(true)")

    # ── Old wording must NOT be present ──────────────────────
    _info("Verifying old confirmation copy is absent")
    if "recorded locally" in written:
        abort(
            "Post-mutation verification failed.\n\n"
            "Old confirmation copy still present: 'recorded locally'\n"
            "Expected: 'validated in this session'"
        )
    _ok("Post-verify: old 'recorded locally' copy absent")

    # ── Exact-count checks ────────────────────────────────────
    count_checks = [
        ('import { Link } from "wouter";',            1, "Link import"),
        (IDEM_MARKER_SUBMITTED,                       1, "submitted state declaration"),
        ("setSubmitted(true);",                       1, "setSubmitted(true) call"),
        (IDEM_MARKER_LINK,                            1, 'href="/growth"'),
    ]
    for marker, expected, desc in count_checks:
        count = written.count(marker)
        if count != expected:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"{desc} count: {count} (expected exactly {expected})\n"
                f"Marker: {marker}"
            )
        _ok(f"Post-verify: {desc} count = {count} (exactly {expected})")

    # ── Exclusion checks ──────────────────────────────────────
    exclusions = [
        ("fetch(",    "No fetch() calls"),
        ("axios",     "No axios"),
        ("supabase",  "No Supabase"),
        ("api/",      "No API endpoint references"),
        ("setLocation", "No imperative navigation"),
    ]
    for marker, desc in exclusions:
        if marker not in written:
            _ok(f"Exclusion confirmed: {desc}")
        else:
            abort(f"Post-mutation verification failed.\n\nProhibited content found: {desc}\nMarker: {marker}")

    state_key = "Stage 5: Post-mutation verification"
    _step_results[state_key] = "PASS (Already Present)" if idempotent else "PASS (Applied)"


# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

def print_summary() -> None:
    _head("MUTATION SUMMARY")
    max_len = max(len(k) for k in _step_results) if _step_results else 0
    for step, state in _step_results.items():
        colour = YELLOW if "Already Present" in state else GREEN
        print(f"  {step.ljust(max_len)}   {colour}{state}{RESET}")

    all_pass = all(s.startswith("PASS") for s in _step_results.values())
    print()
    if all_pass:
        print(f"{BOLD}{GREEN}══ RESULT: PASS ══{RESET}{RESET}")
        print()
        print(f"  One authorized file in final state:")
        print(f"    {FILE_PAGE}")
        print()
        print("  Runtime verification:")
        print("    npm run build")
        print("    # Open /hub/prospect-registration")
        print("    # Leave fields blank → Continue disabled")
        print("    # Complete all required fields → Continue enables")
        print("    # Submit → confirmation panel appears (no network request)")
        print("    # Click 'Back to Growth' → navigates to /growth")
        print("    # Refresh → resets to blank form (no persistence)")
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
        "  python RMP-010E10_client_registration_workflow.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E10 — Prospect Registration Client Workflow{RESET}")
    print(f"{BOLD}CIP-010E10 Revision 2{RESET}\n")

    root = resolve_root()
    _info(f"Repository root: {root}")
    _info(f"Authorized mutation scope: {FILE_PAGE}")

    stage_1_repository(root)
    source = stage_2_locate_and_verify(root)
    already_present = stage_3_idempotency(source)

    if already_present:
        stage_5_post_verify(root, idempotent=True)
    else:
        stage_4_mutate(root)
        stage_5_post_verify(root, idempotent=False)

    print_summary()


if __name__ == "__main__":
    main()
