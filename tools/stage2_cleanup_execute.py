#!/usr/bin/env python3

from pathlib import Path
import shutil

ROOT = Path.cwd()

SAFE_PREFIXES = [
    "_final_backup_quarantine",
    "recovery/backups",
    "recovery/hubdashboard_implicit_any_cluster_rollback",
    "recovery/routes_typing_cluster_rollback",
    "recovery/top_level_await_cluster_rollback",
    "recovery/websocket_contract_fix",
]

SAFE_SUFFIXES = (
    ".candidate",
    ".bak",
)

SAFE_NAME_CONTAINS = (
    ".pre-",
)

deleted = []
skipped = []

def safe_delete(path: Path):
    rel = path.relative_to(ROOT)

    if path.is_dir():
        shutil.rmtree(path)
    else:
        path.unlink()

    deleted.append(str(rel))


for path in sorted(ROOT.rglob("*")):

    if ".git" in path.parts:
        continue

    rel = str(path.relative_to(ROOT))

    # Skip authoritative evidence locations
    if rel.startswith("execution/implementation-evidence"):
        skipped.append(rel)
        continue

    if rel.startswith("execution/packages"):
        skipped.append(rel)
        continue

    if rel.startswith("execution/recovery"):
        skipped.append(rel)
        continue

    if rel.startswith("execution/builders/recovery"):
        skipped.append(rel)
        continue

    approved = False

    if rel.startswith(tuple(SAFE_PREFIXES)):
        approved = True

    if rel.endswith(SAFE_SUFFIXES):
        approved = True

    if any(token in rel for token in SAFE_NAME_CONTAINS):
        approved = True

    if approved:

        try:
            safe_delete(path)
        except Exception as ex:
            skipped.append(f"{rel}    ({ex})")

manifest = ROOT / "repository_cleanup_manifest.txt"

with manifest.open("w", encoding="utf-8") as f:

    f.write("EOS-REPO-001A Repository Cleanup Manifest\n")
    f.write("=" * 60 + "\n\n")

    f.write("Deleted\n")
    f.write("-" * 40 + "\n")

    for item in deleted:
        f.write(item + "\n")

    f.write("\nSkipped\n")
    f.write("-" * 40 + "\n")

    for item in skipped:
        f.write(item + "\n")

print("=" * 72)
print("EOS-REPO-001A CLEANUP COMPLETE")
print("=" * 72)
print(f"Deleted : {len(deleted)}")
print(f"Skipped : {len(skipped)}")
print()
print(f"Manifest : {manifest}")
