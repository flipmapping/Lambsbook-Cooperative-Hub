"""
Builder Certification Guard

Verifies that the Builder Certification subsystem is complete
and ready for execution.
"""

from __future__ import annotations

import json
from pathlib import Path

REQUIRED = [
    "builder_certification.py",
    "builder_certification_pipeline.py",
    "builder_certification_assessment.py",
    "builder_certification_registry.py",
]

def check() -> dict:
    base = Path(__file__).parent
    missing = []

    for name in REQUIRED:
        if not (base / name).exists():
            missing.append(name)

    evidence_dir = base / "evidence"

    if not evidence_dir.exists():
        missing.append("evidence/")

    return {
        "status": "PASS" if not missing else "FAIL",
        "missing": missing,
        "checked": REQUIRED + ["evidence/"],
    }

def main() -> int:
    result = check()
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["status"] == "PASS" else 1

if __name__ == "__main__":
    raise SystemExit(main())
