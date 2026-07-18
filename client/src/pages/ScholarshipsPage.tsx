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
  ExternalLink,
  Star,
  Users,
  Play,
} from 'lucide-react';
import { HubHeader } from '@/components/HubHeader';
import { HubConsultationForm } from '@/components/HubConsultationForm';
import { useLanguage } from '@/lib/LanguageContext';
import { useHubTranslation } from '@/lib/hubTranslations';

// ---------------------------------------------------------------------------
// RDM-CTBC-001: CTBC asset slots
//
// Place the following files in the repository before deployment:
//   public/assets/ctbc/ctbc-logo.png         — official CTBC logo
//   public/assets/ctbc/campus-1.jpg          — campus photograph 1
//   public/assets/ctbc/campus-2.jpg          — campus photograph 2
//   public/assets/ctbc/campus-3.jpg          — campus photograph 3
//
// Promotional video: replace CTBC_VIDEO_ID with the Founder-approved
// YouTube video ID (e.g. 'dQw4w9WgXcQ' → full URL auto-constructed below).
// ---------------------------------------------------------------------------

const CTBC_LOGO        = '/assets/ctbc/ctbc-logo.png';
const CTBC_CAMPUS_1    = '/assets/ctbc/campus-1.jpg';
const CTBC_CAMPUS_2    = '/assets/ctbc/campus-2.png';
const CTBC_CAMPUS_3    = '/assets/ctbc/campus-3.jpg';
const CTBC_VIDEO_ID    = 'kvZF1CVyFFs'; // Set to Founder-approved YouTube video ID
const CTBC_WEBSITE_URL = 'https://www.ctbctech.edu.tw/';

// Supported Growth Experience locales (RDM-CTBC-001: vi, en, zh only)
const GROWTH_LOCALES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '简体中文' },
] as const;

const scholarships = [
  {
    id: 'ctbc',
    titleKey: 'schol_program_ctbc',
    descKey: 'schol_program_ctbc_desc',
    icon: Award,
    badgeKey: 'schol_badge_featured',
    color: 'bg-blue-500/10 text-blue-600',
    href: '/hub/prospect-registration',
    isCTBC: true,
  },
  {
    id: 'tropicana',
    titleKey: 'schol_program_tropicana',
    descKey: 'schol_program_tropicana_desc',
    icon: GraduationCap,
    badgeKey: 'schol_badge_open',
    color: 'bg-orange-500/10 text-orange-600',
    href: '/hub/prospect-registration',
    isCTBC: false,
  },
  {
    id: 'lambsbook',
    titleKey: 'schol_program_lambsbook',
    descKey: 'schol_program_lambsbook_desc',
    icon: BookOpen,
    badgeKey: 'schol_badge_open',
    color: 'bg-purple-500/10 text-purple-600',
    href: '/hub/prospect-registration',
    isCTBC: false,
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


function CampusPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          el.parentElement!.classList.add('flex', 'items-center', 'justify-center');
          el.style.display = 'none';
          const placeholder = document.createElement('span');
          placeholder.className = 'text-xs text-muted-foreground';
          placeholder.textContent = alt;
          el.parentElement!.appendChild(placeholder);
        }}
      />
    </div>
  );
}

export default function ScholarshipsPage() {
  const sectionRefs = {
    about:    useRef<HTMLDivElement>(null),
    programs: useRef<HTMLDivElement>(null),
    contact:  useRef<HTMLDivElement>(null),
  };

  const { language, setLanguage } = useLanguage();
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
      />

      {/* Language selector — restricted to vi / en / zh */}
      <div className="flex justify-end gap-1 px-4 py-2 border-b bg-muted/10">
        {GROWTH_LOCALES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              language === code
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="relative container mx-auto px-4 text-center max-w-4xl">
          {/* CTBC logo in hero */}
          <div className="flex justify-center mb-6">
</div>
          <Badge variant="secondary" className="mb-4 text-xs px-3 py-1">
            {t('schol_badge_surface')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {t('schol_hero_title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            {t('schol_hero_subtitle')}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {t('schol_hero_trusted')}
          </p>
          {/* Official CTBC website reference */}
          <p className="text-xs text-muted-foreground mb-10">
            <a
              href={CTBC_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              CTBC University of Technology — ctbctech.edu.tw
            </a>{' '}
            · Tainan, Taiwan
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => handleNavigate('programs')}>
              {t('schol_cta_browse')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleNavigate('contact')}>
              {t('hub_free_consultation')}
            </Button>
            {/* Learn More — official CTBC website */}
            <a href={CTBC_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">
                Learn More <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTBC campus photographs */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-semibold text-center mb-6">
            CTBC University of Technology — Tainan, Taiwan
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <CampusPhoto src={CTBC_CAMPUS_1} alt="CTBC Campus — Main Building" />
            <CampusPhoto src={CTBC_CAMPUS_2} alt="CTBC Campus — Student Life" />
            <CampusPhoto src={CTBC_CAMPUS_3} alt="CTBC Campus — Facilities" />
          </div>
        </div>
      </section>

      {/* Promotional video */}
      {CTBC_VIDEO_ID && (
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              CTBC University — Official Video
            </h2>
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${CTBC_VIDEO_ID}`}
                title="CTBC University of Technology — Official Promotional Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* Video placeholder when ID not yet set */}
      {!CTBC_VIDEO_ID && (
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="aspect-video rounded-xl overflow-hidden shadow-sm border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center bg-muted/20 gap-3">
              <Play className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground font-medium">
                CTBC University — Official Promotional Video
              </p>
              <p className="text-xs text-muted-foreground/60">
                Set CTBC_VIDEO_ID in ScholarshipsPage.tsx to activate
              </p>
              <a
                href={CTBC_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary underline"
              >
                View on ctbctech.edu.tw <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>
      )}

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
              <Card
                key={s.id}
                className={`flex flex-col hover:shadow-md transition-shadow ${
                  s.isCTBC ? 'ring-1 ring-blue-200' : ''
                }`}
              >
                {/* CTBC card header with logo */}
                {s.isCTBC && (
                  <div className="px-6 pt-4 pb-0 flex items-center justify-between">
<a
                      href={CTBC_WEBSITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground underline flex items-center gap-1 hover:text-foreground"
                    >
                      ctbctech.edu.tw <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
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
                <CardContent className="mt-auto pt-0 space-y-2">
                  <Link href={s.href}>
                    <Button size="sm" className="w-full">
                      {t('schol_cta_apply')} <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                  {s.isCTBC && (
                    <a href={CTBC_WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="block">
                      <Button size="sm" variant="outline" className="w-full">
                        Learn More <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </a>
                  )}
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
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/hub/prospect-registration">
              <Button size="lg">
                {t('schol_cta_register')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href={CTBC_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">
                Learn More at CTBC <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Consultation form */}
      <section ref={sectionRefs.contact} className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-4">{t('hub_free_consultation')}</h2>
          <HubConsultationForm inquiryOptions={inquiryOptions} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Lambsbook Cooperative Hub. {t('hub_footer_rights')}</p>
          <p className="mt-1">{t('hub_footer_contact')}: support@lambsbook.net</p>
          <p className="mt-1">
            <a
              href={CTBC_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              CTBC University of Technology — ctbctech.edu.tw
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
