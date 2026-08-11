#!/usr/bin/env python3
"""
EMP-COMPILER-CERT-001
Deterministic compiler contract certification.

The certifier is intentionally self-contained. It discovers the repository's
compiler source and declared/generated/live artifacts from repository truth,
rather than depending on hard-coded case-sensitive package paths.
"""

from __future__ import annotations

import ast
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


AUTHORITY = "EMP-COMPILER-CERT-001"
SOURCE_ROOT = "execution/compiler"
DECLARED_CONTRACT = "execution/contracts/compiler-contract.json"
LIVE_REGISTRY = "execution/registry/surfaces/SURFACE-REGISTRY.json"
CERTIFICATE = "execution/certification/compiler/COMPILER-CERTIFICATION.json"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical_json_bytes(value: Any) -> bytes:
    return (
        json.dumps(
            value,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode("utf-8")
    )


def canonical_json_hash(value: Any) -> str:
    return hashlib.sha256(canonical_json_bytes(value)).hexdigest()


def repo_root() -> Path:
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=Path.cwd(),
            text=True,
        ).strip()
    except Exception as exc:
        raise RuntimeError(f"repository root cannot be resolved: {exc}")
    return Path(out).resolve()


def case_sensitive_resolve(root: Path, relative: str) -> Path:
    """
    Resolve a repository path by walking directory entries exactly as stored.
    Path.exists() alone is insufficient on case-insensitive filesystems.
    """
    current = root
    parts = Path(relative).parts

    for part in parts:
        if part in ("", "."):
            continue
        if part == "..":
            raise RuntimeError(f"invalid repository-relative path: {relative}")

        matches = [entry for entry in current.iterdir() if entry.name == part]
        if len(matches) != 1:
            names = sorted(entry.name for entry in current.iterdir())
            if part.lower() in {name.lower() for name in names}:
                raise RuntimeError(
                    f"CASE_MISMATCH: requested {relative!r}; "
                    f"repository contains case-sensitive sibling(s): "
                    f"{[name for name in names if name.lower() == part.lower()]}"
                )
            raise RuntimeError(
                f"MISSING_PATH: {relative!r}; missing component {part!r}"
            )
        current = matches[0]

    return current


def rel(root: Path, path: Path) -> str:
    return path.resolve().relative_to(root.resolve()).as_posix()


def git_sha(root: Path) -> str | None:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            cwd=root,
            text=True,
        ).strip()
    except Exception:
        return None


def git_status(root: Path) -> list[str]:
    try:
        return subprocess.check_output(
            ["git", "status", "--short"],
            cwd=root,
            text=True,
        ).splitlines()
    except Exception:
        return []


def node_name(node: ast.AST) -> str:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return f"{node_name(node.value)}.{node.attr}"
    return ast.dump(node, annotate_fields=False)


def annotation_text(node: ast.AST | None) -> str | None:
    if node is None:
        return None
    return ast.unparse(node)


def inspect_module(root: Path, path: Path) -> dict[str, Any]:
    source = path.read_text(encoding="utf-8")

    try:
        tree = ast.parse(source, filename=str(path))
    except SyntaxError as exc:
        return {
            "path": rel(root, path),
            "sha256": sha256(path),
            "status": "INVALID",
            "syntax_error": {
                "line": exc.lineno,
                "column": exc.offset,
                "message": exc.msg,
            },
            "objects": [],
            "imports": [],
            "references": [],
        }

    objects: list[dict[str, Any]] = []
    imports: list[str] = []
    references: list[str] = []

    defined_names: set[str] = set()
    referenced_names: set[str] = set()

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            defined_names.add(node.name)

            item: dict[str, Any] = {
                "kind": type(node).__name__,
                "name": node.name,
                "line": node.lineno,
                "end_line": getattr(node, "end_lineno", node.lineno),
                "classification": "DEFINED",
            }

            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                item["arguments"] = [
                    {
                        "name": arg.arg,
                        "annotation": annotation_text(arg.annotation),
                    }
                    for arg in (
                        list(node.args.posonlyargs)
                        + list(node.args.args)
                        + list(node.args.kwonlyargs)
                    )
                ]
                item["return_annotation"] = annotation_text(node.returns)

            if isinstance(node, ast.ClassDef):
                item["bases"] = [ast.unparse(base) for base in node.bases]

            objects.append(item)

        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name)
            else:
                module = node.module or ""
                for alias in node.names:
                    imports.append(
                        f"{module}.{alias.name}" if module else alias.name
                    )

        elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
            referenced_names.add(node.id)
            references.append(node.id)

        elif isinstance(node, ast.Call):
            references.append(f"CALL:{node_name(node.func)}")

    # Classification is deliberately four-state:
    # DEFINED / USED / UNUSED / INVALID.
    # Imported/referenced/constructed are evidence attributes, not states.
    for item in objects:
        name = item["name"]
        if name in referenced_names:
            item["classification"] = "USED"
            item["evidence"] = {
                "referenced": True,
                "constructed": any(
                    ref == f"CALL:{name}" or ref.endswith(f".{name}")
                    for ref in references
                ),
            }
        else:
            item["classification"] = "UNUSED"
            item["evidence"] = {
                "referenced": False,
                "constructed": False,
            }

    return {
        "path": rel(root, path),
        "sha256": sha256(path),
        "status": "VALID",
        "objects": objects,
        "imports": sorted(set(imports)),
        "references": sorted(set(references)),
    }


def discover_generated_contracts(root: Path) -> list[dict[str, Any]]:
    """
    Discover JSON artifacts whose names or content identify them as compiler
    contracts/certifications/manifests. No package name or case is assumed.
    """
    candidates: list[Path] = []

    for base in (
        root / "execution",
        root / "governance",
    ):
        if not base.exists():
            continue

        for path in base.rglob("*.json"):
            if any(part == "__pycache__" for part in path.parts):
                continue

            upper = path.name.upper()

            if any(
                token in upper
                for token in (
                    "COMPILER",
                    "CONTRACT-MANIFEST",
                    "SURFACE-CERTIFICATION",
                    "PROVIDER-DEPENDENCY",
                    "PROVIDER-LIFECYCLE",
                    "REGISTRY-PAYLOAD",
                    "REGISTRY-CONFORMANCE",
                    "REPOSITORY-MUTATION-PACKAGE",
                )
            ):
                candidates.append(path)

    result = []
    seen = set()

    for path in sorted(candidates, key=lambda p: rel(root, p)):
        rp = rel(root, path)
        if rp in seen:
            continue
        seen.add(rp)

        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            result.append(
                {
                    "path": rp,
                    "sha256": sha256(path),
                    "status": "INVALID",
                    "error": str(exc),
                }
            )
            continue

        result.append(
            {
                "path": rp,
                "sha256": sha256(path),
                "status": "VALID",
                "content_sha256": canonical_json_hash(data),
                "top_level_keys": (
                    sorted(data.keys()) if isinstance(data, dict) else []
                ),
            }
        )

    return result


def find_package_lineage(root: Path) -> list[str]:
    """
    Discover package lineage by repository naming/content rather than by
    assuming a particular authority directory.
    """
    found: set[str] = set()

    for base in (
        root / "execution/packages",
        root / "execution/workspace",
        root / "execution/implementation-context",
        root / "governance",
    ):
        if not base.exists():
            continue

        for path in base.rglob("*"):
            if not path.is_file():
                continue

            name = path.name.upper()
            if not (
                "FDR-010E34B" in name
                or "RMP-010E34B" in name
                or "COMPILER" in name
            ):
                continue

            found.add(rel(root, path))

    return sorted(found)


def load_json(root: Path, relative: str) -> tuple[Path, Any]:
    path = case_sensitive_resolve(root, relative)
    try:
        return path, json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise RuntimeError(f"INVALID_JSON: {relative}: {exc}")


def first_fracture(
    category: str,
    path: str,
    obj: str,
    expected: Any,
    actual: Any,
    evidence: Any,
    owner: str,
) -> dict[str, Any]:
    return {
        "category": category,
        "path": path,
        "object": obj,
        "expected": expected,
        "actual": actual,
        "evidence": evidence,
        "recommended_owning_authority": owner,
    }


def main() -> int:
    root = repo_root()
    started = datetime.now(timezone.utc)

    print("=" * 88)
    print(AUTHORITY)
    print("AUTOMATED COMPILER CERTIFICATION")
    print("=" * 88)

    fracture: dict[str, Any] | None = None

    # ------------------------------------------------------------------
    # 1. Discover source from repository truth.
    # ------------------------------------------------------------------
    source_dir = case_sensitive_resolve(root, SOURCE_ROOT)
    source_files = sorted(source_dir.glob("*.py"))

    if not source_files:
        fracture = first_fracture(
            "SOURCE_DISCOVERY",
            SOURCE_ROOT,
            "*",
            "at least one Python compiler module",
            "none",
            "execution/compiler contains no *.py source",
            "EMP",
        )

    modules = []
    if fracture is None:
        modules = [inspect_module(root, path) for path in source_files]

        invalid = next(
            (m for m in modules if m["status"] == "INVALID"),
            None,
        )

        if invalid:
            fracture = first_fracture(
                "SOURCE_SYNTAX",
                invalid["path"],
                "<module>",
                "valid Python AST",
                invalid.get("syntax_error"),
                invalid,
                "EMP",
            )

    # ------------------------------------------------------------------
    # 2. Resolve declared contract and live registry case-sensitively.
    # ------------------------------------------------------------------
    declared_path = None
    declared = None
    live_path = None
    live = None

    if fracture is None:
        try:
            declared_path, declared = load_json(root, DECLARED_CONTRACT)
        except RuntimeError as exc:
            fracture = first_fracture(
                "DECLARED_CONTRACT",
                DECLARED_CONTRACT,
                "<contract>",
                "case-sensitive repository path resolving to valid JSON",
                str(exc),
                "repository resolution",
                "EMP",
            )

    if fracture is None:
        try:
            live_path, live = load_json(root, LIVE_REGISTRY)
        except RuntimeError as exc:
            fracture = first_fracture(
                "LIVE_REGISTRY",
                LIVE_REGISTRY,
                "<registry>",
                "case-sensitive repository path resolving to valid JSON",
                str(exc),
                "repository resolution",
                "Repo Stewardship",
            )

    # ------------------------------------------------------------------
    # 3. Compare source -> declared contract.
    # ------------------------------------------------------------------
    declared_source_paths = set()
    if isinstance(declared, dict):
        for item in declared.get("sources", []):
            if isinstance(item, dict) and item.get("path"):
                declared_source_paths.add(item["path"])

    actual_source_paths = {rel(root, p) for p in source_files}

    if fracture is None and declared_source_paths != actual_source_paths:
        fracture = first_fracture(
            "SOURCE_CONTRACT_DIVERGENCE",
            DECLARED_CONTRACT,
            "sources",
            sorted(actual_source_paths),
            sorted(declared_source_paths),
            {
                "missing_from_contract": sorted(
                    actual_source_paths - declared_source_paths
                ),
                "stale_contract_entries": sorted(
                    declared_source_paths - actual_source_paths
                ),
            },
            "EMP",
        )

    # ------------------------------------------------------------------
    # 4. Compare source fingerprints against declared contract.
    # ------------------------------------------------------------------
    if fracture is None:
        actual_hashes = {
            rel(root, p): sha256(p)
            for p in source_files
        }

        declared_hashes = {
            item.get("path"): item.get("sha256")
            for item in declared.get("sources", [])
            if isinstance(item, dict)
        }

        mismatches = {
            path: {
                "expected": actual_hashes.get(path),
                "actual": declared_hashes.get(path),
            }
            for path in sorted(actual_hashes.keys() | declared_hashes.keys())
            if actual_hashes.get(path) != declared_hashes.get(path)
        }

        if mismatches:
            fracture = first_fracture(
                "SOURCE_FRESHNESS",
                DECLARED_CONTRACT,
                "sources.sha256",
                actual_hashes,
                declared_hashes,
                mismatches,
                "EMP",
            )

    # ------------------------------------------------------------------
    # 5. Generated artifacts + package lineage.
    # ------------------------------------------------------------------
    generated = discover_generated_contracts(root)
    lineage = find_package_lineage(root)

    # ------------------------------------------------------------------
    # 6. Compare generated registry payloads against live registry.
    # ------------------------------------------------------------------
    registry_payloads = [
        item
        for item in generated
        if item["path"].upper().endswith("SURFACE-REGISTRY.JSON")
        and item["path"] != LIVE_REGISTRY
    ]

    generated_registry = None
    generated_registry_path = None

    for item in registry_payloads:
        try:
            p, data = load_json(root, item["path"])
            generated_registry_path = rel(root, p)
            generated_registry = data
            break
        except RuntimeError:
            continue

    if (
        fracture is None
        and generated_registry is not None
        and live is not None
        and generated_registry != live
    ):
        fracture = first_fracture(
            "GENERATED_TO_LIVE_DIVERGENCE",
            generated_registry_path or "<generated registry>",
            "registry",
            generated_registry,
            live,
            {
                "generated_sha256": canonical_json_hash(generated_registry),
                "live_sha256": canonical_json_hash(live),
            },
            "Repo Stewardship",
        )

    # ------------------------------------------------------------------
    # 7. Provider contracts: UNUSED is evidence, not failure.
    # ------------------------------------------------------------------
    classifications = []
    for module in modules:
        for obj in module.get("objects", []):
            classifications.append(
                {
                    "path": module["path"],
                    "kind": obj["kind"],
                    "name": obj["name"],
                    "classification": obj["classification"],
                    "evidence": obj.get("evidence", {}),
                }
            )

    counts = {
        state: sum(
            1 for item in classifications
            if item["classification"] == state
        )
        for state in ("DEFINED", "USED", "UNUSED", "INVALID")
    }

    # ------------------------------------------------------------------
    # 8. Contract / generated hashes.
    # ------------------------------------------------------------------
    source_bundle = {
        item["path"]: item["sha256"]
        for item in modules
    }

    source_bundle_hash = canonical_json_hash(source_bundle)

    declared_hash = sha256(declared_path) if declared_path else None
    live_hash = sha256(live_path) if live_path else None

    finished = datetime.now(timezone.utc)

    result = "PASS" if fracture is None else "FAIL"

    certificate = {
        "schema_version": "1.0",
        "authority": AUTHORITY,
        "result": result,
        "certification_timestamp": finished.isoformat(),
        "started_at": started.isoformat(),
        "repository": {
            "root": str(root),
            "git_head": git_sha(root),
            "git_status_at_certification": git_status(root),
        },
        "source": {
            "root": SOURCE_ROOT,
            "files": sorted(source_bundle),
            "source_count": len(source_bundle),
            "bundle_sha256": source_bundle_hash,
        },
        "declared_contract": {
            "path": (
                rel(root, declared_path)
                if declared_path else DECLARED_CONTRACT
            ),
            "sha256": declared_hash,
            "schema_version": (
                declared.get("schema_version")
                if isinstance(declared, dict)
                else None
            ),
        },
        "generated_artifacts": generated,
        "package_lineage": lineage,
        "live_registry": {
            "path": (
                rel(root, live_path)
                if live_path else LIVE_REGISTRY
            ),
            "sha256": live_hash,
            "generated_registry_path": generated_registry_path,
        },
        "interfaces": [
            {
                "path": module["path"],
                "imports": module["imports"],
                "objects": [
                    {
                        "kind": obj["kind"],
                        "name": obj["name"],
                        "arguments": obj.get("arguments"),
                        "return_annotation": obj.get("return_annotation"),
                        "bases": obj.get("bases"),
                        "classification": obj["classification"],
                        "evidence": obj.get("evidence", {}),
                    }
                    for obj in module["objects"]
                ],
            }
            for module in modules
        ],
        "dependencies": [
            {
                "path": module["path"],
                "imports": module["imports"],
            }
            for module in modules
        ],
        "object_classification": {
            "counts": counts,
            "objects": classifications,
        },
        "provenance": {
            "authority": AUTHORITY,
            "source_of_truth": SOURCE_ROOT,
            "declared_contract": DECLARED_CONTRACT,
            "live_registry": LIVE_REGISTRY,
            "package_lineage_count": len(lineage),
        },
        "hashes": {
            "source_bundle_sha256": source_bundle_hash,
            "declared_contract_sha256": declared_hash,
            "live_registry_sha256": live_hash,
        },
        "fracture": fracture,
    }

    certificate_path = root / CERTIFICATE
    certificate_path.parent.mkdir(parents=True, exist_ok=True)

    certificate_path.write_text(
        json.dumps(certificate, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print("\nRESULT:", result)
    print("SOURCE COUNT:", len(source_bundle))
    print("SOURCE BUNDLE SHA256:", source_bundle_hash)
    print("DECLARED CONTRACT SHA256:", declared_hash)
    print("LIVE REGISTRY SHA256:", live_hash)
    print("OBJECT COUNTS:", json.dumps(counts, sort_keys=True))
    print("PACKAGE LINEAGE:", len(lineage))
    print("CERTIFICATE:", CERTIFICATE)

    if fracture:
        print("\nFIRST MATERIAL FRACTURE:")
        print(json.dumps(fracture, indent=2, ensure_ascii=False))
        print("\nFAIL: certification stopped at first material fracture.")
        return 1

    print("\nCERTIFIED: PASS")
    print("Compiler contract is ready for downstream consumption.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
