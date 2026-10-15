#!/usr/bin/env python3
"""Read-only repository inventory for a monthly hygiene review.

Prints JSON to stdout. It does not write reports, alter files, or perform cleanup.
Run from the repository root. Candidate-list lines are repository-relative paths.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import stat
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

SECRET_NAME = re.compile(
    r"(^|/)(\.env($|\.)|secrets?($|/)|credentials?($|/)|"
    r".*\.(pem|key|p12|pfx|secret)$|.*(token|credential|secret).*)",
    re.IGNORECASE,
)


def git(root: Path, *args: str) -> bytes:
    return subprocess.check_output(["git", *args], cwd=root)


def git_paths(root: Path, *args: str) -> list[str]:
    return [os.fsdecode(p) for p in git(root, *args).split(b"\0") if p]


def valid_relative_path(value: str) -> bool:
    path = Path(value)
    return bool(value) and not path.is_absolute() and ".." not in path.parts


def path_metadata(root: Path, rel: str) -> dict:
    if not valid_relative_path(rel):
        return {"kind": "not_checked", "reason": "unsafe_relative_path"}

    current = root
    parts = Path(rel).parts
    info = None
    try:
        for index, part in enumerate(parts):
            current = current / part
            info = os.lstat(current)
            if stat.S_ISLNK(info.st_mode):
                if index < len(parts) - 1:
                    return {"kind": "not_followed", "reason": "symlink_parent"}
                return {
                    "kind": "symlink",
                    "size_bytes": info.st_size,
                    "mode": oct(stat.S_IMODE(info.st_mode)),
                }

        if info is None:
            return {"kind": "missing"}

        kind = (
            "directory" if stat.S_ISDIR(info.st_mode) else
            "file" if stat.S_ISREG(info.st_mode) else
            "other"
        )
        return {
            "kind": kind,
            "size_bytes": info.st_size,
            "mode": oct(stat.S_IMODE(info.st_mode)),
            "modified_utc": datetime.fromtimestamp(
                info.st_mtime, timezone.utc
            ).isoformat(),
        }
    except FileNotFoundError:
        return {"kind": "missing"}
    except OSError as exc:
        return {"kind": "not_checked", "reason": type(exc).__name__}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--candidate-list",
        help="UTF-8 text file of repository-relative candidate paths, one per line",
    )
    args = parser.parse_args()

    root = Path(
        subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"], text=True
        ).strip()
    ).resolve()

    tracked = sorted(git_paths(root, "ls-files", "-z"))
    untracked = sorted(git_paths(
        root, "ls-files", "--others", "--exclude-standard", "-z"
    ))
    ignored = sorted(git_paths(
        root, "ls-files", "--others", "--ignored", "--exclude-standard", "-z"
    ))
    tracked_set, untracked_set, ignored_set = set(tracked), set(untracked), set(ignored)

    candidates = []
    if args.candidate_list:
        candidate_file = Path(args.candidate_list)
        if candidate_file.is_absolute():
            raise SystemExit("STOP=CANDIDATE_LIST_MUST_BE_REPOSITORY_RELATIVE")
        if not valid_relative_path(args.candidate_list):
            raise SystemExit("STOP=UNSAFE_CANDIDATE_LIST_PATH")
        metadata = path_metadata(root, args.candidate_list)
        if metadata.get("kind") != "file" or SECRET_NAME.search(args.candidate_list):
            raise SystemExit("STOP=CANDIDATE_LIST_NOT_A_SAFE_REGULAR_FILE")
        candidates = [
            line.strip()
            for line in (root / candidate_file).read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        ]

    records = []
    for rel in candidates:
        if not valid_relative_path(rel):
            records.append({
                "path": rel,
                "existence": "NOT_CHECKED",
                "git_status": "UNSAFE_PATH",
                "disposition": "UNKNOWN",
                "confidence": "LOW",
                "references": "MANUAL_REVIEW_REQUIRED",
                "owner": "MANUAL_REVIEW_REQUIRED",
                "recovery_value": "MANUAL_REVIEW_REQUIRED",
            })
            continue

        metadata = path_metadata(root, rel)
        exists = metadata.get("kind") not in (
            "missing", "not_checked", "not_followed"
        )
        status = (
            "TRACKED" if rel in tracked_set else
            "UNTRACKED" if rel in untracked_set else
            "IGNORED" if rel in ignored_set else
            "NOT_TRACKED"
        )
        if metadata.get("kind") in ("not_checked", "not_followed"):
            disposition, confidence = "UNKNOWN", "LOW"
        elif not exists:
            disposition, confidence = "MISSING", "HIGH"
        elif status == "TRACKED":
            disposition, confidence = "PROTECTED", "HIGH"
        else:
            disposition, confidence = "REVIEW", "LOW"

        records.append({
            "path": rel,
            "existence": "PRESENT" if exists else "ABSENT",
            "path_metadata": metadata,
            "git_status": status,
            "disposition": disposition,
            "confidence": confidence,
            "references": "MANUAL_REVIEW_REQUIRED",
            "owner": "MANUAL_REVIEW_REQUIRED",
            "recovery_value": "MANUAL_REVIEW_REQUIRED",
        })

    secret_paths = sorted({
        p for p in tracked + untracked + ignored if SECRET_NAME.search(p)
    })
    result = {
        "schema": "MONTHLY-REPOSITORY-HYGIENE-INVENTORY-v1",
        "audit_timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "repository_root": str(root),
        "branch": subprocess.check_output(
            ["git", "branch", "--show-current"], cwd=root, text=True
        ).strip(),
        "head": subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=root, text=True
        ).strip(),
        "cleanup_authority": "NOT_GRANTED",
        "files_modified": False,
        "cleanup_performed": False,
        "inventory": {
            "tracked_count": len(tracked),
            "tracked_paths": tracked,
            "untracked_count": len(untracked),
            "untracked_paths": untracked,
            "ignored_count": len(ignored),
            "ignored_path_metadata": [
                {"path": p, **path_metadata(root, p)} for p in ignored
            ],
            "secret_related_path_metadata_only": [
                {"path": p, **path_metadata(root, p)} for p in secret_paths
            ],
        },
        "candidate_records": records,
        "limitations": [
            "Path-name detection for secrets can have false positives and misses.",
            "References, ownership, and recovery value require human review.",
            "No disposition authorizes cleanup."
        ],
    }
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
