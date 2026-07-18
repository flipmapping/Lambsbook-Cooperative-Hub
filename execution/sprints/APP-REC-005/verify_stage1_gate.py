#!/usr/bin/env python3

from pathlib import Path
import re

TARGET = Path("client/src/pages/MemberHub.tsx")

if not TARGET.exists():
    raise SystemExit("ERROR: client/src/pages/MemberHub.tsx not found")

text = TARGET.read_text(encoding="utf-8")
lines = text.splitlines()

print("=" * 90)
print("APP-REC-005 STAGE-1 VERIFICATION")
print("=" * 90)

targets = [
    "/api/member/me",
    "/api/member/recent-participation",
    "/api/member/earnings",
    "/api/member/pending-invitation",
    "/api/member/trusted-relationships",
]

for endpoint in targets:
    print()
    print("-" * 90)
    print(endpoint)
    print("-" * 90)

    for i, line in enumerate(lines):
        if endpoint in line:
            start = max(0, i - 2)
            end = min(len(lines), i + 6)

            for n in range(start, end):
                print(f"{n+1:5d}: {lines[n]}")
            break

print()
print("=" * 90)

expected = "enabled: isAuthenticated && !profileLoading && !!profile"

count = text.count(expected)

print(f"Stage-2 gated queries found : {count}")

if count != 4:
    raise SystemExit(
        f"ERROR: Expected 4 gated queries, found {count}"
    )

profile_ok = re.search(
    r'/api/member/me.*?enabled:\s*isAuthenticated\b',
    text,
    flags=re.S,
)

if not profile_ok:
    raise SystemExit(
        "ERROR: Profile query was modified unexpectedly."
    )

print("Verification PASSED")
print("=" * 90)
