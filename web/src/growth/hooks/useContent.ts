import { useMemo } from "react";

import { loadContent } from "../runtime/loader";
import { resolveLocale } from "../runtime/resolver";

import type { ContentDocument } from "../types/content";
import type { GrowthLocale } from "../types/locale";

export function useContent(
  page: string,
  locale?: GrowthLocale
): ContentDocument {

  return useMemo(() => {

    const resolved = resolveLocale(locale);

    return loadContent(resolved, page);

  }, [page, locale]);

}
