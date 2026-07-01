import {
  DEFAULT_LOCALE,
  GrowthLocale,
  isGrowthLocale,
} from "../types/locale";

export function resolveLocale(
  requested?: string
): GrowthLocale {

  if (requested && isGrowthLocale(requested)) {
    return requested;
  }

  return DEFAULT_LOCALE;
}
