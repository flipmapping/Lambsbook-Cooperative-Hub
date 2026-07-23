"""
Builder Certification Assessment

Evaluates certification evidence and produces a deterministic
Builder certification decision.
"""

from __future__ import annotations

import json
from pathlib import Path


REQUIRED_FIELDS = (
    "sprint",
    "generated_at",
    "sha256",
    "report",
)


def assess(evidence_file: Path) -> dict:

    evidence = json.loads(evidence_file.read_text())

    missing = [
        field
        for field in REQUIRED_FIELDS
        if field not in evidence
    ]

    if missing:
        return {
            "status": "FAIL",
            "reason": "Missing required evidence fields.",
            "missing": missing,
        }

    report = evidence["report"]

    status = "PASS"

    if report.get("failed", 0) > 0:
        status = "FAIL"

    return {
        "status": status,
        "executed": report.get("executed"),
        "passed": report.get("passed"),
        "failed": report.get("failed"),
        "sha256": evidence["sha256"],
    }


def main():

    evidence = (
        Path(__file__).parent
        / "evidence"
        / "bcs001_evidence.json"
    )

    result = assess(evidence)

    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
