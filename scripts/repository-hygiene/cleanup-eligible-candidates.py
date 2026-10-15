#!/usr/bin/env python3
"""Fail-closed monthly cleanup executor. Only exact registered regular files qualify."""
import argparse
import json
import os
import re
import stat
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

REGISTER = Path("execution/repository-stewardship/monthly-hygiene-eligibility-register.json")
RUNLOG = Path("execution/workspace/REP-STEWARD-027/monthly-run-evidence.jsonl")
SECRET = re.compile(r"(^|/)(\.env($|\.)|secrets?($|/)|credentials?($|/)|.*\.(pem|key|p12|pfx|secret)$)", re.I)
NEVER_ROOTS = (
    ".git", ".github", "governance", "scripts", "supabase", "database",
    "execution/contracts", "execution/repository-stewardship"
)
LOCAL_TZ = ZoneInfo("Asia/Singapore")


def git(root, *args):
    return subprocess.check_output(["git", *args], cwd=root)


def safe_rel(value):
    p = Path(value)
    return bool(value) and not p.is_absolute() and ".." not in p.parts and "\\" not in value and "\n" not in value


def metadata(root, rel):
    if not safe_rel(rel) or SECRET.search(rel):
        return None, "unsafe_or_secret_named_path"
    p = root
    parts = Path(rel).parts
    info = None
    try:
        for part in parts:
            p = p / part
            info = os.lstat(p)
            if stat.S_ISLNK(info.st_mode):
                return None, "symlink_path"
        if not info or not stat.S_ISREG(info.st_mode):
            return None, "not_regular_file"
        if any(rel == base or rel.startswith(base + "/") for base in NEVER_ROOTS):
            return None, "protected_path"
        return p, None
    except OSError:
        return None, "missing_or_unreadable"


def parse_time(value):
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        raise ValueError("timestamp_requires_timezone")
    return dt.astimezone(timezone.utc)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel").decode().strip()).resolve()
    now = datetime.now(timezone.utc)
    local_now = now.astimezone(LOCAL_TZ)
    next_day = local_now.date() + timedelta(days=1)
    month_end = next_day.month != local_now.month

    inventory = json.loads(Path(args.inventory).read_text(encoding="utf-8"))
    inv = inventory.get("inventory", {})
    tracked = set(inv.get("tracked_paths", []))
    untracked = set(inv.get("untracked_paths", []))
    ignored = {item.get("path") if isinstance(item, dict) else item for item in inv.get("ignored_path_metadata", [])}
    # The existing inventory tool stores ignored paths as metadata records.
    ignored = {x.get("path") for x in ignored if isinstance(x, dict)} | set(inv.get("ignored_paths", []))
    known = tracked | untracked | ignored

    data = json.loads((root / REGISTER).read_text(encoding="utf-8"))
    if data.get("schema") != "MONTHLY-HYGIENE-ELIGIBILITY-REGISTER-v1" or not isinstance(data.get("entries"), list):
        raise SystemExit("STOP=ELIGIBILITY_REGISTER_SCHEMA")

    records, eligible = [], []
    seen = set()
    for item in data["entries"]:
        if not isinstance(item, dict):
            raise SystemExit("STOP=INVALID_REGISTER_ENTRY")
        rel = item.get("path", "")
        if rel in seen:
            raise SystemExit("STOP=DUPLICATE_REGISTER_PATH")
        seen.add(rel)
        reasons = []
        if not safe_rel(rel) or SECRET.search(rel):
            reasons.append("unsafe_or_secret_named_path")
        if item.get("production_status") != "NON_PRODUCTION":
            reasons.append("production_status_not_proven_nonproduction")
        if not item.get("production_evidence"):
            reasons.append("production_evidence_missing")
        if not item.get("created_at_evidence"):
            reasons.append("creation_evidence_missing")
        if not item.get("owner"):
            reasons.append("owner_unknown")
        if item.get("references_status") != "NONE_FOUND" or not item.get("references_evidence"):
            reasons.append("references_not_cleared")
        if item.get("recovery_value") != "NOT_REQUIRED" or not item.get("recovery_evidence"):
            reasons.append("recovery_value_uncertain")
        if item.get("lifecycle_status") != "OBSOLETE":
            reasons.append("lifecycle_not_proven_obsolete")
        if rel not in known:
            reasons.append("not_in_current_inventory")

        try:
            created = parse_time(item.get("created_at", ""))
            if now - created <= timedelta(days=90):
                reasons.append("90_days_old_or_newer")
        except (ValueError, TypeError):
            reasons.append("creation_date_unknown")

        target, path_error = metadata(root, rel)
        if path_error:
            reasons.append(path_error)

        record = {
            "path": rel,
            "recommendation": "CLEANUP" if not reasons else "EXCLUDE",
            "reasons": reasons,
            "git_status": (
                "TRACKED" if rel in tracked else
                "UNTRACKED" if rel in untracked else
                "IGNORED" if rel in ignored else "UNKNOWN"
            ),
            "evidence": {
                "production": item.get("production_evidence"),
                "creation": item.get("created_at_evidence"),
                "references": item.get("references_evidence"),
                "recovery": item.get("recovery_evidence")
            }
        }
        records.append(record)
        if not reasons:
            eligible.append((rel, target))

    prior = []
    if RUNLOG.exists():
        for line in RUNLOG.read_text(encoding="utf-8").splitlines():
            try:
                prior.append(json.loads(line))
            except json.JSONDecodeError:
                raise SystemExit("STOP=RUNLOG_CORRUPT")
    cycle_month = local_now.strftime("%Y-%m")
    if args.apply and not month_end:
        raise SystemExit("STOP=NOT_LAST_DAY_IN_ASIA_SINGAPORE")
    if args.apply and any(x.get("cycle_month") == cycle_month and x.get("status") == "COMPLETED" for x in prior):
        print(json.dumps({"cycle_month": cycle_month, "status": "ALREADY_COMPLETED"}))
        return 0

    deleted = []
    if args.apply:
        # All paths are preflighted before any unlink. Only regular files are supported.
        for rel, target in eligible:
            if target is None or not target.is_file() or target.is_symlink():
                raise SystemExit("STOP=FINAL_PREFLIGHT_FAILED")
        for rel, target in eligible:
            target.unlink()
            deleted.append(rel)

    result = {
        "cycle_month": cycle_month,
        "run_time_utc": now.isoformat(),
        "timezone": "Asia/Singapore",
        "branch": git(root, "branch", "--show-current").decode().strip(),
        "head_before_run": git(root, "rev-parse", "HEAD").decode().strip(),
        "inventory_counts": {
            "tracked": len(tracked),
            "untracked": len(untracked),
            "ignored": len(ignored)
        },
        "status": "COMPLETED" if args.apply else "DRY_RUN",
        "recommendations": [r for r in records if r["recommendation"] == "CLEANUP"],
        "excluded_candidates": [r for r in records if r["recommendation"] == "EXCLUDE"],
        "deleted_paths": deleted,
        "cleanup_authority": "REP-STEWARD-027-WCS-001",
        "files_modified": bool(deleted),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if args.apply:
        RUNLOG.parent.mkdir(parents=True, exist_ok=True)
        with (root / RUNLOG).open("a", encoding="utf-8") as out:
            out.write(json.dumps(result, ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
