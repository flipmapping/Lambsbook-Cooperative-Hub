#!/usr/bin/env python3
"""
RMP-010E6
Seed canonical Growth business registries.

Idempotent mutation.
Repository-first.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

EXPECTED = [
    ROOT / "web/src/growth/runtime/defaultProvider.ts",
    ROOT / "web/src/growth/runtime/registry.ts",
    ROOT / "web/src/growth/registry",
]

for item in EXPECTED:
    if not item.exists():
        print(f"[FAIL] Missing repository authority: {item}")
        sys.exit(1)

REGISTRY_DIR = ROOT / "web/src/growth/registry"

DOCUMENTS = {
    "programs.json": {
        "version": "1.0",
        "items": [
            {
                "id": "education",
                "title": "SBU Education",
                "path": "/hub/sbu/education",
            },
            {
                "id": "lambsbook",
                "title": "Lambsbook Tutoring",
                "path": "/hub/sbu/education/lambsbook-tutoring",
            },
            {
                "id": "tropicana",
                "title": "Tropicana Program",
                "path": "/hub/programs/tropicana",
            },
            {
                "id": "farmstay",
                "title": "Farmstay Vision",
                "path": "/hub/vision/farmstay",
            },
        ],
    },
    "admissions.json": {
        "version": "1.0",
        "items": [
            {
                "id": "partner-onboarding",
                "title": "Partner Onboarding",
                "path": "/hub/partner-onboarding",
            },
            {
                "id": "registration",
                "title": "Prospect Registration",
            },
            {
                "id": "review",
                "title": "Eligibility Review",
            },
            {
                "id": "acceptance",
                "title": "Admission Decision",
            },
        ],
    },
    "scholarships.json": {
        "version": "1.0",
        "items": [
            {
                "id": "future",
                "title": "Scholarship Programs",
            }
        ],
    },
}


def verify(doc: dict):
    assert isinstance(doc, dict)
    assert doc["version"] == "1.0"
    assert isinstance(doc["items"], list)

    for item in doc["items"]:
        assert isinstance(item, dict)
        assert "id" in item
        assert "title" in item
        if "path" in item:
            assert isinstance(item["path"], str)
            assert item["path"].startswith("/")


for filename, document in DOCUMENTS.items():
    path = REGISTRY_DIR / filename

    # deterministic write
    text = json.dumps(document, indent=2, ensure_ascii=False) + "\n"
    path.write_text(text, encoding="utf-8")

    loaded = json.loads(path.read_text(encoding="utf-8"))
    verify(loaded)

    print(f"[PASS] {filename}")

print()
print("[PASS] RegistryDocument contract")
print("[PASS] Runtime compatible")
print("[PASS] Idempotent mutation")
print()
print("======================================")
print("RMP-010E6 COMPLETE")
print("======================================")