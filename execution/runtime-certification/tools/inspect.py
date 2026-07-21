from pathlib import Path
import sys

ROOT = Path.home() / "workspace"

memberhub = ROOT / "client/src/pages/MemberHub.tsx"

if not memberhub.exists():
    print("ERROR")
    print("Authorized mutation surface not found.")
    sys.exit(1)

text = memberhub.read_text()

required = [
    "profileLoading",
    "activityLoading",
    "earningsLoading",
    "invitationLoading",
    "relationshipsLoading",
]

missing = [x for x in required if x not in text]

if missing:
    print("ERROR")
    print("Repository evidence no longer matches approved authority.")
    print(missing)
    sys.exit(1)

print("Inspection PASS")
print(memberhub)