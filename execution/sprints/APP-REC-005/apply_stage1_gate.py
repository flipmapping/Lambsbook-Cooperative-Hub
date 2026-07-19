\
#!/usr/bin/env python3
"""
APP-REC-005
Stage-1 Gate Applicator

Repository-native implementation derived from the accepted
STAGE2-QUERY-STRUCTURAL-CAPTURE.json.

Behaviour

1. Load accepted Structural Capture.
2. Validate repository still matches captured query blocks.
3. Mutate only authorized Stage-2 queries when required.
4. Preserve /api/member/me.
5. Write MemberHub.tsx at most once.
6. Execute verify_stage1_gate.py.
7. Produce STAGE1-IMPLEMENTATION-CERTIFICATION.md.
"""

from pathlib import Path
from datetime import datetime, timezone
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]

CAPTURE = ROOT / "execution/sprints/APP-REC-005/STAGE2-QUERY-STRUCTURAL-CAPTURE.json"
TARGET = ROOT / "client/src/pages/MemberHub.tsx"
VERIFY = ROOT / "execution/sprints/APP-REC-005/verify_stage1_gate.py"
CERT = ROOT / "execution/sprints/APP-REC-005/STAGE1-IMPLEMENTATION-CERTIFICATION.md"

PROFILE_ENDPOINT = "/api/member/me"
PROFILE_ENABLED = "isAuthenticated"
STAGE2_ENABLED = "isAuthenticated && !profileLoading && !!profile"

if not CAPTURE.exists():
    raise SystemExit(f"ERROR: Missing {CAPTURE}")

if not TARGET.exists():
    raise SystemExit(f"ERROR: Missing {TARGET}")

if not VERIFY.exists():
    raise SystemExit(f"ERROR: Missing {VERIFY}")

capture = json.loads(CAPTURE.read_text(encoding="utf-8"))
text = TARGET.read_text(encoding="utf-8")

updated = text
modified = False

for entry in capture["captures"]:

    endpoint = entry["endpoint"]
    captured_block = entry["block"]
    captured_enabled = entry["enabled"]

    if captured_block not in updated:
        raise SystemExit(
            "ERROR: Repository no longer matches accepted Structural Capture\\n"
            f"Endpoint: {endpoint}"
        )

    if endpoint == PROFILE_ENDPOINT:

        if captured_enabled != PROFILE_ENABLED:
            raise SystemExit(
                "ERROR: Protected profile query differs from implementation authority."
            )

        continue

    if captured_enabled == STAGE2_ENABLED:
        # Already certified.
        continue

    expected = captured_block

    replacement = captured_block.replace(
        f"enabled: {captured_enabled}",
        f"enabled: {STAGE2_ENABLED}",
        1,
    )

    if expected not in updated:
        raise SystemExit(
            f"ERROR: Unable to locate authorized mutation block for {endpoint}"
        )

    updated = updated.replace(expected, replacement, 1)
    modified = True

if modified:
    TARGET.write_text(updated, encoding="utf-8")

result = subprocess.run(
    [sys.executable, str(VERIFY)],
    cwd=str(ROOT),
)

if result.returncode != 0:
    raise SystemExit(result.returncode)

CERT.write_text(
    f"""# Stage-1 Implementation Certification

Timestamp:
{datetime.now(timezone.utc).isoformat()}

Implementation Authority:
- STAGE2-QUERY-STRUCTURAL-CAPTURE.json

Repository Target:
- client/src/pages/MemberHub.tsx

Repository Mutation:
- {"Performed" if modified else "Not Required (Already Certified)"}

Verification:
- PASSED

Certification:
The repository satisfies the Stage-1 gate implementation contract.
""",
    encoding="utf-8",
)

print("=" * 78)
print("APP-REC-005 IMPLEMENTATION COMPLETE")
print("=" * 78)
print(f"Repository mutation : {'Performed' if modified else 'Not Required'}")
print("Verification        : PASSED")
print(f"Certification       : {CERT}")
