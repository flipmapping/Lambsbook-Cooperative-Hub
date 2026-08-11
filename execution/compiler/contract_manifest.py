"""
EMP Compiler Contract Manifest Generator.

Source of truth:
    execution/compiler/*.py

Generated evidence:
    execution/contracts/compiler-contract.json

The generated manifest intentionally contains no timestamp so that
unchanged compiler source produces byte-identical contract evidence.
"""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
COMPILER = ROOT / "execution" / "compiler"
OUTPUT = ROOT / "execution" / "contracts" / "compiler-contract.json"


def git_sha() -> str:
    return subprocess.check_output(
        ["git", "-C", str(ROOT), "rev-parse", "HEAD"],
        text=True,
    ).strip()


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def annotation(node: ast.AST | None) -> str | None:
    if node is None:
        return None
    return ast.unparse(node)


def argument_data(arg: ast.arg) -> dict[str, Any]:
    return {
        "name": arg.arg,
        "annotation": annotation(arg.annotation),
    }


def method_data(node: ast.FunctionDef | ast.AsyncFunctionDef) -> dict[str, Any]:
    args = node.args

    positional = list(args.posonlyargs) + list(args.args)

    return {
        "name": node.name,
        "async": isinstance(node, ast.AsyncFunctionDef),
        "arguments": {
            "positional": [argument_data(a) for a in positional],
            "vararg": argument_data(args.vararg) if args.vararg else None,
            "keyword_only": [argument_data(a) for a in args.kwonlyargs],
            "kwarg": argument_data(args.kwarg) if args.kwarg else None,
        },
        "returns": annotation(node.returns),
    }


def class_data(node: ast.ClassDef) -> dict[str, Any]:
    fields = []
    methods = []

    for child in node.body:
        if isinstance(child, ast.AnnAssign):
            if isinstance(child.target, ast.Name):
                fields.append({
                    "name": child.target.id,
                    "annotation": annotation(child.annotation),
                })

        elif isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if not child.name.startswith("__"):
                methods.append(method_data(child))

    return {
        "name": node.name,
        "bases": [ast.unparse(base) for base in node.bases],
        "fields": fields,
        "methods": sorted(methods, key=lambda x: x["name"]),
    }


def module_data(path: Path) -> dict[str, Any]:
    source = path.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(path))

    classes = [
        class_data(node)
        for node in tree.body
        if isinstance(node, ast.ClassDef)
    ]

    functions = []

    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if not node.name.startswith("__"):
                functions.append(method_data(node))

    return {
        "path": str(path.relative_to(ROOT)),
        "sha256": sha256(path),
        "classes": sorted(classes, key=lambda x: x["name"]),
        "functions": sorted(functions, key=lambda x: x["name"]),
    }


def provider_lifecycle() -> list[dict[str, Any]]:
    """Derive provider lifecycle state from compiler AST evidence."""
    providers = [
        "AuthorityProvider",
        "RepositoryProvider",
        "StandardsProvider",
    ]

    states = {
        name: {
            "name": name,
            "defined": False,
            "imported": False,
            "referenced": False,
            "constructed": False,
            "used": False,
        }
        for name in providers
    }

    sources = sorted(
        p for p in COMPILER.rglob("*.py")
        if "__pycache__" not in p.parts
    )

    for path in sources:
        tree = ast.parse(
            path.read_text(encoding="utf-8"),
            filename=str(path),
        )

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                if node.name in states:
                    states[node.name]["defined"] = True

            elif isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name in states:
                        states[alias.name]["imported"] = True

            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    if alias.name in states:
                        states[alias.name]["imported"] = True

            elif isinstance(node, ast.Call):
                target = node.func

                if isinstance(target, ast.Name):
                    if target.id in states:
                        states[target.id]["constructed"] = True
                        states[target.id]["used"] = True

                elif isinstance(target, ast.Attribute):
                    if target.attr in states:
                        states[target.attr]["constructed"] = True
                        states[target.attr]["used"] = True

            elif isinstance(node, ast.Name):
                if node.id in states:
                    states[node.id]["referenced"] = True

            elif isinstance(node, ast.Attribute):
                if node.attr in states:
                    states[node.attr]["referenced"] = True

    return [states[name] for name in providers]


def build_manifest() -> dict[str, Any]:
    sources = sorted(
        p for p in COMPILER.rglob("*.py")
        if "__pycache__" not in p.parts
    )

    modules = [module_data(path) for path in sources]

    return {
        "schema_version": "1.0",
        "contract_type": "EXECUTION_COMPILER_CONTRACT",
        "authority": "EMP-001M-08",
        "source_of_truth": "execution/compiler/*.py",
        "repository_sha": git_sha(),
        "source_count": len(modules),
        "sources": modules,
        "provider_lifecycle": provider_lifecycle(),
    }



def verify_manifest() -> bool:
    """
    Verify that the committed compiler contract matches current compiler
    source hashes and repository identity.

    This function never rewrites the manifest.
    """
    if not OUTPUT.exists():
        print("CONTRACT STALE: compiler contract is missing.")
        return False

    try:
        existing = json.loads(
            OUTPUT.read_text(encoding="utf-8")
        )
    except (OSError, json.JSONDecodeError) as exc:
        print(f"CONTRACT STALE: cannot read compiler contract: {exc}")
        return False

    expected = build_manifest()

    expected_serialized = json.dumps(
        expected,
        indent=2,
        sort_keys=True,
        ensure_ascii=False,
    ) + "\n"

    actual_serialized = json.dumps(
        existing,
        indent=2,
        sort_keys=True,
        ensure_ascii=False,
    ) + "\n"

    if existing != expected:
        print("CONTRACT STALE: compiler contract does not match source.")
        print(f"Expected repository SHA: {expected['repository_sha']}")
        print(f"Actual repository SHA  : {existing.get('repository_sha')}")

        expected_sources = {
            item["path"]: item["sha256"]
            for item in expected["sources"]
        }

        actual_sources = {
            item["path"]: item["sha256"]
            for item in existing.get("sources", [])
        }

        for path in sorted(
            set(expected_sources) | set(actual_sources)
        ):
            expected_hash = expected_sources.get(path)
            actual_hash = actual_sources.get(path)

            if expected_hash != actual_hash:
                print(f"  STALE SOURCE: {path}")

        return False

    if expected_serialized != actual_serialized:
        print("CONTRACT STALE: canonical serialization mismatch.")
        return False

    print("COMPILER CONTRACT FRESHNESS: PASS")
    return True

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate or verify the EMP compiler contract."
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="verify freshness without modifying the manifest",
    )

    args = parser.parse_args()

    if args.verify:
        if not verify_manifest():
            raise SystemExit(1)
        return

    manifest = build_manifest()

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    serialized = json.dumps(
        manifest,
        indent=2,
        sort_keys=True,
        ensure_ascii=False,
    ) + "\n"

    OUTPUT.write_text(serialized, encoding="utf-8")

    print(f"Generated: {OUTPUT.relative_to(ROOT)}")
    print(f"Sources  : {manifest['source_count']}")
    print(f"Git SHA  : {manifest['repository_sha']}")


if __name__ == "__main__":
    main()
