import type {
  GrowthRuntimeProvider,
} from "./providers";

import type {
  ContentDocument,
} from "../types/content";

import type {
  RegistryDocument,
} from "../types/registry";

import type {
  GrowthLocale,
} from "../types/locale";

import type {
  RegistryName,
} from "./registry";

import home_en from "../content/en/home.json";
import home_vi from "../content/vi/home.json";
import home_zh from "../content/zh/home.json";

import programs from "../registry/programs.json";
import scholarships from "../registry/scholarships.json";
import navigation from "../registry/navigation.json";
import faq from "../registry/faq.json";
import journey from "../registry/journey.json";
import assets from "../registry/assets.json";
import admissions from "../registry/admissions.json";

const CONTENT = {
  en: { home: home_en },
  vi: { home: home_vi },
  zh: { home: home_zh },
} as const;

const REGISTRY = {
  programs,
  scholarships,
  navigation,
  faq,
  journey,
  assets,
  admissions,
} as const;

export const defaultGrowthRuntimeProvider:
GrowthRuntimeProvider = {

  loadContent(
    locale: GrowthLocale,
    page: string
  ): ContentDocument {

    return (CONTENT as any)[locale][page];

  },

  loadRegistry(
    name: RegistryName
  ): RegistryDocument {

    return (REGISTRY as any)[name];

  },

};
