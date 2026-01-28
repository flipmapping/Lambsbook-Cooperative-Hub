import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Gift, GraduationCap, Sprout, Home, Coffee, ArrowRight } from "lucide-react";
import { HubHeader } from "@/components/HubHeader";
import { HubConsultationForm } from "@/components/HubConsultationForm";
import { useLanguage } from "@/lib/LanguageContext";
import { useHubTranslation } from "@/lib/hubTranslations";

const sbus = [
  {
    id: 2,
    nameKey: "hub_sbu2_name",
    icon: GraduationCap,
    descKey: "hub_sbu2_desc",
    color: "bg-blue-500/10 text-blue-600",
    href: "/hub/sbu/education",
    active: true,
  },
  {
    id: 1,
    nameKey: "hub_sbu1_name",
    icon: Coffee,
    descKey: "hub_sbu1_desc",
    color: "bg-amber-500/10 text-amber-600",
    href: null,
    active: false,
    comingSoon: true,
  },
  {
    id: 4,
    nameKey: "hub_sbu4_name",
    icon: Sprout,
    descKey: "hub_sbu4_desc",
    color: "bg-green-500/10 text-green-600",
    href: "/hub/partner-onboarding",
    active: true,
  },
  {
    id: 5,
    nameKey: "hub_sbu5_name",
    icon: Home,
    descKey: "hub_sbu5_desc",
    color: "bg-teal-500/10 text-teal-600",
    href: null,
    active: false,
    comingSoon: true,
  },
];

const benefitKeys = [
  {
    icon: TrendingUp,
    titleKey: "hub_benefit1_title",
    descKey: "hub_benefit1_desc",
  },
  {
    icon: Users,
    titleKey: "hub_benefit2_title",
    descKey: "hub_benefit2_desc",
  },
  {
    icon: Gift,
    titleKey: "hub_benefit3_title",
    descKey: "hub_benefit3_desc",
  },
];

const inquiryOptions = [
  { value: "general", labelKey: "hub_inquiry_general" },
  { value: "partnership", labelKey: "hub_inquiry_partnership" },
  { value: "referral", labelKey: "hub_inquiry_referral" },
  { value: "support", labelKey: "hub_inquiry_support" },
];

export default function HubLanding() {
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);

  const sectionRefs = {
    about: useRef<HTMLDivElement>(null),
    programs: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
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

  return (
    <div className="min-h-screen bg-background">
      <HubHeader 
        onNavigate={handleNavigate}
        brandName="Lambsbook Hub"
        brandSubtitle={t('hub_tagline')}
        homeLink="/hub"
      />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-hero-title">
            {t('hub_hero_title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
            {t('hub_hero_subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button size="lg" data-testid="button-hero-signup">
                {t('hub_start_earning')}
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => handleNavigate('programs')}
              data-testid="button-explore-programs"
            >
              {t('hub_explore_programs')}
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={sectionRefs.about} className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" data-testid="text-benefits-title">
            {t('hub_why_join')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefitKeys.map((benefit, index) => (
              <Card key={index} className="text-center" data-testid={`card-benefit-${index}`}>
                <CardHeader>
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{t(benefit.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t(benefit.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SBUs Section */}
      <section ref={sectionRefs.programs} id="programs" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4" data-testid="text-sbu-title">
            {t('hub_our_sbus')}
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('hub_sbu_subtitle')}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sbus.map((sbu) => {
              const cardContent = (
                <Card 
                  className={`h-full ${sbu.active ? 'hover-elevate cursor-pointer' : 'opacity-70'}`} 
                  data-testid={`card-sbu-${sbu.id}`}
                >
                  <CardHeader>
                    <div className={`h-10 w-10 rounded-md ${sbu.color} flex items-center justify-center mb-2`}>
                      <sbu.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {t(sbu.nameKey)}
                      {sbu.comingSoon && (
                        <span 
                          className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-normal"
                          data-testid={`text-sbu-coming-soon-${sbu.id}`}
                        >
                          Coming Soon
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{t(sbu.descKey)}</CardDescription>
                  </CardHeader>
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

      {/* Commission Structure */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10" data-testid="text-commission-title">
            {t('hub_commission_title')}
          </h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <Card data-testid="card-commission-tier1">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-primary">15%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{t('hub_tier1')}</p>
                <p className="text-sm text-muted-foreground">{t('hub_tier1_desc')}</p>
              </CardContent>
            </Card>
            <Card data-testid="card-commission-tier2">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-primary">15%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{t('hub_tier2')}</p>
                <p className="text-sm text-muted-foreground">{t('hub_tier2_desc')}</p>
              </CardContent>
            </Card>
            <Card data-testid="card-commission-partner">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-primary">10%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{t('hub_partner_fee')}</p>
                <p className="text-sm text-muted-foreground">{t('hub_partner_fee_desc')}</p>
              </CardContent>
            </Card>
            <Card data-testid="card-commission-charity">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-primary">10%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{t('hub_charity')}</p>
                <p className="text-sm text-muted-foreground">{t('hub_charity_desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">
            {t('hub_cta_title')}
          </h2>
          <p className="mb-8 opacity-90" data-testid="text-cta-desc">
            {t('hub_cta_desc')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button size="lg" variant="secondary" data-testid="button-cta-signup">
                {t('hub_create_account')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground text-primary-foreground"
              onClick={scrollToContact}
              data-testid="button-cta-contact"
            >
              {t('hub_contact')}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={sectionRefs.contact} className="py-16 px-4 bg-muted/30" id="contact">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-4">{t('hub_free_consultation')}</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('hub_consultation_desc')}
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
            <div className="text-sm text-muted-foreground">
              © 2025 Lambsbook Agentic Hub. {t('hub_footer_rights')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/hub/sbu/education" className="text-muted-foreground hover:text-primary">
                {t('hub_sbu2_name')}
              </Link>
              <Link href="/immigration" className="text-muted-foreground hover:text-primary">
                Immigration Services
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
