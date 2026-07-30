"""
Builder Certification Registry

Canonical immutable registry for Builder certification records.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


REGISTRY_FILE = (
    Path(__file__).parent
    / "builder_certification_registry.json"
)


def load_registry() -> list:
    if REGISTRY_FILE.exists():
        return json.loads(REGISTRY_FILE.read_text(encoding="utf-8"))
    return []


def append_record(record: dict) -> None:
    registry = load_registry()

    entry = {
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        **record,
    }

    registry.append(entry)

    REGISTRY_FILE.write_text(
        json.dumps(
            registry,
            indent=2,
            sort_keys=True,
        ),
        encoding="utf-8",
    )


def list_records() -> list:
    return load_registry()


if __name__ == "__main__":
    print(
        json.dumps(
            list_records(),
            indent=2,
            sort_keys=True,
        )
    )
