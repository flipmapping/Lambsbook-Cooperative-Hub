"""
EOS Infrastructure Service Registry

Canonical registry for certified EOS infrastructure services.
"""

from __future__ import annotations

import json
from pathlib import Path

REGISTRY_FILE = Path(__file__).parent / "infrastructure_registry.json"


def _load() -> list:
    if REGISTRY_FILE.exists():
        return json.loads(REGISTRY_FILE.read_text(encoding="utf-8"))
    return []


def register(service: dict) -> None:
    registry = _load()

    names = {item["name"] for item in registry}

    if service["name"] not in names:
        registry.append(service)

        REGISTRY_FILE.write_text(
            json.dumps(
                registry,
                indent=2,
                sort_keys=True,
            ),
            encoding="utf-8",
        )


def lookup(name: str):
    for service in _load():
        if service["name"] == name:
            return service
    return None


if __name__ == "__main__":
    register(
        {
            "name": "projection_builder",
            "status": "CERTIFIED",
            "interface": "builders.projection.builder_interface.execute_builder",
            "version": "1.0.0",
        }
    )

    print(
        json.dumps(
            _load(),
            indent=2,
            sort_keys=True,
        )
    )
