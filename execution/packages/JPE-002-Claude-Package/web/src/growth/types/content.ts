import type { GrowthLocale } from "./locale";

export interface HeroSection {

  title: string;

  subtitle?: string;

  description?: string;

  primaryAction?: string;

  secondaryAction?: string;

}

export interface HomeSections {

  hero?: HeroSection;

  [key: string]: unknown;

}

export interface ContentDocument {

  version: string;

  locale: GrowthLocale;

  sections: Record<string, unknown>;

}

export interface HomeContentDocument
  extends Omit<ContentDocument, "sections"> {

  sections: HomeSections;

}
