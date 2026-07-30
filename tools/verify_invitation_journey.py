#!/usr/bin/env python3

"""
GE-001 Invitation Journey Verification

Purpose:
    Verify the complete invitation workflow without mutating repository code.

Expected checkpoints:

1. Invitation creation endpoint exists.
2. Pending invitation endpoint exists.
3. Accept invitation endpoint exists.
4. Member dashboard references pending invitation.
5. Acceptance UI exists.
6. Invitation materialization endpoint exists.

This script performs static verification only.
Dynamic API execution can be added after runtime configuration.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

checks = {
    "server/routes/member.ts": [
        "router.post(\"/invitations\"",
        "router.get(\"/pending-invitation\"",
        "router.post(\"/accept-invitation\"",
        "materialize-invitation",
    ],
    "client/src/pages/MemberHub.tsx": [
        "/api/member/pending-invitation",
        "/api/member/accept-invitation",
    ],
    "client/src/components/dashboard/InvitationAcceptanceSection.tsx": [
        "/api/member/accept-invitation",
    ],
}

ok = True

for file, required in checks.items():
    path = ROOT / file
    if not path.exists():
        print(f"[FAIL] Missing: {file}")
        ok = False
        continue

    text = path.read_text(errors="ignore")

    for item in required:
        if item in text:
            print(f"[PASS] {file} -> {item}")
        else:
            print(f"[FAIL] {file} -> {item}")
            ok = False

print()

if ok:
    print("Repository invitation implementation appears structurally complete.")
    print("Next milestone: runtime end-to-end verification.")
else:
    print("Structural defects detected.")

exit(0 if ok else 1)
