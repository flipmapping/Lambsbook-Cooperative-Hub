"""
Builder Operational Qualification Protocol

Canonical operational qualification for the Projection Builder.
"""

from __future__ import annotations

import json
from pathlib import Path

from builders.projection.certification.builder_certification import certify_builder
from builders.projection.certification.builder_certification_guard import check


def qualify() -> dict:
    guard = check()

    if guard["status"] != "PASS":
        return {
            "status": "NOT_QUALIFIED",
            "stage": "guard",
            "details": guard,
        }

    certification = certify_builder()

    if certification["status"] != "PASS":
        return {
            "status": "NOT_QUALIFIED",
            "stage": "certification",
            "details": certification,
        }

    return {
        "status": "QUALIFIED",
        "builder": "Projection Builder",
        "certification": certification,
    }


def main() -> int:
    result = qualify()
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["status"] == "QUALIFIED" else 1


if __name__ == "__main__":
    raise SystemExit(main())
