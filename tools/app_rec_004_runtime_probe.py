#!/usr/bin/env python3

from pathlib import Path

TARGETS = [
    "server/middleware/attachUserContext.ts",
    "server/lib/supabase-member-client.ts",
    "server/lib/supabase-dal.ts",
    "server/routes/member.ts",
    "server/routes.ts",
    "client/src/pages/MemberHub.tsx",
    "client/src/pages/HubDashboard.tsx",
    "client/src/pages/HubAdminDashboard.tsx",
    "client/src/lib/auth/RuntimeNavigationPolicy.ts",
    "client/src/App.tsx",
]

KEYWORDS = [
    "req.user",
    "attachUserContext",
    "getMemberByUserId",
    "/api/member/me",
    "memberContext",
    "dashboard",
    "navigate(",
    "setLocation(",
    "role",
    "sbu",
    "admin",
]

print("=" * 80)
print("APP-REC-004")
print("LIVE RUNTIME CORRIDOR")
print("=" * 80)

for target in TARGETS:
    path = Path(target)

    print("\n" + "=" * 80)
    print(target)
    print("=" * 80)

    if not path.exists():
        print("FILE NOT FOUND")
        continue

    lines = path.read_text(errors="ignore").splitlines()

    for idx, line in enumerate(lines, start=1):
        if any(k.lower() in line.lower() for k in KEYWORDS):
            start = max(0, idx - 3)
            end = min(len(lines), idx + 2)

            print(f"\n--- around line {idx} ---")
            for i in range(start, end):
                print(f"{i+1:4d}: {lines[i]}")

print("\n")
print("=" * 80)
print("FOUNDER LIVE TEST")
print("=" * 80)
print("""
Immediately after running this script:

1. Login as ADMIN
2. Login as MEMBER (different browser)

For EACH session capture:

A. Final URL
B. HTTP status of GET /api/member/me
C. JSON returned by /api/member/me
D. First page rendered
E. Browser console errors
F. Failed Network requests

STOP immediately at the first point where
the two users diverge.

That divergence is the mutation target.
""")
