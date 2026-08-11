#!/usr/bin/env python3

from pathlib import Path
import ast
import json
from datetime import datetime

ROOT = Path.cwd()
COMPILER = ROOT / "execution" / "compiler"

target = COMPILER / "context_resolver.py"
providers = COMPILER / "providers.py"

if not target.exists():
    raise SystemExit("ERROR: context_resolver.py not found")

source = target.read_text(
    encoding="utf-8",
    errors="replace"
)

tree = ast.parse(source)

imports = []
constructor_calls = []
attribute_refs = []
names = []

for node in ast.walk(tree):

    if isinstance(node, ast.Import):
        imports.extend(
            alias.name for alias in node.names
        )

    elif isinstance(node, ast.ImportFrom):
        module = node.module or ""
        imports.extend(
            f"{module}.{alias.name}"
            for alias in node.names
        )

    elif isinstance(node, ast.Call):
        if isinstance(node.func, ast.Name):
            constructor_calls.append(node.func.id)
        elif isinstance(node.func, ast.Attribute):
            constructor_calls.append(
                ast.unparse(node.func)
            )

    elif isinstance(node, ast.Attribute):
        attribute_refs.append(
            ast.unparse(node)
        )

    elif isinstance(node, ast.Name):
        names.append(node.id)

provider_names = [
    "AuthorityProvider",
    "RepositoryProvider",
    "StandardsProvider",
]

usage = {}

for provider in provider_names:
    usage[provider] = {
        "imported": any(
            provider in item for item in imports
        ),
        "referenced": provider in names,
        "constructed": provider in constructor_calls
    }

provider_contract = {}

if providers.exists():

    provider_tree = ast.parse(
        providers.read_text(
            encoding="utf-8",
            errors="replace"
        )
    )

    for node in provider_tree.body:

        if isinstance(node, ast.ClassDef):
            if node.name in provider_names:

                provider_contract[node.name] = {
                    "bases": [
                        ast.unparse(base)
                        for base in node.bases
                    ],
                    "methods": [
                        item.name
                        for item in node.body
                        if isinstance(
                            item,
                            (
                                ast.FunctionDef,
                                ast.AsyncFunctionDef
                            )
                        )
                    ]
                }

report = {
    "authority": "EMP-001M-07",
    "generated_at": datetime.utcnow().replace(
        microsecond=0
    ).isoformat() + "Z",
    "target": "execution/compiler/context_resolver.py",
    "provider_usage": usage,
    "provider_contracts": provider_contract,
    "imports": sorted(set(imports)),
    "constructor_calls": sorted(set(constructor_calls)),
    "attribute_references": sorted(set(attribute_refs))
}

output_dir = (
    ROOT /
    "execution" /
    "workspace" /
    "EMP-001M-07"
)

output_dir.mkdir(
    parents=True,
    exist_ok=True
)

output = (
    output_dir /
    "PROVIDER-DEPENDENCY-INSPECTION.json"
)

output.write_text(
    json.dumps(report, indent=2),
    encoding="utf-8"
)

print("=" * 80)
print("EMP-001M-07 PROVIDER DEPENDENCY INSPECTION")
print("=" * 80)

for provider, data in usage.items():
    print()
    print(provider)
    print("  imported   :", data["imported"])
    print("  referenced :", data["referenced"])
    print("  constructed:", data["constructed"])

print()
print("Output:", output.relative_to(ROOT))
print("=" * 80)
