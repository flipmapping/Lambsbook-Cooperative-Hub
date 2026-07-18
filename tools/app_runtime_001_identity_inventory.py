#!/usr/bin/env python3

from pathlib import Path
import re

ROOT = Path(".")

IGNORE = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    "__pycache__",
    ".turbo",
    ".cache",
}

SEARCH_PATTERNS = {
    "AUTH_ROUTES": [
        r"/auth/",
        r"/hub/auth/",
        r"AuthCallback",
        r"HubAuthCallback",
        r"ResetPassword",
        r"HubAuth",
    ],
    "SUPABASE_AUTH": [
        r"createClient\(",
        r"supabase\.auth",
        r"setSession",
        r"updateUser",
        r"resetPasswordForEmail",
        r"signIn",
        r"signUp",
        r"exchangeCodeForSession",
        r"onAuthStateChange",
    ],
    "IDENTITY_RUNTIME": [
        r"attachUserContext",
        r"getMemberByUserId",
        r"requireSBUAccess",
        r"/api/member/me",
        r"/api/hub/auth",
        r"/api/member",
        r"dashboard",
        r"MemberHub",
        r"HubDashboard",
    ],
    "LEGACY_REFERENCES": [
        r"onboarding",
        r"HUB_API_BASE_URL",
        r"NEXT_PUBLIC_SITE_URL",
        r"NEXT_PUBLIC_SUPABASE_URL",
        r"NEXT_PUBLIC_SUPABASE_ANON_KEY",
        r"SUPABASE_URL",
        r"SUPABASE_ANON_KEY",
    ],
}

TEXT_EXT = {
    ".ts",".tsx",".js",".jsx",".mjs",".cjs",
    ".json",".md",".env",".sql",".py"
}

report = []
report.append("="*80)
report.append("APP-RUNTIME-001")
report.append("RUNTIME IDENTITY DEPENDENCY REPORT")
report.append("="*80)

for path in ROOT.rglob("*"):
    if any(part in IGNORE for part in path.parts):
        continue
    if not path.is_file():
        continue
    if path.suffix.lower() not in TEXT_EXT:
        continue

    try:
        text = path.read_text(errors="ignore")
    except Exception:
        continue

    matches = []

    for group, patterns in SEARCH_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                matches.append(group)
                break

    if matches:
        report.append("")
        report.append(str(path))
        report.append("  Categories: " + ", ".join(sorted(matches)))

out = Path("tcrs/runtime/APP-RUNTIME-001-identity-dependency-report.txt")
out.write_text("\n".join(report), encoding="utf-8")

print("\n".join(report))
print()
print(f"Report written to: {out}")
