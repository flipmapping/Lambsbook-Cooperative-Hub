import { useContent } from "../../hooks/useContent";
import type { HomeContentDocument } from "../../types/content";
import { HeroContent } from "./HeroContent";

export function Hero() {

  const document =
    useContent("home") as HomeContentDocument;

  const hero = document.sections.hero;

  if (!hero) {
    return null;
  }

  return (
    <HeroContent
      title={hero.title}
      subtitle={hero.subtitle}
      description={hero.description}
      primaryAction={hero.primaryAction}
      secondaryAction={hero.secondaryAction}
    />
  );

}
