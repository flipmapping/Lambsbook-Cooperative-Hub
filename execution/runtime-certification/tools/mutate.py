from pathlib import Path
import shutil
import re
import sys

ROOT = Path.home() / "workspace"

memberhub = ROOT / "client/src/pages/MemberHub.tsx"

backup = (
    ROOT
    / "execution/runtime-certification/backups/MemberHub.tsx.bak"
)

backup.parent.mkdir(parents=True, exist_ok=True)

shutil.copy2(memberhub, backup)

text = memberhub.read_text()

pattern = re.compile(
    r"""const\s+isDashboardLoading\s*=\s*
profileLoading\s*\|\|\s*
activityLoading\s*\|\|\s*
earningsLoading\s*\|\|\s*
invitationLoading\s*\|\|\s*
relationshipsLoading\s*\|\|\s*
false;""",
    re.MULTILINE,
)

replacement = """
const isDashboardLoading = profileLoading;
"""

updated, count = pattern.subn(replacement, text)

if count != 1:
    print("Mutation halted.")
    print("Expected bootstrap aggregation not found.")
    sys.exit(1)

memberhub.write_text(updated)

print("Mutation PASS")