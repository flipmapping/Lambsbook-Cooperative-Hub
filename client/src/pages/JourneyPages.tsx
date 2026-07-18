import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Handshake,
  Sprout,
  Users,
  Globe,
  BookOpen,
  Award,
} from "lucide-react";
import { HubHeader } from "@/components/HubHeader";
import { useLanguage } from "@/lib/LanguageContext";
import { useHubTranslation } from "@/lib/hubTranslations";

interface InitiativeItem {
  icon: typeof Users;
  titleKey: string;
  descKey: string;
}

interface JourneyPageContent {
  id: string;
  heroImage: string;
  heroImageAlt: string;
  captionKey: string;
  titleKey: string;
  subtitleKey: string;
  whyTitleKey: string;
  whyParagraphKeys: string[];
  listTitleKey: string;
  listItemKeys: string[];
  actionTitleKey: string;
  actionSubtitleKey: string;
  initiatives: InitiativeItem[];
  ctaLineKey: string;
  primaryCta: { labelKey: string; href: string };
  secondaryCta: { labelKey: string; href: string };
}

const contributeContent: JourneyPageContent = {
  id: "contribute",
  heroImage: "/assets/journey-contribute.jpg",
  heroImageAlt:
    "A diverse multicultural group of education, business and community members collaborating together",
  captionKey: "jc_caption",
  titleKey: "jc_title",
  subtitleKey: "jc_subtitle",
  whyTitleKey: "jc_why_title",
  whyParagraphKeys: ["jc_why_p1", "jc_why_p2", "jc_why_p3"],
  listTitleKey: "jc_list_title",
  listItemKeys: [
    "jc_item1",
    "jc_item2",
    "jc_item3",
    "jc_item4",
    "jc_item5",
    "jc_item6",
    "jc_item7",
    "jc_item8",
    "jc_item9",
  ],
  actionTitleKey: "jc_action_title",
  actionSubtitleKey: "jc_action_subtitle",
  initiatives: [
    { icon: GraduationCap, titleKey: "jc_init1_title", descKey: "jc_init1_desc" },
    { icon: Award, titleKey: "jc_init2_title", descKey: "jc_init2_desc" },
    { icon: Sprout, titleKey: "jc_init3_title", descKey: "jc_init3_desc" },
    { icon: Handshake, titleKey: "jc_init4_title", descKey: "jc_init4_desc" },
  ],
  ctaLineKey: "jc_cta_line",
  primaryCta: { labelKey: "jc_cta_primary", href: "/hub/scholarships" },
  secondaryCta: { labelKey: "jc_cta_secondary", href: "/hub/signup" },
};

const learnContent: JourneyPageContent = {
  id: "learn",
  heroImage: "/assets/journey-learn.jpg",
  heroImageAlt:
    "A joyful group of graduating students celebrating together on a sunny university campus",
  captionKey: "jl_caption",
  titleKey: "jl_title",
  subtitleKey: "jl_subtitle",
  whyTitleKey: "jl_why_title",
  whyParagraphKeys: ["jl_why_p1", "jl_why_p2", "jl_why_p3"],
  listTitleKey: "jl_list_title",
  listItemKeys: [
    "jl_item1",
    "jl_item2",
    "jl_item3",
    "jl_item4",
    "jl_item5",
    "jl_item6",
    "jl_item7",
    "jl_item8",
  ],
  actionTitleKey: "jl_action_title",
  actionSubtitleKey: "jl_action_subtitle",
  initiatives: [
    { icon: GraduationCap, titleKey: "jl_init1_title", descKey: "jl_init1_desc" },
    { icon: Award, titleKey: "jl_init2_title", descKey: "jl_init2_desc" },
    { icon: Users, titleKey: "jl_init3_title", descKey: "jl_init3_desc" },
    { icon: Globe, titleKey: "jl_init4_title", descKey: "jl_init4_desc" },
  ],
  ctaLineKey: "jl_cta_line",
  primaryCta: { labelKey: "jl_cta_primary", href: "/hub/scholarships" },
  secondaryCta: { labelKey: "jl_cta_secondary", href: "/hub/signup" },
};

function JourneyPage({ content }: { content: JourneyPageContent }) {
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);

  return (
    <div className="min-h-screen bg-background">
      <HubHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b1533]">
        <img
          src={content.heroImage}
          alt={content.heroImageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0b1533] via-[#0b1533]/70 to-[#0b1533]/30"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 pt-40 pb-16 md:pt-56 md:pb-20 max-w-5xl">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            data-testid={`text-journey-${content.id}-title`}
          >
            {t(content.titleKey)}
          </h1>
          <p
            className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed mb-4"
            data-testid={`text-journey-${content.id}-subtitle`}
          >
            {t(content.subtitleKey)}
          </p>
          <p className="text-sm text-slate-300/90 italic" data-testid={`text-journey-${content.id}-caption`}>
            "{t(content.captionKey)}"
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-6" data-testid={`text-journey-${content.id}-why-title`}>
            {t(content.whyTitleKey)}
          </h2>
          <div className="space-y-4">
            {content.whyParagraphKeys.map((key) => (
              <p key={key} className="text-lg text-muted-foreground leading-relaxed">
                {t(key)}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* List */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-8" data-testid={`text-journey-${content.id}-list-title`}>
            {t(content.listTitleKey)}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {content.listItemKeys.map((key) => (
              <li key={key} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-base">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* In Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" data-testid={`text-journey-${content.id}-action-title`}>
              {t(content.actionTitleKey)}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t(content.actionSubtitleKey)}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {content.initiatives.map((initiative) => (
              <Card key={initiative.titleKey} data-testid={`card-initiative-${initiative.titleKey}`}>
                <CardHeader>
                  <div className="h-11 w-11 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                    <initiative.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{t(initiative.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(initiative.descKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-5 text-primary" />
          <p className="text-2xl md:text-3xl font-semibold mb-8 leading-snug" data-testid={`text-journey-${content.id}-cta`}>
            {t(content.ctaLineKey)}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href={content.primaryCta.href}>
              <Button size="lg" data-testid={`button-journey-${content.id}-primary-cta`}>
                {t(content.primaryCta.labelKey)}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href={content.secondaryCta.href}>
              <Button size="lg" variant="outline" data-testid={`button-journey-${content.id}-secondary-cta`}>
                {t(content.secondaryCta.labelKey)}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2025 Lambsbook Cooperative Hub. {t("hub_footer_rights")}
        </div>
      </footer>
    </div>
  );
}

export function JourneyContribute() {
  return <JourneyPage content={contributeContent} />;
}

export function JourneyLearn() {
  return <JourneyPage content={learnContent} />;
}
