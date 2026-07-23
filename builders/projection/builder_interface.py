"""
Builder Integration Interface

Canonical external entry point for the Projection Builder.
"""

from __future__ import annotations

import json

from builders.projection.qualification.builder_operational_qualification import qualify
from builders.projection.certification.builder_certification import certify_builder


def execute_builder() -> dict:
    """
    Execute the Builder through the canonical EOS interface.
    """

    qualification = qualify()

    if qualification["status"] != "QUALIFIED":
        return {
            "status": "REJECTED",
            "reason": "Builder is not operationally qualified.",
            "qualification": qualification,
        }

    certification = certify_builder()

    return {
        "status": "EXECUTABLE",
        "qualification": qualification,
        "certification": certification,
    }


def main() -> int:
    result = execute_builder()

    print(json.dumps(result, indent=2, sort_keys=True))

    return 0 if result["status"] == "EXECUTABLE" else 1


if __name__ == "__main__":
    raise SystemExit(main())
