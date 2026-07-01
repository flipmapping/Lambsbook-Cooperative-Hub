import type { ContentDocument } from "../types/content";
import type { RegistryDocument } from "../types/registry";
import type { GrowthLocale } from "../types/locale";
import type { RegistryName } from "./registry";

export interface GrowthContentProvider {

  loadContent(
    locale: GrowthLocale,
    page: string
  ): ContentDocument;

}

export interface GrowthRegistryProvider {

  loadRegistry(
    name: RegistryName
  ): RegistryDocument;

}

export interface GrowthRuntimeProvider
  extends
    GrowthContentProvider,
    GrowthRegistryProvider {}

let runtimeProvider:
  GrowthRuntimeProvider | null = null;

export function registerRuntimeProvider(
  provider: GrowthRuntimeProvider
): void {

  runtimeProvider = provider;

}

export function getRuntimeProvider():
  GrowthRuntimeProvider {

  if (!runtimeProvider) {

    throw new Error(
      "Growth runtime provider has not been registered."
    );

  }

  return runtimeProvider;

}
