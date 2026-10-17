from __future__ import annotations

from collections import Counter

import argparse
import gzip
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


MANIFEST_SCHEMA = "EOS-VERIFIED-FEATURE-RESTORATION-MANIFEST-v1"
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


class GateError(Exception):
    pass


def stop(code: str, detail: str = "") -> None:
    raise GateError(f"{code}:{detail}" if detail else code)


def command(args: list[str], cwd: Path, input_bytes: bytes | None = None) -> bytes:
    result = subprocess.run(
        args,
        cwd=cwd,
        input=input_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode:
        stop(
            "COMMAND_FAILED",
            f"{args[0]} exit={result.returncode}: "
            f"{result.stderr.decode(errors='replace').strip()}",
        )
    return result.stdout


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        stop("REQUIRED_FILE_MISSING", str(path))
    except (OSError, json.JSONDecodeError) as exc:
        stop("INVALID_JSON", f"{path}: {exc}")
    if not isinstance(value, dict):
        stop("JSON_OBJECT_REQUIRED", str(path))
    return value


def verify_bound_file(root: Path, item: dict[str, str], label: str) -> Path:
    rel = Path(item["path"])
    if rel.is_absolute() or ".." in rel.parts:
        stop("UNSAFE_AUTHORITY_PATH", f"{label}:{rel}")
    path = (root / rel).resolve()
    if root.resolve() not in path.parents:
        stop("AUTHORITY_PATH_ESCAPES_REPOSITORY", label)
    if not path.is_file():
        stop("REQUIRED_FILE_MISSING", f"{label}:{rel}")
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != item["sha256"]:
        stop("AUTHORITY_DIGEST_MISMATCH", label)
    return path


def exact_paths(actual: list[str], expected: list[str]) -> None:
    if len(expected) != len(set(expected)):
        stop("DUPLICATE_DECLARED_PATH")
    if set(actual) != set(expected):
        stop(
            "EXACT_PATH_MISMATCH",
            f"missing={sorted(set(expected) - set(actual))}; "
            f"extra={sorted(set(actual) - set(expected))}",
        )



def verify_authority_wcs(authority: dict[str, Any], wcs: dict[str, Any]) -> None:
    if authority.get("status") != "AUTHORIZED":
        stop("AUTHORITY_NOT_ACTIVE")
    if authority.get("authority_id") != "HUB-RESTORE-AUTO-001":
        stop("UNEXPECTED_AUTHORITY")
    cycle_id = authority.get("cycle_id")
    if not isinstance(cycle_id, str) or not cycle_id:
        stop("AUTHORITY_CYCLE_MISSING")
    if wcs.get("status") != "FOUNDER_APPROVED":
        stop("WCS_NOT_APPROVED")
    if wcs.get("work_cycle_id") != cycle_id:
        stop("WCS_AUTHORITY_CYCLE_MISMATCH")


def release_contract(
    root: Path,
    item: dict[str, str],
    expected_paths: list[str],
    base_sha: str,
    candidate_sha: str,
) -> dict[str, Any]:
    path = verify_bound_file(root, item, "release_contract")
    contract = read_json(path)

    scope = contract.get("certified_change_scope")
    if not isinstance(scope, list):
        stop("CONTRACT_SCOPE_MISSING")
    exact_paths(scope, expected_paths)

    serialized = json.dumps(contract, sort_keys=True)
    if base_sha not in serialized or candidate_sha not in serialized:
        stop("CONTRACT_CANDIDATE_BINDING_MISMATCH")

    checks = contract.get("required_checks")
    if not isinstance(checks, list) or not all(
        isinstance(row, list) and row and all(isinstance(x, str) for x in row)
        for row in checks
    ):
        stop("CONTRACT_REQUIRED_CHECKS_MISSING")
    return contract


def patch_bytes(root: Path, path_value: str, expected_sha: str) -> bytes:
    rel = Path(path_value)
    if rel.is_absolute() or ".." in rel.parts:
        stop("UNSAFE_PATCH_PATH", path_value)
    path = (root / rel).resolve()
    if root.resolve() not in path.parents or not path.is_file():
        stop("PATCH_FILE_MISSING", path_value)

    raw = path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != expected_sha:
        stop("PATCH_DIGEST_MISMATCH")

    try:
        return gzip.decompress(raw) if path.suffix == ".gz" else raw
    except OSError as exc:
        stop("PATCH_GZIP_INVALID", str(exc))


def validate(root: Path, manifest: dict[str, Any]) -> tuple[bytes, list[str]]:
    if manifest.get("schema") != MANIFEST_SCHEMA:
        stop("MANIFEST_SCHEMA_MISMATCH")

    authority_path = verify_bound_file(root, manifest["authority"], "authority")
    authority = read_json(authority_path)
    if authority.get("status") != "AUTHORIZED":
        stop("AUTHORITY_NOT_ACTIVE")
    if authority.get("authority_id") != "HUB-RESTORE-AUTO-001":
        stop("UNEXPECTED_AUTHORITY")

    current_branch = command(
        ["git", "branch", "--show-current"], root
    ).decode().strip()
    if current_branch != authority.get("branch"):
        stop("AUTHORITY_BRANCH_MISMATCH", current_branch)

    wcs_path = verify_bound_file(root, manifest["wcs"], "wcs")
    wcs = read_json(wcs_path)
    verify_authority_wcs(authority, wcs)

    verify_bound_file(root, manifest["founder_decision"], "founder_decision")

    source = manifest["source"]
    paths = source["exact_paths"]
    approved_paths = (
        wcs.get("execution", {})
        .get("candidate", {})
        .get("exact_paths")
    )
    if not isinstance(approved_paths, list):
        stop("WCS_CANDIDATE_PATHS_MISSING")
    exact_paths(paths, approved_paths)
    certified_paths = authority.get("certified_mutation_paths")
    if not isinstance(certified_paths, list) or not set(paths).issubset(certified_paths):
        stop("PATHS_OUTSIDE_AUTHORITY")
    if not paths or len(paths) != len(set(paths)):
        stop("INVALID_EXACT_PATH_LIST")
    for item in paths:
        rel = Path(item)
        if rel.is_absolute() or ".." in rel.parts:
            stop("UNSAFE_CANDIDATE_PATH", item)

    target = manifest["target"]
    if target["branch"] != "main":
        stop("UNEXPECTED_TARGET_BRANCH", target["branch"])
    if not SHA_RE.fullmatch(target["baseline_sha"]):
        stop("INVALID_TARGET_BASELINE")

    contract = release_contract(
        root,
        manifest["release_contract"],
        paths,
        source["baseline_sha"],
        source["candidate_sha"],
    )
    if manifest["required_checks"] != contract["required_checks"]:
        stop("REQUIRED_CHECKS_DIFFER_FROM_CONTRACT")

    raw_patch = patch_bytes(root, source["patch_path"], source["patch_sha256"])
    source_diff = command(
        [
            "git", "diff", "--binary",
            source["baseline_sha"], source["candidate_sha"],
            "--", *paths,
        ],
        root,
    )
    changed = command(
        [
            "git", "diff", "--name-only",
            source["baseline_sha"], source["candidate_sha"],
        ],
        root,
    ).decode().splitlines()
    exact_paths(changed, paths)
    if raw_patch != source_diff:
        stop("PATCH_DOES_NOT_MATCH_BOUND_CANDIDATE")

    return raw_patch, paths


def resolve_target_baseline(root: Path, target: dict[str, str]) -> str:
    target_branch = target["branch"]
    if target_branch != "main":
        stop("UNEXPECTED_TARGET_BRANCH", target_branch)

    expected_sha = target["baseline_sha"]
    if not SHA_RE.fullmatch(expected_sha):
        stop("INVALID_TARGET_BASELINE")

    command(["git", "fetch", "origin", target_branch], root)
    remote_ref = f"refs/remotes/origin/{target_branch}"
    actual_sha = command(["git", "rev-parse", remote_ref], root).decode().strip()
    if actual_sha != expected_sha:
        stop(
            "TARGET_BASELINE_MISMATCH",
            f"expected={expected_sha}; origin/{target_branch}={actual_sha}",
        )
    return actual_sha



def link_node_modules(root: Path, worktree: Path) -> None:
    source = (root / "node_modules").resolve()
    if not source.is_dir():
        stop("NODE_MODULES_UNAVAILABLE", str(source))
    target = worktree / "node_modules"
    if target.exists() or target.is_symlink():
        stop("WORKTREE_NODE_MODULES_ALREADY_EXISTS", str(target))
    target.symlink_to(source, target_is_directory=True)


def typecheck_diagnostics(worktree: Path, args: list[str]) -> Counter:
    result = subprocess.run(
        args,
        cwd=worktree,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=False,
    )
    output = (result.stdout or "") + "\n" + (result.stderr or "")
    pattern = re.compile(
        r"^(?P<file>.+?)\(\d+,\d+\): error "
        r"(?P<code>TS\d+): (?P<message>.*)$"
    )
    diagnostics = Counter()
    unparsed_type_errors = []

    for line in output.splitlines():
        match = pattern.match(line.strip())
        if match:
            filename = match.group("file").replace("\\", "/")
            prefix = str(worktree.resolve()).replace("\\", "/").rstrip("/") + "/"
            if filename.startswith(prefix):
                filename = filename[len(prefix):]
            diagnostics[
                (filename, match.group("code"), match.group("message"))
            ] += 1
        elif "error TS" in line:
            unparsed_type_errors.append(line)

    if unparsed_type_errors:
        stop(
            "TYPECHECK_DIAGNOSTIC_FORMAT_UNRECOGNIZED",
            "; ".join(unparsed_type_errors[:3]),
        )
    if result.returncode != 0 and not diagnostics:
        stop(
            "TYPECHECK_COMMAND_FAILED_WITHOUT_DIAGNOSTICS",
            f"exit={result.returncode}: {output.strip()[:1000]}",
        )
    return diagnostics


def compare_typecheck_diagnostics(
    baseline_worktree: Path,
    candidate_worktree: Path,
    args: list[str],
) -> None:
    baseline = typecheck_diagnostics(baseline_worktree, args)
    candidate = typecheck_diagnostics(candidate_worktree, args)
    introduced = candidate - baseline
    if introduced:
        details = [
            f"{count}x {filename}: {code}: {message}"
            for (filename, code, message), count in sorted(introduced.items())
        ]
        stop("NEW_TYPESCRIPT_DIAGNOSTICS", " | ".join(details))
    print(f"TYPECHECK_COMPARISON=PASS baseline={sum(baseline.values())} candidate={sum(candidate.values())}")


def stage_and_verify_paths(worktree: Path, expected: list[str]) -> None:
    # Staging only approved paths includes new files in the scope check.
    command(["git", "add", "--", *expected], worktree)
    staged = command(
        ["git", "diff", "--cached", "--name-only"], worktree
    ).decode().splitlines()
    exact_paths(staged, expected)


def cleanup_worktree(root: Path, worktree: Path, registered: bool) -> None:
    if registered:
        command(["git", "worktree", "remove", "--force", str(worktree)], root)
        command(["git", "worktree", "prune"], root)
    if worktree.exists() or worktree.is_symlink():
        shutil.rmtree(worktree)


def run(manifest_path: Path, repo_root: Path) -> None:
    root = repo_root.resolve()
    manifest = read_json(manifest_path.resolve())
    patch, paths = validate(root, manifest)

    target_sha = resolve_target_baseline(root, manifest["target"])
    new_branch = f"restore/{manifest['source']['candidate_sha'][:12]}"
    remote = command(["git", "ls-remote", "--heads", "origin", new_branch], root)
    local = command(["git", "branch", "--list", new_branch], root)
    local_exists = bool(local.strip())
    local_sha = ""
    if remote.strip():
        stop("RESTORATION_BRANCH_ALREADY_EXISTS", new_branch)
    if local_exists:
        local_sha = command(
            ["git", "rev-parse", f"refs/heads/{new_branch}"], root
        ).decode().strip()
        if local_sha != target_sha:
            stop(
                "RESTORATION_BRANCH_NOT_AT_TARGET_BASELINE",
                f"{new_branch}={local_sha}; target={target_sha}",
            )

    candidate_worktree = Path(tempfile.mkdtemp(prefix="hub-restore-candidate-"))
    baseline_worktree = Path(tempfile.mkdtemp(prefix="hub-restore-baseline-"))
    shutil.rmtree(candidate_worktree)
    shutil.rmtree(baseline_worktree)
    candidate_added = False
    baseline_added = False

    try:
        command(
            ["git", "worktree", "add", "--detach", str(baseline_worktree), target_sha],
            root,
        )
        baseline_added = True
        if local_exists:
            command(
                ["git", "worktree", "add", str(candidate_worktree), new_branch],
                root,
            )
        else:
            command(
                ["git", "worktree", "add", "-b", new_branch, str(candidate_worktree), target_sha],
                root,
            )
        candidate_added = True

        link_node_modules(root, baseline_worktree)
        link_node_modules(root, candidate_worktree)

        command(["git", "apply", "--check", "--binary", "-"], candidate_worktree, patch)
        command(["git", "apply", "--binary", "-"], candidate_worktree, patch)

        stage_and_verify_paths(candidate_worktree, paths)

        for check in manifest["required_checks"]:
            command(check, candidate_worktree)

        wcs_path = verify_bound_file(root, manifest["wcs"], "wcs")
        wcs = read_json(wcs_path)
        comparison = wcs.get("execution", {}).get("typecheck_comparison", {})
        typecheck_command = comparison.get("restored_candidate_command")
        if (
            not isinstance(typecheck_command, list)
            or not typecheck_command
            or not all(isinstance(part, str) for part in typecheck_command)
            or comparison.get("baseline_command") != typecheck_command
        ):
            stop("TYPECHECK_COMPARISON_NOT_VALIDLY_SPECIFIED")
        compare_typecheck_diagnostics(
            baseline_worktree,
            candidate_worktree,
            typecheck_command,
        )

        command(["git", "add", "--", *paths], candidate_worktree)
        command(
            ["git", "commit", "-m", "Restore Founder-approved verified feature"],
            candidate_worktree,
        )
        command(["git", "push", "-u", "origin", new_branch], candidate_worktree)

        pr = manifest["pull_request"]
        command(
            [
                "gh", "pr", "create",
                "--base", "main",
                "--head", new_branch,
                "--title", pr["title"],
                "--body", pr["body"],
            ],
            candidate_worktree,
        )
        print("RESTORATION_PR_CREATED=YES")
    finally:
        cleanup_worktree(root, candidate_worktree, candidate_added)
        cleanup_worktree(root, baseline_worktree, baseline_added)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--repo-root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    try:
        run(args.manifest, args.repo_root)
    except GateError as exc:
        print(f"RESTORATION_STOP={exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
