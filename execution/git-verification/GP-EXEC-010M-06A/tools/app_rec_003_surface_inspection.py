#!/usr/bin/env python3

from pathlib import Path

TARGETS = [
    "client/src/pages/ResetPassword.tsx",
    "client/src/App.tsx",
    "client/src/pages/AuthCallback.tsx",
    "client/src/pages/HubAuthCallback.tsx",
]

KEYWORDS = [
    "access_token",
    "refresh_token",
    "type",
    "recovery",
    "updateUser",
    "setSession",
    "exchangeCodeForSession",
    "onAuthStateChange",
    "PASSWORD_RECOVERY",
    "navigate",
    "setLocation",
    "/auth/reset",
]

report = []
report.append("=" * 80)
report.append("APP-REC-003 SURFACE INSPECTION")
report.append("=" * 80)

for target in TARGETS:
    p = Path(target)

    report.append("")
    report.append(f"FILE: {target}")
    report.append("-" * 80)

    if not p.exists():
        report.append("NOT FOUND")
        continue

    lines = p.read_text(errors="ignore").splitlines()

    report.append(f"Total Lines: {len(lines)}")
    report.append("")

    for i, line in enumerate(lines, start=1):
        lower = line.lower()
        for kw in KEYWORDS:
            if kw.lower() in lower:
                report.append(f"{i:4d}: {line.rstrip()}")
                break

out = Path("tcrs/runtime/APP-REC-003-surface-inspection.txt")
out.write_text("\n".join(report), encoding="utf-8")

print("\n".join(report))
print()
print(f"Report written to {out}")
