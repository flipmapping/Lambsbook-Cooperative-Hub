#!/usr/bin/env python3
"""
Namespace-independent Claude Package Builder

Status:
SPRINT 1 — CIB Parsing

Builder Sprint 1:
  Read the supplied Claude Instruction Brief.
  Validate that the file exists.
  Parse and extract required fields.
  Verify each mandatory field exists exactly once.
  Emit structured metadata.
  Exit PASS.

Input:
    Claude Instruction Brief

Output (Sprint 1):
    Structured metadata to stdout
    PASS / FAIL report

Future Sprints:
    Repository Truth consumption
    Package assembly
    ZIP archive
    SHA256 digest
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


# ── Mandatory CIB fields (Sprint 1) ───────────────────────────
MANDATORY_FIELDS = [
    "Implementation Authority",
    "Repository",
    "Execution Derivation",
    "Production Surface",
]


# ── Output ─────────────────────────────────────────────────────
def _banner(msg: str) -> None:
    print("=" * 40)
    print(msg)
    print("=" * 40)


def fail(message: str, code: int = EXIT_MISSING_ARTIFACT) -> None:
    print()
    print(f"FAIL: {message}")
    sys.exit(code)


# ── CIB field extraction ───────────────────────────────────────

def extract_fields(cib_text: str) -> dict[str, list[str]]:
    """
    Extract mandatory fields from a CIB document.

    CIB field pattern (markdown, no # prefix on field label):
        <field name>

        <value>

    Returns a dict mapping field name → list of all values found
    (list length > 1 indicates duplicate).
    """
    results: dict[str, list[str]] = {f: [] for f in MANDATORY_FIELDS}

    for field in MANDATORY_FIELDS:
        # Match the field label on its own line, blank line, then the value line.
        # The value runs to end-of-line; it may not itself be a known field label.
        pattern = rf"^{re.escape(field)}\n\n(.+?)$"
        matches = re.findall(pattern, cib_text, re.MULTILINE)
        results[field] = [m.strip() for m in matches if m.strip()]

    return results


def validate_fields(
    fields: dict[str, list[str]],
) -> dict[str, str]:
    """
    Validate that each mandatory field exists exactly once.
    Returns clean dict of field → single value.
    Aborts on missing or duplicate field.
    """
    clean: dict[str, str] = {}

    for field in MANDATORY_FIELDS:
        values = fields[field]

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


# ── Structured metadata emission ──────────────────────────────

def emit_metadata(fields: dict[str, str]) -> None:
    print()
    print("Structured Metadata")
    print("-" * 40)
    for field in MANDATORY_FIELDS:
        print(f"{field}: {fields[field]}")
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

    args = parser.parse_args()
    cib_path = Path(args.cib)

    _banner("Claude Package Builder")
    print(f"CIB: {cib_path}")
    print(f"Sprint: 1 — CIB Parsing")

    # Verify CIB exists and is readable
    if not cib_path.exists():
        fail(f"CIB not found: {cib_path}", EXIT_MISSING_ARTIFACT)

    try:
        cib_text = cib_path.read_text(encoding="utf-8")
    except OSError as exc:
        fail(f"CIB unreadable: {exc}", EXIT_MISSING_ARTIFACT)

    print()
    print("PASS: CIB exists and is readable")

    # Extract and validate fields
    raw_fields = extract_fields(cib_text)
    fields = validate_fields(raw_fields)

    print("PASS: All mandatory fields present and unique")

    # Emit structured metadata
    emit_metadata(fields)

    _banner("PASS")


if __name__ == "__main__":
    main()
