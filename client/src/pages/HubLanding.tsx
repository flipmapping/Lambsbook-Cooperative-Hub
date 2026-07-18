import { useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Handshake, 
  Heart, 
  GraduationCap, 
  Sprout, 
  Home, 
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Globe,
  Shield,
  Clock,
  ExternalLink,
} from "lucide-react";
import { HubHeader } from "@/components/HubHeader";
import { HubConsultationForm } from "@/components/HubConsultationForm";
import { useLanguage } from "@/lib/LanguageContext";
import { useHubTranslation } from "@/lib/hubTranslations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const getSbus = (t: (key: string) => string) => [
  {
    id: 2,
    name: t('hub_sbu_education'),
    icon: GraduationCap,
    description: t('hub_sbu_education_desc'),
    color: "bg-blue-500/10 text-blue-600",
    href: "/hub/scholarships",
    active: true,
    ctbc: true,
  },
  {
    id: 4,
    name: t('hub_sbu_food'),
    icon: Sprout,
    description: t('hub_sbu_food_desc'),
    color: "bg-green-500/10 text-green-600",
    href: "/hub/partner-onboarding",
    active: true,
  },
  {
    id: 5,
    name: t('hub_sbu_farmstay'),
    icon: Home,
    description: t('hub_sbu_farmstay_desc'),
    color: "bg-teal-500/10 text-teal-600",
    href: "/hub/vision/farmstay",
    active: true,
    hasVisionLink: true,
  },
];

const getCollaborationPrinciples = (t: (key: string) => string) => [
  {
    icon: Handshake,
    title: t('hub_collab_principle1_title'),
    description: t('hub_collab_principle1_desc'),
  },
  {
    icon: Shield,
    title: t('hub_collab_principle2_title'),
    description: t('hub_collab_principle2_desc'),
  },
  {
    icon: Heart,
    title: t('hub_collab_principle3_title'),
    description: t('hub_collab_principle3_desc'),
  },
  {
    icon: Clock,
    title: t('hub_collab_principle4_title'),
    description: t('hub_collab_principle4_desc'),
  },
];

const getFaqItems = (t: (key: string) => string) => [
  {
    question: t('hub_faq1_q'),
    answer: t('hub_faq1_a'),
  },
  {
    question: t('hub_faq2_q'),
    answer: t('hub_faq2_a'),
  },
  {
    question: t('hub_faq3_q'),
    answer: t('hub_faq3_a'),
  },
  {
    question: t('hub_faq4_q'),
    answer: t('hub_faq4_a'),
  },
  {
    question: t('hub_faq5_q'),
    answer: t('hub_faq5_a'),
  },
];

const getCommitments = (t: (key: string) => string) => [
  t('hub_commitment1'),
  t('hub_commitment2'),
  t('hub_commitment3'),
  t('hub_commitment4'),
];

const inquiryOptions = [
  { value: "general", labelKey: "hub_inquiry_general" },
  { value: "partnership", labelKey: "hub_inquiry_partnership" },
  { value: "collaboration", labelKey: "hub_inquiry_collaboration" },
  { value: "support", labelKey: "hub_inquiry_support" },
];

export default function HubLanding() {
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);

  const sbus = getSbus(t);
  const collaborationPrinciples = getCollaborationPrinciples(t);
  const faqItems = getFaqItems(t);
  const commitments = getCommitments(t);

  const sectionRefs = {
    about: useRef<HTMLDivElement>(null),
    programs: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
    collaboration: useRef<HTMLDivElement>(null),
    journey: useRef<HTMLDivElement>(null),
  };

  const [selectedJourney, setSelectedJourney] = useState<string | null>(() => {
    try {
      return localStorage.getItem("lambsbook_journey_preference");
    } catch {
      return null;
    }
  });

  const chooseJourney = (journey: string) => {
    setSelectedJourney(journey);
    try {
      localStorage.setItem("lambsbook_journey_preference", journey);
      sessionStorage.setItem("lambsbook_journey_preference", journey);
    } catch {
      // storage unavailable — preference kept in memory for this visit
    }
  };

  const handleNavigate = (section: string) => {
    const ref = sectionRefs[section as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    sectionRefs.contact.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCollaboration = () => {
    sectionRefs.collaboration.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <HubHeader 
        onNavigate={handleNavigate}
      />

      {/* Universal Hero */}
      <section className="relative overflow-hidden bg-[#0b1533]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/hero-cooperative.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1533] via-[#0b1533]/90 to-[#0b1533]/40" aria-hidden="true" />
        <div className="relative container mx-auto px-4 py-24 md:py-32 max-w-6xl">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6" data-testid="text-hero-title">
              {t('hub_home_hero_title1')}{" "}
              <span className="text-sky-400">{t('hub_home_hero_title2')}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-6 leading-relaxed font-medium" data-testid="text-hero-subtitle">
              {t('hub_home_hero_subtitle')}
            </p>
            <p className="text-base text-slate-300/90 mb-4 leading-relaxed" data-testid="text-hero-narrative-1">
              {t('hub_home_hero_narrative1')}
            </p>
            <p className="text-base text-slate-300/90 mb-10 leading-relaxed" data-testid="text-hero-narrative-2">
              {t('hub_home_hero_narrative2')}
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button
                size="lg"
                onClick={() => sectionRefs.journey.current?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-hero-begin-journey"
              >
                {t('hub_home_begin_journey')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="backdrop-blur-sm bg-white/5 border-white/25 text-white"
                onClick={scrollToCollaboration}
                data-testid="button-learn-collaboration"
              >
                {t('hub_learn_collaboration')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Preference Experience */}
      <section ref={sectionRefs.journey} className="py-20 px-4" id="journey-preference">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-journey-title">
              {t('hub_home_journey_title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg" data-testid="text-journey-subtitle">
              {t('hub_home_journey_subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className={`h-full ${selectedJourney === "contribute" ? "border-primary ring-1 ring-primary" : ""}`}
              data-testid="card-journey-a"
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                  <Handshake className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('jc_title')}</CardTitle>
                <CardDescription className="text-base leading-relaxed mt-2">
                  {t('hub_gw_contribute_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href="/journeys/contribute">
                    <Button
                      onClick={() => chooseJourney("contribute")}
                      data-testid="button-journey-a"
                    >
                      {t('hub_learn_more')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  {selectedJourney === "contribute" && (
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium" data-testid="status-journey-a-selected">
                      <CheckCircle2 className="h-4 w-4" /> {t('hub_home_selected_journey')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`h-full ${selectedJourney === "learn" ? "border-primary ring-1 ring-primary" : ""}`}
              data-testid="card-journey-b"
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('jl_title')}</CardTitle>
                <CardDescription className="text-base leading-relaxed mt-2">
                  {t('hub_gw_learn_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href="/journeys/learn">
                    <Button
                      onClick={() => chooseJourney("learn")}
                      data-testid="button-journey-b"
                    >
                      {t('hub_learn_more')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  {selectedJourney === "learn" && (
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium" data-testid="status-journey-b-selected">
                      <CheckCircle2 className="h-4 w-4" /> {t('hub_home_selected_journey')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How the Cooperative Works — Flywheel */}
      <section className="py-20 px-4 bg-muted/30" id="how-it-works">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-flywheel-title">
              {t('hub_flywheel_title')}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg" data-testid="text-flywheel-subtitle">
              {t('hub_flywheel_subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
              <Card key={step} data-testid={`card-flywheel-step-${step}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {step}
                    </div>
                    <h3 className="font-semibold">{t(`hub_flywheel_s${step}_title`)}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`hub_flywheel_s${step}_desc`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-flywheel-difference">
              {t('hub_flywheel_difference')}
            </p>
          </div>
        </div>
      </section>

      {/* How Collaboration Works Section */}
      <section ref={sectionRefs.collaboration} className="py-20 px-4 bg-muted/30" id="collaboration">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Globe className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4" data-testid="text-collaboration-title">
              {t('hub_collab_title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t('hub_collab_subtitle')}
            </p>
          </div>

          {/* Collaboration Principles */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {collaborationPrinciples.map((principle, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-principle-${index}`}>
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <principle.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{principle.title}</CardTitle>
                    <CardDescription className="mt-2">{principle.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Collaboration Explanation */}
          <Card className="mb-12" data-testid="card-collaboration-explanation">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Users className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">{t('hub_trust_title')}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t('hub_trust_desc1')}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('hub_trust_desc2')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">{t('hub_faq_title')}</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} data-testid={`accordion-faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Scholarship CTA Banner */}
      <section className="py-10 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-4 py-1 mb-4">
            <GraduationCap className="h-4 w-4" />
            <span className="text-sm font-semibold">{t('hub_schol_banner_badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {t('hub_schol_banner_title')}
          </h2>
          <p className="text-lg opacity-90 mb-6">
            {t('hub_schol_banner_desc')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/scholarships">
              <Button size="lg" variant="secondary">
                {t('hub_schol_banner_view')} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/hub/prospect-registration">
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                {t('hub_path_s3_cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recruitment Journey */}
      <section className="py-16 px-4 bg-muted/20" id="RecruitmentJourney">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-2">{t('hub_path_title')}</h2>
          <p className="text-center text-muted-foreground mb-12">{t('hub_path_subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", n: 1, href: "/hub/scholarships" },
              { step: "02", n: 2, href: "/hub/scholarships" },
              { step: "03", n: 3, href: "/hub/prospect-registration" },
            ].map(({ step, n, href }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  {step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{t(`hub_path_s${n}_title`)}</h3>
                <p className="text-muted-foreground text-sm mb-4 flex-1">{t(`hub_path_s${n}_desc`)}</p>
                <Link href={href}>
                  <Button size="sm" variant="outline">{t(`hub_path_s${n}_cta`)} <ArrowRight className="h-3 w-3 ml-1" /></Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SBUs Section */}
      <section ref={sectionRefs.programs} id="programs" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-sbu-title">
            {t('hub_sbu_title')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto text-lg">
            {t('hub_sbu_desc')}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {sbus.map((sbu) => {
              if ((sbu as { ctbc?: boolean }).ctbc) {
                return (
                  <Link key={sbu.id} href={sbu.href ?? "/hub/scholarships"}>
                    <Card className="h-full hover-elevate cursor-pointer overflow-hidden" data-testid={`card-sbu-${sbu.id}`}>
                      <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                        <div className="text-center text-white">
                          <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-90" />
                          <p className="text-xs font-semibold opacity-80">CTBC University of Technology</p>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{sbu.name}</CardTitle>
                        <CardDescription>{sbu.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground mb-3">Tainan, Taiwan · ctbctech.edu.tw</div>
                        <div className="flex items-center gap-1 text-sm text-primary font-medium mb-3">
                          {t('hub_schol_banner_view')} <ArrowRight className="h-3 w-3" />
                        </div>
                        <a href="https://www.ctbctech.edu.tw/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground underline hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                          {t('hub_learn_more')} <ExternalLink className="h-3 w-3" />
                        </a>
                      </CardContent>
                    </Card>
                  </Link>
                );
              }
              const cardContent = (
                <Card 
                  className={`h-full ${sbu.active ? 'hover-elevate cursor-pointer' : 'opacity-70'}`} 
                  data-testid={`card-sbu-${sbu.id}`}
                >
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-md ${sbu.color} flex items-center justify-center mb-3`}>
                      <sbu.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{sbu.name}</CardTitle>
                    <CardDescription className="min-h-[60px]">{sbu.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sbu.hasVisionLink && (
                      <div className="flex items-center gap-1 text-sm text-primary">
                        {t('hub_sbu_learn_more')}
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
              if (sbu.href) {
                return (
                  <Link key={sbu.id} href={sbu.href}>
                    {cardContent}
                  </Link>
                );
              }
              return <div key={sbu.id}>{cardContent}</div>;
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-8">{t('hub_commitment_title')}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {commitments.map((value, index) => (
              <div key={index} className="flex items-center gap-2 justify-center" data-testid={`text-value-${index}`}>
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">
            {t('hub_cta_join_title')}
          </h2>
          <p className="mb-8 opacity-90 text-lg" data-testid="text-cta-desc">
            {t('hub_cta_join_desc')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button size="lg" variant="secondary" data-testid="button-cta-signup">
                {t('hub_cta_join_button')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="backdrop-blur-sm bg-primary-foreground/10"
              onClick={scrollToContact}
              data-testid="button-cta-contact"
            >
              {t('hub_cta_contact_button')}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={sectionRefs.contact} className="py-16 px-4 bg-muted/30" id="contact">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-4">{t('hub_contact_title')}</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('hub_contact_desc')}
          </p>
          <HubConsultationForm 
            inquiryOptions={inquiryOptions}
            source="hub-landing"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
              © 2025 Lambsbook Cooperative Hub. {t('hub_footer_rights')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/hub/sbu/education" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-education">
                {t('hub_footer_education')}
              </Link>
              <Link href="/hub/vision/farmstay" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-farmstay">
                {t('hub_footer_farmstay')}
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              {t('hub_footer_contact')}: support@lambsbook.net
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
