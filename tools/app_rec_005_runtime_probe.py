#!/usr/bin/env python3

from pathlib import Path

report = []

report.append("=" * 80)
report.append("APP-REC-005")
report.append("PASSWORD RESET RUNTIME TRUTH CAPTURE")
report.append("=" * 80)
report.append("")
report.append("Execute the following runtime sequence:")
report.append("")
report.append("1. Start the application.")
report.append("2. Request a new password reset email.")
report.append("3. Click the newest recovery link.")
report.append("4. Enter a NEW password.")
report.append("5. Submit.")
report.append("")
report.append("Capture ALL of the following:")
report.append("")
report.append("A. Browser Console")
report.append("B. Network -> POST /api/hub/auth/reset-password")
report.append("   - Status Code")
report.append("   - Response Body")
report.append("")
report.append("C. Replit Server Console")
report.append("   - Any '[Hub Auth] Reset password error:' output")
report.append("   - Complete stack trace if present")
report.append("")
report.append("DO NOT modify repository files.")
report.append("DO NOT restart from assumptions.")
report.append("")
report.append("Paste the captured evidence into ChatGPT.")
report.append("")
report.append("=" * 80)

out = Path("tcrs/runtime/APP-REC-005-runtime-capture-instructions.txt")
out.write_text("\n".join(report), encoding="utf-8")

print("\n".join(report))
print()
print(f"Instructions written to: {out}")
