from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import re
import sys

TARGET = Path(
    "execution/builder/delivery/generated-cib/"
    "CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md"
)

if not TARGET.exists():
    raise SystemExit(f"ERROR: Missing {TARGET}")

if len(sys.argv) != 2:
    raise SystemExit(
        "Usage: python3 gex_rec_020.py '<Production Surface>'"
    )

production_surface = sys.argv[1]

repository = subprocess.check_output(
    ["git", "remote", "get-url", "origin"],
    text=True
).strip()

fields = {
    "Implementation Authority": "GE-RMP-014",
    "Repository": repository,
    "Production Surface": production_surface,
    "Implementation Context Manifest":
        "execution/packages/GE-RMP-014-Claude-Package/"
        "governance/icm/generated/"
        "ICM-GE-RMP-014-CTBC-RECRUITMENT-EMAIL-ENABLEMENT.md",
}

backup = TARGET.with_name(
    TARGET.name +
    ".pre-gex-rec-021." +
    datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
)

shutil.copy2(TARGET, backup)

text = TARGET.read_text(encoding="utf-8", errors="ignore")

for field, value in fields.items():
    pattern = re.compile(
        rf"(?ms)^({re.escape(field)}\n\n)(.+?)(?=\n[A-Z][^\n]*\n\n|\Z)"
    )

    replacement = f"{field}\n\n{value}"

    if pattern.search(text):
        text = pattern.sub(replacement, text, count=1)
    else:
        text += "\n\n" + replacement

TARGET.write_text(text, encoding="utf-8")

print("=" * 72)
print("Backup")
print("=" * 72)
print(backup)

print("\nMutation complete.")
