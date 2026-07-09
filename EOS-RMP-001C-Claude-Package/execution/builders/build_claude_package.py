#!/usr/bin/env python3
"""
Namespace-independent Claude Package Builder

Status:
SPRINT 2 — Repository Truth Consumption (HF1: IA artifact path corrected)

Sprint 1 (CERTIFIED — EOS-RMP-001A):
  Read the supplied Claude Instruction Brief.
  Validate that the file exists.
  Parse and extract required fields.
  Verify each mandatory field exists exactly once.
  Emit structured metadata.
  Exit PASS.

Sprint 2 (EOS-RMP-001B):
  Locate Execution Derivation artifact from CIB field.
  Locate Implementation Authority artifact from authority ID.
  Locate synchronization artifacts (canonical set).
  Verify existence of all located artifacts.
  Verify authority consistency across certified artifacts.
  Emit verified Repository Truth metadata.

Future Sprints:
  Sprint 3 — Package materialization (directory + manifest)
  Sprint 4 — Package certification (ZIP + SHA256 + report)

Input:
    Claude Instruction Brief

Output (Sprint 2):
    Structured metadata to stdout
    Repository Truth metadata to stdout
    PASS / FAIL report
"""

import argparse
import re
import sys
from pathlib import Path


# ── Exit codes ────────────────────────────────────────────────
EXIT_PASS                     = 0
EXIT_REPOSITORY_TRUTH         = 1
EXIT_MISSING_ARTIFACT         = 2
EXIT_AUTHORITY_INCONSISTENCY  = 3
EXIT_SYNC_VERIFICATION        = 4
EXIT_PACKAGE_VERIFICATION     = 5


# ── Mandatory CIB fields ───────────────────────────────────────
MANDATORY_FIELDS = [
    "Implementation Authority",
    "Repository",
    "Execution Derivation",
    "Production Surface",
]

# Optional CIB fields consumed by Sprint 2
OPTIONAL_FIELDS = [
    "Authority Stream",
    "Derived From",
]

# ── Canonical synchronization artifact paths ─────────────────
# These paths are relative to the repository root.
# Derived from the canonical synchronization set specification.
SYNC_ARTIFACTS = [
    "governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md",
    "governance/startup/EXECUTION-STARTUP-SYNCHRONIZATION.md",
    "governance/startup/AUTHORITY-NAMESPACE-RULE-v1.0.md",
    "governance/startup/CLAUDE-NAMESPACE-SYNCHRONIZATION.md",
    "governance/BASELINE.md",
    "governance/execution/EXECUTION-PIPELINE.md",
]

# ── Implementation Authority artifact path template ──────────
# Pattern: governance/{IA}-IMPLEMENTATION-AUTHORITY.md
# No authority prefix is hard-coded; {IA} is derived from the CIB at runtime.
IA_ARTIFACT_TEMPLATE = "governance/rmp/{ia}-IMPLEMENTATION-AUTHORITY.md"


# ── Output helpers ─────────────────────────────────────────────
def _banner(msg: str) -> None:
    print("=" * 40)
    print(msg)
    print("=" * 40)


def fail(message: str, code: int = EXIT_MISSING_ARTIFACT) -> None:
    print()
    print(f"FAIL: {message}")
    sys.exit(code)


# ── CIB field extraction ───────────────────────────────────────

def _extract_field(
    text: str,
    field: str,
) -> list[str]:
    """
    Extract all occurrences of a named field from a CIB-format document.

    Pattern: field label on its own line, blank line, value on next line.
    Returns list of stripped values (empty list if absent).
    """
    pattern = rf"^{re.escape(field)}\n\n(.+?)$"
    matches = re.findall(pattern, text, re.MULTILINE)
    return [m.strip() for m in matches if m.strip()]


def extract_cib_fields(
    cib_text: str,
) -> dict[str, list[str]]:
    """Extract all tracked fields from the CIB."""
    results: dict[str, list[str]] = {}
    for field in MANDATORY_FIELDS + OPTIONAL_FIELDS:
        results[field] = _extract_field(cib_text, field)
    return results


def validate_mandatory_fields(
    fields: dict[str, list[str]],
) -> dict[str, str]:
    """
    Validate that each mandatory field exists exactly once.
    Returns clean dict of field → single value.
    Aborts on missing or duplicate field.
    """
    clean: dict[str, str] = {}
    for field in MANDATORY_FIELDS:
        values = fields.get(field, [])
        if len(values) == 0:
            fail(
                f"Mandatory field absent from CIB: '{field}'",
                EXIT_MISSING_ARTIFACT,
            )
        if len(values) > 1:
            fail(
                f"Duplicate mandatory field in CIB: '{field}' "
                f"(found {len(values)} occurrences)",
                EXIT_AUTHORITY_INCONSISTENCY,
            )
        clean[field] = values[0]
    return clean


def get_optional(
    fields: dict[str, list[str]],
    field: str,
) -> str | None:
    """Return the single value of an optional field, or None if absent."""
    values = fields.get(field, [])
    return values[0] if len(values) == 1 else None


# ── Repository Truth artifact discovery ───────────────────────

def locate_artifacts(
    repo_root: Path,
    mandatory: dict[str, str],
    optional: dict[str, str | None],
) -> dict[str, Path]:
    """
    Deterministically locate all Repository Truth artifacts.

    Derives locations from:
    - CIB.Execution Derivation  → direct path (verified field)
    - CIB.Implementation Authority → IA_ARTIFACT_TEMPLATE
    - canonical sync set        → SYNC_ARTIFACTS

    No authority prefixes are hard-coded.
    Returns mapping of artifact label → absolute Path.
    """
    located: dict[str, Path] = {}

    # Execution Derivation — path is the direct value from the CIB field
    ed_path = repo_root / mandatory["Execution Derivation"]
    located["Execution Derivation"] = ed_path

    # Implementation Authority artifact
    ia = mandatory["Implementation Authority"]
    ia_path = repo_root / IA_ARTIFACT_TEMPLATE.format(ia=ia)
    located["Implementation Authority Artifact"] = ia_path

    # Canonical synchronization artifacts
    for sync_path in SYNC_ARTIFACTS:
        located[f"Sync:{sync_path}"] = repo_root / sync_path

    return located


# ── Artifact existence verification ───────────────────────────

def verify_artifact_existence(
    located: dict[str, Path],
) -> tuple[list[str], list[str]]:
    """
    Verify existence of all located artifacts.
    Returns (present_labels, missing_labels).
    """
    present: list[str] = []
    missing: list[str] = []
    for label, path in located.items():
        if path.exists():
            present.append(label)
        else:
            missing.append(f"{label} → {path}")
    return present, missing


# ── Authority consistency verification ────────────────────────

def verify_authority_consistency(
    repo_root: Path,
    mandatory: dict[str, str],
    optional: dict[str, str | None],
    ia_artifact_path: Path,
) -> list[str]:
    """
    Verify authority consistency across certified artifacts.

    Checks:
    1. IA artifact filename contains the Implementation Authority ID.
    2. If the IA artifact is readable, its Authority Stream matches the CIB (if present).
    3. The Implementation Authority in the IA artifact matches the CIB.

    Returns list of consistency violations (empty = consistent).
    """
    violations: list[str] = []
    ia = mandatory["Implementation Authority"]
    cib_stream = optional.get("Authority Stream")

    # Check 1: IA artifact filename contains the authority ID
    if ia not in ia_artifact_path.name:
        violations.append(
            f"Implementation Authority '{ia}' "
            f"not reflected in artifact filename '{ia_artifact_path.name}'"
        )

    # Check 2 & 3: if IA artifact exists, inspect its content
    if ia_artifact_path.exists():
        try:
            ia_text = ia_artifact_path.read_text(encoding="utf-8")

            # Check IA in artifact
            ia_values = _extract_field(ia_text, "Implementation Authority")
            if ia_values and ia_values[0] != ia:
                violations.append(
                    f"Implementation Authority mismatch: "
                    f"CIB='{ia}', IA artifact='{ia_values[0]}'"
                )

            # Check Authority Stream consistency (if both present)
            if cib_stream:
                ia_streams = _extract_field(ia_text, "Authority Stream")
                if ia_streams and ia_streams[0] != cib_stream:
                    violations.append(
                        f"Authority Stream mismatch: "
                        f"CIB='{cib_stream}', IA artifact='{ia_streams[0]}'"
                    )

        except OSError:
            # File exists but unreadable — note but do not block
            violations.append(
                f"IA artifact unreadable (exists but could not be read): {ia_artifact_path}"
            )

    return violations


# ── Structured metadata emission ──────────────────────────────

def emit_cib_metadata(mandatory: dict[str, str]) -> None:
    print()
    print("Structured Metadata")
    print("-" * 40)
    for field in MANDATORY_FIELDS:
        print(f"{field}: {mandatory[field]}")
    print()


def emit_repository_truth(
    located: dict[str, Path],
    present: list[str],
    missing: list[str],
) -> None:
    print("Repository Truth")
    print("-" * 40)
    for label, path in located.items():
        status = "✓" if path.exists() else "✗"
        print(f"  {status}  {label}")
    print()
    print(f"  Artifacts present: {len(present)}")
    print(f"  Artifacts missing: {len(missing)}")
    print()


# ── Main ───────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Namespace-independent Claude Package Builder"
    )
    parser.add_argument(
        "cib",
        help="Path to Claude Instruction Brief",
    )
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Repository root directory (default: current directory)",
    )

    args = parser.parse_args()
    cib_path = Path(args.cib)
    repo_root = Path(args.repo_root).resolve()

    _banner("Claude Package Builder")
    print(f"CIB: {cib_path}")
    print(f"Sprint: 2 — Repository Truth Consumption")
    print(f"Repository Root: {repo_root}")

    # ── Sprint 1: CIB validation ───────────────────────────────
    if not cib_path.exists():
        fail(f"CIB not found: {cib_path}", EXIT_MISSING_ARTIFACT)

    try:
        cib_text = cib_path.read_text(encoding="utf-8")
    except OSError as exc:
        fail(f"CIB unreadable: {exc}", EXIT_MISSING_ARTIFACT)

    print()
    print("PASS: CIB exists and is readable")

    raw_fields = extract_cib_fields(cib_text)
    mandatory  = validate_mandatory_fields(raw_fields)
    optional   = {f: get_optional(raw_fields, f) for f in OPTIONAL_FIELDS}

    print("PASS: All mandatory fields present and unique")

    emit_cib_metadata(mandatory)

    # ── Sprint 2: Repository Truth consumption ─────────────────
    print("Repository Truth Consumption")
    print("-" * 40)

    # Locate all artifacts deterministically
    located = locate_artifacts(repo_root, mandatory, optional)
    ia_artifact_path = located["Implementation Authority Artifact"]

    # Verify artifact existence
    present, missing = verify_artifact_existence(located)

    emit_repository_truth(located, present, missing)

    # Report missing sync artifacts (non-fatal warning — repo may not be bootstrapped)
    sync_missing = [m for m in missing if m.startswith("Sync:")]
    core_missing = [m for m in missing
                    if not m.startswith("Sync:")]

    if core_missing:
        print("  Core artifact(s) missing:")
        for m in core_missing:
            print(f"    {m}")
        print()
        fail(
            f"Required Repository Truth artifacts not found "
            f"({len(core_missing)} missing). "
            "Verify repository is bootstrapped and artifacts exist.",
            EXIT_REPOSITORY_TRUTH,
        )

    if sync_missing:
        print("  Synchronization artifact(s) not found (warning — repository may need bootstrap):")
        for m in sync_missing:
            print(f"    {m}")
        print()

    print("PASS: Core Repository Truth artifacts located")

    # Verify authority consistency
    violations = verify_authority_consistency(
        repo_root, mandatory, optional, ia_artifact_path
    )

    if violations:
        print()
        print("  Authority consistency violations:")
        for v in violations:
            print(f"    {v}")
        fail(
            f"Authority inconsistency detected ({len(violations)} violation(s)). "
            "Verify Implementation Authority matches certified artifacts.",
            EXIT_AUTHORITY_INCONSISTENCY,
        )

    print("PASS: Authority consistency verified")

    _banner("PASS")


if __name__ == "__main__":
    main()
