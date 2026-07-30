#!/usr/bin/env python3

from pathlib import Path
import datetime

ROOT = Path(".")

IGNORE = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".cache",
    "__pycache__",
    ".turbo",
}

SEARCHES = [
    "onAuthStateChange",
    "PASSWORD_RECOVERY",
    "SIGNED_IN",
    "updateUser(",
    "detectSessionInUrl",
    "exchangeCodeForSession",
    "type=recovery",
    "access_token",
    "refresh_token",
    "ResetPassword",
    "/auth/reset",
    "/auth/callback",
    "AuthCallback",
    "reset password",
]

TEXT_EXT = {
    ".ts",".tsx",".js",".jsx",".mjs",".cjs",
    ".json",".sql",".md",".env",".txt"
}

report = []

report.append("="*78)
report.append("APP-REC-002 PASSWORD RECOVERY TRUTH GATE")
report.append("="*78)
report.append(f"UTC: {datetime.datetime.utcnow().isoformat()}Z")
report.append("")

for term in SEARCHES:

    report.append("")
    report.append(f"SEARCH TERM: {term}")
    report.append("-"*78)

    found=False

    for f in ROOT.rglob("*"):

        if not f.is_file():
            continue

        if any(p in IGNORE for p in f.parts):
            continue

        if f.suffix.lower() not in TEXT_EXT:
            continue

        try:
            lines=f.read_text(errors="ignore").splitlines()
        except Exception:
            continue

        for n,line in enumerate(lines,start=1):
            if term.lower() in line.lower():
                found=True
                report.append(f"{f}:{n}")
                report.append("    "+line.strip())

    if not found:
        report.append("NOT FOUND")

report.append("")
report.append("="*78)
report.append("END OF REPORT")
report.append("="*78)

out=Path("tcrs/runtime/APP-REC-002-password-recovery-report.txt")
out.write_text("\n".join(report),encoding="utf-8")

print("\n".join(report))
print()
print(f"Report written to: {out}")
