#!/usr/bin/env python3

from pathlib import Path

ROOT = Path.cwd()

targets = [
    "server/routes.ts",
    "server/middleware/attachUserContext.ts",
    "server/middleware/requireAuth.ts",
    "server/routes/member.ts",
    "server/routes/memberRoutes.ts",
    "server/lib/supabaseAuth.ts",
    "server/lib/supabase.ts",
    "client/src/context",
    "client/src/hooks",
    "client/src/pages/MemberHub.tsx",
]

print("=" * 72)
print("APP-REC-001 IDENTITY CORRIDOR INVENTORY")
print("=" * 72)

for target in targets:
    matches = list(ROOT.glob(target))
    if matches:
        for m in matches:
            print(f"[FOUND] {m}")
    else:
        print(f"[MISSING] {target}")

print("=" * 72)
print("Inventory complete.")
print("=" * 72)
