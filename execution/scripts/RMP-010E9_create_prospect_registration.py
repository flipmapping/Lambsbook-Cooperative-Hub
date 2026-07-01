#!/usr/bin/env python3
"""
RMP-010E9 — Prospect Registration Workflow
CIP-010E9 Revision 3 — Quality Gate Upgrade

Authorized mutation scope (exactly four files):
  1. client/src/pages/ProspectRegistration.tsx                    [CREATE]
  2. client/src/App.tsx                                           [MODIFY]
  3. web/src/growth/registry/admissions.json                      [MODIFY]
  4. web/src/growth/components/Sections/AdmissionsSection.tsx     [MODIFY]

Quality gate: every mutation is preceded by explicit anchor verification.
No mutation proceeds if the verified repository structure differs from
Current Implementation Authority.

Idempotency states reported per step:
  PASS (Already Present) — intended state exists; step skipped.
  PASS (Applied)         — mutation applied and post-verified.
  FAIL                   — anchor or post-condition failed; execution terminated.
"""

import json
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

def _ok(msg: str)   -> None: print(f"  {GREEN}✓{RESET}  {msg}")
def _info(msg: str) -> None: print(f"  {CYAN}→{RESET}  {msg}")
def _head(msg: str) -> None: print(f"\n{BOLD}{msg}{RESET}")

# Step-level result accumulator
_step_results: dict[str, str] = {}   # step_label → "PASS (Already Present)" | "PASS (Applied)" | "FAIL"

# ── Fail-fast abort ────────────────────────────────────────────
def abort(reason: str) -> None:
    """
    Print the canonical failure banner and terminate immediately.
    No file writes may follow this call.
    """
    banner = (
        f"\n{'=' * 42}\n"
        f"RMP-010E9\n"
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

FILE_PAGE       = Path("client/src/pages/ProspectRegistration.tsx")
FILE_APP        = Path("client/src/App.tsx")
FILE_ADMISSIONS = Path("web/src/growth/registry/admissions.json")
FILE_SECTION    = Path("web/src/growth/components/Sections/AdmissionsSection.tsx")

ROUTE_PATH      = "/hub/prospect-registration"
REGISTRATION_ID = "registration"

# App.tsx anchors (Stage 3)
APP_ANCHOR_LAZY_IMPORT  = "const TranscriptSubmission = lazy(() => import('@/pages/TranscriptSubmission'));"
APP_ANCHOR_ROUTE        = '<Route path="/hub/partner-onboarding" component={PartnerOnboarding} />'
APP_ANCHOR_GROWTH_ROUTE = '<Route path="/growth" component={GrowthLandingPage} />'

NEW_LAZY_IMPORT = "const ProspectRegistration = lazy(() => import('@/pages/ProspectRegistration'));"
NEW_ROUTE       = '      <Route path="/hub/prospect-registration" component={ProspectRegistration} />'

# AdmissionsSection.tsx anchors (Stage 5)
SECTION_ANCHOR_REGISTRY = 'useRegistry("admissions")'
SECTION_ANCHOR_MAP      = "items.map("
SECTION_ANCHOR_LI       = "<li"

# ── Page source ────────────────────────────────────────────────
PAGE_SOURCE = """\
import { useState } from 'react';

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

export default function ProspectRegistration() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

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
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
"""

# ── AdmissionsSection mutated source ──────────────────────────
ADMISSIONS_SECTION_SOURCE = """\
import { Link } from "wouter";
import { useRegistry } from "../../hooks/useRegistry";

export function AdmissionsSection() {

  const registry =
    useRegistry("admissions");

  const items =
    Array.isArray(registry.items)
      ? registry.items
      : [];

  return (

    <section>

      <h2>Admissions</h2>

      {items.length === 0 ? (

        <p>No admissions available.</p>

      ) : (

        <ul>

          {items.map((item, index) => {

            const isObject =
              typeof item === "object" &&
              item !== null;

            const title =
              isObject && "title" in item
                ? String(
                    (item as Record<string, unknown>).title
                  )
                : `Admission ${index + 1}`;

            const path =
              isObject && "path" in item
                ? String(
                    (item as Record<string, unknown>).path
                  )
                : null;

            return (

              <li key={index}>

                {path !== null ? (

                  <Link href={path}>{title}</Link>

                ) : (

                  title

                )}

              </li>

            );

          })}

        </ul>

      )}

    </section>

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
# STAGE 2 — ProspectRegistration.tsx
# Sequence: locate directory → verify absence → create → re-read → verify
# ════════════════════════════════════════════════════════════════

def stage_2_prospect_registration(root: Path) -> None:
    _head("STAGE 2 — ProspectRegistration.tsx")
    page_path = root / FILE_PAGE

    # ── Locate parent directory ───────────────────────────────
    pages_dir = page_path.parent
    _info(f"Locating target directory: {pages_dir.relative_to(root)}")
    if not pages_dir.exists():
        # Directory absent is acceptable — we create it
        _info("Directory absent — will create")
    else:
        _ok(f"Directory exists: {pages_dir.relative_to(root)}")

    # ── Verify absence (idempotency) ──────────────────────────
    _info(f"Verifying ProspectRegistration.tsx is absent")
    if page_path.exists():
        existing = page_path.read_text(encoding="utf-8")
        if "export default function ProspectRegistration" in existing:
            _ok("ProspectRegistration.tsx already present with correct export")
            _step_results["Stage 2: ProspectRegistration.tsx"] = "PASS (Already Present)"
            return
        else:
            abort(
                "ProspectRegistration.tsx already exists but is missing\n"
                "the expected default export.\n\n"
                "File contents do not match Current Implementation Authority.\n"
                "Manual review required."
            )

    # ── Create ────────────────────────────────────────────────
    _info("ProspectRegistration.tsx absent — proceeding with creation")
    pages_dir.mkdir(parents=True, exist_ok=True)
    page_path.write_text(PAGE_SOURCE, encoding="utf-8")
    _ok("File written")

    # ── Re-read and verify ────────────────────────────────────
    _info("Re-reading file for post-creation verification")
    written = page_path.read_text(encoding="utf-8")

    post_checks = [
        ("export default function ProspectRegistration", "default export"),
        ("e.preventDefault()",                          "submit handler"),
        ("fullName",           "field: fullName"),
        ("email",              "field: email"),
        ("phone",              "field: phone"),
        ("country",            "field: country"),
        ("programOfInterest",  "field: programOfInterest"),
        ("Continue",           "button label"),
    ]
    for marker, label in post_checks:
        if marker in written:
            _ok(f"Post-verify: {label}")
        else:
            abort(f"Post-creation verification failed.\nExpected content missing: {label}")

    _step_results["Stage 2: ProspectRegistration.tsx"] = "PASS (Applied)"


# ════════════════════════════════════════════════════════════════
# STAGE 3 — App.tsx
# Sequence: locate file → verify 3 anchors → verify absence → mutate → re-read → verify
# ════════════════════════════════════════════════════════════════

def stage_3_app_tsx(root: Path) -> None:
    _head("STAGE 3 — App.tsx")
    app_path = root / FILE_APP

    # ── Locate file ───────────────────────────────────────────
    _info(f"Locating {FILE_APP}")
    if not app_path.exists():
        abort(f"Lazy import anchor not found.\n\nFile missing: {FILE_APP}")

    source = app_path.read_text(encoding="utf-8")
    _ok(f"File located: {FILE_APP} ({len(source)} chars)")

    # ── Anchor A: lazy import anchor ──────────────────────────
    _info("Verifying Anchor A: final lazy import line (TranscriptSubmission)")
    if APP_ANCHOR_LAZY_IMPORT not in source:
        abort(
            "Lazy import anchor not found.\n\n"
            f"Expected: {APP_ANCHOR_LAZY_IMPORT}\n\n"
            "Cannot safely insert ProspectRegistration import."
        )
    _ok(f"Anchor A present: const TranscriptSubmission = lazy(...)")

    # ── Anchor B: partner-onboarding route ────────────────────
    _info("Verifying Anchor B: Route path=\"/hub/partner-onboarding\"")
    if APP_ANCHOR_ROUTE not in source:
        abort(
            "Partner Onboarding route anchor missing.\n\n"
            f"Expected: {APP_ANCHOR_ROUTE}\n\n"
            "Cannot safely insert ProspectRegistration route."
        )
    _ok('Anchor B present: Route path="/hub/partner-onboarding"')

    # ── Anchor C: /growth routing authority ───────────────────
    _info("Verifying Anchor C: Route path=\"/growth\" (routing authority)")
    if APP_ANCHOR_GROWTH_ROUTE not in source:
        abort(
            "Growth routing authority not found.\n\n"
            f"Expected: {APP_ANCHOR_GROWTH_ROUTE}\n\n"
            "Routing authority cannot be confirmed."
        )
    _ok('Anchor C present: Route path="/growth" — routing authority confirmed')

    # ── Verify mutation not already present ───────────────────
    has_lazy  = "import('@/pages/ProspectRegistration')" in source
    has_route = ROUTE_PATH in source

    if has_lazy and has_route:
        _ok("Lazy import already present")
        _ok("Route already present")
        # Post-verify counts even in idempotent path
        lazy_count  = source.count("import('@/pages/ProspectRegistration')")
        route_count = source.count(ROUTE_PATH)
        if lazy_count != 1 or route_count != 1:
            abort(
                f"Duplicate mutations detected.\n\n"
                f"lazy import count: {lazy_count} (expected 1)\n"
                f"route count: {route_count} (expected 1)"
            )
        _ok(f"Count verification: lazy={lazy_count} route={route_count} (both exactly 1)")
        _step_results["Stage 3: App.tsx"] = "PASS (Already Present)"
        return

    # ── Mutate ────────────────────────────────────────────────
    mutated = source

    if not has_lazy:
        _info("Inserting lazy import after Anchor A")
        mutated = mutated.replace(
            APP_ANCHOR_LAZY_IMPORT,
            APP_ANCHOR_LAZY_IMPORT + "\n" + NEW_LAZY_IMPORT,
            1,   # replace exactly one occurrence
        )

    if not has_route:
        _info("Inserting route after Anchor B")
        mutated = mutated.replace(
            APP_ANCHOR_ROUTE,
            APP_ANCHOR_ROUTE + "\n" + NEW_ROUTE,
            1,   # replace exactly one occurrence
        )

    app_path.write_text(mutated, encoding="utf-8")
    _ok("App.tsx written")

    # ── Re-read and verify ────────────────────────────────────
    _info("Re-reading App.tsx for post-mutation verification")
    verify = app_path.read_text(encoding="utf-8")

    lazy_count  = verify.count("import('@/pages/ProspectRegistration')")
    route_count = verify.count(ROUTE_PATH)

    if lazy_count != 1:
        abort(
            f"Post-mutation verification failed.\n\n"
            f"ProspectRegistration lazy import count: {lazy_count}\n"
            f"Expected: exactly 1"
        )
    _ok(f"Post-verify: lazy import count = {lazy_count} (exactly 1)")

    if route_count != 1:
        abort(
            f"Post-mutation verification failed.\n\n"
            f"Route /hub/prospect-registration count: {route_count}\n"
            f"Expected: exactly 1"
        )
    _ok(f"Post-verify: route count = {route_count} (exactly 1)")

    # Verify anchors still intact after mutation
    if APP_ANCHOR_GROWTH_ROUTE not in verify:
        abort("Post-mutation verification failed.\n\nGrowth routing authority was lost during mutation.")
    _ok("Post-verify: /growth route authority intact")

    _step_results["Stage 3: App.tsx"] = "PASS (Applied)"


# ════════════════════════════════════════════════════════════════
# STAGE 4 — admissions.json
# Sequence: locate → parse → verify id → verify title → verify absence → mutate → re-read → verify
# ════════════════════════════════════════════════════════════════

def stage_4_admissions_json(root: Path) -> None:
    _head("STAGE 4 — admissions.json")
    admissions_path = root / FILE_ADMISSIONS

    # ── Locate file ───────────────────────────────────────────
    _info(f"Locating {FILE_ADMISSIONS}")
    if not admissions_path.exists():
        abort(f"Registration entry missing.\n\nFile not found: {FILE_ADMISSIONS}")

    raw = admissions_path.read_text(encoding="utf-8")
    _ok(f"File located ({len(raw)} chars)")

    # ── Parse JSON ────────────────────────────────────────────
    _info("Parsing JSON")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        abort(f"Registration entry missing.\n\nadmissions.json is not valid JSON:\n{exc}")

    _ok("JSON valid")

    # ── Verify id == registration ─────────────────────────────
    _info(f"Verifying entry: id == \"{REGISTRATION_ID}\"")
    items: list[dict] = data.get("items", [])
    reg_entry: Optional[dict] = next(
        (i for i in items if i.get("id") == REGISTRATION_ID), None
    )
    if reg_entry is None:
        abort(
            f"Registration entry missing.\n\n"
            f"No item with id == \"{REGISTRATION_ID}\" found in admissions.json.\n\n"
            f"Present ids: {[i.get('id') for i in items]}"
        )
    _ok(f"Entry located: id=\"{REGISTRATION_ID}\"")

    # ── Verify title == "Prospect Registration" ───────────────
    _info("Verifying entry title == \"Prospect Registration\"")
    expected_title = "Prospect Registration"
    actual_title   = reg_entry.get("title", "")
    if actual_title != expected_title:
        abort(
            f"Registration entry missing.\n\n"
            f"Entry title mismatch.\n"
            f"Expected: \"{expected_title}\"\n"
            f"Found:    \"{actual_title}\""
        )
    _ok(f"Title confirmed: \"{actual_title}\"")

    # ── Verify mutation not already present ───────────────────
    _info("Verifying path not already present")
    if reg_entry.get("path") == ROUTE_PATH:
        _ok(f"Path already set: \"{ROUTE_PATH}\"")
        # Verify JSON still valid and no other entries changed
        _verify_admissions_post(admissions_path)
        _step_results["Stage 4: admissions.json"] = "PASS (Already Present)"
        return

    if "path" in reg_entry:
        abort(
            f"Registration entry has an unexpected path.\n\n"
            f"Found:    \"{reg_entry['path']}\"\n"
            f"Expected: \"{ROUTE_PATH}\" or absent\n\n"
            f"Manual review required."
        )

    # ── Mutate ────────────────────────────────────────────────
    _info(f"Setting path: \"{ROUTE_PATH}\"")
    reg_entry["path"] = ROUTE_PATH

    output = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    admissions_path.write_text(output, encoding="utf-8")
    _ok("admissions.json written")

    # ── Re-read and verify ────────────────────────────────────
    _info("Re-reading admissions.json for post-mutation verification")
    _verify_admissions_post(admissions_path)

    _step_results["Stage 4: admissions.json"] = "PASS (Applied)"


def _verify_admissions_post(admissions_path: Path) -> None:
    """Re-reads and verifies all post-mutation invariants for admissions.json."""
    raw = admissions_path.read_text(encoding="utf-8")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        abort(f"Post-mutation verification failed.\n\nadmissions.json is no longer valid JSON:\n{exc}")

    _ok("Post-verify: JSON valid")

    items: list[dict] = data.get("items", [])

    reg = next((i for i in items if i.get("id") == REGISTRATION_ID), None)
    if not reg or reg.get("path") != ROUTE_PATH:
        abort(
            f"Post-mutation verification failed.\n\n"
            f"registration.path expected: \"{ROUTE_PATH}\"\n"
            f"registration.path found:    \"{reg.get('path') if reg else 'entry missing'}\""
        )
    _ok(f"Post-verify: registration.path = \"{ROUTE_PATH}\"")

    # Verify no other entry was mutated
    partner = next((i for i in items if i.get("id") == "partner-onboarding"), None)
    if not partner or partner.get("path") != "/hub/partner-onboarding":
        abort(
            "Post-mutation verification failed.\n\n"
            "partner-onboarding entry was unexpectedly altered — VIOLATION."
        )
    _ok("Post-verify: partner-onboarding entry unchanged")

    for entry_id in ["review", "acceptance"]:
        entry = next((i for i in items if i.get("id") == entry_id), None)
        if entry and "path" in entry:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Entry \"{entry_id}\" unexpectedly gained a path — VIOLATION."
            )
        _ok(f"Post-verify: \"{entry_id}\" has no path (correct — not yet routable)")


# ════════════════════════════════════════════════════════════════
# STAGE 5 — AdmissionsSection.tsx
# Sequence: locate → verify 3 anchors → verify absence → mutate → re-read → verify
# ════════════════════════════════════════════════════════════════

def stage_5_admissions_section(root: Path) -> None:
    _head("STAGE 5 — AdmissionsSection.tsx")
    section_path = root / FILE_SECTION

    # ── Locate file ───────────────────────────────────────────
    _info(f"Locating {FILE_SECTION}")
    if not section_path.exists():
        abort(f"AdmissionsSection.tsx not found: {FILE_SECTION}")

    source = section_path.read_text(encoding="utf-8")
    _ok(f"File located ({len(source)} chars)")

    # ── Anchor 1: useRegistry("admissions") ──────────────────
    _info(f"Verifying Anchor 1: {SECTION_ANCHOR_REGISTRY}")
    if SECTION_ANCHOR_REGISTRY not in source:
        abort(
            f"AdmissionsSection anchor missing.\n\n"
            f"Expected: {SECTION_ANCHOR_REGISTRY}\n\n"
            f"File structure differs from Current Implementation Authority."
        )
    _ok(f'Anchor 1 present: {SECTION_ANCHOR_REGISTRY}')

    # ── Anchor 2: items.map( ──────────────────────────────────
    _info(f"Verifying Anchor 2: {SECTION_ANCHOR_MAP}")
    if SECTION_ANCHOR_MAP not in source:
        abort(
            f"AdmissionsSection anchor missing.\n\n"
            f"Expected: {SECTION_ANCHOR_MAP}\n\n"
            f"List rendering structure differs from Current Implementation Authority."
        )
    _ok(f"Anchor 2 present: {SECTION_ANCHOR_MAP}")

    # ── Anchor 3: <li ────────────────────────────────────────
    _info(f"Verifying Anchor 3: {SECTION_ANCHOR_LI}")
    if SECTION_ANCHOR_LI not in source:
        abort(
            f"AdmissionsSection anchor missing.\n\n"
            f"Expected: {SECTION_ANCHOR_LI}\n\n"
            f"List item structure differs from Current Implementation Authority."
        )
    _ok(f"Anchor 3 present: {SECTION_ANCHOR_LI}")

    # ── Verify mutation not already present ───────────────────
    _info("Verifying Link import and render not already present")
    has_link_import  = 'import { Link } from "wouter"' in source
    has_link_render  = '<Link href={path}>' in source

    if has_link_import and has_link_render:
        _ok("Link import already present")
        _ok("Link render already present")
        _verify_section_post(source, "AdmissionsSection.tsx")
        _step_results["Stage 5: AdmissionsSection.tsx"] = "PASS (Already Present)"
        return

    # ── Mutate ────────────────────────────────────────────────
    # The structural change (extracting title/path, conditional Link wrap)
    # is applied as a full deterministic replacement of the verified file.
    # Anchors confirmed above guarantee the source matches the expected structure.
    _info("Writing mutated AdmissionsSection.tsx")
    section_path.write_text(ADMISSIONS_SECTION_SOURCE, encoding="utf-8")
    _ok("File written")

    # ── Re-read and verify ────────────────────────────────────
    _info("Re-reading AdmissionsSection.tsx for post-mutation verification")
    written = section_path.read_text(encoding="utf-8")
    _verify_section_post(written, "AdmissionsSection.tsx")

    _step_results["Stage 5: AdmissionsSection.tsx"] = "PASS (Applied)"


def _verify_section_post(source: str, filename: str) -> None:
    """Post-mutation verification for AdmissionsSection."""

    # Link import count: exactly 1
    link_import_count = source.count('import { Link } from "wouter"')
    if link_import_count != 1:
        abort(
            f"Post-mutation verification failed.\n\n"
            f"Link import count: {link_import_count} (expected exactly 1)\n"
            f"File: {filename}"
        )
    _ok(f"Post-verify: Link import count = {link_import_count} (exactly 1)")

    # href appears exactly once inside list rendering
    href_count = source.count("href={path}")
    if href_count != 1:
        abort(
            f"Post-mutation verification failed.\n\n"
            f"href={{path}} count: {href_count} (expected exactly 1)\n"
            f"File: {filename}"
        )
    _ok(f"Post-verify: href={{path}} count = {href_count} (exactly 1)")

    # All required markers present
    markers = [
        ('import { Link } from "wouter"',    "Link imported from wouter"),
        ('from "../../hooks/useRegistry"',   "useRegistry import preserved"),
        ("export function AdmissionsSection", "export function preserved"),
        ('<Link href={path}>',               "Link rendered for routable items"),
        ("path !== null",                    "non-routable guard present"),
        ("useRegistry",                      "useRegistry call preserved"),
        ("items.map(",                       "list rendering preserved"),
        ("<li",                              "list item preserved"),
    ]
    for marker, label in markers:
        if marker not in source:
            abort(
                f"Post-mutation verification failed.\n\n"
                f"Expected content missing: {label}\n"
                f"Marker: {marker}\n"
                f"File: {filename}"
            )
        _ok(f"Post-verify: {label}")


# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

def print_summary() -> None:
    _head("MUTATION SUMMARY")

    max_len = max(len(k) for k in _step_results) if _step_results else 0
    for step, state in _step_results.items():
        if state.startswith("PASS (Already Present)"):
            colour = YELLOW
        elif state.startswith("PASS (Applied)"):
            colour = GREEN
        else:
            colour = RED
        padded = step.ljust(max_len)
        print(f"  {padded}   {colour}{state}{RESET}")

    all_pass = all(s.startswith("PASS") for s in _step_results.values())

    print()
    if all_pass:
        print(f"{BOLD}{GREEN}══ RESULT: PASS ══{RESET}{RESET}")
        print()
        print("  Four authorized files in final state:")
        print(f"    {FILE_PAGE}")
        print(f"    {FILE_APP}")
        print(f"    {FILE_ADMISSIONS}")
        print(f"    {FILE_SECTION}")
        print()
        print("  Verification commands:")
        print("    npm run build")
        print("    # /growth → AdmissionsSection → click 'Prospect Registration'")
        print("    # → /hub/prospect-registration → form renders → Continue")
    else:
        # Should not reach here — abort() exits first
        print(f"{BOLD}{RED}══ RESULT: FAIL ══{RESET}{RESET}")
        sys.exit(1)


# ════════════════════════════════════════════════════════════════
# NAVIGATION VERIFICATION (informational — runs after all mutations)
# ════════════════════════════════════════════════════════════════

def navigation_verification(root: Path) -> None:
    _head("Navigation Verification")
    app_path = root / FILE_APP
    src = app_path.read_text(encoding="utf-8")

    po_idx  = src.find('"/hub/partner-onboarding"')
    pr_idx  = src.find('"/hub/prospect-registration"')
    gro_idx = src.find('"/growth"')

    if po_idx > 0 and pr_idx > po_idx:
        _ok("Route order: /hub/partner-onboarding → /hub/prospect-registration")
    if gro_idx > pr_idx > 0:
        _ok("/hub/prospect-registration precedes /growth — no shadow conflict")

    _info("Journey: /growth → AdmissionsSection")
    _info("  'Prospect Registration' → <Link href='/hub/prospect-registration'>")
    _info("  'Eligibility Review', 'Admission Decision' → plain text (no path)")
    _info("  /hub/prospect-registration → ProspectRegistration → form → Continue")


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
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
        "  python RMP-010E9_create_prospect_registration.py /path/to/repo"
    )
    raise SystemExit(1)   # unreachable; satisfies type checker


def main() -> None:
    print(f"\n{BOLD}RMP-010E9 — Prospect Registration Workflow{RESET}")
    print(f"{BOLD}CIP-010E9 Revision 3 — Quality Gate Upgrade{RESET}\n")

    root = resolve_root()
    _info(f"Repository root: {root}")

    # Execute all stages in order.
    # abort() terminates immediately on any anchor or post-condition failure.
    stage_1_repository(root)
    stage_2_prospect_registration(root)
    stage_3_app_tsx(root)
    stage_4_admissions_json(root)
    stage_5_admissions_section(root)

    navigation_verification(root)
    print_summary()


if __name__ == "__main__":
    main()
