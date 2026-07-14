import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  DEFAULT_LOCALE,
  type GrowthLocale,
} from "../types/locale";

export interface GrowthContextValue {
  locale: GrowthLocale;
  setLocale(locale: GrowthLocale): void;
}

const GrowthContext =
  createContext<GrowthContextValue | null>(null);

export function GrowthProvider(
  props: PropsWithChildren
) {

  const [locale, setLocale] =
    useState<GrowthLocale>(DEFAULT_LOCALE);

  const value =
    useMemo<GrowthContextValue>(() => ({
      locale,
      setLocale,
    }), [locale]);

  return (
    <GrowthContext.Provider value={value}>
      {props.children}
    </GrowthContext.Provider>
  );

}

export function useGrowthContext(): GrowthContextValue {

  const context = useContext(GrowthContext);

  if (!context) {
    throw new Error(
      "useGrowthContext must be used within GrowthProvider."
    );
  }

  return context;

}
