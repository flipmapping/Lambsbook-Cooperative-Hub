import { getCached, setCached, clearRuntimeCache } from "./cache";
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
