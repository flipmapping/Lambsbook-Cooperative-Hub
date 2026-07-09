import { useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Award,
  Globe,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
} from 'lucide-react';
import { HubHeader } from '@/components/HubHeader';
import { HubConsultationForm } from '@/components/HubConsultationForm';
import { useLanguage } from '@/lib/LanguageContext';
import { useHubTranslation } from '@/lib/hubTranslations';

const scholarships = [
  {
    id: 'ctbc',
    titleKey: 'schol_program_ctbc',
    descKey: 'schol_program_ctbc_desc',
    icon: Award,
    badgeKey: 'schol_badge_featured',
    color: 'bg-blue-500/10 text-blue-600',
    href: '/hub/prospect-registration',
  },
  {
    id: 'tropicana',
    titleKey: 'schol_program_tropicana',
    descKey: 'schol_program_tropicana_desc',
    icon: GraduationCap,
    badgeKey: 'schol_badge_open',
    color: 'bg-orange-500/10 text-orange-600',
    href: '/hub/prospect-registration',
  },
  {
    id: 'lambsbook',
    titleKey: 'schol_program_lambsbook',
    descKey: 'schol_program_lambsbook_desc',
    icon: BookOpen,
    badgeKey: 'schol_badge_open',
    color: 'bg-purple-500/10 text-purple-600',
    href: '/hub/prospect-registration',
  },
];

const benefits = [
  { icon: Globe,        titleKey: 'schol_benefit_global',    descKey: 'schol_benefit_global_desc' },
  { icon: Users,        titleKey: 'schol_benefit_community', descKey: 'schol_benefit_community_desc' },
  { icon: Star,         titleKey: 'schol_benefit_merit',     descKey: 'schol_benefit_merit_desc' },
  { icon: CheckCircle2, titleKey: 'schol_benefit_support',   descKey: 'schol_benefit_support_desc' },
];

const inquiryOptions = [
  { value: 'scholarship_general',    labelKey: 'schol_inquiry_general' },
  { value: 'scholarship_ctbc',       labelKey: 'schol_inquiry_ctbc' },
  { value: 'scholarship_tropicana',  labelKey: 'schol_inquiry_tropicana' },
  { value: 'scholarship_eligibility', labelKey: 'schol_inquiry_eligibility' },
];

export default function ScholarshipsPage() {
  const sectionRefs = {
    about:    useRef<HTMLDivElement>(null),
    programs: useRef<HTMLDivElement>(null),
    contact:  useRef<HTMLDivElement>(null),
  };

  const { language } = useLanguage();
  const { t } = useHubTranslation(language);

  const handleNavigate = (section: string) => {
    const ref = sectionRefs[section as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HubHeader
        onNavigate={handleNavigate}
        brandName={t('schol_brand')}
        brandSubtitle={t('schol_brand_subtitle')}
        homeLink="/hub/scholarships"
      />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="relative container mx-auto px-4 text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4 text-xs px-3 py-1">
            {t('schol_badge_surface')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {t('schol_hero_title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            {t('schol_hero_subtitle')}
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            {t('schol_hero_trusted')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => handleNavigate('programs')}>
              {t('schol_cta_browse')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleNavigate('contact')}>
              {t('hub_free_consultation')}
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={sectionRefs.about} className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            {t('schol_benefits_title')}
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            {t('schol_benefits_subtitle')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <Card key={b.titleKey} className="text-center">
                <CardHeader className="pb-2">
                  <div className="mx-auto h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{t(b.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">{t(b.descKey)}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarship Programs */}
      <section ref={sectionRefs.programs} className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            {t('schol_programs_title')}
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            {t('schol_programs_subtitle')}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {scholarships.map((s) => (
              <Card key={s.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center shrink-0`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {t(s.badgeKey)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{t(s.titleKey)}</CardTitle>
                  <CardDescription className="text-sm">{t(s.descKey)}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <Link href={s.href}>
                    <Button size="sm" className="w-full">
                      {t('schol_cta_apply')} <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-14 bg-primary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-3">{t('schol_cta_title')}</h2>
          <p className="text-muted-foreground mb-6">{t('schol_cta_desc')}</p>
          <Link href="/hub/prospect-registration">
            <Button size="lg">
              {t('schol_cta_register')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Consultation form */}
      <section ref={sectionRefs.contact} className="py-16">
        <div className="container mx-auto px-4 max-w-xl">
          <h2 className="text-2xl font-bold text-center mb-4">{t('hub_free_consultation')}</h2>
          <HubConsultationForm inquiryOptions={inquiryOptions} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Lambsbook Collaborative Hub. {t('hub_footer_rights')}</p>
          <p className="mt-1">{t('hub_footer_contact')}: support@lambsbook.net</p>
        </div>
      </footer>
    </div>
  );
}
