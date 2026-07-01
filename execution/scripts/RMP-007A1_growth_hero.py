#!/usr/bin/env python3
"""
RMP-007A1
Growth Hero Components

Creates:

    web/src/growth/components/Hero/
        Hero.tsx
        HeroContent.tsx
        index.ts

Updates:

    web/src/growth/index.ts

Bounded mutation only.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

HERO_DIR = ROOT / "web/src/growth/components/Hero"

INDEX_FILE = ROOT / "web/src/growth/index.ts"

FILES = {
    "Hero.tsx": """import { useContent } from "../../hooks/useContent";
import { HeroContent } from "./HeroContent";

export function Hero() {

  const document = useContent("home");

  const hero = (document.sections as Record<string, any>).hero;

  if (!hero) {
    return null;
  }

  return (
    <HeroContent
      title={hero.title}
      subtitle={hero.subtitle}
      description={hero.description}
      primaryAction={hero.primaryAction}
      secondaryAction={hero.secondaryAction}
    />
  );

}
""",

    "HeroContent.tsx": """export interface HeroContentProps {

  title: string;

  subtitle?: string;

  description?: string;

  primaryAction?: string;

  secondaryAction?: string;

}

export function HeroContent(
  props: HeroContentProps
) {

  return (
    <section>

      <h1>{props.title}</h1>

      {props.subtitle && (
        <h2>{props.subtitle}</h2>
      )}

      {props.description && (
        <p>{props.description}</p>
      )}

      <div>

        {props.primaryAction && (
          <button type="button">
            {props.primaryAction}
          </button>
        )}

        {props.secondaryAction && (
          <button type="button">
            {props.secondaryAction}
          </button>
        )}

      </div>

    </section>
  );

}
""",

    "index.ts": """export * from "./Hero";
export * from "./HeroContent";
"""
}

EXPORT_LINE = 'export * from "./components/Hero";'


def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str) -> None:
    print(f"[OK] {message}")


def atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    with NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
    ) as tmp:
        tmp.write(text.rstrip() + "\n")
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

anchors = [
    ROOT / "web/src/growth/components",
    ROOT / "web/src/growth/hooks/useContent.ts",
    INDEX_FILE,
]

for anchor in anchors:
    if not anchor.exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

if HERO_DIR.exists():
    fail("Hero component directory already exists")

ok("Mutation surface verified")

print()
print("=== Creating Hero Components ===")

HERO_DIR.mkdir(parents=True)

for filename, source in FILES.items():
    target = HERO_DIR / filename
    atomic_write(target, source)
    print(f"[WRITE] {target.relative_to(ROOT)}")

#
# Update growth index
#

existing = INDEX_FILE.read_text(encoding="utf-8")

if EXPORT_LINE not in existing:
    updated = existing.rstrip() + "\n\n" + EXPORT_LINE + "\n"
    atomic_write(INDEX_FILE, updated)
    print("[UPDATE] web/src/growth/index.ts")
else:
    print("[SKIP] Hero export already present")

print()

ok("Growth Hero components created")
ok("RMP-007A1 COMPLETE")