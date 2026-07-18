#!/usr/bin/env python3

"""
APP-REC-005 Runtime Capture

Usage:

1. Start the application normally.

2. Login as Admin.

3. Open DevTools → Network.

4. Export HAR as:

execution/sprints/APP-REC-005/admin.har

5. Login as Member.

6. Export HAR as:

execution/sprints/APP-REC-005/member.har

7. Run:

python3 execution/sprints/APP-REC-005/runtime_capture.py
"""

import json
from pathlib import Path

ROOT = Path("execution/sprints/APP-REC-005")

FILES = [
    ("ADMIN", ROOT / "admin.har"),
    ("MEMBER", ROOT / "member.har"),
]

for title, path in FILES:

    print("=" * 80)
    print(title)
    print("=" * 80)

    if not path.exists():
        print("Missing:", path)
        continue

    har = json.loads(path.read_text())

    entries = har["log"]["entries"]

    for e in entries:

        url = e["request"]["url"]

        if "/api/" not in url:
            continue

        method = e["request"]["method"]
        status = e["response"]["status"]

        print(f"{status:3d} {method:6s} {url}")

print()
print("=" * 80)
print("Capture Complete")
print("=" * 80)
