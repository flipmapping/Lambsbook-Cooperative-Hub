#!/usr/bin/env python3
"""
RMP-008A2
Growth Home Content Population

Updates

    web/src/growth/content/en/home.json
    web/src/growth/content/vi/home.json
    web/src/growth/content/zh/home.json

Repository-derived bounded mutation.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

FILES = {
    "en": ROOT / "web/src/growth/content/en/home.json",
    "vi": ROOT / "web/src/growth/content/vi/home.json",
    "zh": ROOT / "web/src/growth/content/zh/home.json",
}

CONTENT = {
    "en": {
        "version": "1.0",
        "locale": "en",
        "sections": {
            "hero": {
                "title": "Welcome to the Growth Platform",
                "subtitle": "Grow with the Cooperative",
                "description": (
                    "Discover programs, scholarships, admissions "
                    "and community opportunities."
                ),
                "primaryAction": "Get Started",
                "secondaryAction": "Learn More",
            }
        },
    },
    "vi": {
        "version": "1.0",
        "locale": "vi",
        "sections": {
            "hero": {
                "title": "Chào mừng đến với Nền tảng Phát triển",
                "subtitle": "Đồng hành cùng Hợp tác xã",
                "description": (
                    "Khám phá chương trình, học bổng, tuyển sinh "
                    "và các cơ hội cộng đồng."
                ),
                "primaryAction": "Bắt đầu",
                "secondaryAction": "Tìm hiểu thêm",
            }
        },
    },
    "zh": {
        "version": "1.0",
        "locale": "zh",
        "sections": {
            "hero": {
                "title": "欢迎来到成长平台",
                "subtitle": "与合作社共同成长",
                "description": (
                    "探索课程、奖学金、招生以及社区机会。"
                ),
                "primaryAction": "开始",
                "secondaryAction": "了解更多",
            }
        },
    },
}


def fail(message: str):
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str):
    print(f"[OK] {message}")


def atomic_write_json(path: Path, payload: dict):
    path.parent.mkdir(parents=True, exist_ok=True)

    with NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
    ) as tmp:
        json.dump(payload, tmp, indent=2, ensure_ascii=False)
        tmp.write("\n")
        tmp_name = tmp.name

    os.replace(tmp_name, path)


#
# Verification
#

if sys.version_info[:2] != EXPECTED:
    fail(
        f"Python {EXPECTED[0]}.{EXPECTED[1]} required "
        f"(found {sys.version.split()[0]})"
    )

ok("Python version verified")

if not (ROOT / ".git").exists():
    fail("Repository root not detected")

ok(f"Repository root: {ROOT}")

for locale, path in FILES.items():
    if not path.exists():
        fail(f"Missing repository anchor: {path}")

ok("Repository anchors verified")

#
# Verify baseline
#

for locale, path in FILES.items():
    data = json.loads(path.read_text(encoding="utf-8"))

    if data.get("version") != "1.0":
        fail(f"{locale}: unexpected version")

    if data.get("locale") != locale:
        fail(f"{locale}: unexpected locale")

    sections = data.get("sections")

    if not isinstance(sections, dict):
        fail(f"{locale}: sections is not an object")

    if sections:
        fail(
            f"{locale}: home.json already populated "
            "(Repository Reality differs)"
        )

ok("Mutation surface verified")

print()
print("=== Populating Home Content ===")

for locale, path in FILES.items():
    atomic_write_json(path, CONTENT[locale])
    print(f"[UPDATE] {path.relative_to(ROOT)}")

print()

ok("Growth home content populated")
ok("RMP-008A2 COMPLETE")