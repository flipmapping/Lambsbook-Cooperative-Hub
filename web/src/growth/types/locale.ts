export const SUPPORTED_LOCALES = ["vi","en","zh"] as const;

export type GrowthLocale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: GrowthLocale = "vi";

export function isGrowthLocale(value: string): value is GrowthLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
