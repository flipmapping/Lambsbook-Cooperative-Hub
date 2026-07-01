#!/usr/bin/env python3
"""
RMP-008B2
Growth Loader Provider Integration

Updates

    web/src/growth/runtime/loader.ts

Repository-derived bounded mutation.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

LOADER = ROOT / "web/src/growth/runtime/loader.ts"

NEW_SOURCE = """import { getCached, setCached, clearRuntimeCache } from "./cache";
import { resolveLocale } from "./resolver";
import { getRuntimeProvider } from "./providers";

import type { ContentDocument } from "../types/content";
import type { RegistryDocument } from "../types/registry";
import type { GrowthLocale } from "../types/locale";
import type { RegistryName } from "./registry";

function validateContentDocument(
  document: unknown
): asserts document is ContentDocument {

  if (
    typeof document !== "object" ||
    document === null
  ) {
    throw new Error("Invalid Growth content document");
  }

  const value = document as Record<string, unknown>;

  if (
    typeof value.version !== "string" ||
    typeof value.locale !== "string" ||
    typeof value.sections !== "object" ||
    value.sections === null
  ) {
    throw new Error("Invalid Growth content document");
  }

}

function validateRegistryDocument(
  document: unknown
): asserts document is RegistryDocument {

  if (
    typeof document !== "object" ||
    document === null
  ) {
    throw new Error("Invalid Growth registry document");
  }

  const value = document as Record<string, unknown>;

  if (
    typeof value.version !== "string" ||
    !Array.isArray(value.items)
  ) {
    throw new Error("Invalid Growth registry document");
  }

}

export function loadContent(
  locale: string,
  page: string
): ContentDocument {

  const resolved = resolveLocale(locale);

  const key =
    `content:${resolved}:${page}`;

  const cached =
    getCached<ContentDocument>(key);

  if (cached) {
    return cached;
  }

  const document =
    getRuntimeProvider().loadContent(
      resolved,
      page
    );

  validateContentDocument(document);

  setCached(key, document);

  return document;

}

export function loadRegistry(
  name: RegistryName
): RegistryDocument {

  const key =
    `registry:${name}`;

  const cached =
    getCached<RegistryDocument>(key);

  if (cached) {
    return cached;
  }

  const document =
    getRuntimeProvider().loadRegistry(
      name
    );

  validateRegistryDocument(document);

  setCached(key, document);

  return document;

}

export {
  clearRuntimeCache,
};
"""


def fail(msg: str):
    print(f"[FAIL] {msg}")
    sys.exit(1)


def ok(msg: str):
    print(f"[OK] {msg}")


def atomic_write(path: Path, text: str):
    with NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
    ) as tmp:
        tmp.write(text.rstrip() + "\n")
        name = tmp.name

    os.replace(name, path)


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

if not LOADER.exists():
    fail("Missing repository anchor")

ok("Repository anchor verified")

baseline = LOADER.read_text(encoding="utf-8")

required = [
    "function resolveContentDocument(",
    "function resolveRegistryDocument(",
    "resolveContentDocument(",
    "resolveRegistryDocument(",
]

for token in required:
    if token not in baseline:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

if 'getRuntimeProvider' in baseline:
    fail("Provider integration already appears applied")

ok("Mutation surface verified")

print()
print("=== Updating Runtime Loader ===")

atomic_write(LOADER, NEW_SOURCE)

print("[UPDATE] web/src/growth/runtime/loader.ts")

print()

ok("Growth loader provider integration created")
ok("RMP-008B2 COMPLETE")