#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import tempfile
import sys

REPO = Path.home() / "workspace"
OUT_DIR = REPO / "execution" / "sprints" / "SFP-001"
OUT_FILE = OUT_DIR / "REPOSITORY-TRUTH-SUMMARY.md"

SEARCH_DIRS = [
    "execution",
    "execution/builders",
    "execution/packages",
    "execution/scripts",
    "execution/framework",
    "execution/repository-truth",
    "governance",
    "scripts",
]

EXTENSIONS = {
    ".py",
    ".sh",
    ".bash",
    ".md",
    ".json",
    ".yaml",
    ".yml",
}

def header(title: str) -> str:
    return f"\n## {title}\n"

def list_tree(root: Path):
    if not root.exists():
        return [f"[NOT FOUND] {root.relative_to(REPO)}"]

    results = []

    for p in sorted(root.rglob("*")):
        if p.is_file():
            if p.suffix.lower() in EXTENSIONS:
                results.append(str(p.relative_to(REPO)))

    if not results:
        results.append("[NO MATCHING FILES]")

    return results

def main():

    print("=" * 40)
    print("SFP-001")
    print("PHASE 3 - REPOSITORY BOOTSTRAP")
    print("READ ONLY")
    print("=" * 40)

    if not (REPO / ".git").exists():
        print(f"[FAIL] {REPO} is not a Git repository.")
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile(
        "w",
        delete=False,
        encoding="utf-8"
    ) as tmp:

        tmp.write("# Repository Truth Summary\n\n")
        tmp.write(f"Generated: {datetime.now().isoformat()}\n\n")
        tmp.write(f"Repository: {REPO}\n")

        for d in SEARCH_DIRS:

            tmp.write(header(d))

            for line in list_tree(REPO / d):
                tmp.write(line + "\n")

        temp_name = Path(tmp.name)

    if temp_name.stat().st_size == 0:
        print("[FAIL] Generated summary is empty.")
        temp_name.unlink(missing_ok=True)
        return 1

    if OUT_FILE.exists():
        backup = OUT_FILE.with_suffix(
            OUT_FILE.suffix + "." +
            datetime.now().strftime("%Y%m%d%H%M%S") +
            ".bak"
        )
        shutil.copy2(OUT_FILE, backup)

    shutil.move(str(temp_name), OUT_FILE)

    print("[PASS] Repository Truth Summary generated.")
    print(f"[PASS] {OUT_FILE}")
    print(f"[PASS] Size: {OUT_FILE.stat().st_size} bytes")

    return 0

if __name__ == "__main__":
    sys.exit(main())