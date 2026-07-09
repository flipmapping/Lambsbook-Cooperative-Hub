#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import json
import os
import sys

REPO = Path.home() / "workspace"
SPRINT = REPO / "execution" / "sprints" / "SFP-001"

FRAGMENTS = SPRINT / "fragments"
ASSEMBLED = SPRINT / "assembled"
CERTIFICATION = SPRINT / "certification"
LOGS = SPRINT / "logs"
STATE = SPRINT / "state"

TARGET = ASSEMBLED / "sfp001_phase4_gap_analysis.py"
MANIFEST = STATE / "IAG-MANIFEST.json"


def mkdir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def write_if_missing(path: Path, text: str):
    if path.exists():
        return

    tmp = path.with_suffix(path.suffix + ".tmp")

    with open(tmp, "w", encoding="utf-8") as f:
        f.write(text)

    os.replace(tmp, path)


def main():

    print("=" * 40)
    print("SFP-001")
    print("Incremental Artifact Generation")
    print("Initialization")
    print("=" * 40)

    for d in (
        FRAGMENTS,
        ASSEMBLED,
        CERTIFICATION,
        LOGS,
        STATE,
    ):
        mkdir(d)

    write_if_missing(
        TARGET,
        """#!/usr/bin/env python3
\"\"\"
SFP Sprint 1
Phase 4 Gap Analysis

Managed by Sprint Factory Incremental Artifact Generation.

DO NOT EDIT MANUALLY.
\"\"\"

""",
    )

    if not MANIFEST.exists():

        manifest = {
            "artifact": TARGET.name,
            "status": "initialized",
            "next_fragment": 1,
            "assembled": False,
            "validated": False,
            "certified": False,
            "created": datetime.now().isoformat(),
        }

        tmp = MANIFEST.with_suffix(".tmp")

        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        os.replace(tmp, MANIFEST)

    print("[PASS] Workspace initialized")

    for p in (
        FRAGMENTS,
        ASSEMBLED,
        CERTIFICATION,
        LOGS,
        STATE,
    ):
        print(f"[PASS] {p}")

    print("[PASS] Target:", TARGET)
    print("[PASS] Manifest:", MANIFEST)

    return 0


if __name__ == "__main__":
    sys.exit(main())