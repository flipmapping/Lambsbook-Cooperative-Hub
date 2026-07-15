import { ArrowRight, ExternalLink, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';

// ---------------------------------------------------------------------------
// RDM-CTBC-001: CTBC asset slots
//
// Place the following files in the repository before deployment:
//   public/assets/ctbc/ctbc-logo.png         — official CTBC logo
//   public/assets/ctbc/campus-hero.jpg        — official CTBC campus photograph
//
// Asset filenames must match exactly. Supplied by the Founder.
// ---------------------------------------------------------------------------

const CTBC_LOGO        = '/assets/ctbc/ctbc-logo.png';
const CTBC_CAMPUS_HERO = '/assets/ctbc/campus-hero.jpg';
const CTBC_WEBSITE_URL = 'https://www.ctbctech.edu.tw/';

// Supported Growth Experience locales (RDM-CTBC-001)
const GROWTH_LOCALES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '简体中文' },
] as const;

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* CTBC campus background — falls back to gradient if asset not yet placed */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gradient-to-br from-blue-900 to-blue-700"
        style={{ backgroundImage: `url(${CTBC_CAMPUS_HERO})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

      {/* Language selector — restricted to vi / en / zh */}
      <div className="absolute top-4 right-4 z-20 flex gap-1">
        {GROWTH_LOCALES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              language === code
                ? 'bg-white text-black'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        {/* CTBC logo */}
        <div className="flex justify-center mb-6">
          <img
            src={CTBC_LOGO}
            alt="CTBC University of Technology"
            className="h-16 object-contain"
            onError={(e) => {
              // Asset not yet placed — hide gracefully
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto leading-tight">
          {t('hero_title')}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {t('hero_subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            onClick={() => onNavigate('eb3')}
            className="text-lg px-8"
            data-testid="button-hero-cta"
          >
            {t('hero_cta')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onNavigate('contact')}
            className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            data-testid="button-hero-consultation"
          >
            {t('hero_consultation')}
          </Button>
          {/* Learn More — opens official CTBC website */}
          <a href={CTBC_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              data-testid="button-hero-learn-more"
            >
              Learn More
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 text-white/80">
          <Users className="h-5 w-5" />
          <span>{t('hero_trusted')}</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-white/60 text-sm flex-wrap">
          <span>CTBC University of Technology</span>
          <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />
          <a
            href={CTBC_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/90 transition-colors"
          >
            ctbctech.edu.tw
          </a>
          <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />
          <span>Tainan, Taiwan</span>
        </div>
      </div>
    </section>
  );
}
