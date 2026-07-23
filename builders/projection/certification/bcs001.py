"""
BCS-001
Builder Certification Sprint

Executes the canonical certification suite and preserves
immutable certification evidence.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from execute_certification_suite import execute_suite


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:

    suite = Path(__file__).parent / "certification_suite.json"

    report = execute_suite(suite)

    payload = json.dumps(
        report,
        indent=2,
        sort_keys=True,
    ).encode("utf-8")

    digest = sha256(payload)

    evidence = {
        "sprint": "BCS-001",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sha256": digest,
        "report": report,
    }

    evidence_dir = Path(__file__).parent / "evidence"
    evidence_dir.mkdir(exist_ok=True)

    outfile = evidence_dir / "bcs001_evidence.json"

    outfile.write_text(
        json.dumps(
            evidence,
            indent=2,
            sort_keys=True,
        ),
        encoding="utf-8",
    )

    print("=" * 60)
    print("BUILDER CERTIFICATION SPRINT")
    print("=" * 60)
    print(f"Evidence : {outfile}")
    print(f"SHA256   : {digest}")
    print("STATUS   : EVIDENCE GENERATED")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
