"""
Builder Certification Pipeline

Canonical orchestration layer for the Builder certification lifecycle.
"""

from __future__ import annotations

import json
from pathlib import Path

from builder_certification_assessment import assess
from builder_certification_registry import append_record


EVIDENCE_FILE = (
    Path(__file__).parent
    / "evidence"
    / "bcs001_evidence.json"
)


def run_pipeline() -> dict:
    """
    Execute the canonical certification pipeline.

    The pipeline intentionally orchestrates existing
    certified components rather than reimplementing them.
    """

    result = assess(EVIDENCE_FILE)

    if result["status"] == "PASS":
        append_record(result)

    return result


def main() -> int:

    result = run_pipeline()

    print(json.dumps(result, indent=2, sort_keys=True))

    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
