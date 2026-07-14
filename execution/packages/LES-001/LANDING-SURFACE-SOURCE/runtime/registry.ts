export const REGISTRIES = {
  admissions: "admissions",
  assets: "assets",
  faq: "faq",
  footer: "footer",
  journey: "journey",
  navigation: "navigation",
  programs: "programs",
  scholarships: "scholarships",
} as const;

export type RegistryName =
  keyof typeof REGISTRIES;

export function isRegistryName(
  value: string
): value is RegistryName {

  return value in REGISTRIES;

}

export function getRegistryNames(): RegistryName[] {

  return Object.keys(
    REGISTRIES
  ) as RegistryName[];

}
