#!/usr/bin/env python3

from pathlib import Path
import re

TARGET = Path("client/src/pages/MemberHub.tsx")

if not TARGET.exists():
    raise SystemExit("ERROR: MemberHub.tsx not found")

text = TARGET.read_text(encoding="utf-8")

print("=" * 90)
print("APP-REC-005 STAGE-1 PATCH PLAN")
print("=" * 90)

queries = [
    "/api/member/recent-participation",
    "/api/member/earnings",
    "/api/member/pending-invitation",
    "/api/member/trusted-relationships",
]

print("\nStage 1 (UNCHANGED)")
print("-------------------")
print("Profile query remains:")
print("    enabled: isAuthenticated")

print("\nStage 2 (PATCH)")
print("-------------------")

for endpoint in queries:
    pattern = rf'queryFn:\s*\(\)\s*=>\s*fetchWithAuth\("{re.escape(endpoint)}"\).*?enabled:\s*isAuthenticated'
    if re.search(pattern, text, flags=re.S):
        print(f"[FOUND] {endpoint}")
        print("Replace:")
        print("    enabled: isAuthenticated")
        print("With:")
        print("    enabled: isAuthenticated && !!profile")
        print()

print("=" * 90)
print("NO OTHER MUTATIONS AUTHORIZED")
print("=" * 90)
print("""
Do NOT modify:
  - Authentication
  - Routing
  - attachUserContext
  - dashboardAdapter.ts
  - RuntimeNavigationPolicy

Only gate Stage-2 queries behind a successful profile load.

Expected runtime:

Login
  ↓
/api/member/me
  ↓
profile exists?
  ├── NO → profile error becomes visible
  └── YES
          ↓
remaining dashboard queries
""")
