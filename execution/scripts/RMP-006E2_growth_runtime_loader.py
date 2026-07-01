#!/usr/bin/env python3
"""
RMP-006E2
Growth Runtime Resolution Pipeline

Bounded mutation.

Modifies ONLY:

    web/src/growth/runtime/loader.ts

No other repository files are modified.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

TARGET = Path("web/src/growth/runtime/loader.ts")

SOURCE = """import { getCached, setCached, clearRuntimeCache } from "./cache";
import { resolveLocale } from "./resolver";

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

function resolveContentDocument(
  locale: GrowthLocale,
  page: string
): ContentDocument {

  throw new Error(
    `Growth content resolver has not yet been connected to the active build (locale=${locale}, page=${page}).`
  );

}

function resolveRegistryDocument(
  name: RegistryName
): RegistryDocument {

  throw new Error(
    `Growth registry resolver has not yet been connected to the active build (registry=${name}).`
  );

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
    resolveContentDocument(
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
    resolveRegistryDocument(name);

  validateRegistryDocument(document);

  setCached(key, document);

  return document;

}

export {
  clearRuntimeCache,
};
"""


def fail(message: str):
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str):
    print(f"[OK] {message}")


def atomic_write(path: Path, text: str):
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

repo = Path.cwd()

if not (repo / ".git").exists():
    fail("Repository root not detected")

ok(f"Repository root: {repo}")

if not TARGET.exists():
    fail(f"Missing target: {TARGET}")

ok("Repository anchor verified")

existing = TARGET.read_text(encoding="utf-8")

if "Growth content loader not yet connected" not in existing:
    fail(
        "Unexpected loader implementation. "
        "Repository Reality differs from inspected baseline."
    )

ok("Mutation surface verified")

print()
print("=== Updating Runtime Loader ===")

atomic_write(TARGET, SOURCE)

print(f"[UPDATE] {TARGET}")

print()

ok("Growth runtime resolution pipeline created")
ok("RMP-006E2 COMPLETE")