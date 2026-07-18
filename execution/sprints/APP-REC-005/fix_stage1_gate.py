#!/usr/bin/env python3

from pathlib import Path

TARGET = Path("client/src/pages/MemberHub.tsx")

if not TARGET.exists():
    raise SystemExit("ERROR: client/src/pages/MemberHub.tsx not found")

text = TARGET.read_text(encoding="utf-8")

before = "enabled: enabled: isAuthenticated && !profileLoading && !!profile"
after  = "enabled: isAuthenticated && !profileLoading && !!profile"

count = text.count(before)

if count == 0:
    raise SystemExit("ERROR: No duplicated 'enabled:' tokens found.")

text = text.replace(before, after)

TARGET.write_text(text, encoding="utf-8")

print("=" * 90)
print("APP-REC-005 STAGE-1 GATE FIX")
print("=" * 90)
print(f"Corrected duplicated 'enabled:' occurrences: {count}")
print("=" * 90)
